from typing import Any, Dict
import xml.etree.ElementTree as ET
import os

from schema.shipment_shcema import EventPayload
from schema.xml_file_schema import BaseXMLTransformer


class XMLService:
    """Genera el XML de un evento y lo guarda en la carpeta local del cliente."""

    def __init__(self, transformer: BaseXMLTransformer):
        self.transformer = transformer

    def _dict_to_elem(self, tag: str, d: Dict[str, Any]) -> ET.Element:
        elem = ET.Element(tag)
        for key, val in d.items():
            if isinstance(val, dict):
                elem.append(self._dict_to_elem(key, val))
            else:
                elem.set(key, str(val) if val is not None else "")
        return elem

    def create_event_file(self, data: EventPayload, scac: str, root_folder: str) -> str:
        xml_dict = self.transformer.transform_event(data)
        filename = self.transformer.format_filename(data, scac)

        root_tag = list(xml_dict.keys())[0]
        root = self._dict_to_elem(root_tag, xml_dict[root_tag])

        os.makedirs(root_folder, exist_ok=True)
        file_path = os.path.join(root_folder, filename)
        ET.ElementTree(root).write(file_path, encoding="utf-8", xml_declaration=True)
        return file_path
