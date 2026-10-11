import logging
from sqlalchemy.orm import Session
from typing import List

from service.shipment_dispatch_service import ShipmentDispatchService
from utility.cliente_service import ClienteService
from model.db_model import ShipmentAssign, ShipmentEventModel
from repository.system_config_repository import SystemConfigRepository
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from repository import ShipmentRepository
from utility.reference_rule_service import ReferenceRuleService

logger = logging.getLogger(__name__)


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db
        self._shipment_db = ShipmentRepository(db)
        self._client_service = ClienteService(db)

    def get_all_shipments(
        self, page: int = 1, limit: int = 10
    ) -> List[ShipmentResponse]:
        raw_shipments = self._shipment_db.get_all_shipments(page, limit)

        return [ShipmentResponse.model_validate(s) for s in raw_shipments]

    def create_shipment(self, shipment: ShipmentCreate):
        db_shipment = ShipmentAssign(**shipment.model_dump())
        self._shipment_db.create(db_shipment)
        return db_shipment

    def delete_shipmnet(self, id: int, user: int) -> str | None:
        shipment_found = self._shipment_db.get_shipment(id)

        shipment_delete = self._shipment_db.delete_shipment(shipment_found, user)
        return shipment_delete

    def update_shipment(
        self, shipment_id: int, shipment_data: ShipmentUpdate, user_id: int
    ) -> ShipmentAssign:
        current = self._shipment_db.get_shipment(shipment_id)
        ReferenceRuleService(self.db).validate(
            client_id=shipment_data.cliente,
            operation=shipment_data.type_operation or current.type_operation,
            reference=shipment_data.customer_tracking or current.customer_tracking,
        )

        shipment, new_events = self._shipment_db.update_shipment(
            shipment_id, shipment_data, user_id
        )
        self.sftp_service(shipment, new_events)
        return shipment

    def sftp_service(
        self, shipment: ShipmentAssign, events: List[ShipmentEventModel]
    ) -> list:
        if not events:
            return []

        client_data = self._client_service.get_client_service(
            shipment.client_id, "sftp_service"
        )
        if not client_data or not client_data.sftService:
            return []

        scac = SystemConfigRepository(self.db).get_scac()
        dispatcher = ShipmentDispatchService(self.db, client_data.sftService, scac)
        return dispatcher.dispatch_events(events)

    def email_service(self, shipment: ShipmentUpdate):
        pass
