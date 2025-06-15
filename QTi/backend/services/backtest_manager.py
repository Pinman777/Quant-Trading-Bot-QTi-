import asyncio
import json
import os
import subprocess
from typing import Dict, Any
import logging
from ..models import Backtest

logger = logging.getLogger(__name__)

class BacktestManager:
    def __init__(self):
        self.running_backtests: Dict[int, asyncio.Task] = {}
        self.backtest_processes: Dict[int, subprocess.Popen] = {}
        self.config_dir = os.path.join(os.path.dirname(__file__), "../../config")
        os.makedirs(self.config_dir, exist_ok=True)

    async def run_backtest(self, backtest: Backtest) -> Dict[str, Any]:
        """Run a backtest"""
        if backtest.id in self.running_backtests:
            raise ValueError("Backtest is already running")

        # Create config file
        config_path = os.path.join(self.config_dir, f"backtest_{backtest.id}.json")
        with open(config_path, "w") as f:
            json.dump(backtest.config, f, indent=2)

        # Start backtest process
        try:
            process = subprocess.Popen(
                [
                    "python",
                    "-m",
                    "passivbot",
                    "backtest",
                    "--config",
                    config_path
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.backtest_processes[backtest.id] = process

            # Start monitoring task
            monitor_task = asyncio.create_task(
                self._monitor_backtest(backtest.id, process)
            )
            self.running_backtests[backtest.id] = monitor_task

            # Wait for completion
            results = await monitor_task

            # Clean up
            del self.running_backtests[backtest.id]
            del self.backtest_processes[backtest.id]
            if os.path.exists(config_path):
                os.remove(config_path)

            return results

        except Exception as e:
            logger.error(f"Failed to run backtest {backtest.id}: {str(e)}")
            raise

    async def _monitor_backtest(self, backtest_id: int, process: subprocess.Popen) -> Dict[str, Any]:
        """Monitor backtest process and collect results"""
        try:
            results = {}
            while True:
                # Read stdout
                output = process.stdout.readline()
                if output:
                    line = output.decode().strip()
                    logger.info(f"Backtest {backtest_id} output: {line}")
                    try:
                        # Try to parse JSON output
                        data = json.loads(line)
                        results.update(data)
                    except json.JSONDecodeError:
                        pass

                # Read stderr
                error = process.stderr.readline()
                if error:
                    logger.error(f"Backtest {backtest_id} error: {error.decode().strip()}")

                # Check if process has ended
                if process.poll() is not None:
                    logger.info(f"Backtest {backtest_id} process ended with code {process.returncode}")
                    if process.returncode != 0:
                        raise Exception(f"Backtest failed with code {process.returncode}")
                    break

                await asyncio.sleep(0.1)

            return results

        except asyncio.CancelledError:
            logger.info(f"Backtest {backtest_id} monitoring cancelled")
            raise
        except Exception as e:
            logger.error(f"Error monitoring backtest {backtest_id}: {str(e)}")
            raise

    def get_backtest_status(self, backtest_id: int) -> bool:
        """Check if a backtest is running"""
        return backtest_id in self.running_backtests

    def cancel_backtest(self, backtest_id: int) -> None:
        """Cancel a running backtest"""
        if backtest_id not in self.running_backtests:
            raise ValueError("Backtest is not running")

        try:
            # Cancel monitoring task
            self.running_backtests[backtest_id].cancel()
            del self.running_backtests[backtest_id]

            # Stop backtest process
            process = self.backtest_processes[backtest_id]
            process.terminate()
            await asyncio.sleep(1)
            if process.poll() is None:
                process.kill()
            del self.backtest_processes[backtest_id]

            # Clean up config file
            config_path = os.path.join(self.config_dir, f"backtest_{backtest_id}.json")
            if os.path.exists(config_path):
                os.remove(config_path)

        except Exception as e:
            logger.error(f"Failed to cancel backtest {backtest_id}: {str(e)}")
            raise 