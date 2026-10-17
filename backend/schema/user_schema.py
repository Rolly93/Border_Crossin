from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str


class LoginRequest(BaseModel):
    username: str
    password: str


class NewUser(UserBase):
    password: str
    role: str
    isAdmin: bool = False
    rfc: str


class UserModel(UserBase):
    id: int | None
    status: str = "active"


class NewUserResponse(BaseModel):
    status: str = "success"
    detail: str
    token: str | None


class LoginResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str
    detail: str
    access_token: str
    token_type: str = "bearer"
    isAdmin: bool = Field(..., alias="isAdmin")
