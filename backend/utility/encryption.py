from cryptography.fernet import Fernet

from config import Env

config = Env()

# Use dedicated FERNET_KEY for encryption (separate from JWT_SECRET_KEY)
fernet_key = config.FERNET_KEY or config.SECRET_KEY
fernet = Fernet(
    fernet_key.encode()
    if isinstance(fernet_key, str)
    else fernet_key
)


def encrypt_password(plain_password: str) -> str:
    encrypted_bytes = fernet.encrypt(plain_password.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")


def decrypt_password(encrypted_password: str) -> str:
    decrypted_bytes = fernet.decrypt(encrypted_password.encode("utf-8"))
    return decrypted_bytes.decode("utf-8")