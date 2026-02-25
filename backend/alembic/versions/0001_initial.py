"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-02-25
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── users ──────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.String(50), server_default="operator"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── tickets ────────────────────────────────────────
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("date_received", sa.DateTime(timezone=True), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("company", sa.String(255)),
        sa.Column("phone", sa.String(50)),
        sa.Column("email", sa.String(255)),
        sa.Column("device_serials", ARRAY(sa.String())),
        sa.Column("device_type", sa.String(255)),
        sa.Column("sentiment", sa.String(20)),
        sa.Column("category", sa.String(50)),
        sa.Column("summary", sa.Text()),
        sa.Column("original_email", sa.Text()),
        sa.Column("ai_response", sa.Text()),
        sa.Column("status", sa.String(20), server_default="open"),
        sa.Column("assigned_to", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index("ix_tickets_date_received", "tickets", ["date_received"])
    op.create_index("ix_tickets_status", "tickets", ["status"])
    op.create_index("ix_tickets_sentiment", "tickets", ["sentiment"])
    op.create_index("ix_tickets_category", "tickets", ["category"])
    op.create_index("ix_tickets_assigned_to", "tickets", ["assigned_to"])

    # ── chat_messages ──────────────────────────────────
    op.create_table(
        "chat_messages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("ticket_id", sa.Integer(), sa.ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_chat_messages_ticket_id", "chat_messages", ["ticket_id"])

    # ── kb_sections ────────────────────────────────────
    op.create_table(
        "kb_sections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("order_idx", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── kb_files ───────────────────────────────────────
    op.create_table(
        "kb_files",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("kb_sections.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("file_path", sa.Text(), nullable=False),
        sa.Column("file_size", sa.BigInteger()),
        sa.Column("mime_type", sa.String(100)),
        sa.Column("uploaded_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_kb_files_section_id", "kb_files", ["section_id"])

    # ── Начальный пользователь (admin) ─────────────────
    op.execute("""
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (
            'admin@eris.ru',
            '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
            'Администратор',
            'admin'
        )
    """)
    # Пароль: secret (bcrypt hash)


def downgrade() -> None:
    op.drop_table("kb_files")
    op.drop_table("kb_sections")
    op.drop_table("chat_messages")
    op.drop_table("tickets")
    op.drop_table("users")
