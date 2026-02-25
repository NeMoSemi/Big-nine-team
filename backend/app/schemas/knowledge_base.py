from datetime import datetime
from pydantic import BaseModel


class KbFileOut(BaseModel):
    id: int
    section_id: int
    title: str
    file_path: str
    file_size: int | None
    mime_type: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class KbSectionOut(BaseModel):
    id: int
    title: str
    description: str | None
    order_idx: int
    files: list[KbFileOut] = []
    created_at: datetime

    model_config = {"from_attributes": True}
