import asyncio
import email
import imaplib
import logging
import re
from datetime import datetime, timezone
from email.header import decode_header
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings
from app.database import AsyncSessionLocal
from app.models.chat_message import ChatMessage
from app.models.ticket import Ticket
from app.services.ai_service import analyze_ticket_with_ai

logger = logging.getLogger(__name__)

# Ищем [#123] или #123 в теме письма для связи с существующей заявкой
_TICKET_ID_RE = re.compile(r'\[?#(\d+)\]?')


def _decode_header_value(value: str | None) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    result = []
    for part, charset in parts:
        if isinstance(part, bytes):
            result.append(part.decode(charset or "utf-8", errors="replace"))
        else:
            result.append(part)
    return " ".join(result)


def _parse_ticket_id(subject: str) -> int | None:
    m = _TICKET_ID_RE.search(subject)
    return int(m.group(1)) if m else None


def _fetch_unseen_emails() -> list[dict]:
    """Sync IMAP fetch — runs in a thread executor."""
    if not settings.IMAP_HOST or not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
        logger.warning("IMAP not configured, skipping email fetch")
        return []

    messages = []
    try:
        with imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT) as imap:
            imap.login(settings.EMAIL_USER, settings.EMAIL_PASSWORD)
            imap.select("INBOX")
            _, id_list = imap.search(None, "UNSEEN")

            for msg_id in id_list[0].split():
                _, data = imap.fetch(msg_id, "(RFC822)")
                raw = data[0][1]
                msg = email.message_from_bytes(raw)

                subject = _decode_header_value(msg.get("Subject"))
                from_ = _decode_header_value(msg.get("From"))

                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        if part.get_content_type() == "text/plain":
                            payload = part.get_payload(decode=True)
                            if payload:
                                body = payload.decode(
                                    part.get_content_charset() or "utf-8",
                                    errors="replace",
                                )
                                break
                else:
                    payload = msg.get_payload(decode=True)
                    if payload:
                        body = payload.decode(
                            msg.get_content_charset() or "utf-8",
                            errors="replace",
                        )

                sender_email = from_
                if "<" in from_ and ">" in from_:
                    sender_email = from_.split("<")[1].rstrip(">").strip()

                reply_ticket_id = _parse_ticket_id(subject)

                imap.store(msg_id, "+FLAGS", "\\Seen")

                messages.append({
                    "subject": subject,
                    "from": from_,
                    "email": sender_email,
                    "body": body,
                    "date": datetime.now(timezone.utc),
                    "reply_ticket_id": reply_ticket_id,
                })
    except Exception as e:
        logger.error(f"IMAP error: {e}")

    return messages


async def _handle_email_reply(msg: dict, ticket_id: int) -> None:
    """Client replied to an existing ticket — add message to chat."""
    async with AsyncSessionLocal() as session:
        t = await session.get(Ticket, ticket_id)
        if not t or t.status == "closed":
            return

        session.add(ChatMessage(ticket_id=ticket_id, role="user", text=msg["body"]))

        if "вызвать оператора" in msg["body"].lower():
            t.status = "needs_operator"
            logger.info(f"Ticket #{ticket_id} → needs_operator")

        await session.commit()
    logger.info(f"Added client reply to ticket #{ticket_id}")


async def _handle_new_email(msg: dict) -> None:
    """Create new ticket, run AI, populate chat, email AI response."""
    ticket_id: int

    async with AsyncSessionLocal() as session:
        ticket = Ticket(
            date_received=msg["date"],
            email=msg["email"],
            original_email=f"От: {msg['from']}\nТема: {msg['subject']}\n\n{msg['body']}",
            status="open",
        )
        session.add(ticket)
        await session.commit()
        await session.refresh(ticket)
        ticket_id = ticket.id
        ticket_text = ticket.original_email

    try:
        ai_result = await analyze_ticket_with_ai(ticket_text)

        async with AsyncSessionLocal() as session:
            t = await session.get(Ticket, ticket_id)
            if t:
                t.sentiment = ai_result.get("sentiment")
                t.category = ai_result.get("category")
                t.ai_response = ai_result.get("draft_response")
                t.full_name = ai_result.get("full_name")
                t.company = ai_result.get("company")
                t.phone = ai_result.get("phone")
                t.device_serials = ai_result.get("device_serials") or []
                t.device_type = ai_result.get("device_type")
                t.summary = ai_result.get("summary")
                await session.commit()

        draft = ai_result.get("draft_response", "")
        bot_text = draft + "\n\n💡 Если нужно вызвать оператора, напишите — вызвать оператора"

        async with AsyncSessionLocal() as session:
            session.add(ChatMessage(
                ticket_id=ticket_id,
                role="user",
                text=f"От: {msg['from']}\nТема: {msg['subject']}\n\n{msg['body']}",
            ))
            session.add(ChatMessage(ticket_id=ticket_id, role="bot", text=bot_text))
            await session.commit()

        if msg.get("email"):
            await send_chat_message_to_client(msg["email"], bot_text, ticket_id)

    except Exception as e:
        logger.error(f"Error processing new email → ticket #{ticket_id}: {e}")


async def poll_imap_once() -> None:
    """Fetch unseen emails, route to new-ticket or reply handler."""
    loop = asyncio.get_event_loop()
    messages = await loop.run_in_executor(None, _fetch_unseen_emails)

    if not messages:
        return

    logger.info(f"Fetched {len(messages)} new email(s)")

    for msg in messages:
        reply_ticket_id = msg.get("reply_ticket_id")
        if reply_ticket_id:
            await _handle_email_reply(msg, reply_ticket_id)
        else:
            await _handle_new_email(msg)


async def send_email_response(
    to_email: str, subject: str, body: str, ticket_id: int | None = None
) -> None:
    """Send email via SMTP. Embeds ticket ID in subject for thread tracking."""
    if not settings.SMTP_HOST or not settings.EMAIL_USER or not settings.EMAIL_PASSWORD:
        raise RuntimeError("SMTP не настроен — задайте SMTP_HOST, EMAIL_USER, EMAIL_PASSWORD")

    if ticket_id and f"#{ticket_id}" not in subject:
        subject = f"[#{ticket_id}] {subject}"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_USER
    msg["To"] = to_email
    msg.attach(MIMEText(body, "plain", "utf-8"))

    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.EMAIL_USER,
        password=settings.EMAIL_PASSWORD,
        start_tls=True,
    )
    logger.info(f"Email sent to {to_email} (ticket #{ticket_id})")


async def send_chat_message_to_client(to_email: str, text: str, ticket_id: int) -> None:
    """Send a chat message to client's email with ticket ID in subject."""
    await send_email_response(to_email, "Ответ на ваше обращение", text, ticket_id)


async def start_email_polling(interval: int = 60) -> None:
    """Infinite async loop — polls IMAP every `interval` seconds."""
    logger.info(f"Email polling started (interval={interval}s)")
    while True:
        try:
            await poll_imap_once()
        except Exception as e:
            logger.error(f"Email polling iteration error: {e}")
        await asyncio.sleep(interval)
