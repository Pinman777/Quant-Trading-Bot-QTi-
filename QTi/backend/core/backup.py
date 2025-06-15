import os
import shutil
import json
import zipfile
from datetime import datetime, timedelta
from typing import List, Optional, Dict
import rclone
from sqlalchemy.orm import Session

from .config import settings
from .logger import logger
from ..crud import user as crud_user
from ..crud import exchange as crud_exchange
from ..crud import strategy as crud_strategy
from ..crud import trade as crud_trade

def create_backup_dir() -> str:
    """
    Создает директорию для бэкапов.
    """
    backup_dir = os.path.join(settings.BACKUP_DIR, datetime.utcnow().strftime('%Y%m%d_%H%M%S'))
    os.makedirs(backup_dir, exist_ok=True)
    return backup_dir

def backup_database(db: Session, backup_dir: str) -> bool:
    """
    Создает бэкап базы данных.
    """
    try:
        # Получаем данные из базы
        users = crud_user.user.get_multi(db)
        exchanges = crud_exchange.exchange.get_multi(db)
        strategies = crud_strategy.strategy.get_multi(db)
        trades = crud_trade.trade.get_multi(db)
        
        # Сохраняем данные в JSON файлы
        with open(os.path.join(backup_dir, 'users.json'), 'w') as f:
            json.dump([user.dict() for user in users], f, indent=2)
        
        with open(os.path.join(backup_dir, 'exchanges.json'), 'w') as f:
            json.dump([exchange.dict() for exchange in exchanges], f, indent=2)
        
        with open(os.path.join(backup_dir, 'strategies.json'), 'w') as f:
            json.dump([strategy.dict() for strategy in strategies], f, indent=2)
        
        with open(os.path.join(backup_dir, 'trades.json'), 'w') as f:
            json.dump([trade.dict() for trade in trades], f, indent=2)
        
        return True
    except Exception as e:
        logger.error(f"Failed to backup database: {str(e)}")
        return False

def backup_config_files(backup_dir: str) -> bool:
    """
    Создает бэкап конфигурационных файлов.
    """
    try:
        config_dir = os.path.join(backup_dir, 'config')
        os.makedirs(config_dir, exist_ok=True)
        
        # Копируем конфигурационные файлы
        shutil.copy2('qti.ini', os.path.join(config_dir, 'qti.ini'))
        shutil.copy2('.env', os.path.join(config_dir, '.env'))
        
        return True
    except Exception as e:
        logger.error(f"Failed to backup config files: {str(e)}")
        return False

def backup_logs(backup_dir: str) -> bool:
    """
    Создает бэкап логов.
    """
    try:
        logs_dir = os.path.join(backup_dir, 'logs')
        os.makedirs(logs_dir, exist_ok=True)
        
        # Копируем файлы логов
        for log_file in os.listdir('logs'):
            if log_file.endswith('.log'):
                shutil.copy2(
                    os.path.join('logs', log_file),
                    os.path.join(logs_dir, log_file)
                )
        
        return True
    except Exception as e:
        logger.error(f"Failed to backup logs: {str(e)}")
        return False

def create_backup_archive(backup_dir: str) -> Optional[str]:
    """
    Создает архив бэкапа.
    """
    try:
        archive_path = f"{backup_dir}.zip"
        with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(backup_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, backup_dir)
                    zipf.write(file_path, arcname)
        
        # Удаляем исходную директорию
        shutil.rmtree(backup_dir)
        
        return archive_path
    except Exception as e:
        logger.error(f"Failed to create backup archive: {str(e)}")
        return None

def upload_backup_to_cloud(archive_path: str) -> bool:
    """
    Загружает бэкап в облачное хранилище.
    """
    try:
        # Настраиваем rclone
        rclone.with_config(settings.RCLONE_CONFIG)
        
        # Загружаем файл
        rclone.copy(archive_path, f"{settings.RCLONE_REMOTE}:backups/")
        
        return True
    except Exception as e:
        logger.error(f"Failed to upload backup to cloud: {str(e)}")
        return False

