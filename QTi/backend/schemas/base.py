from datetime import datetime
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict

class BaseSchema(BaseModel):
    """
    Базовая схема для всех моделей.
    """
    model_config = ConfigDict(
        from_attributes=True,
        json_encoders={
            datetime: lambda v: v.isoformat()
        }
    )

class BaseResponse(BaseSchema):
    """
    Базовая схема для ответов API.
    """
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None

class ErrorResponse(BaseSchema):
    """
    Схема для ответов с ошибками.
    """
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None

class PaginationParams(BaseSchema):
    """
    Параметры пагинации.
    """
    page: int = 1
    per_page: int = 10
    total: Optional[int] = None
    total_pages: Optional[int] = None

class PaginatedResponse(BaseResponse):
    """
    Схема для пагинированных ответов.
    """
    pagination: PaginationParams 