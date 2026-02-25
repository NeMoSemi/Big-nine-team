from datetime import datetime
from pydantic import BaseModel


class ChatMessageOut(BaseModel):
    id: int
    ticket_id: int
    role: str
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessageCreate(BaseModel):
    role: str = "user"
    text: str
