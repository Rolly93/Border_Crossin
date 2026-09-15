from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from databse import engine, Base
from routes.client_route import router as client_router
from routes.employee_route import router as employee_router
from routes.notification_router import router as notifications_router
from routes.shipment import router as shipment_router
from routes.user import router as user_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(user_router)

app.include_router(shipment_router)
app.include_router(notifications_router)
app.include_router(client_router)
app.include_router(employee_router)
