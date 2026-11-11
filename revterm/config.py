"""
revterm configuration and storage manager.
Handles Stripe API keys, backend URL, auth token, and license persistence.
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
    stripe_api_key: str = os.environ.get("STRIPE_SECRET_KEY", "")
    backend_url: str = os.environ.get("REVTERM_API_URL", "http://localhost:5001/api/v1")
    auth_token: str = os.environ.get("REVTERM_AUTH_TOKEN", "")
    currency: str = "USD"
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
