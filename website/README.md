# Tooth Kingdom Adventure - Frontend Website

This is the React-based frontend for the **Tooth Kingdom Adventure** application. It serves as both a responsive web platform and the source for Android/iOS mobile apps (via Capacitor).

## 🚀 Quick Start

1.  **Install Dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```

2.  **Configure Environment:**
    Copy `.env.example` to `.env`. Ensure `VITE_LOCAL_BACKEND_URL` matches your running backend.
    ```bash
    # Default local backend is http://localhost:8010
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```

## 🖥️ Desktop & Landscape Mode

The application now supports a dedicated **Landscape Web Mode** optimized for large screens.

- **Standard View**: [http://localhost:3000/](http://localhost:3000/) (Mobile-first with Phone Frame)
- **Landscape View**: [http://localhost:3000/?view=web](http://localhost:3000/?view=web) 
  - Activates a persistent **Sidebar Navigation**.
  - Transforms the Dashboard into a **Multi-Column Grid**.
  - Removes the Phone Frame for a full-screen experience.

## 🛠 Tech Stack

- **Framework:** React 18 (Vite) / TypeScript
- **Styling:** TailwindCSS 4.x
- **Animations:** Framer Motion
- **Mobile:** Capacitor 6.x

## 🔗 Backend & Hosting

The frontend connects to the **Python FastAPI Backend** (default: port 8010).

### 🌐 Deployment Tips
- **Environment Variables**: Always set `VITE_LOCAL_BACKEND_URL` to your production API endpoint.
- **HTTPS**: For production hosting (e.g., Vercel, Firebase Hosting), ensure your backend also uses HTTPS to avoid "Mixed Content" errors.
- **CORS**: Ensure your Python backend allows the origin where this website is hosted.

## 🔍 Troubleshooting & Debugging

### Common Issues
- **White Screen**:
  - Check the Browser Console (F12). 
  - Ensure all environment variables in `.env` are set.
  - If you see `ReferenceError`, ensure you are on the latest code branch where state hoisting is fixed.
- **Backend Connection Failed**:
  - Verify the backend is running on port `8010`.
  - Check if your Firewall/Antivirus is blocking the connection.
  - In a local network, use the server's IP (e.g., `192.168.1.x`) in both `.env` and `main.py`.

## 📱 Mobile App
1. `npm run build`
2. `npx cap sync android`
3. Open `android/` in Android Studio.

## 🔐 Authentication
This version is **Firebase-free** for core logic. All authentication (OTP, Phone, Email) is processed by the local Python API.