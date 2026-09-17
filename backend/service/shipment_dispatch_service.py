import logging

from typing import Optional
from schema import SftpSendConfig, ShipmentUpdate
from model import ShipmentAssign
from service import XMLService, SFTPService, EmailService
from schema import SftpConfigurationRequest
from repository import SftpRepository

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

    def dispatch_file_xml(
        self, shipmentEvent: ShipmentUpdate, connection_data: SftpSendConfig
    ) -> str:

        file_root = self.xml_svc.create_event_file()
        self.xml_svc.create_event_file
        return ""
