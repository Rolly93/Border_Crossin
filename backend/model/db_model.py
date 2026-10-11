from typing import List, Optional
from datetime import datetime, date
from sqlalchemy import (
    UniqueConstraint,
    Integer,
    String,
    Boolean,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
    func,
)
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
    relationship,
)

class Base(DeclarativeBase):
    pass


# ==============================================================================
# 1. PERSONAL Y USUARIOS
# ==============================================================================
class Employee(Base):
    __tablename__ = "employee"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    last_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default="costumer representative"
    )
    hire_date: Mapped[date] = mapped_column(
        Date, nullable=False, server_default=func.current_date()
    )
    rfc: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    still_employee: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relaciones
    user: Mapped[Optional["User"]] = relationship(
        "User", back_populates="employee", uselist=False
    )
    driver_details: Mapped[Optional["DriverDetails"]] = relationship(
        "DriverDetails", back_populates="employee", uselist=False
    )


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(250), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    employee_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("employee.id"), nullable=True
    )

    # Relaciones
    employee: Mapped[Optional["Employee"]] = relationship(
        "Employee", back_populates="user"
    )
    shipment_assigns: Mapped[List["ShipmentAssign"]] = relationship(
        "ShipmentAssign", back_populates="assigned_by_user"
    )
    trip_events: Mapped[List["ShipmentEventModel"]] = relationship(
        "ShipmentEventModel", back_populates="capturer"
    )


class DriverDetails(Base):
    __tablename__ = "driver_details"

    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employee.id"), primary_key=True
    )
    license_number: Mapped[str] = mapped_column(String(50), unique=True)
    expiration_date: Mapped[date] = mapped_column(Date, nullable=False)
    hire_by: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    gafet_id: Mapped[Optional[str]] = mapped_column(
        String(24), nullable=True, unique=True, default="N/A"
    )

    # Relaciones
    employee: Mapped["Employee"] = relationship(
        "Employee", back_populates="driver_details"
    )
    shipment_assigns: Mapped[List["ShipmentAssign"]] = relationship(
        "ShipmentAssign", back_populates="driver"
    )


# ==============================================================================
# 2. CLIENTES Y SERVICIOS (AQUÍ ESTÁN LOS CAMBIOS PRINCIPALES)
# ==============================================================================
class Client(Base):
    __tablename__ = "client"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    still_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    phonenumber: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # Relaciones
    sftp_services: Mapped[List["SftpService"]] = relationship(
        "SftpService", back_populates="client"
    )
    shipment_assigns: Mapped[List["ShipmentAssign"]] = relationship(
        "ShipmentAssign", back_populates="client"
    )
    email_recipients: Mapped[List["ClientEmailRecipient"]] = relationship(
        "ClientEmailRecipient", back_populates="client"
    )


class ClientReferenceRule(Base):
    """Prefijos de referencia permitidos por cliente y tipo de operación."""

    __tablename__ = "client_reference_rule"
    __table_args__ = (
        UniqueConstraint(
            "client_id", "operation_type", "prefix", name="uq_client_reference_rule"
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("client.id", ondelete="CASCADE"), nullable=False
    )
    operation_type: Mapped[str] = mapped_column(String(20), nullable=False)
    prefix: Mapped[str] = mapped_column(String(10), nullable=False)
    reference_length: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class ClientEmailRecipient(Base):
    __tablename__ = "client_email_recipient"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # 💡 CAMBIO 2: FK con onDelete="CASCADE" opcional pero recomendado
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("client.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(200), nullable=False)

    # 💡 CAMBIO 3: 'is_active' se mantiene aquí como el único control de validez del correo
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relaciones
    client: Mapped["Client"] = relationship("Client", back_populates="email_recipients")


class SftpService(Base):
    __tablename__ = "sftp_service"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    host: Mapped[str] = mapped_column(String(200), nullable=False)
    username: Mapped[str] = mapped_column(String(200), nullable=False)
    encrypted_password: Mapped[str] = mapped_column(String(200), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False, default=22)
    root_folder: Mapped[str] = mapped_column(String(200), nullable=False)
    remote_folder: Mapped[str] = mapped_column(String(200), nullable=False)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("client.id"), nullable=False
    )
    configure_by_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )

    # 💡 CAMBIO 4: Campo 'is_active' añadido explícitamente para permitir activar/desactivar
    # el servidor SFTP sin eliminar la configuración ni depender de la tabla client.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relaciones
    client: Mapped["Client"] = relationship("Client", back_populates="sftp_services")
    sends: Mapped[List["SftpSend"]] = relationship("SftpSend", back_populates="service")


