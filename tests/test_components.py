"""
Comprehensive verification test suite for revterm reusable components.
Tests component initialization, rendering, state reactivity, and headless app execution.
"""
import asyncio
from revterm.license import LicenseManager
from revterm.state import MetricSummary, TransactionEvent, CustomerRecord
from revterm.components.stat_card import StatCard
from revterm.components.sparkline_chart import SparklineChart
from revterm.components.event_feed import EventFeed
from revterm.api import MetricsProvider
from revterm.app import RevTermApp


def test_license_manager() -> None:
    demo_key = LicenseManager.generate_demo_key("TESTER")
    assert LicenseManager.verify_key(demo_key) is True
    assert LicenseManager.verify_key("INVALID-KEY") is False
    assert LicenseManager.is_feature_unlocked("churn_radar", demo_key) is True
    assert LicenseManager.is_feature_unlocked("churn_radar", "INVALID") is False


def test_stat_card_render() -> None:
    card = StatCard(title="MRR", value="$12,450.00", delta_pct=14.2, subtitle="vs last mo")
    rendered = card.render()
    assert rendered is not None
    assert "MRR" in rendered.plain
    assert "$12,450.00" in rendered.plain
    assert "+14.2%" in rendered.plain


def test_sparkline_chart_render() -> None:
    chart = SparklineChart(data=[100.0, 250.0, 400.0, 300.0, 600.0])
    rendered = chart.render()
    assert rendered is not None
    assert "Min: $100" in rendered.plain
    assert "Max: $600" in rendered.plain


def test_event_feed_render() -> None:
    from datetime import datetime
    events = [
        TransactionEvent(
            id="ch_123",
            event_type="charge.succeeded",
            amount=49.0,
            currency="usd",
            customer_email="billing@acme.io",
            created_at=datetime.now(),
            description="Pro Monthly",
        )
    ]
    feed = EventFeed(events=events)
    rendered = feed.render()
    assert rendered is not None
    assert len(rendered.columns) == 5


async def test_headless_app_execution() -> None:
    app = RevTermApp()
    async with app.run_test() as pilot:
        await pilot.pause()
        # Verify widgets are present and mounted
        assert app.query_one("#card-mrr") is not None
        assert app.query_one("#card-arr") is not None
        assert app.query_one("#revenue-chart") is not None
        assert app.query_one("#live-events-feed") is not None

        # Test shortcut triggers
        await app.action_refresh_data()
        await pilot.pause()

        # Test quit
        await app.action_quit()


if __name__ == "__main__":
    print("Running component sanity tests...")
    test_license_manager()
    print("✓ LicenseManager test passed")
    test_stat_card_render()
    print("✓ StatCard test passed")
    test_sparkline_chart_render()
    print("✓ SparklineChart test passed")
    test_event_feed_render()
    print("✓ EventFeed test passed")
    asyncio.run(test_headless_app_execution())
    print("✓ Headless RevTermApp execution test passed!")
    print("\nAll component tests PASSED with zero errors!")
