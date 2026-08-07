from sqlalchemy import Column, Integer, String, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from databse import Base
from schema import EventCategory


class ShipmentEventModel(Base):
    __tablename__ = "shipment_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    shipment_id = Column(
        Integer, ForeignKey("shipments.id", ondelete="CASCADE"), nullable=False
    )
    category = Column(SQLEnum(EventCategory), nullable=True)
    dateTime = Column(String, nullable=True)
    notes = Column(String(50), nullable=True)

    shipment = relationship("ShipmentModel", back_populates="events")


class ShipmentModel(Base):
    __tablename__ = "shipments"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    # user_id =Column(Integer, ForeignKey)

    tracking_number = Column(String(100), unique=True, nullable=False)

    customer_tracking = Column(String(100), nullable=False)
    cliente = Column(String(100), nullable=False)
    truck = Column(String(50), nullable=False)
    vehicle_type = Column(String(50), nullable=False)
    trailer = Column(String(50), nullable=False)
    origen = Column(String(50), nullable=False)
    destino = Column(String(50), nullable=False)
    type_operation = Column(String(50), nullable=False, default="exportacion")

    events = relationship(
        "ShipmentEventModel",
        back_populates="shipment",
        cascade="all , delete-orphan",
        lazy="joined",
    )
