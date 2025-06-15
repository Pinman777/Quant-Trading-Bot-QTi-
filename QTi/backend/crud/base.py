from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Базовый класс для CRUD операций.
    """
    def __init__(self, model: Type[ModelType]):
        """
        Инициализация с моделью SQLAlchemy.
        
        Args:
            model: Класс модели SQLAlchemy
        """
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        """
        Получение объекта по ID.
        
        Args:
            db: Сессия базы данных
            id: ID объекта
            
        Returns:
            Optional[ModelType]: Объект или None
        """
        return db.query(self.model).filter(self.model.id == id).first()

    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """
        Получение списка объектов.
        
        Args:
            db: Сессия базы данных
            skip: Количество пропускаемых объектов
            limit: Максимальное количество объектов
            filters: Фильтры для запроса
            
        Returns:
            List[ModelType]: Список объектов
        """
        query = db.query(self.model)
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
        
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Создание объекта.
        
        Args:
            db: Сессия базы данных
            obj_in: Данные для создания
            
        Returns:
            ModelType: Созданный объект
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Обновление объекта.
        
        Args:
            db: Сессия базы данных
            db_obj: Объект для обновления
            obj_in: Данные для обновления
            
        Returns:
            ModelType: Обновленный объект
        """
        obj_data = jsonable_encoder(db_obj)
        
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: int) -> ModelType:
        """
        Удаление объекта.
        
        Args:
            db: Сессия базы данных
            id: ID объекта
            
        Returns:
            ModelType: Удаленный объект
        """
        obj = db.query(self.model).get(id)
        db.delete(obj)
        db.commit()
        return obj

    def count(
        self,
        db: Session,
        *,
        filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Подсчет количества объектов.
        
        Args:
            db: Сессия базы данных
            filters: Фильтры для запроса
            
        Returns:
            int: Количество объектов
        """
        query = db.query(self.model)
        
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field):
                    query = query.filter(getattr(self.model, field) == value)
        
        return query.count() 