from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from ...notifications.manager import NotificationManager
from ...notifications.base import NotificationType, NotificationPriority

router = APIRouter(prefix="/notifications", tags=["notifications"])
notification_manager = NotificationManager()

@router.get("/")
async def get_notifications(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    unread_only: bool = False
):
    """Get notifications with pagination."""
    return await notification_manager.get_notifications(
        limit=limit,
        offset=offset,
        unread_only=unread_only
    )

@router.post("/")
async def create_notification(
    title: str,
    message: str,
    type: NotificationType,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    data: Optional[dict] = None
):
    """Create a new notification."""
    notification = await notification_manager.create_notification(
        title=title,
        message=message,
        type=type,
        priority=priority,
        data=data
    )
    return notification.to_dict()

@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """Mark notification as read."""
    if not await notification_manager.mark_as_read(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

@router.post("/read-all")
async def mark_all_as_read():
    """Mark all notifications as read."""
    count = await notification_manager.mark_all_as_read()
    return {"status": "success", "count": count}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete notification."""
    if not await notification_manager.delete_notification(notification_id):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"} 