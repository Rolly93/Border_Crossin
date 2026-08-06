from sqlalchemy import (
    Column,
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
from sqlalchemy.orm import relationship
from databse import Base
from schema import EventCategory


class Employee(Base):
    __tablename__ = "employee"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    last_name = Column(String(200), nullable=False)
    role = Column(String(50), nullable=False, default="costumer representative")
    hire_date = Column(Date, nullable=False, server_default=func.date("now"))
    rfc_employee = Column(String(200), nullable=False)
    still_employee = Column(Boolean, default=True, nullable=False)

    user = relationship("User", back_populates="employee", uselist=False)
    trucks = relationship("UnitTruck", back_populates="assigned_employee")
    driver_details = relationship(
        "DriverDetails", back_populates="employee", uselist=False
    )


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(200), nullable=False, unique=True)
    email = Column(String(200), nullable=False, unique=True)
    password = Column(String(200), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    employee_id = Column(Integer, ForeignKey("employee.id"))

    employee = relationship("Employee", back_populates="user")
    shipment_assigns = relationship("ShipmentAssign", back_populates="assigned_by_user")
    trip_events = relationship("ShipmentEventModel", back_populates="capturer")


class Client(Base):
    __tablename__ = "client"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True)
    is_ftp = Column(Boolean, default=False)
    is_email_service = Column(Boolean, default=False)

    sftp_services = relationship("SftpService", back_populates="client")
    shipment_assigns = relationship("ShipmentAssign", back_populates="client")


class SftpService(Base):
    __tablename__ = "sftp_service"

    id = Column(Integer, primary_key=True, autoincrement=True)
    host = Column(String(200), nullable=False)
    username = Column(String(200), nullable=False)
    encrypted_password = Column(String(200), nullable=False)
    port = Column(Integer, nullable=False)
    root_folder = Column(String(200), nullable=False)
    remote_folder = Column(String(200), nullable=False)
    client_id = Column(Integer, ForeignKey("client.id"))
    configure_by_id = Column(Integer, ForeignKey("user.id"))

    client = relationship("Client", back_populates="sftp_services")
    sends = relationship("SftpSend", back_populates="service")


class SftpSend(Base):
    __tablename__ = "sftp_send"

    id = Column(Integer, primary_key=True, autoincrement=True)
    shipment_event_id = Column(Integer, ForeignKey("shipment_events.id"))
    filename = Column(String(200), nullable=False)
    local_path = Column(String(200), nullable=False)
    status = Column(String(50), default="pending")
    sent_to = Column(Integer, ForeignKey("sftp_service.id"))
    sftp_log = Column(Text)
    retries = Column(Integer, default=0)

    service = relationship("SftpService", back_populates="sends")
    shipment_event = relationship("ShipmentEventModel", back_populates="sftp_sends")


class DriverDetails(Base):
    __tablename__ = "driver_details"

    employee_id = Column(Integer, ForeignKey("employee.id"), primary_key=True)
    license_number = Column(String(50), unique=True)
    expiration_date = Column(Date, nullable=False)
    hire_by = Column(Integer, ForeignKey("user.id"))

    employee = relationship("Employee", back_populates="driver_details")
    shipment_assigns = relationship("ShipmentAssign", back_populates="driver")


class UnitTruck(Base):
    __tablename__ = "unit_truck"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plates = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    assigned_to = Column(Integer, ForeignKey("employee.id"))
    assigned_day = Column(Date, nullable=False, server_default=func.current_timestamp())

    assigned_employee = relationship("Employee", back_populates="trucks")
    shipment_assigns = relationship("ShipmentAssign", back_populates="truck")


class Trailer(Base):
    __tablename__ = "trailer"

    id = Column(Integer, primary_key=True, autoincrement=True)
    plates = Column(String(50), nullable=False)
    state = Column(String(50), nullable=False)
    seal = Column(String(50), nullable=False, default="N/A")
    assigned_day = Column(Date, nullable=False, server_default=func.current_timestamp())

    shipment_assigns = relationship("ShipmentAssign", back_populates="trailer")


class ShipmentAssign(Base):
    __tablename__ = "trip_assigned"

    id = Column(Integer, primary_key=True, autoincrement=True)
    tracking_number = Column(String(100), unique=True, nullable=False)
    customer_tracking = Column(String(100), nullable=False)
    type_operation = Column(String(50), nullable=False, default="exportacion")

    driver_id = Column(
        Integer, ForeignKey("driver_details.employee_id"), nullable=False
    )
    client_id = Column(Integer, ForeignKey("client.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("user.id"), nullable=False)
    trailer_id = Column(Integer, ForeignKey("trailer.id"), nullable=False)
    unit_truck_id = Column(Integer, ForeignKey("unit_truck.id"))

    assigned_day = Column(Date, nullable=False, server_default=func.current_timestamp())
    origen = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)

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

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    trip_assigned_id = Column(
        Integer, ForeignKey("trip_assigned.id", ondelete="CASCADE"), nullable=False
    )
    capture_by_id = Column(Integer, ForeignKey("user.id"))
    category = Column(SQLEnum(EventCategory), nullable=True)
    event_type = Column(String(50), nullable=True)
    event_time = Column(DateTime, nullable=True)
    captured_at = Column(DateTime, server_default=func.current_timestamp())
    notes = Column(String(200), nullable=True)
    new_seal = Column(String(50), default="N/A")

    trip = relationship("ShipmentAssign", back_populates="events")
    capturer = relationship("User", back_populates="trip_events")
    sftp_sends = relationship("SftpSend", back_populates="shipment_event")


class EmailService(Base):
    __tablename__ = "email_service"

    id = Column(Integer, primary_key=True, autoincrement=True)
    recipient_email = Column(String(500), nullable=False)

    status = Column(String(50), default="pending")
    trip_assigned_id = Column(Integer, ForeignKey("trip_assigned.id"))
    created_at = Column(DateTime, server_default=func.current_timestamp())
    sent_at = Column(DateTime)

    trip = relationship("ShipmentAssign", back_populates="email_services")
