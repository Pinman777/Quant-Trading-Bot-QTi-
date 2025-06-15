from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..models.alert import Alert, AlertSettings
from ..core.exchanges.factory import ExchangeFactory
from ..core.exchanges.base import Position

class AlertService:
    def __init__(self, db: Session):
        self.db = db

    def create_alert(
        self,
        type: str,
        exchange: str,
        symbol: str,
        message: str,
        severity: str = "info"
    ) -> Alert:
        alert = Alert(
            type=type,
            exchange=exchange,
            symbol=symbol,
            message=message,
            severity=severity,
            created_at=datetime.utcnow(),
            read=False
        )
        self.db.add(alert)
        self.db.commit()
        self.db.refresh(alert)
        return alert

    def get_alerts(
        self,
        exchange: Optional[str] = None,
        symbol: Optional[str] = None,
        type: Optional[str] = None,
        read: Optional[bool] = None
    ) -> List[Alert]:
        query = self.db.query(Alert)
        
        if exchange:
            query = query.filter(Alert.exchange == exchange)
        if symbol:
            query = query.filter(Alert.symbol == symbol)
        if type:
            query = query.filter(Alert.type == type)
        if read is not None:
            query = query.filter(Alert.read == read)
            
        return query.order_by(Alert.created_at.desc()).all()

    def get_unread_alerts(self) -> List[Alert]:
        return self.db.query(Alert).filter(Alert.read == False).order_by(Alert.created_at.desc()).all()

    def mark_alert_as_read(self, alert_id: int) -> Alert:
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            alert.read = True
            self.db.commit()
            self.db.refresh(alert)
        return alert

    def mark_all_alerts_as_read(self) -> None:
        self.db.query(Alert).filter(Alert.read == False).update({"read": True})
        self.db.commit()

    def delete_alert(self, alert_id: int) -> None:
        alert = self.db.query(Alert).filter(Alert.id == alert_id).first()
        if alert:
            self.db.delete(alert)
            self.db.commit()

    def clear_all_alerts(self) -> None:
        self.db.query(Alert).delete()
        self.db.commit()

    def get_alert_settings(self) -> AlertSettings:
        settings = self.db.query(AlertSettings).first()
        if not settings:
            settings = AlertSettings(
                position_limit_threshold=10,
                enabled_exchanges=[],
                enabled_symbols=[],
                notification_channels={
                    "email": False,
                    "telegram": False,
                    "web": True
                }
            )
            self.db.add(settings)
            self.db.commit()
            self.db.refresh(settings)
        return settings

    def update_alert_settings(self, settings_data: Dict[str, Any]) -> AlertSettings:
        settings = self.get_alert_settings()
        for key, value in settings_data.items():
            setattr(settings, key, value)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def check_position_limits(self, exchange: str, api_key: str, api_secret: str) -> None:
        """Проверяет позиции на превышение лимитов и создает оповещения"""
        try:
            # Получаем настройки оповещений
            settings = self.get_alert_settings()
            
            # Проверяем, включены ли оповещения для этой биржи
            if exchange not in settings.enabled_exchanges:
                return

            # Создаем экземпляр биржи
            exchange_instance = ExchangeFactory.create(
                exchange=exchange,
                api_key=api_key,
                api_secret=api_secret
            )

            # Получаем баланс
            balance = exchange_instance.get_balance()
            total_balance = sum(float(b['free']) + float(b['locked']) for b in balance)

            # Получаем все позиции
            positions = exchange_instance.get_positions()

            for position in positions:
                # Проверяем, включены ли оповещения для этого символа
                if position.symbol not in settings.enabled_symbols:
                    continue

                # Рассчитываем стоимость позиции
                position_value = float(position.quantity) * float(position.entry_price)
                
                # Рассчитываем процент от баланса
                position_percentage = (position_value / total_balance) * 100

                # Если позиция превышает установленный лимит, создаем оповещение
                if position_percentage > settings.position_limit_threshold:
                    message = (
                        f"Position {position.symbol} exceeds limit: "
                        f"{position_percentage:.2f}% of balance "
                        f"(limit: {settings.position_limit_threshold}%)"
                    )
                    
                    self.create_alert(
                        type="position_limit",
                        exchange=exchange,
                        symbol=position.symbol,
                        message=message,
                        severity="warning"
                    )

                    # Отправляем уведомления через выбранные каналы
                    if settings.notification_channels.get("email"):
                        self._send_email_notification(message)
                    
                    if settings.notification_channels.get("telegram"):
                        self._send_telegram_notification(message)
                    
                    if settings.notification_channels.get("web"):
                        self._send_web_notification(message)

        except Exception as e:
            self.create_alert(
                type="system",
                exchange=exchange,
                symbol="",
                message=f"Error checking position limits: {str(e)}",
                severity="error"
            )

    def _send_email_notification(self, message: str) -> None:
        # TODO: Implement email notification
        pass

    def _send_telegram_notification(self, message: str) -> None:
        # TODO: Implement Telegram notification
        pass

    def _send_web_notification(self, message: str) -> None:
        # TODO: Implement web notification (e.g., WebSocket)
        pass 