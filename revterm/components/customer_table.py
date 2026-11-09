"""
Reusable Customer Explorer Component.
Interactive searchable table of accounts, MRR contribution, and churn status.
"""
from __future__ import annotations
from typing import List
from rich.text import Text
from textual.app import ComposeResult
from textual.containers import Vertical
from textual.widgets import DataTable, Input
from revterm.state import CustomerRecord


class CustomerTable(Vertical):
    """Reusable interactive customer table with real-time filtering."""

    DEFAULT_CSS = """
    CustomerTable {
        height: 1fr;
        background: $surface;
        border: round $primary;
        padding: 0 1;
    }
    CustomerTable Input {
        margin: 0 0 1 0;
        border: tall $secondary;
    }
    """

    def __init__(self, customers: List[CustomerRecord] | None = None) -> None:
        super().__init__()
        self._raw_customers = customers or []

    def compose(self) -> ComposeResult:
        yield Input(placeholder="Search customer email or organization... (Press '/' to focus)", id="customer-search")
        yield DataTable(id="customers-data-table", cursor_type="row")

    def on_mount(self) -> None:
        table = self.query_one(DataTable)
        table.add_columns("Customer", "Email", "Plan Tier", "MRR Contrib", "Status", "Joined")
        self.populate(self._raw_customers)

    def populate(self, customers: List[CustomerRecord], query: str = "") -> None:
        table = self.query_one(DataTable)
        table.clear()
        query = query.lower().strip()

        for c in customers:
            if query and query not in c.name.lower() and query not in c.email.lower():
                continue

            # Color status
            if c.status == "active":
                status_text = Text("● ACTIVE", style="bold green")
            elif c.status == "past_due":
                status_text = Text("▲ PAST DUE", style="bold red")
            else:
                status_text = Text("■ CANCELED", style="dim yellow")

            table.add_row(
                c.name,
                c.email,
                c.plan,
                f"${c.mrr_contribution:,.2f}/mo",
                status_text,
                c.joined_date,
            )

    def update_data(self, customers: List[CustomerRecord]) -> None:
        self._raw_customers = customers
        search_val = self.query_one(Input).value
        self.populate(self._raw_customers, search_val)

    def on_input_changed(self, event: Input.Changed) -> None:
        self.populate(self._raw_customers, event.value)
