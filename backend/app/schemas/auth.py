from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    telegram_id: int | None = None

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    telegram_id: int | None = None
