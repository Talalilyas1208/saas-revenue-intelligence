"""
Reusable Real-Time Event Feed Component.
Renders incoming Stripe and SaaS events with colored status badges.
"""
from __future__ import annotations
from typing import List, Optional
from rich.table import Table
from rich.text import Text
from textual.app import RenderResult
from textual.containers import VerticalScroll
from textual.reactive import reactive
from textual.widget import Widget
from revterm.state import TransactionEvent


class EventFeed(Widget):
    """Reusable scrollable event feed displaying real-time transactions."""

    DEFAULT_CSS = """
    EventFeed {
        height: 1fr;
        background: $surface;
        border: round $primary;
        padding: 0 1;
    }
    """

    events: reactive[List[TransactionEvent]] = reactive(list)

    def __init__(
        self,
        events: Optional[List[TransactionEvent]] = None,
        name: Optional[str] = None,
        id: Optional[str] = None,
        classes: Optional[str] = None,
    ) -> None:
        super().__init__(name=name, id=id, classes=classes)
        self.events = events or []

    def render(self) -> RenderResult:
        table = Table(
            box=None,
            expand=True,
            show_header=True,
            header_style="bold dim white",
            pad_edge=False,
        )
        table.add_column("Time", style="dim", width=10)
        table.add_column("Status", width=14)
        table.add_column("Customer", ratio=2)
        table.add_column("Description", ratio=2)
        table.add_column("Amount", justify="right", style="bold", width=12)

        if not self.events:
            table.add_row("--", "NO EVENTS", "Waiting for incoming transactions...", "", "$0.00")
            return table

        for evt in self.events:
            time_str = evt.created_at.strftime("%H:%M:%S")

            # Status badge
            if "succeeded" in evt.event_type:
                badge = Text("  SUCCESS  ", style="bold black on bright_green")
            elif "created" in evt.event_type:
                badge = Text("  NEW SUB  ", style="bold black on bright_cyan")
            elif "failed" in evt.event_type:
                badge = Text("  FAILED   ", style="bold white on bright_red")
            else:
                badge = Text("  CANCELED ", style="bold black on bright_yellow")

            table.add_row(
                time_str,
                badge,
                evt.customer_email,
                evt.description,
                evt.formatted_amount,
            )

        return table
