from sqlalchemy.orm import Session
from typing import List

from service.xml_factory import XMLServiceFactory
from service.xml_service import XMLService
from utility.cliente_service import ClienteService
from model.db_model import ShipmentAssign
from schema.shipment_shcema import ShipmentCreate, ShipmentUpdate, ShipmentResponse
from repository import ShipmentRepository
from service import ShipmentDispatchService


class ShipmentService:
    def __init__(self, db: Session):
        self.db = db
        self._shipment_db = ShipmentRepository(db)
        self._client_service = ClienteService(db)
        self._orchestrator_service = ShipmentDispatchService

    def get_all_shipments(
        self, page: int = 1, limit: int = 10
    ) -> List[ShipmentResponse]:
        raw_shipments = self._shipment_db.get_all_shipments(page, limit)

        return [ShipmentResponse.model_validate(s) for s in raw_shipments]

    def create_shipment(self, shipment: ShipmentCreate):

        db_shipment = ShipmentAssign(**shipment.model_dump())
        self._shipment_db.create(db_shipment)
        return db_shipment

    def delete_shipmnet(self, id: int, user: str) -> str | None:

        shipment_found = self._shipment_db.get_shipment(id)

        shipment_delete = self._shipment_db.delete_shipment(shipment_found, user)
        return shipment_delete

    def update_shipment(self, shipment_id: int, shipment_data: ShipmentUpdate):
        shipment_update = self._shipment_db.update_shipment(shipment_id, shipment_data)
        self.sftp_service(shipment_update)

        return shipment_update

    def sftp_service(self, shipment: ShipmentUpdate):
        client_id = shipment.cliente
        client_data = self._client_service.get_client_service(client_id, "sftp_service")
        if not client_data or not client_data.sftp_config:
            return

        files_send: List[str] = []
        if client_data.sftp_service:

            xml_strategy = XMLServiceFactory.get_xml_service(client_data.name)
            orchestrator_service = self._orchestrator_service(
                sftp_config=client_data.sftp_config,
                xml_svc=XMLService(xml_strategy),
                shipment=shipment,
            )
            files_send = orchestrator_service.dispatch_file_xml()

        return files_send

    def email_service(self, shipment: ShipmentUpdate):
        pass
