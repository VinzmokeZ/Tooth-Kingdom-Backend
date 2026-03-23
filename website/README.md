# Tooth Kingdom Adventure - Frontend Website

This is the React-based frontend for the **Tooth Kingdom Adventure** application. It serves as both the web platform and the source for the Android/iOS mobile apps (via Capacitor).

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Configure Environment:**
    Copy `.env.example` to `.env` and adjust the `VITE_LOCAL_BACKEND_URL` if necessary.
    ```bash
    cp .env.example .env
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🛠 Tech Stack

- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Mobile Packaging:** Capacitor
- **State Management:** React Context (Auth, Game, Sound)

## 🔗 Backend Connection

The frontend is designed to work exclusively with the **Python FastAPI Backend**.

- **Auto-Detection:** By default, it attempts to find the backend at `http://localhost:8000` or the current host's IP.
- **Manual Override:** Set `VITE_LOCAL_BACKEND_URL` in your `.env` file to point to your deployed production backend (e.g., `http://your-college-server-ip:8000`).

## 📦 Build & Deployment

To create a production build of the website:
```bash
npm run build
```
The output will be in the `dist/` folder, which can be hosted on any static web server (Nginx, Apache, Vercel, Netlify, etc.).

## 📱 Mobile App (Android)

This same codebase is used to build the Android app.
1. `npm run build`
2. `npx cap sync android`
3. Open the `android/` project in Android Studio and build the APK/Bundle.

## 🔐 Authentication

All authentication flows (Email/Password, Phone OTP, Google) are handled by the Python backend. This version is **Firebase-free** and relies solely on the high-performance Python API.