# Tooth Kingdom Adventure — Backend

> Python backend for the Tooth Kingdom Adventure dental health gamification app.  
> **FastAPI + SQLite** — no external database server required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.8+) |
| Database | SQLite (6 auto-created databases) |
| Auth | JWT + bcrypt |
| AI Chatbot | Google Gemini API (REST) |
| Voice TTS | ElevenLabs API (REST) |
| Email OTP | Gmail SMTP |

---

## Server Deployment Guide

> **For the server admin**: Follow these steps to deploy the backend and provide the team with the live URL.

### Prerequisites

- **Python 3.8+** (check with `python3 --version`)
- **pip** (Python package manager)
- **Git** (to clone the repo)

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tooth-kingdom-backend.git
cd tooth-kingdom-backend
```

### Step 2: Create Virtual Environment (Recommended)

```bash
# Linux / macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Then edit `.env` with your values:
```env
JWT_SECRET_KEY=your-secret-key-change-this
GOOGLE_GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
SMTP_EMAIL=toothkingdomadventures@gmail.com
SMTP_PASSWORD=your_gmail_app_password
```

> **Note:** If you don't have API keys yet, the backend will still work — AI responses will use built-in keyword matching, and voice/email features will be gracefully skipped.

### Step 5: Run the Server

#### Option A: Quick Start (Development / Testing)
```bash
python main.py
```
Server starts at `http://0.0.0.0:8010`

#### Option B: Production with Auto-Restart (Recommended)
```bash
# Install process manager
pip install gunicorn

# Run with gunicorn (Linux)
gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8010

# Or use nohup to keep it running after SSH disconnect
nohup python main.py > server.log 2>&1 &
```

#### Option C: Run as a System Service (Best for Production)

Create `/etc/systemd/system/tooth-kingdom.service`:
```ini
[Unit]
Description=Tooth Kingdom Backend
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/tooth-kingdom-backend
ExecStart=/path/to/tooth-kingdom-backend/venv/bin/python main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable tooth-kingdom
sudo systemctl start tooth-kingdom

# Check status
sudo systemctl status tooth-kingdom
```

### Step 6: Verify It Works

Open a browser or use curl:
```bash
curl http://YOUR_SERVER_IP:8010/
```

Expected response:
```json
{
  "status": "online",
  "version": "5.0.0",
  "engine": "Tooth Kingdom Clean Architecture",
  "timestamp": "2026-03-23T12:00:00"
}
```

To see all registered API routes:
```bash
curl http://YOUR_SERVER_IP:8010/debug/routes
```

---

### Step 7: Provide the URL to the App Team

The URL to share is:
```
http://YOUR_SERVER_IP:8010
```

If running behind a reverse proxy (nginx/Apache) with HTTPS:
```
https://your-domain.com/api
```

#### Nginx Reverse Proxy Example (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` (make sure venv is activated) |
| Port 8010 already in use | Change port in `main.py` last line: `port=8010` → `port=YOUR_PORT` |
| "Address already in use" | Kill existing process: `lsof -i :8010` then `kill PID` |
| Database locked errors | Only run ONE instance of the server at a time |
| SMTP email fails | Check firewall isn't blocking ports 587/465 |
| bcrypt not installing | Try `pip install bcrypt==4.0.1` |

## Quick Reference

| Command | Description |
|---|---|
| `python main.py` | Start the server |
| `python tools/test_backend.py` | Run automated API tests (server must be running) |
| `python tools/db_viewer.py` | Live view of all databases |
| `python tools/clean_db.py` | Reset all databases |

---

## Project Structure

```
tooth-kingdom-backend/
├── main.py              # Entry point — start here
├── logger.py            # Logging module
├── requirements.txt     # Python dependencies
├── .env.example         # Environment config template
├── db/                  # Database layer (6 SQLite DBs)
│   └── init_db.py       # Auto-creates all tables
├── routers/             # API modules
│   ├── auth.py          # Login, register, Google, phone OTP
│   ├── users.py         # User profiles, game stats
│   ├── game.py          # Brushing logs, chapters, XP
│   ├── rewards.py       # Achievements, inventory, shop
│   ├── quests.py        # Daily/weekly quest system
│   ├── social.py        # Leaderboard, parent/teacher links
│   └── ai.py            # Tanu AI chatbot
└── tools/               # Dev utilities
    ├── db_viewer.py     # Live DB viewer
    ├── clean_db.py      # DB reset
    └── test_backend.py  # API test suite
```

## License

Tooth Kingdom Adventure © 2026
