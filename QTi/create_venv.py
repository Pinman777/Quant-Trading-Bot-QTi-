import subprocess
import sys
import os
import venv

def create_venv():
    """Создание виртуального окружения Python"""
    print("Creating Python virtual environment...")
    venv.create("venv", with_pip=True)

def main():
    """Создание виртуального окружения и установка зависимостей"""
    # Получаем путь к директории скрипта
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    # Создаем виртуальное окружение
    create_venv()
    
    # Определяем путь к pip в виртуальном окружении
    if sys.platform == "win32":
        pip_path = os.path.join(project_root, "venv", "Scripts", "pip")
    else:
        pip_path = os.path.join(project_root, "venv", "bin", "pip")
    
    # Устанавливаем зависимости
    print("Installing dependencies...")
    requirements_path = os.path.join(project_root, "requirements.txt")
    subprocess.check_call([pip_path, "install", "-r", requirements_path])
    
    print("\nVirtual environment created successfully!")
    print("\nTo activate the virtual environment:")
    if sys.platform == "win32":
        print("venv\\Scripts\\activate")
    else:
        print("source venv/bin/activate")

if __name__ == "__main__":
    main() 