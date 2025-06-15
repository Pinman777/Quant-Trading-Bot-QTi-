import subprocess
import sys
import os
import time
import webbrowser
import logging

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_backend():
    """Запуск бэкенда"""
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "backend/main.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        logger.info("Бэкенд запущен")
        return backend_process
    except Exception as e:
        logger.error(f"Ошибка при запуске бэкенда: {str(e)}")
        raise

def run_frontend():
    """Запуск фронтенда"""
    try:
        frontend_process = subprocess.Popen(
            [sys.executable, "frontend/server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        logger.info("Фронтенд запущен")
        return frontend_process
    except Exception as e:
        logger.error(f"Ошибка при запуске фронтенда: {str(e)}")
        raise

def main():
    """Запуск всего приложения"""
    logger.info("Запуск приложения...")
    
    try:
        # Запускаем бэкенд
        logger.info("Запуск бэкенда...")
        backend_process = run_backend()
        
        # Ждем немного, чтобы бэкенд успел запуститься
        time.sleep(2)
        
        # Запускаем фронтенд
        logger.info("Запуск фронтенда...")
        frontend_process = run_frontend()
        
        # Открываем браузер
        time.sleep(3)  # Ждем запуска фронтенда
        webbrowser.open('http://localhost:3000')
        
        try:
            # Ждем завершения процессов
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            logger.info("\nЗавершение работы...")
            backend_process.terminate()
            frontend_process.terminate()
            logger.info("Приложение остановлено.")
            
    except Exception as e:
        logger.error(f"Критическая ошибка: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 