# Tooth Kingdom Adventure — Backend

> Python backend for the Tooth Kingdom Adventure dental health gamification app.  
> **FastAPI + SQLite** — fully self-contained, no external services or databases required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI (Python 3.8+) |
| Database | SQLite (6 auto-created file databases) |
| Auth | JWT + bcrypt |
| AI Chatbot | Built-in keyword-based response engine |
| Voice | Pre-generated audio assets (gTTS) |
| Email OTP | SMTP (optional — falls back to console logging) |

> **No external API keys or third-party services are required.** The AI chatbot (Tanu) uses a built-in keyword matching engine with pre-defined dental health responses. Voice features use pre-generated audio files. All features run entirely offline on the server.

---

## 🖥️ Frontend Setup (Website & Desktop)

The frontend is a React-based web application located in the `/website` directory. It uses Vite for fast development and can be deployed as a standalone website or wrapped in Capacitor for mobile.

### Prerequisites
- **Node.js** (v18+)
- **npm** (comes with Node)

### Step 1: Install Dependencies
```bash
cd website
npm install
```

### Step 2: Configure Backend URL
Edit `website/.env` to point to your backend:
```env
VITE_LOCAL_BACKEND_URL=http://your-server-ip:8010
```

### Step 3: Run Development Server
```bash
npm run dev
```
Access the app at `http://localhost:5173`.

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
git clone https://github.com/VinzmokeZ/Tooth-Kingdom-Backend.git
cd Tooth-Kingdom-Backend
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

Edit `.env` — only one required value:
```env
JWT_SECRET_KEY=your-secret-key-change-this
```

> Everything else is optional. The server runs fully without any additional configuration.

### Step 5: Run the Server

#### Option A: Quick Start (Development / Testing)
```bash
python main.py
```
Server starts at `http://0.0.0.0:8010`

#### Option B: Keep Running After SSH Disconnect
```bash
nohup python main.py > server.log 2>&1 &
```

#### Option C: Run as a System Service (Auto-Restart on Crash)

Create `/etc/systemd/system/tooth-kingdom.service`:
```ini
[Unit]
Description=Tooth Kingdom Backend
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/Tooth-Kingdom-Backend
ExecStart=/path/to/Tooth-Kingdom-Backend/venv/bin/python main.py
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
Tooth-Kingdom-Backend/
├── main.py              # Entry point — start here
├── logger.py            # Logging module
├── requirements.txt     # Python dependencies
├── .env.example         # Environment config template
├── db/                  # Database layer (6 SQLite DBs, auto-created)
│   └── init_db.py       # Schema definitions
├── routers/             # API modules
│   ├── auth.py          # Login, register, Google bridge, phone OTP
│   ├── users.py         # User profiles, game stats
│   ├── game.py          # Brushing logs, chapters, XP
│   ├── rewards.py       # Achievements, inventory, shop
│   ├── quests.py        # Daily/weekly quest system
│   ├── social.py        # Leaderboard, parent/teacher links
│   └── ai.py            # Tanu AI chatbot (built-in responses)
└── tools/               # Dev utilities
    ├── db_viewer.py     # Live DB viewer
    ├── clean_db.py      # DB reset
    └── test_backend.py  # API test suite
```

## How the AI Chatbot Works

The Tanu chatbot uses a **built-in keyword matching engine** — no external AI services needed:

1. User sends a message (e.g., "How do I brush?")
2. The engine matches keywords against a curated response database of dental health answers
3. Returns a friendly, age-appropriate response instantly

This design ensures **zero latency, zero external dependencies**, and works fully offline on any server.

## License

Tooth Kingdom Adventure © 2026
