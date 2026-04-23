import bcrypt  
from backend.model.user import LoginRequest
from typing import Optional
from config.config import Env
class AuthService:
    def __init__(self):
        # In a real app, you'd pass a DB session here
        self._env = Env()
        pass

    def hash_content(self, toHash: str) -> str:
        """Transforms a plain input into a secure hash."""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(toHash.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Checks if the entered password matches the stored hash."""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    def autenticar(self, email: str, password: str) -> Optional[LoginRequest]:
        """
        Logic for the /login route.
        """
        # 1. Look for the user in your database 
        # user = db.query(User).filter(User.email == email).first()
        
        if email == self._env.USER_EMAIL and password == self._env.USER_PASSWORD:
            class MockUser:
                id = 1
                usrname = "Test_Username"
                rol = "admin"
                email = self._env.USER_EMAIL
                is_admin = True
            
            
            return MockUser
        
        # 2. Verify password (Real logic)
        # if user and self.verify_password(password, user.hashed_password):
        #     return user
            
        return False
    def is_duplicate(self,name , email ):
        """Verify if ist duplicate in the database
        
        """
        pass
    def crear_usuario(self, nombre, email, password, es_admin=False):
        """
        Logic for the /usuarios route.
        """
        hashed = self.hash_content(password)
        try:
            # db_user = User(nombre=nombre, email=email, hashed_password=hashed, rol="admin" if es_admin else "user")
            # db.add(db_user)
            # db.commit()
            print(f"Saving user {nombre} with hashed pass: {hashed}")
            return True
        except Exception as e:
            print(f"Error: {e}")
            return False

    def es_token_valido(self, token: str) -> bool:
        """
        Logic for the /setup/{token} route.
        """
        # For now, just a dummy check
        return token == "secret-setup-token"