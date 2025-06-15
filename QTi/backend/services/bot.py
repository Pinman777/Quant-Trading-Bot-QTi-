import os
import json
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import HTTPException
from ..schemas.bot import Bot, BotCreate, BotUpdate, BotConfig
from ..logger import bot_logger, log_extra

class BotService:
    def __init__(self):
        self.bots_dir = os.path.join(os.path.dirname(__file__), '../data/bots')
        os.makedirs(self.bots_dir, exist_ok=True)
        self.bots = {}
        
        bot_logger.info(
            "Бот инициализирован",
            extra=log_extra({
                "config_path": self.bots_dir
            })
        )

    def _get_bot_path(self, bot_id: str) -> str:
        return os.path.join(self.bots_dir, f'{bot_id}.json')

    def _load_bot(self, bot_id: str) -> Bot:
        bot_path = self._get_bot_path(bot_id)
        if not os.path.exists(bot_path):
            raise HTTPException(status_code=404, detail="Bot not found")
        
        with open(bot_path, 'r') as f:
            data = json.load(f)
            return Bot(**data)

    def _save_bot(self, bot: Bot) -> None:
        bot_path = self._get_bot_path(bot.id)
        with open(bot_path, 'w') as f:
            json.dump(bot.dict(), f, default=str)

    def get_bots(self) -> List[Bot]:
        bots = []
        for filename in os.listdir(self.bots_dir):
            if filename.endswith('.json'):
                bot_id = filename[:-5]
                try:
                    bot = self._load_bot(bot_id)
                    bots.append(bot)
                except Exception as e:
                    print(f"Error loading bot {bot_id}: {str(e)}")
        return bots

    def get_bot(self, bot_id: str) -> Bot:
        return self._load_bot(bot_id)

    def create_bot(self, bot_data: BotCreate) -> Bot:
        bot_id = str(uuid.uuid4())
        bot = Bot(
            id=bot_id,
            status="stopped",
            balance=0.0,
            pnl=0.0,
            positions=0,
            lastUpdate=datetime.now(),
            **bot_data.dict()
        )
        self._save_bot(bot)
        self.bots[bot_id] = bot.dict()
        return bot

    def update_bot(self, bot_id: str, bot_data: BotUpdate) -> Bot:
        bot = self._load_bot(bot_id)
        update_data = bot_data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(bot, key, value)
        bot.lastUpdate = datetime.now()
        self._save_bot(bot)
        self.bots[bot_id] = bot.dict()
        return bot

    def delete_bot(self, bot_id: str) -> None:
        bot_path = self._get_bot_path(bot_id)
        if not os.path.exists(bot_path):
            raise HTTPException(status_code=404, detail="Bot not found")
        os.remove(bot_path)
        del self.bots[bot_id]

    def start_bot(self, bot_id: str) -> Bot:
        bot = self._load_bot(bot_id)
        if bot.status == "running":
            raise HTTPException(status_code=400, detail="Bot is already running")
        
        # TODO: Implement actual bot start logic
        bot.status = "running"
        bot.lastUpdate = datetime.now()
        self._save_bot(bot)
        self.bots[bot_id] = bot.dict()
        return bot

    def stop_bot(self, bot_id: str) -> Bot:
        bot = self._load_bot(bot_id)
        if bot.status == "stopped":
            raise HTTPException(status_code=400, detail="Bot is already stopped")
        
        # TODO: Implement actual bot stop logic
        bot.status = "stopped"
        bot.lastUpdate = datetime.now()
        self._save_bot(bot)
        self.bots[bot_id] = bot.dict()
        return bot

    def refresh_bot(self, bot_id: str) -> Bot:
        bot = self._load_bot(bot_id)
        
        # TODO: Implement actual bot refresh logic
        # This would typically involve fetching current market data,
        # updating positions, calculating P&L, etc.
        
        bot.lastUpdate = datetime.now()
        self._save_bot(bot)
        return bot 

    async def get_all_bots(self) -> List[Dict[str, Any]]:
        """Получение всех ботов
        
        Returns:
            List[Dict[str, Any]]: Список ботов
        """
        try:
            bots = list(self.bots.values())
            
            bot_logger.debug(
                "Все боты получены",
                extra=log_extra({
                    "count": len(bots)
                })
            )
            return bots
            
        except Exception as e:
            bot_logger.error(
                "Ошибка получения всех ботов",
                exc_info=True,
                extra=log_extra({
                    "error": str(e)
                })
            )
            raise 