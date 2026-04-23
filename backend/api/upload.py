import asyncio
from ..service import sftp

sftp_service = sftp.SFPTService()
async def handel_upload(local: str,remote: str):
    loop = asyncio.get_event_loop()
    
    await loop.run_in_executor(None,sftp_service.connet)
    await loop.run_in_executor(None , sftp_service.upload_file,local,remote)