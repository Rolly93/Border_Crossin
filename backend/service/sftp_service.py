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

        self._root_folder = config.root_folder
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

    def upload_file(
        self,
    ):
        """Envio de Documentos via SFTP

        Args:
            local_path (str):ubicacion real del archivo EJEM : "test/route/my_shipment.xml"
            remote_path (str): a donde se estara depostiando : EJEM: /upload/test_xml.xm

        Raises:
            f: Error de E/S (Ruta remota valida?)
            f: Error al subir archivo
            f: Error: Generico
        """
        try:
            if self.sftp:
                self.sftp.put(self._root_folder, self._remote_folder)
        except FileExistsError as e:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El archivo local no fue encontrado en la ruta: {self._root_folder}",
            )
        except IOError as io_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error de E/S (¿Ruta remota válida?): {io_error}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error al subir archivo: {e}",
            )

    def close(self):
        if self.sftp:
            self.sftp.close()
        if self.trasport:
            self.trasport.close()
        print(f"Conexion Cerrada!!")

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
