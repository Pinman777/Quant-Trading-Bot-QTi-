from typing import Dict, List, Optional, Set
from datetime import datetime
import asyncio
import uuid
from .base import Notification, NotificationType, NotificationPriority
from .websocket import WebSocketNotification
from ..websockets.manager import WebSocketManager

class NotificationManager:
    def __init__(self):
        self._notifications: Dict[str, Notification] = {}
        self._websocket_clients: Set[str] = set()
        self._notification_queue: asyncio.Queue[Notification] = asyncio.Queue()
        self._running = False
        self._websocket_manager = WebSocketManager()

    async def start(self):
        """Start notification manager."""
        if not self._running:
            self._running = True
            asyncio.create_task(self._process_notifications())

    async def stop(self):
        """Stop notification manager."""
        self._running = False

    def register_websocket_client(self, client_id: str):
        """Register new WebSocket client."""
        self._websocket_clients.add(client_id)

    def unregister_websocket_client(self, client_id: str):
        """Unregister WebSocket client."""
        self._websocket_clients.discard(client_id)

    async def create_notification(
        self,
        title: str,
        message: str,
        type: NotificationType,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        data: Optional[Dict] = None
    ) -> Notification:
        """Create and queue a new notification."""
        notification = WebSocketNotification(
            title=title,
            message=message,
            type=type,
            priority=priority,
            data=data
        )
        notification.id = str(uuid.uuid4())
        self._notifications[notification.id] = notification
        await self._notification_queue.put(notification)
        return notification

    async def get_notifications(
        self,
        limit: int = 100,
        offset: int = 0,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications with pagination."""
        notifications = list(self._notifications.values())
        if unread_only:
            notifications = [n for n in notifications if not n.read]
        notifications.sort(key=lambda x: x.created_at, reverse=True)
        return [n.to_dict() for n in notifications[offset:offset + limit]]

    async def mark_as_read(self, notification_id: str) -> bool:
        """Mark notification as read."""
        if notification := self._notifications.get(notification_id):
            notification.read = True
            notification.read_at = datetime.utcnow()
            return True
        return False

    async def mark_all_as_read(self) -> int:
        """Mark all notifications as read."""
        count = 0
        for notification in self._notifications.values():
            if not notification.read:
                notification.read = True
                notification.read_at = datetime.utcnow()
                count += 1
        return count

    async def delete_notification(self, notification_id: str) -> bool:
        """Delete notification."""
        if notification_id in self._notifications:
            del self._notifications[notification_id]
            return True
        return False

    async def _process_notifications(self):
        """Process notification queue."""
        while self._running:
            try:
                notification = await self._notification_queue.get()
                await self._broadcast_notification(notification)
                self._notification_queue.task_done()
            except Exception as e:
                print(f"Error processing notification: {e}")
                await asyncio.sleep(1)

    async def _broadcast_notification(self, notification: Notification):
        """Broadcast notification to all WebSocket clients."""
        message = {
            "type": "notification",
            "data": notification.to_dict()
        }
        await self._websocket_manager.broadcast(message, "notifications") 