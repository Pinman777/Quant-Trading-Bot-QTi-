from typing import Any, Dict, Optional, Union
from sqlalchemy.orm import Session
from ..core.security import get_password_hash, verify_password
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate
from .base import CRUDBase

class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """
    CRUD операции для пользователей.
    """
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        """
        Получение пользователя по email.
        
        Args:
            db: Сессия базы данных
            email: Email пользователя
            
        Returns:
            Optional[User]: Пользователь или None
        """
        return db.query(User).filter(User.email == email).first()

    def get_by_username(self, db: Session, *, username: str) -> Optional[User]:
        """
        Получение пользователя по имени пользователя.
        
        Args:
            db: Сессия базы данных
            username: Имя пользователя
            
        Returns:
            Optional[User]: Пользователь или None
        """
        return db.query(User).filter(User.username == username).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        """
        Создание пользователя.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            
        Returns:
            User: Созданный пользователь
        """
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
            is_superuser=False,
            is_verified=False
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: User,
        obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        """
        Обновление пользователя.
        
        Args:
            db: Сессия базы данных
            db_obj: Пользователь для обновления
            obj_in: Данные для обновления
            
        Returns:
            User: Обновленный пользователь
        """
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        if update_data.get("password"):
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(
        self,
        db: Session,
        *,
        email: str,
        password: str
    ) -> Optional[User]:
        """
        Аутентификация пользователя.
        
        Args:
            db: Сессия базы данных
            email: Email пользователя
            password: Пароль
            
        Returns:
            Optional[User]: Пользователь или None
        """
        user = self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def is_active(self, user: User) -> bool:
        """
        Проверка активности пользователя.
        
        Args:
            user: Пользователь
            
        Returns:
            bool: True если пользователь активен
        """
        return user.is_active

    def is_superuser(self, user: User) -> bool:
        """
        Проверка прав суперпользователя.
        
        Args:
            user: Пользователь
            
        Returns:
            bool: True если пользователь является суперпользователем
        """
        return user.is_superuser

    def is_verified(self, user: User) -> bool:
        """
        Проверка верификации пользователя.
        
        Args:
            user: Пользователь
            
        Returns:
            bool: True если пользователь верифицирован
        """
        return user.is_verified

user = CRUDUser(User) 