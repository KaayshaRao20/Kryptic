import json
import logging
from typing import Any, Optional, Dict
import redis
from app.config import settings

logger = logging.getLogger(__name__)


class InMemoryRedisFallback:
    """In-memory key-value store simulating Redis when standalone server is offline."""
    def __init__(self):
        self._store: Dict[str, str] = {}
        self._hash_store: Dict[str, Dict[str, str]] = {}
        self._counters: Dict[str, int] = {}
        self.is_fallback = True

    def ping(self) -> bool:
        return True

    def get(self, key: str) -> Optional[str]:
        return self._store.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        self._store[key] = str(value)
        return True

    def delete(self, *keys: str) -> int:
        count = 0
        for k in keys:
            if k in self._store:
                del self._store[k]
                count += 1
            if k in self._hash_store:
                del self._hash_store[k]
                count += 1
            if k in self._counters:
                del self._counters[k]
                count += 1
        return count

    def hget(self, name: str, key: str) -> Optional[str]:
        return self._hash_store.get(name, {}).get(key)

    def hset(self, name: str, key: str, value: str) -> int:
        if name not in self._hash_store:
            self._hash_store[name] = {}
        self._hash_store[name][key] = str(value)
        return 1

    def hgetall(self, name: str) -> Dict[str, str]:
        return self._hash_store.get(name, {}).copy()

    def incr(self, name: str, amount: int = 1) -> int:
        self._counters[name] = self._counters.get(name, 0) + amount
        return self._counters[name]

    def exists(self, *names: str) -> int:
        count = 0
        for n in names:
            if n in self._store or n in self._hash_store or n in self._counters:
                count += 1
        return count

    def keys(self, pattern: str = "*") -> list:
        # Simple glob filter
        all_keys = list(self._store.keys()) + list(self._hash_store.keys()) + list(self._counters.keys())
        if pattern == "*":
            return all_keys
        prefix = pattern.rstrip("*")
        return [k for k in all_keys if k.startswith(prefix)]


class RedisClientWrapper:
    def __init__(self):
        self._client = None
        self._is_connected = False
        self._init_connection()

    def _init_connection(self):
        try:
            r = redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=1,
                socket_timeout=1
            )
            r.ping()
            self._client = r
            self._is_connected = True
            logger.info("Connected to primary Redis server.")
        except Exception as e:
            logger.warning(f"Redis unavailable at {settings.REDIS_URL} ({e}). Using in-memory fallback.")
            self._client = InMemoryRedisFallback()
            self._is_connected = False

    @property
    def client(self):
        if self._client is None:
            self._init_connection()
        return self._client

    def set_json(self, key: str, value: Any, expire_seconds: Optional[int] = None) -> bool:
        serialized = json.dumps(value)
        prefixed_key = f"{settings.REDIS_KEY_PREFIX}{key}"
        return bool(self.client.set(prefixed_key, serialized, ex=expire_seconds))

    def get_json(self, key: str) -> Optional[Any]:
        prefixed_key = f"{settings.REDIS_KEY_PREFIX}{key}"
        val = self.client.get(prefixed_key)
        if val is None:
            return None
        try:
            return json.loads(val)
        except Exception:
            return val

    def delete_key(self, key: str) -> int:
        prefixed_key = f"{settings.REDIS_KEY_PREFIX}{key}"
        return self.client.delete(prefixed_key)

    def increment_counter(self, key: str, amount: int = 1) -> int:
        prefixed_key = f"{settings.REDIS_KEY_PREFIX}{key}"
        return self.client.incr(prefixed_key, amount)

    def check_health(self) -> dict:
        try:
            is_alive = self.client.ping()
            return {
                "status": "healthy" if is_alive else "degraded",
                "is_fallback": getattr(self.client, "is_fallback", False),
                "connected": self._is_connected
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "connected": False
            }


redis_client = RedisClientWrapper()
