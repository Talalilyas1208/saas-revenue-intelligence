"""
Data structures and domain models for revterm.
Provides clean, type-safe data objects for reusable TUI components.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional


@dataclass
class MetricSummary:
    mrr: float = 0.0
    arr: float = 0.0
    active_subscribers: int = 0
    churn_rate: float = 0.0
    mrr_growth_pct: float = 0.0
    daily_revenue_trend: List[float] = field(default_factory=list)


@dataclass
class TransactionEvent:
    id: str
    event_type: str  # "charge.succeeded", "subscription.created", "charge.failed"
    amount: float
    currency: str
    customer_email: str
    created_at: datetime
    description: str = ""

    @property
    def badge_color(self) -> str:
        if "succeeded" in self.event_type or "created" in self.event_type:
            return "green"
        if "failed" in self.event_type or "deleted" in self.event_type:
            return "red"
        return "yellow"

    @property
    def formatted_amount(self) -> str:
        sym = "$" if self.currency.upper() == "USD" else self.currency.upper() + " "
        return f"{sym}{self.amount:,.2f}"


@dataclass
class CustomerRecord:
    id: str
    name: str
    email: str
    plan: str
    mrr_contribution: float
    status: str  # "active", "past_due", "canceled"
    joined_date: str
