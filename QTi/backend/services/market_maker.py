import asyncio
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import numpy as np
from ..logger import market_logger, log_extra

class MarketMaker:
    def __init__(self, config_path: str):
        """Инициализация сервиса маркет-мейкинга
        
        Args:
            config_path: Путь к конфигурационному файлу
        """
        self.config_path = config_path
        self.config = self._load_config()
        self.orders: Dict[str, Dict[str, Any]] = {}
        self.positions: Dict[str, float] = {}
        
        market_logger.info(
            "Сервис маркет-мейкинга инициализирован",
            extra=log_extra({
                "config_path": config_path
            })
        )
        
    def _load_config(self) -> Dict[str, Any]:
        """Загрузка конфигурации
        
        Returns:
            Dict[str, Any]: Конфигурация маркет-мейкера
        """
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                
            market_logger.info(
                "Конфигурация загружена",
                extra=log_extra({
                    "config_path": self.config_path
                })
            )
            return config
        except Exception as e:
            market_logger.error(
                "Ошибка загрузки конфигурации",
                exc_info=True,
                extra=log_extra({
                    "config_path": self.config_path,
                    "error": str(e)
                })
            )
            raise
            
    def calculate_spread(self, mid_price: float, volatility: float) -> float:
        """Расчет спреда
        
        Args:
            mid_price: Средняя цена
            volatility: Волатильность
            
        Returns:
            float: Спред
        """
        try:
            # Расчет спреда на основе волатильности
            spread = mid_price * volatility * self.config.get("spread_multiplier", 1.0)
            
            market_logger.info(
                "Спред рассчитан",
                extra=log_extra({
                    "mid_price": mid_price,
                    "volatility": volatility,
                    "spread": spread
                })
            )
            
            return spread
            
        except Exception as e:
            market_logger.error(
                "Ошибка расчета спреда",
                exc_info=True,
                extra=log_extra({
                    "mid_price": mid_price,
                    "volatility": volatility,
                    "error": str(e)
                })
            )
            raise
            
    def calculate_order_sizes(self, position: float, max_position: float) -> Dict[str, float]:
        """Расчет размеров ордеров
        
        Args:
            position: Текущая позиция
            max_position: Максимальная позиция
            
        Returns:
            Dict[str, float]: Размеры ордеров
        """
        try:
            # Расчет размеров ордеров на основе позиции
            remaining_capacity = max_position - abs(position)
            base_size = remaining_capacity * self.config.get("base_size_ratio", 0.1)
            
            sizes = {
                "bid": base_size * (1 + position / max_position),
                "ask": base_size * (1 - position / max_position)
            }
            
            market_logger.info(
                "Размеры ордеров рассчитаны",
                extra=log_extra({
                    "position": position,
                    "max_position": max_position,
                    "sizes": sizes
                })
            )
            
            return sizes
            
        except Exception as e:
            market_logger.error(
                "Ошибка расчета размеров ордеров",
                exc_info=True,
                extra=log_extra({
                    "position": position,
                    "max_position": max_position,
                    "error": str(e)
                })
            )
            raise
            
    def update_orders(self, symbol: str, mid_price: float, volatility: float):
        """Обновление ордеров
        
        Args:
            symbol: Символ инструмента
            mid_price: Средняя цена
            volatility: Волатильность
        """
        try:
            # Расчет новых цен и размеров
            spread = self.calculate_spread(mid_price, volatility)
            position = self.positions.get(symbol, 0.0)
            sizes = self.calculate_order_sizes(position, self.config.get("max_position", 1.0))
            
            # Обновление ордеров
            self.orders[symbol] = {
                "bid": {
                    "price": mid_price - spread/2,
                    "size": sizes["bid"]
                },
                "ask": {
                    "price": mid_price + spread/2,
                    "size": sizes["ask"]
                },
                "timestamp": datetime.utcnow().isoformat()
            }
            
            market_logger.info(
                "Ордера обновлены",
                extra=log_extra({
                    "symbol": symbol,
                    "mid_price": mid_price,
                    "volatility": volatility,
                    "orders": self.orders[symbol]
                })
            )
            
        except Exception as e:
            market_logger.error(
                "Ошибка обновления ордеров",
                exc_info=True,
                extra=log_extra({
                    "symbol": symbol,
                    "mid_price": mid_price,
                    "volatility": volatility,
                    "error": str(e)
                })
            )
            raise
            
    def handle_trade(self, symbol: str, side: str, price: float, size: float):
        """Обработка сделки
        
        Args:
            symbol: Символ инструмента
            side: Сторона сделки (bid/ask)
            price: Цена
            size: Размер
        """
        try:
            # Обновление позиции
            if side == "bid":
                self.positions[symbol] = self.positions.get(symbol, 0.0) + size
            else:
                self.positions[symbol] = self.positions.get(symbol, 0.0) - size
                
            market_logger.info(
                "Сделка обработана",
                extra=log_extra({
                    "symbol": symbol,
                    "side": side,
                    "price": price,
                    "size": size,
                    "position": self.positions[symbol]
                })
            )
            
        except Exception as e:
            market_logger.error(
                "Ошибка обработки сделки",
                exc_info=True,
                extra=log_extra({
                    "symbol": symbol,
                    "side": side,
                    "price": price,
                    "size": size,
                    "error": str(e)
                })
            )
            raise
            
    def get_orders(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Получение ордеров
        
        Args:
            symbol: Символ инструмента
            
        Returns:
            Optional[Dict[str, Any]]: Ордера или None
        """
        try:
            orders = self.orders.get(symbol)
            
            market_logger.info(
                "Ордера получены",
                extra=log_extra({
                    "symbol": symbol,
                    "orders": orders
                })
            )
            
            return orders
            
        except Exception as e:
            market_logger.error(
                "Ошибка получения ордеров",
                exc_info=True,
                extra=log_extra({
                    "symbol": symbol,
                    "error": str(e)
                })
            )
            raise
            
    def get_position(self, symbol: str) -> float:
        """Получение позиции
        
        Args:
            symbol: Символ инструмента
            
        Returns:
            float: Позиция
        """
        try:
            position = self.positions.get(symbol, 0.0)
            
            market_logger.info(
                "Позиция получена",
                extra=log_extra({
                    "symbol": symbol,
                    "position": position
                })
            )
            
            return position
            
        except Exception as e:
            market_logger.error(
                "Ошибка получения позиции",
                exc_info=True,
                extra=log_extra({
                    "symbol": symbol,
                    "error": str(e)
                })
            )
            raise 