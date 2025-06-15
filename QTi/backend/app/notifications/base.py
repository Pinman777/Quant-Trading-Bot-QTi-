from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

class NotificationType(Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    TRADE = "trade"
    SYSTEM = "system"

class NotificationPriority(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Notification(ABC):
    def __init__(
        self,
        title: str,
        message: str,
        type: NotificationType,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        data: Optional[Dict[str, Any]] = None
    ):
        self.id: str = None  # Will be set by notification manager
        self.title = title
        self.message = message
        self.type = type
        self.priority = priority
        self.data = data or {}
        self.created_at = datetime.utcnow()
        self.read = False
        self.read_at: Optional[datetime] = None

    @abstractmethod
    async def send(self) -> bool:
        """
        Send the notification.
        
        Returns:
            bool: True if notification was sent successfully, False otherwise
        """
        pass

    def to_dict(self) -> Dict[str, Any]:
        """Convert notification to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "message": self.message,
            "type": self.type.value,
            "priority": self.priority.value,
            "data": self.data,
            "created_at": self.created_at.isoformat(),
            "read": self.read,
            "read_at": self.read_at.isoformat() if self.read_at else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Notification':
        """Create notification from dictionary."""
        notification = cls(
            title=data["title"],
            message=data["message"],
            type=NotificationType(data["type"]),
            priority=NotificationPriority(data["priority"]),
            data=data.get("data", {})
        )
        notification.id = data["id"]
        notification.created_at = datetime.fromisoformat(data["created_at"])
        notification.read = data["read"]
        notification.read_at = (
            datetime.fromisoformat(data["read_at"])
            if data.get("read_at")
            else None
        )
        return notification 