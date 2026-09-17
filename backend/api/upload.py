import asyncio
from service import SFTPService

sftp_service = SFTPService()


async def handel_upload(local: str, remote: str):
    loop = asyncio.get_event_loop()

    await loop.run_in_executor(None, sftp_service.connect)
    await loop.run_in_executor(None, sftp_service.upload_file, local, remote)
