import os
import json
import logging
import asyncio
from typing import Dict, Any, Optional, List
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)

class RustIntegration:
    def __init__(self, rust_path: str = "./qti-bot/qti_rust"):
        self.rust_path = Path(rust_path)
        self.bin_path = self.rust_path / "target" / "release"
        self._check_rust_installation()

    def _check_rust_installation(self) -> None:
        """Проверяет наличие Rust и необходимых компонентов"""
        try:
            subprocess.run(["rustc", "--version"], check=True, capture_output=True)
            subprocess.run(["cargo", "--version"], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при проверке Rust: {e}")
            raise RuntimeError("Rust не установлен или не настроен правильно")

    async def compile_rust(self) -> bool:
        """Компиляция Rust-компонентов"""
        try:
            process = await asyncio.create_subprocess_exec(
                "cargo",
                "build",
                "--release",
                cwd=str(self.rust_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"Error compiling Rust: {stderr.decode()}")
                return False
                
            return True
        except Exception as e:
            logger.error(f"Error compiling Rust: {str(e)}")
            return False
            
    async def run_rust_command(
        self,
        command: str,
        args: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Запуск Rust-команды"""
        try:
            cmd = [str(self.bin_path / command)]
            if args:
                cmd.extend(["--args", json.dumps(args)])
                
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"Error running Rust command: {stderr.decode()}")
                return {"error": stderr.decode()}
                
            return json.loads(stdout.decode())
        except Exception as e:
            logger.error(f"Error running Rust command: {str(e)}")
            return {"error": str(e)}
            
    async def optimize_strategy(
        self,
        strategy: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Оптимизация стратегии через Rust"""
        return await self.run_rust_command("optimize", {
            "strategy": strategy,
            "params": params
        })
        
    async def backtest_strategy(
        self,
        strategy: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Бэктестинг стратегии через Rust"""
        return await self.run_rust_command("backtest", {
            "strategy": strategy,
            "params": params
        })
        
    async def calculate_indicators(
        self,
        data: Dict[str, Any],
        indicators: List[str]
    ) -> Dict[str, Any]:
        """Расчет индикаторов через Rust"""
        return await self.run_rust_command("indicators", {
            "data": data,
            "indicators": indicators
        })
        
    async def validate_strategy(
        self,
        strategy: str,
        params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Валидация стратегии через Rust"""
        return await self.run_rust_command("validate", {
            "strategy": strategy,
            "params": params
        })

    def build_rust_components(self) -> None:
        """Собирает Rust-компоненты с помощью maturin"""
        try:
            subprocess.run(
                ["maturin", "build", "--release"],
                cwd=self.rust_path,
                check=True
            )
        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при сборке Rust-компонентов: {e}")
            raise RuntimeError("Не удалось собрать Rust-компоненты")

    def run_optimization(
        self,
        config: Dict[str, Any],
        param_ranges: Dict[str, List[float]],
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """Запускает оптимизацию с использованием Rust-компонентов"""
        try:
            # Создаем временный конфиг для оптимизации
            config_path = self.rust_path / "temp_config.json"
            with open(config_path, "w") as f:
                import json
                json.dump({
                    "config": config,
                    "param_ranges": param_ranges,
                    "start_date": start_date,
                    "end_date": end_date
                }, f)

            # Запускаем оптимизацию
            result = subprocess.run(
                ["cargo", "run", "--release", "--bin", "optimize", "--", str(config_path)],
                cwd=self.rust_path,
                check=True,
                capture_output=True,
                text=True
            )

            # Удаляем временный конфиг
            config_path.unlink()

            # Парсим результат
            return {
                "status": "success",
                "result": result.stdout,
                "metrics": self._parse_optimization_metrics(result.stdout)
            }

        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при запуске оптимизации: {e}")
            return {
                "status": "error",
                "error": str(e),
                "stderr": e.stderr
            }

    def _parse_optimization_metrics(self, output: str) -> Dict[str, float]:
        """Парсит метрики из вывода оптимизации"""
        try:
            import json
            return json.loads(output)
        except json.JSONDecodeError:
            logger.error("Не удалось распарсить метрики оптимизации")
            return {}

    def run_backtest(
        self,
        config: Dict[str, Any],
        start_date: str,
        end_date: str
    ) -> Dict[str, Any]:
        """Запускает бэктест с использованием Rust-компонентов"""
        try:
            # Создаем временный конфиг для бэктеста
            config_path = self.rust_path / "temp_backtest.json"
            with open(config_path, "w") as f:
                import json
                json.dump({
                    "config": config,
                    "start_date": start_date,
                    "end_date": end_date
                }, f)

            # Запускаем бэктест
            result = subprocess.run(
                ["cargo", "run", "--release", "--bin", "backtest", "--", str(config_path)],
                cwd=self.rust_path,
                check=True,
                capture_output=True,
                text=True
            )

            # Удаляем временный конфиг
            config_path.unlink()

            # Парсим результат
            return {
                "status": "success",
                "result": result.stdout,
                "metrics": self._parse_backtest_metrics(result.stdout)
            }

        except subprocess.CalledProcessError as e:
            logger.error(f"Ошибка при запуске бэктеста: {e}")
            return {
                "status": "error",
                "error": str(e),
                "stderr": e.stderr
            }

    def _parse_backtest_metrics(self, output: str) -> Dict[str, float]:
        """Парсит метрики из вывода бэктеста"""
        try:
            import json
            return json.loads(output)
        except json.JSONDecodeError:
            logger.error("Не удалось распарсить метрики бэктеста")
            return {} 