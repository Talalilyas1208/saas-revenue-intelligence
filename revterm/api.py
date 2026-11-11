"""
Live API client for revterm TUI.
Connects directly to the live Stripe REST API or your RevTerm Express Backend.
"""
from __future__ import annotations
from datetime import datetime
from typing import List
import httpx
from revterm.state import MetricSummary, TransactionEvent, CustomerRecord


class MetricsProvider:
    """Fetches real metrics, customers, and transactions from Stripe or RevTerm API."""

    def __init__(
        self,
        stripe_key: str = "",
        backend_url: str = "http://localhost:5001/api/v1",
        auth_token: str = "",
    ) -> None:
        self.stripe_key = stripe_key.strip()
        self.backend_url = backend_url.rstrip("/")
        self.auth_token = auth_token.strip()

    async def fetch_summary(self) -> MetricSummary:
        if self.stripe_key:
            return await self._fetch_stripe_summary()
        if self.auth_token:
            return await self._fetch_backend_summary()
        return MetricSummary()

    async def fetch_recent_events(self, limit: int = 20) -> List[TransactionEvent]:
        if self.stripe_key:
            return await self._fetch_stripe_events(limit)
        if self.auth_token:
            return await self._fetch_backend_events(limit)
        return []

    async def fetch_customers(self) -> List[CustomerRecord]:
        if self.stripe_key:
            return await self._fetch_stripe_customers()
        if self.auth_token:
            return await self._fetch_backend_customers()
        return []

    async def _fetch_backend_summary(self) -> MetricSummary:
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.backend_url}/metrics/summary", headers=headers)
            resp.raise_for_status()
            data = resp.json().get("data", {})
            trend = [float(item["revenue"]) for item in data.get("dailyTrend", [])]
            return MetricSummary(
                mrr=float(data.get("mrr", 0.0)),
                arr=float(data.get("arr", 0.0)),
                active_subscribers=int(data.get("activeSubscribers", 0)),
                churn_rate=float(data.get("churnRate", 0.0)),
                mrr_growth_pct=float(data.get("mrrGrowthPct", 0.0)),
                daily_revenue_trend=trend,
            )

    async def _fetch_backend_events(self, limit: int) -> List[TransactionEvent]:
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.backend_url}/metrics/transactions?limit={limit}",
                headers=headers,
            )
            resp.raise_for_status()
            rows = resp.json().get("data", [])
            return [
                TransactionEvent(
                    id=r["id"],
                    event_type=r["eventType"],
                    amount=float(r["amount"]),
                    currency=r.get("currency", "usd"),
                    customer_email=r["customerEmail"],
                    created_at=datetime.fromisoformat(r["occurredAt"].replace("Z", "+00:00")),
                    description=r.get("description", ""),
                )
                for r in rows
            ]

    async def _fetch_backend_customers(self) -> List[CustomerRecord]:
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{self.backend_url}/metrics/customers", headers=headers)
            resp.raise_for_status()
            rows = resp.json().get("data", [])
            return [
                CustomerRecord(
                    id=r["id"],
                    name=r["name"],
                    email=r["email"],
                    plan=r["plan"],
                    mrr_contribution=float(r["mrrContribution"]),
                    status=r["status"],
                    joined_date=r["joinedDate"],
                )
                for r in rows
            ]

    async def _fetch_stripe_summary(self) -> MetricSummary:
        customers = await self._fetch_stripe_customers()
        active = [c for c in customers if c.status == "active"]
        canceled = [c for c in customers if c.status == "canceled"]
        mrr = sum(c.mrr_contribution for c in active)
        churn = (len(canceled) / len(customers) * 100.0) if customers else 0.0
        events = await self._fetch_stripe_events(30)
        trend = [e.amount for e in reversed(events) if "succeeded" in e.event_type] or [0.0]
        return MetricSummary(
            mrr=round(mrr, 2),
            arr=round(mrr * 12.0, 2),
            active_subscribers=len(active),
            churn_rate=round(churn, 1),
            mrr_growth_pct=0.0,
            daily_revenue_trend=trend,
        )

    async def _fetch_stripe_events(self, limit: int) -> List[TransactionEvent]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"https://api.stripe.com/v1/charges?limit={limit}",
                auth=(self.stripe_key, ""),
            )
            resp.raise_for_status()
            charges = resp.json().get("data", [])
            return [
                TransactionEvent(
                    id=c["id"],
                    event_type="charge.succeeded" if c.get("paid") else "charge.failed",
                    amount=float(c.get("amount", 0)) / 100.0,
                    currency=c.get("currency", "usd"),
                    customer_email=(c.get("billing_details") or {}).get("email") or c.get("receipt_email") or "stripe@customer",
                    created_at=datetime.fromtimestamp(c.get("created", 0)),
                    description=c.get("description") or "Stripe Charge",
                )
                for c in charges
            ]

    async def _fetch_stripe_customers(self) -> List[CustomerRecord]:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://api.stripe.com/v1/subscriptions?status=all&limit=100&expand[]=data.customer",
                auth=(self.stripe_key, ""),
            )
            resp.raise_for_status()
            subs = resp.json().get("data", [])
            records: List[CustomerRecord] = []
            for sub in subs:
                cust = sub.get("customer") or {}
                email = cust.get("email", "unknown@stripe.local") if isinstance(cust, dict) else str(cust)
                name = cust.get("name") or email.split("@")[0] if isinstance(cust, dict) else email
                items = (sub.get("items") or {}).get("data", [])
                mrr = 0.0
                plan_name = "Subscription"
                if items:
                    price = items[0].get("price") or {}
                    amt = float(price.get("unit_amount", 0)) / 100.0
                    interval = (price.get("recurring") or {}).get("interval", "month")
                    mrr = amt / 12.0 if interval == "year" else amt
                    plan_name = price.get("nickname") or f"Plan (${amt:.2f}/{interval})"
                status = "active"
                if sub.get("status") in ("past_due", "unpaid"):
                    status = "past_due"
                elif sub.get("status") == "canceled":
                    status = "canceled"
                records.append(
                    CustomerRecord(
                        id=sub["id"],
                        name=name,
                        email=email,
                        plan=plan_name,
                        mrr_contribution=round(mrr, 2),
                        status=status,
                        joined_date=datetime.fromtimestamp(sub.get("created", 0)).strftime("%Y-%m-%d"),
                    )
                )
            return records
