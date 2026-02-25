from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.ticket import Ticket
from app.models.chat_message import ChatMessage
from app.schemas.ticket import TicketOut, TicketUpdate, TicketCreate
from app.schemas.chat import ChatMessageOut, ChatMessageCreate
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


# ── Список заявок ─────────────────────────────────────
@router.get("", response_model=list[TicketOut])
async def list_tickets(
    status: str | None = None,
    sentiment: str | None = None,
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = select(Ticket).order_by(desc(Ticket.date_received))
    if status:
        q = q.where(Ticket.status == status)
    if sentiment:
        q = q.where(Ticket.sentiment == sentiment)
    if category:
        q = q.where(Ticket.category == category)
    result = await db.execute(q)
    return result.scalars().all()


# ── Создать заявку (вручную / AI-агент) ───────────────
@router.post("", response_model=TicketOut, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    payload: TicketCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    ticket = Ticket(**payload.model_dump())
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)
    return ticket


# ── Получить заявку ────────────────────────────────────
@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    return ticket


# ── Обновить заявку ────────────────────────────────────
@router.patch("/{ticket_id}", response_model=TicketOut)
async def update_ticket(
    ticket_id: int,
    payload: TicketUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ticket, field, value)
    await db.commit()
    await db.refresh(ticket)
    return ticket


# ── Отправить ответ ────────────────────────────────────
@router.post("/{ticket_id}/send")
async def send_response(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    ticket = await db.get(Ticket, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    if not ticket.ai_response:
        raise HTTPException(status_code=400, detail="Нет текста ответа")

    # TODO: подключить SMTP-отправку на хакатоне
    ticket.status = "closed"
    await db.commit()
    return {"success": True, "message": "Ответ отправлен (заглушка)"}


# ── Чат заявки ────────────────────────────────────────
@router.get("/{ticket_id}/chat", response_model=list[ChatMessageOut])
async def get_chat(
    ticket_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.ticket_id == ticket_id)
        .order_by(ChatMessage.created_at)
    )
    return result.scalars().all()


@router.post("/{ticket_id}/chat", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
async def add_chat_message(
    ticket_id: int,
    payload: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if not await db.get(Ticket, ticket_id):
        raise HTTPException(status_code=404, detail="Заявка не найдена")
    msg = ChatMessage(ticket_id=ticket_id, role=payload.role, text=payload.text)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg
