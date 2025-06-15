import asyncio
import json
import os
import subprocess
from typing import Dict, Any, List
import logging
from ..models import Optimization

logger = logging.getLogger(__name__)

class OptimizeManager:
    def __init__(self):
        self.running_optimizations: Dict[int, asyncio.Task] = {}
        self.optimize_processes: Dict[int, subprocess.Popen] = {}
        self.config_dir = os.path.join(os.path.dirname(__file__), "../../config")
        os.makedirs(self.config_dir, exist_ok=True)

    async def run_optimization(self, optimization: Optimization) -> Dict[str, Any]:
        """Run an optimization"""
        if optimization.id in self.running_optimizations:
            raise ValueError("Optimization is already running")

        # Create config file
        config_path = os.path.join(self.config_dir, f"optimize_{optimization.id}.json")
        with open(config_path, "w") as f:
            json.dump(optimization.config, f, indent=2)

        # Start optimization process
        try:
            process = subprocess.Popen(
                [
                    "python",
                    "-m",
                    "passivbot",
                    "optimize",
                    "--config",
                    config_path
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
            self.optimize_processes[optimization.id] = process

            # Start monitoring task
            monitor_task = asyncio.create_task(
                self._monitor_optimization(optimization.id, process)
            )
            self.running_optimizations[optimization.id] = monitor_task

            # Wait for completion
            results = await monitor_task

            # Clean up
            del self.running_optimizations[optimization.id]
            del self.optimize_processes[optimization.id]
            if os.path.exists(config_path):
                os.remove(config_path)

            return results

        except Exception as e:
            logger.error(f"Failed to run optimization {optimization.id}: {str(e)}")
            raise

    async def _monitor_optimization(self, optimization_id: int, process: subprocess.Popen) -> Dict[str, Any]:
        """Monitor optimization process and collect results"""
        try:
            results = {
                "iterations": [],
                "best_params": None,
                "best_score": float("-inf"),
                "progress": 0
            }
            
            while True:
                # Read stdout
                output = process.stdout.readline()
                if output:
                    line = output.decode().strip()
                    logger.info(f"Optimization {optimization_id} output: {line}")
                    try:
                        # Try to parse JSON output
                        data = json.loads(line)
                        if "iteration" in data:
                            results["iterations"].append(data)
                            if data["score"] > results["best_score"]:
                                results["best_score"] = data["score"]
                                results["best_params"] = data["params"]
                        elif "progress" in data:
                            results["progress"] = data["progress"]
                    except json.JSONDecodeError:
                        pass

                # Read stderr
                error = process.stderr.readline()
                if error:
                    logger.error(f"Optimization {optimization_id} error: {error.decode().strip()}")

                # Check if process has ended
                if process.poll() is not None:
                    logger.info(f"Optimization {optimization_id} process ended with code {process.returncode}")
                    if process.returncode != 0:
                        raise Exception(f"Optimization failed with code {process.returncode}")
                    break

                await asyncio.sleep(0.1)

            return results

        except asyncio.CancelledError:
            logger.info(f"Optimization {optimization_id} monitoring cancelled")
            raise
        except Exception as e:
            logger.error(f"Error monitoring optimization {optimization_id}: {str(e)}")
            raise

    def get_optimization_status(self, optimization_id: int) -> bool:
        """Check if an optimization is running"""
        return optimization_id in self.running_optimizations

    async def cancel_optimization(self, optimization_id: int) -> None:
        """Cancel a running optimization"""
        if optimization_id not in self.running_optimizations:
            raise ValueError("Optimization is not running")

        try:
            # Cancel monitoring task
            self.running_optimizations[optimization_id].cancel()
            del self.running_optimizations[optimization_id]

            # Stop optimization process
            process = self.optimize_processes[optimization_id]
            process.terminate()
            await asyncio.sleep(1)
            if process.poll() is None:
                process.kill()
            del self.optimize_processes[optimization_id]

            # Clean up config file
            config_path = os.path.join(self.config_dir, f"optimize_{optimization_id}.json")
            if os.path.exists(config_path):
                os.remove(config_path)

        except Exception as e:
            logger.error(f"Failed to cancel optimization {optimization_id}: {str(e)}")
            raise 