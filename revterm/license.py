"""
Monetization & License Verification Engine.
Handles Pro tier licensing, feature gating, and cryptographic activation.
"""
from __future__ import annotations
import hashlib
from typing import Optional


class LicenseManager:
    """Validates user license keys and determines feature gating."""

    MAGIC_PREFIX = "REV-PRO-"

    @classmethod
    def verify_key(cls, key: str) -> bool:
        """
        Validates the license key format and checksum.
        Allows instant offline verification without network latency.
        """
        clean_key = key.strip().upper()
        if not clean_key.startswith(cls.MAGIC_PREFIX):
            return False

        payload = clean_key[len(cls.MAGIC_PREFIX):]
        parts = payload.split("-")
        if len(parts) < 2:
            return False

        data_part, checksum_part = parts[0], parts[1]
        expected_checksum = hashlib.sha256(f"revterm_salt_{data_part}".encode()).hexdigest()[:6].upper()
        return checksum_part == expected_checksum

    @classmethod
    def generate_demo_key(cls, identifier: str = "FOUNDER2026") -> str:
        """Generates a valid demo pro key for testing/onboarding."""
        checksum = hashlib.sha256(f"revterm_salt_{identifier}".encode()).hexdigest()[:6].upper()
        return f"{cls.MAGIC_PREFIX}{identifier}-{checksum}"

    @classmethod
    def is_feature_unlocked(cls, feature_name: str, key: str) -> bool:
        """Checks if a given feature is unlocked by the current license."""
        is_pro = cls.verify_key(key)
        pro_features = {
            "multi_account",
            "realtime_chime",
            "churn_radar",
            "csv_export",
        }
        if feature_name in pro_features:
            return is_pro
        return True  # Free features always unlocked
