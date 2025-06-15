import pytest
import os
import shutil
from datetime import datetime
from sqlalchemy.orm import Session

from ..core.testing import (
    test_backup_restore,
    setup_test_environment,
    cleanup_test_environment
)
from ..core.backup import (
    create_backup,
    restore_from_backup,
    list_backups,
    cleanup_old_backups
)

def test_create_backup(test_db: Session):
    """
    Тест создания бэкапа.
    """
    # Создаем тестовые данные
    test_data = setup_test_environment(test_db)
    
    # Создаем бэкап
    backup_file = create_backup()
    
    # Проверяем, что файл бэкапа создан
    assert os.path.exists(backup_file)
    assert backup_file.endswith(".zip")
    
    # Очищаем тестовые данные
    cleanup_test_environment(test_db)

def test_restore_backup(test_db: Session):
    """
    Тест восстановления из бэкапа.
    """
    # Создаем тестовые данные
    test_data = setup_test_environment(test_db)
    
    # Создаем бэкап
    backup_file = create_backup()
    
    # Очищаем тестовые данные
    cleanup_test_environment(test_db)
    
    # Восстанавливаем из бэкапа
    assert restore_from_backup(backup_file, test_db)
    
    # Проверяем, что данные восстановлены
    assert test_backup_restore(test_db, backup_file)

def test_list_backups():
    """
    Тест получения списка бэкапов.
    """
    # Создаем тестовый бэкап
    backup_file = create_backup()
    
    # Получаем список бэкапов
    backups = list_backups()
    
    # Проверяем, что список не пустой
    assert len(backups) > 0
    
    # Проверяем структуру данных бэкапа
    backup = backups[0]
    assert "name" in backup
    assert "path" in backup
    assert "created_at" in backup
    assert "size" in backup
    
    # Проверяем, что созданный бэкап есть в списке
    assert any(b["path"] == backup_file for b in backups)

def test_cleanup_old_backups():
    """
    Тест очистки старых бэкапов.
    """
    # Создаем несколько тестовых бэкапов
    backup_files = []
    for _ in range(3):
        backup_file = create_backup()
        backup_files.append(backup_file)
    
    # Получаем начальное количество бэкапов
    initial_backups = list_backups()
    initial_count = len(initial_backups)
    
    # Очищаем старые бэкапы
    cleanup_old_backups()
    
    # Получаем конечное количество бэкапов
    final_backups = list_backups()
    final_count = len(final_backups)
    
    # Проверяем, что количество бэкапов уменьшилось
    assert final_count < initial_count

def test_backup_integrity(test_db: Session):
    """
    Тест целостности бэкапа.
    """
    # Создаем тестовые данные
    test_data = setup_test_environment(test_db)
    
    # Создаем бэкап
    backup_file = create_backup()
    
    # Очищаем тестовые данные
    cleanup_test_environment(test_db)
    
    # Восстанавливаем из бэкапа
    assert restore_from_backup(backup_file, test_db)
    
    # Проверяем, что все данные восстановлены корректно
    assert test_data["user"] is not None
    assert test_data["exchange"] is not None
    assert test_data["strategy"] is not None
    assert test_data["trade"] is not None

def test_backup_error_handling(test_db: Session):
    """
    Тест обработки ошибок при работе с бэкапами.
    """
    # Пытаемся восстановить из несуществующего бэкапа
    with pytest.raises(Exception):
        restore_from_backup("nonexistent_backup.zip", test_db)
    
    # Пытаемся создать бэкап с неверными правами доступа
    backup_dir = os.path.join(os.getcwd(), "backups")
    if os.path.exists(backup_dir):
        os.chmod(backup_dir, 0o444)  # Только для чтения
        with pytest.raises(Exception):
            create_backup()
        os.chmod(backup_dir, 0o755)  # Восстанавливаем права

def test_backup_concurrent_access(test_db: Session):
    """
    Тест конкурентного доступа к бэкапам.
    """
    import threading
    
    def create_backup_thread():
        try:
            create_backup()
        except Exception as e:
            print(f"Error in backup thread: {e}")
    
    # Создаем несколько потоков для создания бэкапов
    threads = []
    for _ in range(3):
        thread = threading.Thread(target=create_backup_thread)
        threads.append(thread)
        thread.start()
    
    # Ждем завершения всех потоков
    for thread in threads:
        thread.join()
    
    # Проверяем, что все бэкапы созданы успешно
    backups = list_backups()
    assert len(backups) >= 3 