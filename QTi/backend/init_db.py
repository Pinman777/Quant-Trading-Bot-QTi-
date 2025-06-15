from database import engine, Base
from models import Bot, Backtest, Optimization, Server, UserSettings

def init_db():
    """Инициализация базы данных"""
    # Создаем все таблицы
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created successfully!") 