import os
from fastapi_mail import  MessageSchema , ConnectionConfig, MessageType ,FastMail
from pydantic import EmailStr
from backend.config import EmailConfig
from jinja2 import Environment , FileSystemLoader

class EmailService:
    def __init__(self, config: EmailConfig):
        self.conf = ConnectionConfig(
            MAIL_USERNAME=config.USERNAME,
            MAIL_PASSWORD=config.PASSWORD,
            MAIL_FROM=config.MAIL_FROM,
            MAIL_PORT=config.PORT,
            MAIL_SERVER=config.SERVER,
            MAIL_STARTTLS=False,
            MAIL_SSL_TLS=False,
            USE_CREDENTIALS=False,
            VALIDATE_CERTS=False
        )
        template_path = os.path.join(os.path.dirname(__file__),'..','templates')
        self.jinja_env = Environment(loader=FileSystemLoader(template_path))

    async def send_notification(self, subject: str, recipient: str, body: str):
        """Notificacion EMAIL

        Args:
            subject (str): Email Subject
            recipient (list): Send to
            body (dic): track_num , shipment_num , trailer,pick_time
            departure_time , mex_inspection , mex_clear , usa_inspection
            
        """
        
        template = self.jinja_env.get_template("status_email.html")
        html_content =  template.render(body)
        message = MessageSchema(
            subject=subject,
            recipients=[recipient],  # Debe ser una lista
            body=html_content,
            subtype=MessageType.html # O MessageType.plain
        )

        fm = FastMail(self.conf)
        try:
            await fm.send_message(message)
            print(f"📧 Notificación enviada a {recipient}")
        except Exception as e:
            print(f"❌ Error al enviar email: {e}")
import asyncio

async def send_templated_email():
    # 1. Simular la configuración
    config = EmailConfig() # Asegúrate de que cargue los datos de Mailhog
    
    # 2. Instanciar el servicio
    service = EmailService(config)
    
    shipment = {
        "track_num" : "tr1234567",
        "shipment_num" : "92B1234567"
    }
    await service.send_notification(
        subject="STATUS UPDATE",
        recipient="rolando@ejemplo.com",
        body=shipment
    )

if __name__ == "__main__":
    asyncio.run(send_templated_email())