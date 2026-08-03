from dataclasses import dataclass
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email : str
    password : str

class LoginResponse(BaseModel):
    status :str
    user_id :str
    is_admin :str

class NewUser(LoginRequest):
    username : str
    role:str
