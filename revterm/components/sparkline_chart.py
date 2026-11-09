"""
Reusable Unicode / Block Chart Component.
Renders responsive historical trend graphs in pure terminal text.
"""
from __future__ import annotations
from typing import List, Optional
from rich.text import Text
from textual.app import RenderResult
from textual.reactive import reactive
from textual.widget import Widget

BAR_GLYPHS = (" ", " ", "▂", "▃", "▄", "▅", "▆", "▇", "█")


class SparklineChart(Widget):
    """Reusable ASCII/Unicode trend graph with min/max labels."""

    DEFAULT_CSS = """
    SparklineChart {
        height: 8;
        padding: 0 1;
        margin: 0 0 1 0;
        background: $surface;
        border: round $primary;
    }
    """

    title: reactive[str] = reactive("REVENUE TREND (LAST 30 DAYS)")
    data: reactive[List[float]] = reactive(list)

    def __init__(
        self,
        data: Optional[List[float]] = None,
        title: str = "REVENUE TREND (LAST 30 DAYS)",
        name: Optional[str] = None,
        id: Optional[str] = None,
        classes: Optional[str] = None,
    ) -> None:
        super().__init__(name=name, id=id, classes=classes)
        self.title = title
        self.data = data or []

    def render(self) -> RenderResult:
        if not self.data:
            return Text("No trend data available.", style="dim italic")

        min_val = min(self.data)
        max_val = max(self.data)
        spread = max(1e-5, max_val - min_val)

        res = Text()
        # Header line
        res.append(f"{self.title} ", style="bold dim white")
        res.append(f"Min: ${min_val:,.0f}  Max: ${max_val:,.0f}  Latest: ${self.data[-1]:,.0f}\n\n", style="dim green")

        # Multi-row block graph rendering for height
        rows = 3
        # Normalize data to height * (len(BAR_GLYPHS) - 1)
        max_levels = rows * (len(BAR_GLYPHS) - 1)

        normalized: List[int] = []
        for val in self.data:
            ratio = (val - min_val) / spread
            level = int(ratio * max_levels)
            normalized.append(min(max_levels, max(0, level)))

        # Render each row from top to bottom
        for row in reversed(range(rows)):
            row_min = row * (len(BAR_GLYPHS) - 1)
            line = Text("  ")
            for level in normalized:
                diff = level - row_min
                if diff <= 0:
                    glyph = " "
                    color = "dim blue"
                elif diff >= (len(BAR_GLYPHS) - 1):
                    glyph = "█"
                    color = "bold cyan"
                else:
                    glyph = BAR_GLYPHS[diff]
                    color = "bright_cyan"
                line.append(glyph, style=color)
            res.append(line)
            res.append("\n")

        # Base axis
        res.append("  " + "─" * len(self.data), style="dim blue")
        return res
