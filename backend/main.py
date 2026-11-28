import asyncio
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from database import engine
from model.db_model import Base
from routes.client_route import router as client_router
from routes.employee_route import router as employee_router
from routes.notification_router import router as notifications_router
from routes.sftp_route import router as sftp_router
from routes.shipment import router as shipment_router
from routes.system_route import health_router
from routes.system_route import router as system_router
from routes.unit_route import router as unit_router
from routes.user import router as user_router
from service import alerting
from service.logging_config import get_logger, setup_logging
from service.sftp_dispatcher import find_pending_to_resume, process_sends
from utility.schema_upgrade import upgrade_sftp_schema, upgrade_unit_schema

# Configure structured logging early
log_level = os.getenv("LOG_LEVEL", "INFO")
json_logs = os.getenv("JSON_LOGS", "true").lower() == "true"
setup_logging(log_level=log_level, json_logs=json_logs)
logger = get_logger(__name__)

Base.metadata.create_all(bind=engine)
upgrade_unit_schema(engine)
upgrade_sftp_schema(engine)

# Rate limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["1000/minute"])

_background_tasks: set[asyncio.Task] = set()


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Envíos SFTP que quedaron pendientes por un reinicio: se reanudan.
    if pending := find_pending_to_resume():
        logger.info("sftp_resume_pending", count=len(pending))
        task = asyncio.create_task(process_sends(pending))
        _background_tasks.add(task)
        task.add_done_callback(_background_tasks.discard)
    yield


app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Log startup
logger.info("application_starting", environment=os.getenv("ENVIRONMENT", "development"))


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "unknown"

    logger.info(
        "request_started",
        method=request.method,
        path=request.url.path,
        client_ip=client_ip,
        user_agent=request.headers.get("user-agent", ""),
    )

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        logger.info(
            "request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            process_time_ms=round(process_time * 1000, 2),
            client_ip=client_ip,
        )
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            "request_failed",
            method=request.method,
            path=request.url.path,
            error=str(e),
            process_time_ms=round(process_time * 1000, 2),
            client_ip=client_ip,
        )
        # Error no controlado = bug del servidor: se registra, se alerta a soporte y el
        # usuario recibe un código. Se responde aquí (dentro de CORS) para que el
        # navegador pueda leer el mensaje.
        title, detail, location = alerting.describe_exception(e)
        error_id = alerting.report(
            "unhandled",
            title,
            detail,
            location,
            alerting.RequestContext(path=request.url.path, method=request.method),
        )
        code = f" Código: {error_id}" if error_id else ""
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error interno del servidor. Ya se notificó a soporte.{code}"},
        )


@app.exception_handler(StarletteHTTPException)
async def report_server_http_errors(request: Request, exc: StarletteHTTPException):
    # Solo errores del servidor (>= 500); los 4xx son del usuario y no se alertan.
    if exc.status_code >= 500:
        alerting.report(
            "http_5xx",
            f"HTTP {exc.status_code}: {str(exc.detail)[:200]}",
            location=f"{request.method} {request.url.path}",
            ctx=alerting.RequestContext(path=request.url.path, method=request.method),
        )
    return await http_exception_handler(request, exc)


# CORS configuration - configurable via env for production
cors_origins = os.getenv("CORS_ORIGINS", "*")
if cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip() for o in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(user_router)
app.include_router(health_router)
app.include_router(shipment_router)
app.include_router(notifications_router)
app.include_router(client_router)
app.include_router(employee_router)
app.include_router(sftp_router)
app.include_router(system_router)
app.include_router(unit_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
