# Tooth Kingdom Adventure — Website (Frontend)

> React + Vite frontend for the Tooth Kingdom Adventure dental health app.  
> Builds as a website and also as an Android APK via Capacitor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | TailwindCSS + Custom CSS |
| UI Components | Radix UI + Lucide Icons |
| Animations | Framer Motion |
| Mobile | Capacitor (Android) |
| Auth | Firebase Auth (Google Sign-In) + Local Python Backend |
| Charts | Recharts |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Edit .env with your Firebase config (for Google login)

# 3. Start development server
npm run dev
```

Website runs at **http://localhost:5173**

> **Important:** The Python backend must be running on port 8010 for login, game data, and AI features to work. See the root `README.md` for backend setup.

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase project values:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Firebase is used **only for Google Sign-In**. All other auth (email/password, phone OTP) goes directly through the Python backend. The app works without Firebase — users just won't have the Google login option.

## Connecting to the Backend

The frontend automatically detects the backend URL:

| Environment | Backend URL |
|---|---|
| Local development | `http://localhost:8010` |
| Android emulator | `http://10.0.2.2:8010` |
| Production server | Set via `VITE_LOCAL_BACKEND_URL` in `.env` |

To point to your deployed server, add to `.env`:
```env
VITE_LOCAL_BACKEND_URL=http://your-server-ip:8010
```

## Build for Production

```bash
npm run build
```

Output goes to `dist/` — deploy this folder to any static hosting (Netlify, Firebase Hosting, Nginx, etc.).

## Project Structure

```
website/
├── index.html           # Entry HTML
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── capacitor.config.ts  # Android/iOS build config
├── public/              # Static assets (images, sounds, icons)
└── src/
    ├── App.tsx          # Main app with routing
    ├── main.tsx         # React entry point
    ├── index.css        # Global styles
    ├── components/      # UI components and screens
    ├── context/         # Auth + Game state management
    ├── lib/             # Firebase config, utilities
    ├── services/        # RPG game service
    ├── hooks/           # Custom React hooks
    ├── data/            # Static game data
    └── assets/          # Embedded assets
```

## Screens

The app includes 30+ screens covering:
- **Auth**: Sign-in, OTP verification, onboarding
- **Dashboard**: Main hub with stats, streaks, quick actions
- **Game**: Brushing lessons, VTuber quest, chapters, kingdom hub
- **Progress**: Stats, calendar, achievements, rewards
- **Social**: Leaderboard, parent dashboard, teacher dashboard
- **Settings**: Profile, app preferences

## License

Tooth Kingdom Adventure © 2026