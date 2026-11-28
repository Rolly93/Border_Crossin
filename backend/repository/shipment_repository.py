from datetime import UTC, datetime, time

from fastapi import HTTPException, status
from sqlalchemy import and_, exists, or_, select
from sqlalchemy.orm import Session

from model.db_model import Consolidate, ShipmentAssign, ShipmentEventModel, Trailer
from repository.base_repository import BaseRepository
from schema.shipment_shcema import (
    EventCategory,
    ServiceType,
    ServiceTypeUnionRequestUpdate,
    ShipmentCreateRequest,
)

_EDITABLE_FIELDS = {
    "tracking_number",
    "customer_tracking",
    "type_operation",
    "origen",
    "destination",
}
_TRAILER_FIELDS = {"trailer_number", "plates", "state", "seal"}


class ShipmentRepository(BaseRepository[ShipmentAssign]):
    def __init__(self, db: Session):
        super().__init__(db, model=ShipmentAssign)

        self._db_shipment_event = ShipmentEventModel
        self._db = db

    def get_by_tracking(self, tracking_number: str) -> ShipmentAssign | None:
        return (
            self._db.query(ShipmentAssign)
            .filter(ShipmentAssign.tracking_number == tracking_number)
            .first()
        )

    def delete_shipment(
        self, shipment_to_inactive: ShipmentAssign, who_deleted: int
    ) -> str | None:
        shipment_to_inactive.is_active = False

        for event in shipment_to_inactive.events:
            event.is_active = False
            event.last_modify = datetime.now(tz=UTC)
            event.capture_by_id = who_deleted

        self.save(shipment_to_inactive)

        return shipment_to_inactive.customer_tracking

    def create(
        self,
        data: ShipmentCreateRequest,
        driver_id: int,
        service_type: ServiceType,
        user_id: int,
        new_trailer: Trailer | None,
        new_consolidate: list[Consolidate] | Consolidate | None,
    ) -> ShipmentAssign:

        consolidates_list = (
            new_consolidate
            if isinstance(new_consolidate, list)
            else ([new_consolidate] if new_consolidate is not None else [])
        )

        new_assgiment_shipment = ShipmentAssign(
            tracking_number=data.tracking_number,
            customer_tracking=data.customer_tracking,
            type_operation=data.type_operation,
            driver_id=driver_id,
            client_id=data.cliente,
            assigned_by=user_id,
            service_type=service_type,
            unit_truck_id=int(data.truck),
            origen=data.origen,
            destination=data.destination,
            is_active=True,
            trailer_id=new_trailer.id if new_trailer else None,
            consolidate_guide=consolidates_list,
        )
        return self.save(new_assgiment_shipment)

    def refresh(self, shipment: ShipmentAssign) -> ShipmentAssign:
        self._db.refresh(shipment)
        return shipment

    def get_shipment(self, id: int) -> ShipmentAssign:
        shipment_id = (
            self._db.query(ShipmentAssign).filter(ShipmentAssign.id == id).first()
        )
        if not shipment_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Shipment with {id} not found",
            )
        return shipment_id

    def update_shipment(
        self, id: int, shipment_data: ServiceTypeUnionRequestUpdate, user_id: int
    ) -> tuple[ShipmentAssign, list[ShipmentEventModel]]:

        shipment = self.get_shipment(id)

        # La respuesta trae cliente/truck como texto para mostrar (nombre, número
        # de unidad) y consolidate_guide como dicts: no se pueden asignar a las
        # columnas/relaciones, así que solo se actualizan campos escalares.
        changes = shipment_data.model_dump(
            include=_EDITABLE_FIELDS | _TRAILER_FIELDS, exclude_unset=True
        )
        for field, value in changes.items():
            target = shipment.trailer if field in _TRAILER_FIELDS else shipment
            if value is not None and target is not None:
                setattr(target, field, value)

        # Los eventos se AGREGAN al historial (no se reemplazan): sftp_send
        # referencia eventos existentes y el cascade borraría su historial.
        # El formulario reenvía todos los eventos; solo se agregan los nuevos.
        existing = {
            (e.category, e.event_time.replace(tzinfo=None, microsecond=0))
            for e in shipment.events
            if e.is_active and e.event_time
        }

        events = (
            shipment_data.events
            if isinstance(shipment_data.events, list)
            else [shipment_data.events]
        )

        new_events: list[ShipmentEventModel] = []
        for e in events:
            if e is None:
                continue
            key = (e.category.value, e.dateTime.replace(tzinfo=None, microsecond=0))
            if key in existing:
                continue
            new_event = ShipmentEventModel(
                category=e.category.value,
                event_time=e.dateTime,
                notes=e.notes,
                trip_assigned_id=id,
                capture_by_id=user_id,
            )
            shipment.events.append(new_event)
            new_events.append(new_event)

        self._db.commit()
        self._db.refresh(shipment)
        for event in new_events:
            self._db.refresh(event)
        return shipment, new_events

    def get_all_shipments(
        self, page: int = 1, limit: int = 10
    ) -> tuple[list[ShipmentAssign], int]:
        """Dashboard: embarques sin entregar + los entregados hoy."""

        today = datetime.combine(datetime.now().date(), time.min)
        delivered = and_(
            ShipmentEventModel.trip_assigned_id == ShipmentAssign.id,
            ShipmentEventModel.is_active.is_(True),
            ShipmentEventModel.category == EventCategory.DELIVERY.value,
        )
        is_delivered = exists(select(ShipmentEventModel.id).where(delivered))
        delivered_today = exists(
            select(ShipmentEventModel.id).where(
                delivered, ShipmentEventModel.event_time >= today
            )
        )

        query = self._db.query(ShipmentAssign).filter(
            ShipmentAssign.is_active.is_(True), or_(~is_delivered, delivered_today)
        )

        total = query.count()
        shipments = (
            query.order_by(ShipmentAssign.assigned_day.desc(), ShipmentAssign.id.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return shipments, total

    def get_shipments_history(
        self,
        date_from: datetime | None = None,
        date_to: datetime | None = None,
        client_name: int | None = None,
        driver_name: str | None = None,
        only_delivered: bool | None = None,
        delivered_event_type: str = EventCategory.DELIVERY.value,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[ShipmentAssign], int]:
        query = self._db.query(ShipmentAssign)

        if date_from is not None:
            query = query.filter(ShipmentAssign.assigned_day >= date_from)
        if date_to is not None:
            query = query.filter(ShipmentAssign.assigned_day <= date_to)
        if client_name is not None:
            query = query.filter(ShipmentAssign.client_id == client_name)
        if driver_name is not None:
            query = query.filter(ShipmentAssign.driver_id == driver_name)

        if only_delivered is not None:
            has_delivered = exists(
                select(ShipmentEventModel.id).where(
                    and_(
                        ShipmentEventModel.trip_assigned_id == ShipmentAssign.id,
                        ShipmentEventModel.is_active.is_(True),
                        ShipmentEventModel.category == delivered_event_type,
                    )
                )
            )
            query = query.filter(has_delivered if only_delivered else ~has_delivered)

        total = query.count()
        shipments = (
            query.order_by(ShipmentAssign.assigned_day.desc(), ShipmentAssign.id.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return shipments, total
