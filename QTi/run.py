import subprocess
import sys
import os
import signal
import time
import webbrowser
import re
import threading
import logging
import platform
import psutil
from typing import Set, Optional

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('qti_startup.log')
    ]
)
logger = logging.getLogger(__name__)

class BrowserManager:
    def __init__(self):
        self.opened_urls: Set[str] = set()
        self.browser_processes = []
        
    def open_url(self, url: str, browser_name: Optional[str] = None):
        """Открытие URL в указанном браузере"""
        if url in self.opened_urls:
            return
            
        try:
            if browser_name:
                browser = webbrowser.get(browser_name)
            else:
                browser = webbrowser.get()
                
            browser.open(url)
            self.opened_urls.add(url)
            logger.info(f"Открыт URL в браузере: {url}")
            
            # Сохраняем PID процесса браузера
            if platform.system() == "Windows":
                for proc in psutil.process_iter(['pid', 'name']):
                    if any(browser_name in proc.info['name'].lower() for browser_name in ['chrome', 'firefox', 'edge', 'opera']):
                        self.browser_processes.append(proc.pid)
        except Exception as e:
            logger.error(f"Ошибка при открытии URL {url}: {str(e)}")

    def close_browsers(self):
        """Закрытие всех открытых браузеров"""
        for pid in self.browser_processes:
            try:
                process = psutil.Process(pid)
                process.terminate()
                logger.info(f"Закрыт браузер с PID: {pid}")
            except psutil.NoSuchProcess:
                pass
            except Exception as e:
                logger.error(f"Ошибка при закрытии браузера {pid}: {str(e)}")

def run_backend():
    """Запуск бэкенда"""
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "backend/run.py"],
            cwd=os.getcwd(),
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
            ["npm", "run", "dev"],
            cwd=os.path.join(os.getcwd(), "frontend"),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True
        )
        logger.info("Фронтенд запущен")
        return frontend_process
    except Exception as e:
        logger.error(f"Ошибка при запуске фронтенда: {str(e)}")
        raise

def monitor_process_output(process, browser_manager: BrowserManager):
    """Мониторинг вывода процесса и открытие URL"""
    url_pattern = re.compile(r'(https?://[^\s]+)')
    server_started = False
    
    while True:
        line = process.stdout.readline()
        if not line:
            break
            
        logger.debug(f"Вывод процесса: {line.strip()}")
        
        # Проверяем, запустился ли сервер
        if "ready" in line.lower() or "started" in line.lower():
            server_started = True
            logger.info("Сервер успешно запущен")
            
        # Если сервер запущен, ищем URL
        if server_started:
            matches = url_pattern.findall(line)
            for url in matches:
                # Добавляем небольшую задержку перед открытием URL
                time.sleep(1)
                browser_manager.open_url(url)

def main():
    """Запуск всего приложения"""
    logger.info("Запуск приложения QTi...")
    browser_manager = BrowserManager()
    
    try:
        # Запускаем бэкенд
        logger.info("Запуск бэкенда...")
        backend_process = run_backend()
        
        # Ждем немного, чтобы бэкенд успел запуститься
        time.sleep(2)
        
        # Запускаем фронтенд
        logger.info("Запуск фронтенда...")
        frontend_process = run_frontend()
        
        # Запускаем потоки для отслеживания вывода
        backend_thread = threading.Thread(
            target=monitor_process_output,
            args=(backend_process, browser_manager)
        )
        frontend_thread = threading.Thread(
            target=monitor_process_output,
            args=(frontend_process, browser_manager)
        )
        
        backend_thread.daemon = True
        frontend_thread.daemon = True
        
        backend_thread.start()
        frontend_thread.start()
        
        try:
            # Ждем завершения процессов
            backend_process.wait()
            frontend_process.wait()
        except KeyboardInterrupt:
            logger.info("\nЗавершение работы...")
            # Завершаем процессы при нажатии Ctrl+C
            backend_process.send_signal(signal.SIGTERM)
            frontend_process.send_signal(signal.SIGTERM)
            browser_manager.close_browsers()
            backend_process.wait()
            frontend_process.wait()
            logger.info("Приложение остановлено.")
            
    except Exception as e:
        logger.error(f"Критическая ошибка: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 