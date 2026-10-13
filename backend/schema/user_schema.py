<<<<<<< Updated upstream
from pydantic import BaseModel, EmailStr
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


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


class UserModel(UserBase):
    id: Optional[int] = None
    status: str = "active"


class NewUserResponse(BaseModel):
    status: str = "success"
    detail: str
    token: Optional[str] = None


class LoginResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str
    detail: str
    access_token: str
    token_type: str = "bearer"
    isAdmin: bool = Field(..., alias="isAdmin")
=======
from pydantic import BaseModel
from typing import Text


class UserModel(BaseModel):
    status: Text
    id: int | None = None
    email: str


class LoginRequest(UserModel):
    password: str | None = None


class LoginResponse(LoginRequest):
    is_admin: bool


class NewUser(LoginRequest):
    username: str
    role: str


class NewUserResponse(UserModel):
    detail: str
>>>>>>> Stashed changes
