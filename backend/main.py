from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.user import router as  LoginRoute
from routes.shipment import router as Shipment
from routes.notification_router import router as notifications_router


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"], 
)
app.include_router(LoginRoute)
app.include_router(Shipment)
app.include_router(notifications_router)