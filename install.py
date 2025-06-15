import os
import sys
import subprocess
import logging
from pathlib import Path

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('installation.log')
    ]
)
logger = logging.getLogger(__name__)

def run_command(command, cwd=None):
    """Выполнение команды с логированием"""
    try:
        process = subprocess.Popen(
            command,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            universal_newlines=True,
            shell=True
        )
        for line in process.stdout:
            logger.info(line.strip())
        process.wait()
        if process.returncode != 0:
            raise Exception(f"Команда завершилась с ошибкой: {command}")
    except Exception as e:
        logger.error(f"Ошибка при выполнении команды {command}: {str(e)}")
        raise

def install_project():
    """Установка проекта"""
    logger.info("Начало установки проекта QTi...")
    
    # Создаем виртуальное окружение
    logger.info("Создание виртуального окружения...")
    run_command(f"{sys.executable} -m venv venv")
    
    # Активируем виртуальное окружение
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        python_path = "venv\\Scripts\\python"
        pip_path = "venv\\Scripts\\pip"
    else:  # Linux/Mac
        activate_script = "source venv/bin/activate"
        python_path = "venv/bin/python"
        pip_path = "venv/bin/pip"
    
    # Устанавливаем зависимости Python
    logger.info("Установка Python зависимостей...")
    run_command(f"{pip_path} install -r QTi/requirements.txt")
    
    # Устанавливаем зависимости Node.js
    logger.info("Установка Node.js зависимостей...")
    run_command("npm install", cwd="QTi/frontend")
    
    # Копируем конфигурационный файл
    logger.info("Настройка конфигурации...")
    if not os.path.exists("QTi/qti.ini"):
        run_command("copy QTi\\qti.ini.example QTi\\qti.ini" if os.name == 'nt' else "cp QTi/qti.ini.example QTi/qti.ini")
    
    logger.info("Установка завершена успешно!")

if __name__ == "__main__":
    try:
        install_project()
    except Exception as e:
        logger.error(f"Ошибка при установке: {str(e)}")
        sys.exit(1) 