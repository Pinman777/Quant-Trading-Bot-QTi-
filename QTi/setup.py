import subprocess
import sys
import os

def install_python_deps():
    """Установка Python-зависимостей"""
    print("Installing Python dependencies...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

def install_node_deps():
    """Установка Node.js-зависимостей"""
    print("Installing Node.js dependencies...")
    subprocess.check_call(["npm", "install"], cwd=os.path.join(os.getcwd(), "frontend"))

def init_database():
    """Инициализация базы данных"""
    print("Initializing database...")
    subprocess.check_call([sys.executable, "backend/init_db.py"])

def main():
    """Установка всех зависимостей и инициализация проекта"""
    print("Setting up QTi project...")
    
    # Устанавливаем Python-зависимости
    install_python_deps()
    
    # Устанавливаем Node.js-зависимости
    install_node_deps()
    
    # Инициализируем базу данных
    init_database()
    
    print("\nSetup completed successfully!")
    print("\nTo start the application, run:")
    print("python run.py")

if __name__ == "__main__":
    main() 