// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Backend Toggle Configuration
const metaEnv = (import.meta as any).env || {};
// Force mockup mode by default for LIVE_DEV (easy login, no CAPTCHA)
export const USE_LOCAL_BACKEND = metaEnv.VITE_USE_LOCAL_BACKEND !== 'false'; 

// Dynamic API Discovery:
// In dev, use the env var or localhost:8000
// In production, if USE_LOCAL_BACKEND is true, assume the API is at our current origin
const getBackendUrl = () => {
    const envUrl = metaEnv.VITE_LOCAL_BACKEND_URL;
    if (envUrl) return envUrl;

    // Fallback to dynamic hostname for LAN dev (handles localhost, 127.0.0.1, and IPs)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const isNative = (window as any).Capacitor?.isNative;
        const isEmulator = (window as any).Capacitor?.isEmulator;

        // On Native (Android/iOS), we prioritize the Python backend at :8010
        if (isNative) {
            // Check for manual IP override (set via TK Wireless Link)
            const manualIp = localStorage.getItem('BACKEND_IP_OVERRIDE');
            if (manualIp) {
                console.log('[BACKEND] Using Manual IP Override:', manualIp);
                return `http://${manualIp}:8010`;
            }

            // Emulator needs 10.0.2.2 to reach PC host.
            // Physical device with `adb reverse tcp:8010 tcp:8010` uses localhost directly.
            if (isEmulator) return 'http://10.0.2.2:8010';
            return 'http://localhost:8010';
        }

        // Web (Dev/Prod)
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8010';
        }
        
        // PROD Web Fallback (Api.php if hosted as a site)
        if ((import.meta as any).env?.PROD) {
            return `${window.location.origin}/api.php`;
        }
        
        return `http://${hostname}:8010`;
    }
    return 'http://127.0.0.1:8010';
};

export const LOCAL_BACKEND_URL = getBackendUrl();

if (typeof window !== 'undefined') {
    console.log('[BACKEND] Final API URL:', LOCAL_BACKEND_URL);
}

// Live Mirror / Shadow Backend Configuration (For syncing while using Firebase)
export const SHADOW_BACKEND_SYNC = (import.meta as any).env?.VITE_SHADOW_BACKEND_SYNC === 'true';
export const SHADOW_BACKEND_URL = (import.meta as any).env?.VITE_SHADOW_BACKEND_URL || LOCAL_BACKEND_URL;

export default app;
