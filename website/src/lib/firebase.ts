// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCX16H6LtmsOE6qs0-i9eLZmV5G2_KwRFU",
    authDomain: "tooth-kingdom-adventure.firebaseapp.com",
    projectId: "tooth-kingdom-adventure",
    storageBucket: "tooth-kingdom-adventure.firebasestorage.app",
    messagingSenderId: "678156466470",
    appId: "1:678156466470:web:5edb67b5389fc975c1e9e7",
    measurementId: "G-HKPL0R9TN1"
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
export const USE_LOCAL_BACKEND = metaEnv.VITE_USE_LOCAL_BACKEND === 'true';

// Dynamic API Discovery:
// In dev, use the env var or localhost:8000
// In production, if USE_LOCAL_BACKEND is true, assume the API is at our current origin
const getBackendUrl = () => {
    const envUrl = metaEnv.VITE_LOCAL_BACKEND_URL;
    if (envUrl) return envUrl;

    // Check if we are in a production browser environment
    if (typeof window !== 'undefined' && (import.meta as any).env?.PROD) {
        // In "Hybrid Zero-Install" mode, we serve api.php from the root of the build
        return `${window.location.origin}/api.php`;
    }

    // Fallback to dynamic hostname for LAN dev (handles localhost, 127.0.0.1, and IPs)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://127.0.0.1:8010'; // Force IPv4 loopback
        }
        return `http://${hostname}:8010`;
    }
    return 'http://127.0.0.1:8010';
};

export const LOCAL_BACKEND_URL = getBackendUrl();

// Live Mirror / Shadow Backend Configuration (For syncing while using Firebase)
export const SHADOW_BACKEND_SYNC = (import.meta as any).env?.VITE_SHADOW_BACKEND_SYNC === 'true';
export const SHADOW_BACKEND_URL = (import.meta as any).env?.VITE_SHADOW_BACKEND_URL || LOCAL_BACKEND_URL;

export default app;
