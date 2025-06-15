#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting QTi setup and launch...${NC}"

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Проверка наличия npm
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Создание и активация виртуального окружения Python
echo -e "${BLUE}Creating Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Установка Python зависимостей
echo -e "${BLUE}Installing Python dependencies...${NC}"
pip install -r requirements.txt

# Установка Node.js зависимостей
echo -e "${BLUE}Installing Node.js dependencies...${NC}"
cd frontend
npm install
cd ..

# Инициализация базы данных
echo -e "${BLUE}Initializing database...${NC}"
python backend/init_db.py

# Запуск приложения
echo -e "${GREEN}Starting QTi application...${NC}"
python run.py 