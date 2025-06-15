from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status

from ..models import User
from ..schemas.auth import UserCreate
from ..config import settings
from ..logger import auth_logger

class AuthService:
    def __init__(self):
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = settings.SECRET_KEY
        self.algorithm = "HS256"

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return self.pwd_context.hash(password)

    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    def authenticate_user(
        self,
        db: Session,
        username: str,
        password: str
    ) -> Optional[User]:
        """Authenticate user"""
        user = self.get_user_by_username(db, username)
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user

    def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create new user"""
        hashed_password = self.get_password_hash(user_data.password)
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def create_access_token(
        self,
        data: dict,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        try:
            encoded_jwt = jwt.encode(
                to_encode,
                self.secret_key,
                algorithm=self.algorithm
            )
            return encoded_jwt
        except Exception as e:
            auth_logger.error(f"Error creating access token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error creating access token"
            )

    def verify_token(self, token: str) -> dict:
        """Verify JWT token"""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm]
            )
            return payload
        except JWTError as e:
            auth_logger.error(f"Error verifying token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    def update_user_password(
        self,
        db: Session,
        user: User,
        new_password: str
    ) -> User:
        """Update user password"""
        hashed_password = self.get_password_hash(new_password)
        user.hashed_password = hashed_password
        db.commit()
        db.refresh(user)
        return user

    def deactivate_user(self, db: Session, user: User) -> User:
        """Deactivate user account"""
        user.is_active = False
        db.commit()
        db.refresh(user)
        return user

    def activate_user(self, db: Session, user: User) -> User:
        """Activate user account"""
        user.is_active = True
        db.commit()
        db.refresh(user)
        return user 