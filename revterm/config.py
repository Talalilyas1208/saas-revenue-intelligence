"""
revterm configuration and storage manager.
Handles secure configuration, mock data toggling, and persistence.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
from dataclasses import dataclass, asdict

DEFAULT_CONFIG_DIR = Path.home() / ".config" / "revterm"
CONFIG_FILE = DEFAULT_CONFIG_DIR / "config.json"


@dataclass
class AppConfig:
    stripe_api_key: str = ""
    currency: str = "USD"
    use_mock_data: bool = True
    theme: str = "stripe-dark"
    license_key: str = ""
    is_pro: bool = False

    @classmethod
    def load(cls) -> AppConfig:
        if not CONFIG_FILE.exists():
            return cls()
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return cls(**{k: v for k, v in data.items() if k in cls.__annotations__})
        except Exception:
            return cls()

    def save(self) -> None:
        DEFAULT_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(asdict(self), f, indent=2)
