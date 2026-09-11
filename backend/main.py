from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from routes.user import router as LoginRoute
from routes.shipment import router as Shipment
from routes.notification_router import router as notifications_router
from routes.client_route import router as client_router
from databse import engine, Base
from deps.auth import get_current_user

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(LoginRoute)

app.include_router(Shipment, dependencies=[Depends(get_current_user)])
app.include_router(notifications_router, dependencies=[Depends(get_current_user)])
app.include_router(client_router, dependencies=[Depends(get_current_user)])
