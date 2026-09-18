from typing import Any, Dict
import xml.etree.ElementTree as ET
from datetime import datetime
import os

from schema.shipment_shcema import EventPayload
from schema.xml_file_schema import BaseXMLTransformer

class XMLService:
    """docstring for XMLService."""

    def __init__(self, transformer: BaseXMLTransformer, output_dir="temp/xmltemp/"):
        self.transformer = transformer
        self._output_dir = output_dir
        self.now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

        if not os.path.exists(self._output_dir):
            os.makedirs(self._output_dir)

    def _dict_to_elem(self, tag: str, d: Dict[str, Any]) -> ET.Element:
        elem = ET.Element(tag)
        for key, val in d.items():
            if isinstance(val, dict):
                child = self._dict_to_elem(key, val)
                elem.append(child)
            else:
                elem.set(key, str(val) if val is not None else "")
        return elem

    def create_event_file(self, data: EventPayload) -> str:
        xml_dict = self.transformer.transform_event(data)

        root_tag = list(xml_dict.keys())[0]
        root_content = xml_dict[root_tag]

        if isinstance(root_content, dict):
            root = self._dict_to_elem(root_tag, root_content)
        else:
            root = ET.Element(root_tag)

        now_str = datetime.now().strftime("%Y%m%dT%H%M%S")
        file_name = f"{data.tracking_number}_{data.event}_{now_str}.xml"
        file_path = os.path.join(self._output_dir, file_name)

        tree = ET.ElementTree(root)
        tree.write(file_path, encoding="utf-8", xml_declaration=True)

        return file_path
