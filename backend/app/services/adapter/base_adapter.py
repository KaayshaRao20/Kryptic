from abc import ABC, abstractmethod
from typing import Dict, Any


class BaseProviderAdapter(ABC):
    """Abstract interface to normalize heterogeneous third-party payment provider payloads into Kryptic schema."""

    @abstractmethod
    def normalize_event(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        """Maps provider-specific JSON to standard Kryptic internal transaction dictionary."""
        pass
