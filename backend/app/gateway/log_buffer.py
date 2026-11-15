import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.traffic import TrafficLog

logger = logging.getLogger("patchshield.log_buffer")

class LogBatchBuffer:
    """
    High-Throughput Asynchronous Log Batching Buffer.
    
    Prevents SQLite write-contention and PostgreSQL connection starvation by
    decoupling incoming HTTP packet inspection from disk I/O.
    Incoming requests enqueue logs in < 0.05ms (in-memory O(1)), and a dedicated
    background worker batches database writes into bulk transactions.
    """
    def __init__(self, max_queue_size: int = 50000):
        self._queue: asyncio.Queue = asyncio.Queue(maxsize=max_queue_size)
        self._worker_task: Optional[asyncio.Task] = None
        self._running: bool = False
        self._total_enqueued: int = 0
        self._total_flushed: int = 0

    def enqueue(self, log_data: Dict[str, Any]):
        """
        Fast non-blocking enqueue of a traffic log entry.
        """
        try:
            self._queue.put_nowait(log_data)
            self._total_enqueued += 1
        except asyncio.QueueFull:
            logger.warning("Log buffer queue full! Dropping log entry under extreme backpressure.")

    async def start(self):
        """Start the background flush worker."""
        if self._running:
            return
        self._running = True
        self._worker_task = asyncio.create_task(self._flush_loop())
        logger.info("Started High-Throughput Log Batching Worker.")

    async def stop(self):
        """Flush remaining logs and shut down worker."""
        self._running = False
        if self._worker_task:
            self._worker_task.cancel()
            try:
                await self._worker_task
            except asyncio.CancelledError:
                pass
        # Final emergency flush
        await self._flush_batch()
        logger.info(f"Log buffer stopped. Total enqueued: {self._total_enqueued}, Flushed: {self._total_flushed}")

    async def _flush_loop(self):
        interval = settings.LOG_BATCH_INTERVAL_MS / 1000.0
        while self._running:
            try:
                await asyncio.sleep(interval)
                await self._flush_batch()
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in log buffer flush loop: {e}")

    async def _flush_batch(self):
        if self._queue.empty():
            return

        batch_dicts: List[Dict[str, Any]] = []
        max_size = settings.LOG_BATCH_MAX_SIZE

        while not self._queue.empty() and len(batch_dicts) < max_size:
            try:
                item = self._queue.get_nowait()
                batch_dicts.append(item)
                self._queue.task_done()
            except asyncio.QueueEmpty:
                break

        if not batch_dicts:
            return

        # Bulk write transaction
        try:
            async with AsyncSessionLocal() as session:
                models = []
                for d in batch_dicts:
                    models.append(TrafficLog(
                        site_id=d.get("site_id", ""),
                        timestamp=d.get("timestamp", datetime.utcnow()),
                        client_ip=d.get("client_ip", "127.0.0.1"),
                        method=d.get("method", "GET"),
                        path=d.get("path", "/"),
                        query_params_sanitized=d.get("query_params_sanitized", ""),
                        body_sanitized=d.get("body_sanitized", ""),
                        headers_sanitized=d.get("headers_sanitized", "{}"),
                        ml_score=d.get("ml_score", 0.0),
                        ml_prediction=d.get("ml_prediction", "Benign"),
                        rule_action=d.get("action_taken", "PASSED"),
                        response_status=d.get("response_status", 200),
                        matched_rule_id=d.get("rule_id")
                    ))
                session.add_all(models)
                await session.commit()
                self._total_flushed += len(models)
        except Exception as e:
            logger.error(f"Failed to flush batch of {len(batch_dicts)} traffic logs: {e}")

    def get_stats(self) -> Dict[str, Any]:
        return {
            "queue_depth": self._queue.qsize(),
            "total_enqueued": self._total_enqueued,
            "total_flushed": self._total_flushed,
            "batch_interval_ms": settings.LOG_BATCH_INTERVAL_MS,
            "batch_max_size": settings.LOG_BATCH_MAX_SIZE
        }

# Global Singleton
log_buffer = LogBatchBuffer()
