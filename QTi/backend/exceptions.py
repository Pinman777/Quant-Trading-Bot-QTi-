from fastapi import HTTPException, status

class QTiException(HTTPException):
    """Base exception for QTi application"""
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class AuthenticationError(QTiException):
    """Authentication related errors"""
    def __init__(self, detail: str = "Authentication failed"):
        super().__init__(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)

class AuthorizationError(QTiException):
    """Authorization related errors"""
    def __init__(self, detail: str = "Not authorized"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class NotFoundError(QTiException):
    """Resource not found errors"""
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class ValidationError(QTiException):
    """Validation related errors"""
    def __init__(self, detail: str = "Validation failed"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)

class DatabaseError(QTiException):
    """Database related errors"""
    def __init__(self, detail: str = "Database error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class APIError(QTiException):
    """External API related errors"""
    def __init__(self, detail: str = "API error"):
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)

class BotError(QTiException):
    """Bot related errors"""
    def __init__(self, detail: str = "Bot error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class ServerError(QTiException):
    """Server related errors"""
    def __init__(self, detail: str = "Server error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class MarketError(QTiException):
    """Market data related errors"""
    def __init__(self, detail: str = "Market data error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail)

class ConfigurationError(QTiException):
    """Configuration related errors"""
    def __init__(self, detail: str = "Configuration error"):
        super().__init__(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=detail) 