def cleanup_old_backups() -> bool:
    """
    Удаляет старые бэкапы.
    """
    try:
        backup_dir = settings.BACKUP_DIR
        retention_days = settings.BACKUP_RETENTION_DAYS
        
        # Получаем список всех бэкапов
        backups = []
        for item in os.listdir(backup_dir):
            if item.endswith('.zip'):
                backup_path = os.path.join(backup_dir, item)
                backup_time = datetime.fromtimestamp(os.path.getctime(backup_path))
                backups.append((backup_path, backup_time))
        
        # Удаляем старые бэкапы
        current_time = datetime.utcnow()
        for backup_path, backup_time in backups:
            if (current_time - backup_time) > timedelta(days=retention_days):
                os.remove(backup_path)
                logger.info(f"Deleted old backup: {backup_path}")
        
        return True
    except Exception as e:
        logger.error(f"Failed to cleanup old backups: {str(e)}")
        return False

def create_backup() -> Optional[str]:
    """
    Создает полный бэкап системы.
    """
    try:
        # Создаем директорию для бэкапа
        backup_dir = create_backup_dir()
        
        # Создаем бэкап базы данных
        if not backup_database(None, backup_dir):  # TODO: передать сессию БД
            raise Exception("Failed to backup database")
        
        # Создаем бэкап конфигурационных файлов
        if not backup_config_files(backup_dir):
            raise Exception("Failed to backup config files")
        
        # Создаем бэкап логов
        if not backup_logs(backup_dir):
            raise Exception("Failed to backup logs")
        
        # Создаем архив
        archive_path = create_backup_archive(backup_dir)
        if not archive_path:
            raise Exception("Failed to create backup archive")
        
        # Загружаем в облако
        if settings.ENABLE_CLOUD_BACKUP:
            if not upload_backup_to_cloud(archive_path):
                raise Exception("Failed to upload backup to cloud")
        
        # Очищаем старые бэкапы
        cleanup_old_backups()
        
        return archive_path
    except Exception as e:
        logger.error(f"Failed to create backup: {str(e)}")
        return None

def restore_from_backup(backup_path: str, db: Session) -> bool:
    """
    Восстанавливает систему из бэкапа.
    """
    try:
        # Создаем временную директорию
        temp_dir = os.path.join(settings.BACKUP_DIR, 'temp_restore')
        os.makedirs(temp_dir, exist_ok=True)
        
        # Распаковываем архив
        with zipfile.ZipFile(backup_path, 'r') as zipf:
            zipf.extractall(temp_dir)
        
        # Восстанавливаем базу данных
        with open(os.path.join(temp_dir, 'users.json'), 'r') as f:
            users = json.load(f)
            for user in users:
                crud_user.user.create(db, obj_in=user)
        
        with open(os.path.join(temp_dir, 'exchanges.json'), 'r') as f:
            exchanges = json.load(f)
            for exchange in exchanges:
                crud_exchange.exchange.create(db, obj_in=exchange)
        
        with open(os.path.join(temp_dir, 'strategies.json'), 'r') as f:
            strategies = json.load(f)
            for strategy in strategies:
                crud_strategy.strategy.create(db, obj_in=strategy)
        
        with open(os.path.join(temp_dir, 'trades.json'), 'r') as f:
            trades = json.load(f)
            for trade in trades:
                crud_trade.trade.create(db, obj_in=trade)
        
        # Восстанавливаем конфигурационные файлы
        config_dir = os.path.join(temp_dir, 'config')
        shutil.copy2(os.path.join(config_dir, 'qti.ini'), 'qti.ini')
        shutil.copy2(os.path.join(config_dir, '.env'), '.env')
        
        # Восстанавливаем логи
        logs_dir = os.path.join(temp_dir, 'logs')
        for log_file in os.listdir(logs_dir):
            shutil.copy2(
                os.path.join(logs_dir, log_file),
                os.path.join('logs', log_file)
            )
        
        # Удаляем временную директорию
        shutil.rmtree(temp_dir)
        
        return True
    except Exception as e:
        logger.error(f"Failed to restore from backup: {str(e)}")
        return False

def list_backups() -> List[Dict]:
    """
    Получает список доступных бэкапов.
    """
    try:
        backups = []
        backup_dir = settings.BACKUP_DIR
        
        for item in os.listdir(backup_dir):
            if item.endswith('.zip'):
                backup_path = os.path.join(backup_dir, item)
                backup_time = datetime.fromtimestamp(os.path.getctime(backup_path))
                backup_size = os.path.getsize(backup_path)
                
                backups.append({
                    'name': item,
                    'path': backup_path,
                    'created_at': backup_time.isoformat(),
                    'size': backup_size
                })
        
        return sorted(backups, key=lambda x: x['created_at'], reverse=True)
    except Exception as e:
        logger.error(f"Failed to list backups: {str(e)}")
        return [] 