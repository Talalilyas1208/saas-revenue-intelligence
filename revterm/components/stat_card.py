"""
Reusable KPI StatCard Component.
Displays a high-level metric (e.g. MRR, ARR, Churn) with title, value, and growth pill.
"""
from __future__ import annotations
from typing import Optional
from rich.panel import Panel
from rich.text import Text
from textual.app import RenderResult
from textual.reactive import reactive
from textual.widget import Widget


class StatCard(Widget):
    """A reusable card displaying a key business performance indicator."""

    DEFAULT_CSS = """
    StatCard {
        height: 7;
        min-width: 24;
        padding: 0 1;
        margin: 0 1 1 0;
        background: $surface;
        border: round $primary;
    }
    StatCard:hover {
        border: round $accent;
    }
    """

    title: reactive[str] = reactive("")
    value: reactive[str] = reactive("$0.00")
    delta_pct: reactive[Optional[float]] = reactive(None)
    subtitle: reactive[str] = reactive("")

    def __init__(
        self,
        title: str,
        value: str,
        delta_pct: Optional[float] = None,
        subtitle: str = "",
        name: Optional[str] = None,
        id: Optional[str] = None,
        classes: Optional[str] = None,
    ) -> None:
        super().__init__(name=name, id=id, classes=classes)
        self.title = title
        self.value = value
        self.delta_pct = delta_pct
        self.subtitle = subtitle

    def render(self) -> RenderResult:
        content = Text()
        # Title (muted small uppercase)
        content.append(self.title.upper(), style="bold dim white")
        content.append("\n")

        # Big bold value
        content.append(self.value, style="bold bright_white")
        content.append("\n")

        # Growth / Decline pill
        if self.delta_pct is not None:
            if self.delta_pct > 0:
                content.append(f" ▲ +{self.delta_pct:.1f}% ", style="bold black on bright_green")
            elif self.delta_pct < 0:
                content.append(f" ▼ {self.delta_pct:.1f}% ", style="bold black on bright_red")
            else:
                content.append(" ▬ 0.0% ", style="bold white on dim")
            content.append(" ")

        if self.subtitle:
            content.append(self.subtitle, style="dim white")

        return content
