# QTi - Quant Trading Bot

QTi - это автоматизированный торговый бот для количественной торговли.

## Требования

- Python 3.8 или выше
- Node.js 16.x или выше
- npm 7.x или выше

## Быстрая установка

### Windows
```bash
git clone https://github.com/Pinman777/Quant-Trading-Bot-QTi-.git
cd Quant-Trading-Bot-QTi-
python install.py
```

### Linux/Mac
```bash
git clone https://github.com/Pinman777/Quant-Trading-Bot-QTi-.git
cd Quant-Trading-Bot-QTi-
python3 install.py
```

## Ручная установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Pinman777/Quant-Trading-Bot-QTi-.git
cd Quant-Trading-Bot-QTi-
```

2. Создайте и активируйте виртуальное окружение Python:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Установите зависимости Python:
```bash
pip install -r QTi/requirements.txt
```

4. Установите зависимости Node.js:
```bash
cd QTi/frontend
npm install
```

5. Настройте конфигурацию:
```bash
# Windows
copy QTi\qti.ini.example QTi\qti.ini

# Linux/Mac
cp QTi/qti.ini.example QTi/qti.ini
```

## Запуск

1. Запустите приложение:
```bash
python QTi/run.py
```

2. Откройте браузер и перейдите по адресу:
- Local URL: http://localhost:3000
- Network URL: http://your-ip:3000

## Разработка

### Запуск тестов
```bash
# Python тесты
cd QTi
pytest

# Frontend тесты
cd QTi/frontend
npm test
```

### Сборка frontend
```bash
cd QTi/frontend
npm run build
```

## CI/CD

Проект использует GitHub Actions для автоматизации:
- Тестирование на разных версиях Python и Node.js
- Автоматическая сборка и деплой на GitHub Pages
- Проверка кода при pull requests

## Лицензия

MIT License 