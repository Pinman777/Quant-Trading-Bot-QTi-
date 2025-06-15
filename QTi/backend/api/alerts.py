from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.alert_service import AlertService
from ..models.alert import Alert, AlertSettings
from pydantic import BaseModel

router = APIRouter()

class AlertCreate(BaseModel):
    type: str
    exchange: str
    symbol: str
    message: str
    severity: str = "info"

class AlertUpdate(BaseModel):
    read: bool

class AlertSettingsUpdate(BaseModel):
    position_limit_threshold: Optional[float] = None
    enabled_exchanges: Optional[List[str]] = None
    enabled_symbols: Optional[List[str]] = None
    notification_channels: Optional[dict] = None

@router.get("/alerts", response_model=List[Alert])
def get_alerts(
    exchange: Optional[str] = None,
    symbol: Optional[str] = None,
    type: Optional[str] = None,
    read: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    alert_service = AlertService(db)
    return alert_service.get_alerts(exchange, symbol, type, read)

@router.get("/alerts/unread", response_model=List[Alert])
def get_unread_alerts(db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    return alert_service.get_unread_alerts()

@router.post("/alerts", response_model=Alert)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    return alert_service.create_alert(
        type=alert.type,
        exchange=alert.exchange,
        symbol=alert.symbol,
        message=alert.message,
        severity=alert.severity
    )

@router.post("/alerts/{alert_id}/read")
def mark_alert_as_read(alert_id: int, db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    alert = alert_service.mark_alert_as_read(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert marked as read"}

@router.post("/alerts/read-all")
def mark_all_alerts_as_read(db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    alert_service.mark_all_alerts_as_read()
    return {"message": "All alerts marked as read"}

@router.delete("/alerts/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    alert_service.delete_alert(alert_id)
    return {"message": "Alert deleted"}

@router.delete("/alerts")
def clear_all_alerts(db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    alert_service.clear_all_alerts()
    return {"message": "All alerts cleared"}

@router.get("/alerts/settings", response_model=AlertSettings)
def get_alert_settings(db: Session = Depends(get_db)):
    alert_service = AlertService(db)
    return alert_service.get_alert_settings()

@router.put("/alerts/settings", response_model=AlertSettings)
def update_alert_settings(
    settings: AlertSettingsUpdate,
    db: Session = Depends(get_db)
):
    alert_service = AlertService(db)
    return alert_service.update_alert_settings(settings.dict(exclude_unset=True))

@router.post("/alerts/check-position-limits/{exchange}")
def check_position_limits(
    exchange: str,
    api_key: str,
    api_secret: str,
    db: Session = Depends(get_db)
):
    alert_service = AlertService(db)
    alert_service.check_position_limits(exchange, api_key, api_secret)
    return {"message": "Position limits checked"} 