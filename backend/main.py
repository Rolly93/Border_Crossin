from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
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
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
)
app.include_router(user_router)

app.include_router(shipment_router)
app.include_router(notifications_router)
app.include_router(client_router)
app.include_router(employee_router)
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
