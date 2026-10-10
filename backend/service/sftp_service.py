import os

import paramiko
from fastapi import HTTPException, status

from config.config import SFTPConfig
from schema import SftpConfigurationRequest


class SFTPService:
    """docstring for SftoService."""

    def __init__(self, config: SftpConfigurationRequest):

        self.__host = config.host
        self.__port = config.port
        self.__user = config.username
        self.__password = config.encrypted_password
        self._remote_folder = config.remote_folder

        self.trasport = None
        self.sftp = None

    def connect(self):
        try:
            if not self.__host:
                raise ValueError("SFTP_HOST is not define in envarioment variables")
            self.trasport = paramiko.Transport((self.__host, self.__port))
            self.trasport.connect(username=self.__user, password=self.__password)
            self.sftp = paramiko.SFTPClient.from_transport(self.trasport)
            print(f"Connectando a SFTP: {self.__host}")
        except paramiko.AuthenticationException as e:
            self.close()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Error: Usuario o contraseña incorrectos.",
            )
        except paramiko.SSHException as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error de protocolo SSH: {e}",
            )
        except Exception as e:
            self.close()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error inesperado al conectar: { e}",
            )

    def upload_file(self, local_path: str) -> str:
        """Sube local_path a remote_folder y devuelve la ruta remota."""
        if self.sftp is None:
            raise RuntimeError("No hay una sesión SFTP activa")
        remote_path = f"{self._remote_folder.rstrip('/')}/{os.path.basename(local_path)}"
        self.sftp.put(local_path, remote_path)
        return remote_path

    def close(self):
        if self.sftp:
            self.sftp.close()
        if self.trasport:
            self.trasport.close()
        self.sftp = None
        self.trasport = None

    def delete_file(self, filename: str):
        try:
            if not self.sftp:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No hay una sesión SFTP activa.",
                )
            self.sftp.remove(filename)
            print(f"Archivo {filename} eliminado del servidor")
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El archivo remoto {filename} no existe en el servidor.",
            )
