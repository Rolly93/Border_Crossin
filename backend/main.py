from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.user import router as  LoginRoute


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"], 
)
app.include_router(LoginRoute)