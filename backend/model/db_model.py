from sqlalchemy import (
    Integer,
    String,
    ForeignKey,
    Enum as SQLEnum,
    Boolean,
    func,
    Date,
    DateTime,
    Text,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column
from databse import Base
from schema import EventCategory
from datetime import date, datetime


class Employee(Base):
    __tablename__ = "employee"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    last_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50), nullable=False, default="costumer representative"
    )
    hire_date: Mapped[date] = mapped_column(
        Date, nullable=False, server_default=func.date("now")
    )
    rfc_employee: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    still_employee: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="employee", uselist=False)
    trucks = relationship("UnitTruck", back_populates="assigned_employee")
    driver_details = relationship(
        "DriverDetails", back_populates="employee", uselist=False
    )


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    hashed_password: Mapped[str] = mapped_column(String(250), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    employee_id: Mapped[int] = mapped_column(Integer, ForeignKey("employee.id"))

    employee = relationship("Employee", back_populates="user")
    shipment_assigns = relationship("ShipmentAssign", back_populates="assigned_by_user")
    trip_events = relationship("ShipmentEventModel", back_populates="capturer")


class Client(Base):
    __tablename__ = "client"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    is_ftp: Mapped[bool] = mapped_column(Boolean, default=False)
    is_email_service: Mapped[bool] = mapped_column(Boolean, default=False)

    sftp_services = relationship("SftpService", back_populates="client")
    shipment_assigns = relationship("ShipmentAssign", back_populates="client")
    email_recipients = relationship("ClientEmailRecipient", back_populates="client")


class SftpService(Base):
    __tablename__ = "sftp_service"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    host: Mapped[str] = mapped_column(String(200), nullable=False)
    username: Mapped[str] = mapped_column(String(200), nullable=False)
    encrypted_password: Mapped[str] = mapped_column(String(200), nullable=False)
    port: Mapped[int] = mapped_column(Integer, nullable=False)
    root_folder: Mapped[str] = mapped_column(String(200), nullable=False)
    remote_folder: Mapped[str] = mapped_column(String(200), nullable=False)
    client_id: Mapped[int] = mapped_column(Integer, ForeignKey("client.id"))
    configure_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))

    client = relationship("Client", back_populates="sftp_services")
    sends = relationship("SftpSend", back_populates="service")


class SftpSend(Base):
    __tablename__ = "sftp_send"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    shipment_event_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("shipment_events.id")
    )
    filename: Mapped[str] = mapped_column(String(200), nullable=False)
    local_path: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    sent_to: Mapped[int] = mapped_column(Integer, ForeignKey("sftp_service.id"))
    sftp_log: Mapped[str] = mapped_column(Text)
    retries: Mapped[int] = mapped_column(Integer, default=0)

    service = relationship("SftpService", back_populates="sends")
    shipment_event = relationship("ShipmentEventModel", back_populates="sftp_sends")


class DriverDetails(Base):
    __tablename__ = "driver_details"

    employee_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("employee.id"), primary_key=True
    )
    license_number: Mapped[str] = mapped_column(String(50), unique=True)
    expiration_date: Mapped[date] = mapped_column(Date, nullable=False)
    hire_by: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))

    employee = relationship("Employee", back_populates="driver_details")
    shipment_assigns = relationship("ShipmentAssign", back_populates="driver")


class UnitTruck(Base):
    __tablename__ = "unit_truck"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plates: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    assigned_to: Mapped[int] = mapped_column(Integer, ForeignKey("employee.id"))
    assigned_day: Mapped[date] = mapped_column(
        Date, nullable=False, server_default=func.current_timestamp()
    )

    assigned_employee = relationship("Employee", back_populates="trucks")
    shipment_assigns = relationship("ShipmentAssign", back_populates="truck")


class Trailer(Base):
    __tablename__ = "trailer"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    plates: Mapped[str] = mapped_column(String(50), nullable=False)
    state: Mapped[str] = mapped_column(String(50), nullable=False)
    seal: Mapped[str] = mapped_column(String(50), nullable=False, default="N/A")
    assigned_day: Mapped[date] = mapped_column(
        Date, nullable=False, server_default=func.current_timestamp()
    )

    shipment_assigns = relationship("ShipmentAssign", back_populates="trailer")


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
    unit_truck_id: Mapped[int] = mapped_column(Integer, ForeignKey("unit_truck.id"))

    assigned_day: Mapped[date] = mapped_column(
        Date, nullable=False, server_default=func.current_timestamp()
    )
    origen: Mapped[str] = mapped_column(String(200), nullable=False)
    destination: Mapped[str] = mapped_column(String(200), nullable=False)

    driver = relationship("DriverDetails", back_populates="shipment_assigns")
    client = relationship("Client", back_populates="shipment_assigns")
    assigned_by_user = relationship("User", back_populates="shipment_assigns")
    trailer = relationship("Trailer", back_populates="shipment_assigns")
    truck = relationship("UnitTruck", back_populates="shipment_assigns")

    events = relationship(
        "ShipmentEventModel", back_populates="trip", cascade="all, delete-orphan"
    )
    email_services = relationship("EmailService", back_populates="trip")


class ShipmentEventModel(Base):
    __tablename__ = "shipment_events"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True, autoincrement=True
    )
    trip_assigned_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trip_assigned.id", ondelete="CASCADE"), nullable=False
    )
    capture_by_id: Mapped[int] = mapped_column(Integer, ForeignKey("user.id"))
    category: Mapped[EventCategory | None] = mapped_column(
        SQLEnum(EventCategory), nullable=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=True)
    event_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    captured_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    notes: Mapped[str] = mapped_column(String(200), nullable=True)
    new_seal: Mapped[str] = mapped_column(String(50), default="N/A")

    trip = relationship("ShipmentAssign", back_populates="events")
    capturer = relationship("User", back_populates="trip_events")
    sftp_sends = relationship("SftpSend", back_populates="shipment_event")


class EmailService(Base):
    __tablename__ = "email_service"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    recipient_email: Mapped[str] = mapped_column(String(500), nullable=False)

    status: Mapped[str] = mapped_column(String(50), default="pending")
    trip_assigned_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("trip_assigned.id")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.current_timestamp()
    )
    sent_at: Mapped[datetime] = mapped_column(
        DateTime,
    )

    trip = relationship("ShipmentAssign", back_populates="email_services")


class ClientEmailRecipient(Base):
    __tablename__ = "client_email_recipient"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("client.id", ondelete="CASCADE")
    )
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    client = relationship("Client", back_populates="email_recipients")
