from pydantic import BaseModel
from typing import Text


class UserModel(BaseModel):
    status: Text
    id: int | None = None
    email: str


class LoginRequest(UserModel):
    password: str
    username: str


class LoginResponse(LoginRequest):
    is_admin: bool


class NewUser(LoginRequest):
    username: str
    role: str
    is_admin: bool | bool = False


class NewUserResponse(UserModel):
    detail: str
