from typing import List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from sqlalchemy.orm import Session

from .config import settings
from ..crud import user as crud_user
from ..schemas.notification import NotificationCreate

def send_email_notification(
    to_email: str,
    subject: str,
    body: str,
    is_html: bool = False
) -> bool:
    """
    Отправляет уведомление по электронной почте.
    """
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"Ошибка при отправке email: {str(e)}")
        return False

def send_telegram_notification(
    chat_id: str,
    message: str,
    bot_token: Optional[str] = None
) -> bool:
    """
    Отправляет уведомление в Telegram.
    """
    try:
        if not bot_token:
            bot_token = settings.TELEGRAM_BOT_TOKEN
        if not bot_token:
            raise ValueError("Не указан токен Telegram бота")

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "HTML"
        }
        response = requests.post(url, data=data)
        return response.status_code == 200
    except Exception as e:
        print(f"Ошибка при отправке уведомления в Telegram: {str(e)}")
        return False

def send_discord_notification(
    webhook_url: str,
    message: str,
    title: Optional[str] = None,
    color: Optional[int] = None
) -> bool:
    """
    Отправляет уведомление в Discord.
    """
    try:
        data = {
            "content": message
        }
        if title or color:
            data["embeds"] = [{
                "title": title,
                "description": message,
                "color": color or 0x00ff00
            }]
            data["content"] = None

        response = requests.post(webhook_url, json=data)
        return response.status_code == 204
    except Exception as e:
        print(f"Ошибка при отправке уведомления в Discord: {str(e)}")
        return False

def send_trade_notification(
    db: Session,
    user_id: int,
    trade_data: dict,
    notification_type: str = "email"
) -> bool:
    """
    Отправляет уведомление о сделке.
    """
    user = crud_user.user.get(db, id=user_id)
    if not user:
        return False

    subject = f"Новая сделка: {trade_data['symbol']}"
    body = f"""
    Новая сделка:
    Символ: {trade_data['symbol']}
    Тип: {trade_data['type']}
    Сторона: {trade_data['side']}
    Цена: {trade_data['price']}
    Объем: {trade_data['amount']}
    Время: {trade_data['timestamp']}
    """

    if notification_type == "email":
        return send_email_notification(user.email, subject, body)
    elif notification_type == "telegram" and user.telegram_chat_id:
        return send_telegram_notification(user.telegram_chat_id, body)
    elif notification_type == "discord" and user.discord_webhook_url:
        return send_discord_notification(user.discord_webhook_url, body, title=subject)
    return False

def send_strategy_notification(
    db: Session,
    user_id: int,
    strategy_data: dict,
    notification_type: str = "email"
) -> bool:
    """
    Отправляет уведомление о стратегии.
    """
    user = crud_user.user.get(db, id=user_id)
    if not user:
        return False

    subject = f"Обновление стратегии: {strategy_data['name']}"
    body = f"""
    Обновление стратегии:
    Название: {strategy_data['name']}
    Статус: {strategy_data['status']}
    Доходность: {strategy_data.get('performance', {}).get('total_return', 0):.2%}
    Волатильность: {strategy_data.get('performance', {}).get('volatility', 0):.2%}
    Коэффициент Шарпа: {strategy_data.get('performance', {}).get('sharpe_ratio', 0):.2f}
    """

    if notification_type == "email":
        return send_email_notification(user.email, subject, body)
    elif notification_type == "telegram" and user.telegram_chat_id:
        return send_telegram_notification(user.telegram_chat_id, body)
    elif notification_type == "discord" and user.discord_webhook_url:
        return send_discord_notification(user.discord_webhook_url, body, title=subject)
    return False

def send_system_notification(
    db: Session,
    user_id: int,
    message: str,
    level: str = "info",
    notification_type: str = "email"
) -> bool:
    """
    Отправляет системное уведомление.
    """
    user = crud_user.user.get(db, id=user_id)
    if not user:
        return False

    subject = f"Системное уведомление: {level.upper()}"
    body = f"""
    Системное уведомление:
    Уровень: {level.upper()}
    Сообщение: {message}
    """

    if notification_type == "email":
        return send_email_notification(user.email, subject, body)
    elif notification_type == "telegram" and user.telegram_chat_id:
        return send_telegram_notification(user.telegram_chat_id, body)
    elif notification_type == "discord" and user.discord_webhook_url:
        return send_discord_notification(user.discord_webhook_url, body, title=subject)
    return False 