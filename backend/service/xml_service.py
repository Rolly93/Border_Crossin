import xml.etree.ElementTree as ET
from datetime import datetime
import os

from schema.xml_file_schema import XmlRequest


class XMLService:
    """docstring for XMLService."""

    def __init__(self, output_dir="temp/xmltemp/"):
        self._output_dir = output_dir
        self.now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        if not os.path.exists(self._output_dir):
            os.makedirs(self._output_dir)

    def create_event_file(self, data: XmlRequest) -> str:
        """XML Events File Creator

        Keyword arguments:
        referencia-- Client refences (92B , 82B) lenght 10 chars.
        tipo_operacion -- 1 Importacion / 2 Exportacion -> str.
        codigo_transport -- SCAC -> len 4 char.
        ref_transport -- supplier reference /track num.
        codigo_evento -- AFS: Arrival  / DPU: departure / ECC: MEX Clearece /   CLR : USA Clearece /  TSC : Delivery.
        date_time -- date and time when it happens.
        comments -- general comments..

        Return: FilePath : str.
        """

        root = ET.Element(
            "AvisoEventos",
            {
                "ReferenciaExpd": data.client_reference,
                "TipoOperacion": data.operation_type,
                "CodigoTransportista": data.scac_code,
                "ReferenciaTransportista": data.drayage_reference,
                "CodigoEvento": data.date_time,
                "FechaHoraEvento": data.event_code,
                "Comentarios": data.comments if data.comments else "",
            },
        )
        tree = ET.ElementTree(root)
        file_name = (
            f"{data.scac_code}_{data.client_reference}_{data.event_code}_{self.now}.xml"
        )
        file_path = os.path.join(self._output_dir, file_name)

        tree.write(file_path, encoding="utf-8", xml_declaration=True)
        return file_path
