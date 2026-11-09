"""
RevTerm - Modern Terminal & TUI Dashboard for SaaS & Stripe Metrics.
Assembles reusable components with reactive state and background polling.
"""
from __future__ import annotations
from pathlib import Path
from rich.text import Text
from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical
from textual.widgets import Footer, Header, Static, TabbedContent, TabPane

from revterm.api import MetricsProvider
from revterm.components.customer_table import CustomerTable
from revterm.components.event_feed import EventFeed
from revterm.components.license_modal import LicenseModal
from revterm.components.sparkline_chart import SparklineChart
from revterm.components.stat_card import StatCard
from revterm.config import AppConfig
from revterm.license import LicenseManager
from revterm.state import MetricSummary

CSS_PATH = Path(__file__).parent / "theme.tcss"


class RevTermApp(App[None]):
    """Main RevTerm TUI Application."""

    TITLE = "rev-term // Stripe & SaaS Metrics"
    SUB_TITLE = "Real-time revenue, subscribers & live transactions"
    CSS_PATH = CSS_PATH

    BINDINGS = [
        Binding("q", "quit", "Quit", show=True),
        Binding("r", "refresh_data", "Refresh", show=True),
        Binding("p", "open_license_modal", "Pro License", show=True),
        Binding("/", "focus_search", "Search", show=True),
    ]

    def __init__(self) -> None:
        super().__init__()
        self.config = AppConfig.load()
        self.provider = MetricsProvider(
            stripe_key=self.config.stripe_api_key,
            use_mock=self.config.use_mock_data,
        )

    def compose(self) -> ComposeResult:
        yield Header(show_clock=True)

        with Vertical():
            # Row 1: KPI Stat Cards
            with Horizontal(id="kpi-row"):
                yield StatCard(title="Monthly Recurring (MRR)", value="$0.00", delta_pct=0.0, id="card-mrr")
                yield StatCard(title="Annual Run Rate (ARR)", value="$0.00", subtitle="projected", id="card-arr")
                yield StatCard(title="Active Subscribers", value="0", subtitle="customers", id="card-subs")
                yield StatCard(title="User Churn Rate", value="0.0%", subtitle="last 30d", id="card-churn")

            # Row 2: Trend Graph
            with Container(id="chart-container"):
                yield SparklineChart(id="revenue-chart")

            # Row 3: Tabbed views (Live Feed, Customers, Pro Info)
            with TabbedContent(initial="tab-feed"):
                with TabPane("⚡ Real-Time Feed", id="tab-feed"):
                    yield EventFeed(id="live-events-feed")

                with TabPane("👥 Customers & MRR", id="tab-customers"):
                    yield CustomerTable()

                with TabPane("⚙ Settings & License", id="tab-settings"):
                    yield Static(id="settings-pane-content")

        yield Footer()

    async def on_mount(self) -> None:
        """Called when app mounts. Fetches initial data and schedules background refreshes."""
        await self.action_refresh_data()
        self.set_interval(8.0, self._background_tick)

    async def action_refresh_data(self) -> None:
        """Fetches fresh metrics and updates UI reactively without blocking."""
        summary = await self.provider.fetch_summary()
        events = await self.provider.fetch_recent_events(limit=20)
        customers = await self.provider.fetch_customers()

        # Update KPI Cards
        card_mrr = self.query_one("#card-mrr", StatCard)
        card_mrr.value = f"${summary.mrr:,.2f}"
        card_mrr.delta_pct = summary.mrr_growth_pct

        card_arr = self.query_one("#card-arr", StatCard)
        card_arr.value = f"${summary.arr:,.0f}"

        card_subs = self.query_one("#card-subs", StatCard)
        card_subs.value = f"{summary.active_subscribers:,}"

        card_churn = self.query_one("#card-churn", StatCard)
        card_churn.value = f"{summary.churn_rate:.1f}%"

        # Update Trend Chart
        chart = self.query_one("#revenue-chart", SparklineChart)
        chart.data = summary.daily_revenue_trend

        # Update Event Feed
        feed = self.query_one("#live-events-feed", EventFeed)
        feed.events = events

        # Update Customers Table
        cust_table = self.query_one(CustomerTable)
        cust_table.update_data(customers)

        # Update Settings Pane
        self._update_settings_pane()

    async def _background_tick(self) -> None:
        """Lightweight background pulse to simulate/poll new transactions."""
        events = await self.provider.fetch_recent_events(limit=20)
        feed = self.query_one("#live-events-feed", EventFeed)
        feed.events = events

    def _update_settings_pane(self) -> None:
        pane = self.query_one("#settings-pane-content", Static)
        is_pro = LicenseManager.verify_key(self.config.license_key)
        status_text = Text()
        status_text.append("\n  REVTERM CONFIGURATION & STATUS\n\n", style="bold #635bff")
        status_text.append(f"  • Data Mode:   ", style="dim")
        status_text.append("MOCK DEMO MODE (Stripe API key optional)\n", style="bold yellow")
        status_text.append(f"  • License:     ", style="dim")
        if is_pro:
            status_text.append("PRO TIER ACTIVATED (All Features Unlocked)\n", style="bold green")
        else:
            status_text.append("FREE COMMUNITY TIER (Press 'p' to activate Pro)\n", style="bold white")

        status_text.append("\n  Keyboard Shortcuts:\n", style="bold white")
        status_text.append("  [r] Refresh metrics    [p] Upgrade/License    [/] Focus Search    [q] Quit\n", style="dim cyan")
        pane.update(status_text)

    def action_open_license_modal(self) -> None:
        """Opens the Pro License upgrade modal."""
        def handle_result(activated: bool) -> None:
            if activated:
                self.config.license_key = LicenseManager.generate_demo_key()
                self.config.is_pro = True
                self.config.save()
                self._update_settings_pane()

        self.push_screen(LicenseModal(self.config.license_key), handle_result)

    def action_focus_search(self) -> None:
        """Switches to the Customers tab and focuses the search input."""
        tabs = self.query_one(TabbedContent)
        tabs.active = "tab-customers"
        cust_table = self.query_one(CustomerTable)
        inp = cust_table.query_one("Input")
        inp.focus()


def main() -> None:
    app = RevTermApp()
    app.run()


if __name__ == "__main__":
    main()
