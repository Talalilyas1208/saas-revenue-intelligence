"""
Reusable License & Pro Upgrade Modal Screen.
Prompts user to unlock Pro features or enter their purchase license key.
"""
from __future__ import annotations
from rich.text import Text
from textual.app import ComposeResult
from textual.containers import Grid, Vertical
from textual.screen import ModalScreen
from textual.widgets import Button, Input, Static
from revterm.license import LicenseManager


class LicenseModal(ModalScreen[bool]):
    """Modal dialog for activating Pro License."""

    DEFAULT_CSS = """
    LicenseModal {
        align: center middle;
        background: rgba(0, 0, 0, 0.7);
    }
    #license-dialog {
        width: 65;
        height: auto;
        padding: 1 2;
        background: #161b22;
        border: thick #635bff;
    }
    #license-title {
        text-align: center;
        margin: 0 0 1 0;
    }
    #license-desc {
        margin: 0 0 1 0;
    }
    #license-input {
        margin: 1 0;
        border: tall #635bff;
    }
    #license-buttons {
        layout: horizontal;
        align: center middle;
        height: 3;
        margin: 1 0 0 0;
    }
    #license-buttons Button {
        margin: 0 1;
    }
    """

    def __init__(self, current_key: str = "") -> None:
        super().__init__()
        self.current_key = current_key

    def compose(self) -> ComposeResult:
        with Vertical(id="license-dialog"):
            yield Static(
                Text("★ UPGRADE TO REVTERM PRO", style="bold #635bff"),
                id="license-title",
            )
            yield Static(
                "Unlock Multi-Account Switching, Real-Time Webhook Chimes, "
                "Customer Churn Radar, and Unlimited Metric History.\n\n"
                "Get your license at: [bold underline cyan]https://polar.sh/revterm[/]",
                id="license-desc",
            )
            yield Input(
                value=self.current_key,
                placeholder="Paste key: REV-PRO-XXXXX-XXXXXX",
                id="license-input",
            )
            yield Static("", id="license-feedback")
            with Grid(id="license-buttons"):
                yield Button("Activate Key", variant="success", id="btn-activate")
                yield Button("Demo Key", variant="primary", id="btn-demo")
                yield Button("Close", variant="default", id="btn-close")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        feedback = self.query_one("#license-feedback", Static)
        inp = self.query_one("#license-input", Input)

        if event.button.id == "btn-demo":
            demo_key = LicenseManager.generate_demo_key()
            inp.value = demo_key
            feedback.update(Text("✓ Generated valid Pro demo key!", style="bold green"))

        elif event.button.id == "btn-activate":
            entered_key = inp.value.strip()
            if LicenseManager.verify_key(entered_key):
                feedback.update(Text("✓ Pro License Activated Successfully!", style="bold green"))
                self.dismiss(True)
            else:
                feedback.update(Text("✗ Invalid License Key. Please check the format.", style="bold red"))

        elif event.button.id == "btn-close":
            self.dismiss(False)
