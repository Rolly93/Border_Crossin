import logging

from typing import List
from schema import ShipmentUpdate

from service import XMLService, SFTPService
from schema import SftpConfigurationRequest, EventPayload

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
        event_payload: List[EventPayload] = EventPayload.from_shipment_update(
            self.shipment
        )

        dispatch_files: list[str] = []
        for payload in event_payload:
            file_path = self.xml_svc.create_event_file(payload)
            self.sft_svc.upload_file(file_path)
            dispatch_files.append(file_path)

        return dispatch_files
