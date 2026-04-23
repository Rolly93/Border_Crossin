from dataclasses import dataclass
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email : str
    password : str

class NewUser(LoginRequest):
    username : str
    role:str
