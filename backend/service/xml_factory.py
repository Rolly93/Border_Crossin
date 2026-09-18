from schema.xml_file_schema import  BaseXMLTransformer , ExpeditorsXMLService

class XMLServiceFactory:
    @staticmethod

    def get_xml_service(client_identifier:str)-> BaseXMLTransformer:
        client_key = client_identifier.lower().strip()

        if "expeditors" in client_key:
            return ExpeditorsXMLService()

        else:
            raise ValueError(
                f"No XML generator configured for client: {client_identifier}"
            )