# ==============================================================================
# 3. EQUIPO Y TRANSPORTE
# ==============================================================================
class UnitTruck(Base):
    __tablename__ = "unit_truck"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plates: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    tag_id: Mapped[Optional[str]] = mapped_column(
        String(24), nullable=True, unique=True, default="N/A"
    )
    assigned_day: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    # Relaciones
    shipment_assigns: Mapped[List["ShipmentAssign"]] = relationship(
        "ShipmentAssign", back_populates="truck"
    )


class Trailer(Base):
    __tablename__ = "trailer"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plates: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    seal: Mapped[str] = mapped_column(String(50), nullable=False, default="N/A")
    assigned_day: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )

    # Relaciones
    shipment_assigns: Mapped[List["ShipmentAssign"]] = relationship(
        "ShipmentAssign", back_populates="trailer"
    )


# ==============================================================================
# 4. OPERACIÓN CENTRAL (VIAJES)
# ==============================================================================
class ShipmentAssign(Base):
    __tablename__ = "trip_assigned"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tracking_number: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False
    )
    customer_tracking: Mapped[str] = mapped_column(String(100), nullable=False)
    type_operation: Mapped[str] = mapped_column(
        String(50), nullable=False, default="exportacion"
    )

    driver_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("driver_details.employee_id"), nullable=False
    )
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("client.id"), nullable=False
    )
    assigned_by: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    trailer_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trailer.id"), nullable=False
    )
    unit_truck_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("unit_truck.id"), nullable=True
    )

    assigned_day: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.current_timestamp()
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    origen: Mapped[str] = mapped_column(String(200), nullable=False)
    destination: Mapped[str] = mapped_column(String(200), nullable=False)

    # Relaciones
    driver: Mapped["DriverDetails"] = relationship(
        "DriverDetails", back_populates="shipment_assigns"
    )
    client: Mapped["Client"] = relationship("Client", back_populates="shipment_assigns")
    assigned_by_user: Mapped["User"] = relationship(
        "User", back_populates="shipment_assigns"
    )
    trailer: Mapped["Trailer"] = relationship(
        "Trailer", back_populates="shipment_assigns"
    )
    truck: Mapped[Optional["UnitTruck"]] = relationship(
        "UnitTruck", back_populates="shipment_assigns"
    )

    events: Mapped[List["ShipmentEventModel"]] = relationship(
        "ShipmentEventModel", back_populates="trip", cascade="all, delete-orphan"
    )
    email_services: Mapped[List["EmailService"]] = relationship(
        "EmailService", back_populates="trip"
    )


# ==============================================================================
# 5. SEGUIMIENTO, EVENTOS Y TRANSMISIONES
# ==============================================================================
class ShipmentEventModel(Base):
    __tablename__ = "shipment_events"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    event_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    event_time: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    captured_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    notes: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)

    trip_assigned_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trip_assigned.id", ondelete="CASCADE"), nullable=False
    )
    capture_by_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("user.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_modify: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    new_seal: Mapped[str] = mapped_column(String(50), default="N/A")

    # Relaciones
    trip: Mapped["ShipmentAssign"] = relationship(
        "ShipmentAssign", back_populates="events"
    )
    capturer: Mapped["User"] = relationship("User", back_populates="trip_events")
    sftp_sends: Mapped[List["SftpSend"]] = relationship(
        "SftpSend", back_populates="shipment_event"
    )


class EmailService(Base):
    __tablename__ = "email_service"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipient_email: Mapped[str] = mapped_column(String(254), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    trip_assigned_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trip_assigned.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    # Relaciones
    trip: Mapped["ShipmentAssign"] = relationship(
        "ShipmentAssign", back_populates="email_services"
    )


class SftpSend(Base):
    __tablename__ = "sftp_send"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shipment_event_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("shipment_events.id"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(200), nullable=False)
    local_path: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    sent_to: Mapped[int] = mapped_column(
        Integer, ForeignKey("sftp_service.id"), nullable=False
    )
    sftp_log: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retries: Mapped[int] = mapped_column(Integer, default=0)

    # Relaciones
    service: Mapped["SftpService"] = relationship("SftpService", back_populates="sends")
    shipment_event: Mapped["ShipmentEventModel"] = relationship(
        "ShipmentEventModel", back_populates="sftp_sends"
    )


class SystemConfig(Base):
    """Configuración global del sistema. Guarda el SCAC pedido al iniciar."""

    __tablename__ = "system_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scac: Mapped[str] = mapped_column(String(4), nullable=False)
