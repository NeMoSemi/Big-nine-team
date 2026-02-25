from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.knowledge_base import KbSection, KbFile
from app.schemas.knowledge_base import KbSectionOut
from app.routers.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/kb", tags=["knowledge_base"])


@router.get("/sections", response_model=list[KbSectionOut])
async def list_sections(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(KbSection)
        .options(selectinload(KbSection.files))
        .order_by(KbSection.order_idx)
    )
    return result.scalars().all()


@router.get("/sections/{section_id}", response_model=KbSectionOut)
async def get_section(
    section_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(
        select(KbSection)
        .where(KbSection.id == section_id)
        .options(selectinload(KbSection.files))
    )
    section = result.scalar_one_or_none()
    if not section:
        raise HTTPException(status_code=404, detail="Раздел не найден")
    return section
