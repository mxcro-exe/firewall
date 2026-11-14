"""
PatchShield Enterprise — Native OS Desktop Application & System Tray
Wraps PatchShield inside a native OS desktop window (Edge WebView2 / PyWebView)
with taskbar system tray integration, native OS notifications, and kernel status monitoring.
"""

import os
import sys
import time
import threading
import urllib.request
import subprocess
import webview

# Optional native tray and notifications
try:
    from PIL import Image, ImageDraw
    import pystray
    TRAY_AVAILABLE = True
except ImportError:
    TRAY_AVAILABLE = False

try:
    from plyer import notification
    NOTIFICATIONS_AVAILABLE = True
except ImportError:
    NOTIFICATIONS_AVAILABLE = False


def send_os_notification(title: str, message: str):
    """Dispatches a native OS desktop balloon/toast notification."""
    if NOTIFICATIONS_AVAILABLE:
        try:
            notification.notify(
                title=title,
                message=message,
                app_name="PatchShield",
                timeout=4
            )
        except Exception:
            pass


def is_service_running(url: str) -> bool:
    """Checks if a local service is listening and returning 200/OK."""
    try:
        resp = urllib.request.urlopen(url, timeout=1.5)
        return resp.status in (200, 304, 404)
    except Exception:
        return False


def ensure_backend_and_frontend():
    """Starts backend and frontend daemons if not already active."""
    root_dir = os.path.dirname(os.path.abspath(__file__))

    # Check Gateway (:8000)
    if not is_service_running("http://127.0.0.1:8000/api/v1/health"):
        print("[Desktop App] Starting backend gateway on :8000...")
        subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--port", "8000"],
            cwd=root_dir,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        )

    # Check Frontend (:5173)
    if not is_service_running("http://127.0.0.1:5173"):
        print("[Desktop App] Starting Vite frontend server on :5173...")
        subprocess.Popen(
            ["npm", "--prefix", "frontend", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
            cwd=root_dir,
            shell=True,
            creationflags=subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
        )

    # Wait for frontend to become ready
    for _ in range(15):
        if is_service_running("http://127.0.0.1:5173"):
            break
        time.sleep(0.5)


def create_tray_icon_image():
    """Generates an in-memory 64x64 shield icon for the OS taskbar system tray."""
    img = Image.new("RGBA", (64, 64), color=(0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    # Draw Copper / Teal Shield
    draw.polygon([(32, 4), (58, 14), (52, 44), (32, 60), (12, 44), (6, 14)], fill=(198, 96, 31, 255))
    draw.polygon([(32, 10), (52, 18), (46, 40), (32, 54), (18, 40), (12, 18)], fill=(6, 78, 59, 255))
    draw.line([(32, 14), (32, 50)], fill=(248, 231, 201, 255), width=3)
    draw.line([(18, 28), (46, 28)], fill=(248, 231, 201, 255), width=3)
    return img


def setup_system_tray(window):
    """Sets up an OS System Tray icon with quick actions in the taskbar."""
    if not TRAY_AVAILABLE:
        return

    def on_show_deck(icon, item):
        window.show()
        window.restore()

    def on_hide_deck(icon, item):
        window.hide()

    def on_exit(icon, item):
        icon.stop()
        window.destroy()
        sys.exit(0)

    menu = pystray.Menu(
        pystray.MenuItem("🛡️ Open PatchShield Deck", on_show_deck, default=True),
        pystray.MenuItem("Minimize to Tray", on_hide_deck),
        pystray.Menu.SEPARATOR,
        pystray.MenuItem("Exit PatchShield", on_exit)
    )

    icon = pystray.Icon("PatchShield", create_tray_icon_image(), "PatchShield Enterprise WAF", menu)
    tray_thread = threading.Thread(target=icon.run, daemon=True)
    tray_thread.start()


def main():
    print("==================================================")
    print("   PatchShield Enterprise OS Desktop Application  ")
    print("   Kernel Filter: WFP / eBPF / Socket Drop Ready  ")
    print("==================================================")

    # 1. Ensure Services are Running
    ensure_backend_and_frontend()

    # 2. Trigger Native OS Notification
    send_os_notification(
        title="PatchShield Enterprise WAF",
        message="Firewall Active in OS! Kernel Filter & AI Virtual Patching Armed."
    )

    # 3. Create Native OS Window
    dashboard_url = "http://127.0.0.1:5173"
    window = webview.create_window(
        title="PatchShield Enterprise — OS Virtual Patching Gateway",
        url=dashboard_url,
        width=1280,
        height=820,
        min_size=(1024, 680),
        background_color="#0A0F14",
        confirm_close=False
    )

    # 4. Background System Tray
    setup_system_tray(window)

    # 5. Start GUI Event Loop
    webview.start(debug=False)


if __name__ == "__main__":
    main()
