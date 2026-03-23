"""
Tooth Kingdom Adventure — Logging Module
Colorama-based colored console output + file logging
"""
import os
import sys
import time
from datetime import datetime

try:
    from colorama import init, Fore, Style
    init(autoreset=True)
except ImportError:
    class MockColor:
        def __getattr__(self, name): return ""
    Fore = Style = MockColor()

# Log directory
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, f"backend_{datetime.now().strftime('%Y-%m-%d')}.log")


def _write_file(msg):
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    except:
        pass


def api_log(method, path, status, duration):
    """Logs API requests with color-coded status"""
    color = Fore.GREEN if 200 <= status < 300 else Fore.YELLOW if status < 500 else Fore.RED
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    msg = f"[BACKEND] [{timestamp}] INFO:  127.0.0.1 - \"{method} {path} HTTP/1.1\" {status} OK"
    console_msg = (
        f"{Fore.GREEN}[BACKEND]{Style.RESET_ALL} INFO:     "
        f"127.0.0.1 - \"{method} {path} HTTP/1.1\" {color}{status} OK{Style.RESET_ALL}"
    )
    print(console_msg)
    _write_file(msg)


def db_log(category, message, level="INFO"):
    """Logs database / service operations"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    color = Fore.CYAN if level == "INFO" else Fore.YELLOW if level == "WARNING" else Fore.RED
    msg = f"[BACKEND] [{timestamp}] [{category}] {message}"
    console_msg = (
        f"{Fore.GREEN}[BACKEND]{Style.RESET_ALL} [{timestamp}] "
        f"{color}[{category}]{Style.RESET_ALL} {message}"
    )
    print(console_msg)
    _write_file(msg)


def success(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{Fore.GREEN}[SUCCESS]{Style.RESET_ALL} {timestamp} - {message}")
    _write_file(f"SUCCESS: {message}")


def info(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{Fore.BLUE}[INFO]{Style.RESET_ALL} {timestamp} - {message}")
    _write_file(f"INFO: {message}")


def warn(message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"{Fore.YELLOW}[WARN]{Style.RESET_ALL} {timestamp} - {message}")
    _write_file(f"WARN: {message}")


def error(message, exc=None):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    console_msg = f"{Fore.RED}[BACKEND] [ERROR] {timestamp} - {message}{Style.RESET_ALL}"
    print(console_msg)
    if exc:
        print(f"{Fore.RED}Exception: {exc}{Style.RESET_ALL}")
    _write_file(f"ERROR: {message}")
