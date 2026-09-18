import logging

from typing import List
from schema import ShipmentUpdate, EventPayload
from service import XMLService, SFTPService
from schema import SftpConfigurationRequest

logger = logging.getLogger(__name__)


class ShipmentDispatchService:
    """Facade orchestrating XML generation, SFTP transfers, email alerts, and audit logs."""

    def __init__(
        self,
        xml_svc: XMLService,
        sftp_config: SftpConfigurationRequest,
        shipment: ShipmentUpdate,
    ):

        self.xml_svc = xml_svc
        self.sft_svc = SFTPService(sftp_config)
        self.xml_request_data = None
        self.shipment = shipment

    def dispatch_file_xml(self) -> List[str]:
        xml_payload: List[EventPayload] = EventPayload.from_shipment_update(
            self.shipment
        )
        dispatched_files: List[str] = []

        for payload in xml_payload:
            try:
                file_path = self.xml_svc.create_event_file(**payload.model_dump())
                self.sft_svc.upload_file(file_path)
                logger.info(
                    f"Dispatched XML event '{payload.event}' for tracking '{payload.tracking_number}'"
                )
                dispatched_files.append(file_path)
            except Exception as e:
                logger.error(
                    f"Failed to dispatch event '{payload.event}' for tracking '{payload.tracking_number}': {e}"
                )
                raise e

        return dispatched_files

    def dispatch_email_notification(self):
        pass
