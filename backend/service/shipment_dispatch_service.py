import logging

from typing import Optional
from schema import SftpSendConfig, ShipmentUpdate
from model import ShipmentAssign
from service import XMLService, SFTPService, EmailService
from repository import SftpRepository

logger = logging.getLogger(__name__)


class ShipmentDispatchService:
    """Facade orchestrating XML generation, SFTP transfers, email alerts, and audit logs."""

    def __init__(
        self,
        xml_svc: XMLService,
        sftp_svc: SFTPService,
        email_svc: EmailService,
        sftp_send_repo: SftpRepository,
    ):

        self.xml_svc = xml_svc
        self.sftp_svc = sftp_svc
        self.email_svc = email_svc
        self.sftp_send_repo = sftp_send_repo

        def dispatch_file_xml(
            self, shipmentEvent: ShipmentUpdate, connection_data: SftpSendConfig
        ) -> str:

            return ""
