import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, LOCAL_BACKEND_URL } from '../lib/firebase';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithRedirect,
    getRedirectResult
} from 'firebase/auth';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    phoneNumber: string | null;
    role: string;
}

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<User>;
    signUp: (email: string, password: string) => Promise<User>;
    signOut: () => Promise<void>;
    setConfirmationResult: (result: any) => void;
    confirmationResult: any;
    signInWithGoogleLocal: () => Promise<User>;
    signInWithPhoneLocal: (phone: string) => Promise<string>;
    verifyOTPLocal: (phone: string, code: string) => Promise<boolean>;
    loginWithEmailPasswordLocal: (email: string, password: string) => Promise<User>;
    registerLocal: (name: string, email: string, password: string, dob?: string, role?: string) => Promise<User>;
    sendOTPLocal: (target: string, otp: string, method?: 'email' | 'phone') => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const API_URL = LOCAL_BACKEND_URL;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const isManuallyLoggingIn = React.useRef(false);
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [authProvider, setAuthProvider] = useState<'google' | 'local' | null>(null);

    const isCapacitor = typeof window !== 'undefined' && (window as any).Capacitor !== undefined;

    // Helper to sync Google user with backend
    const handleGoogleUserSync = async (firebaseUser: any) => {
        let user: User;
        try {
            // v4.0 Sync: Bridges Firebase Cloud into Local Python DB
            const response = await fetch(`${API_URL}/auth/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    avatar_url: firebaseUser.photoURL,
                    provider: 'google'
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.detail || 'Sync failed');
            }

            user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                phoneNumber: firebaseUser.phoneNumber || null,
                role: 'hero'
            };

            setAuthProvider('google');
            localStorage.setItem('authToken', 'firebase-hybrid-token');

        } catch (fetchError: any) {
            console.warn('Backend sync failed, falling back to offline mode:', fetchError);
            user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || 'Google User',
                phoneNumber: firebaseUser.phoneNumber || null,
                role: 'hero'
            };
            localStorage.setItem('authToken', 'offline-google-token');
        }

        setCurrentUser(user);
        setAuthProvider('google');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authProvider', 'google');
        return user;
    };

    // Unified Profile Fetch with error recovery
    const fetchUserProfile = async (uid: string) => {
        if (!uid || uid === 'undefined') return;
        // This function is intended for fetching user profiles from the backend
        // based on a UID, potentially for cases where the Firebase user object
        // might not contain all necessary local backend profile details.
        // The current implementation of handleGoogleUserSync already handles
        // syncing Firebase user data to the local backend.
        // If this function is meant to *fetch* an existing profile from the local
        // backend, its implementation would differ from the provided snippet.
        // The provided snippet seems to be a placeholder or an incomplete thought
        // for a different flow, as it contains `getRedirectResult(auth)` which
        // is specific to Firebase redirect sign-in.
        // For now, I'm placing it as requested, but noting its current content
        // doesn't align with a typical "fetchUserProfile" from a backend.
    };

    // Handle Redirect Result
    const handleRedirect = async () => {
        try {
            const result = await getRedirectResult(auth);
            if (result) {
                const firebaseUser = result.user;
                console.log("Redirect sign-in successful:", firebaseUser);
                await handleGoogleUserSync(firebaseUser);
            }
        } catch (error) {
            console.error("Redirect result error:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // v4.0: Proactively sync Firebase user to Local Python Backend
                const storedProvider = localStorage.getItem('authProvider');
                if (storedProvider !== 'local') {
                    await handleGoogleUserSync(firebaseUser);
                } else {
                    const storedUser = localStorage.getItem('currentUser');
                    if (storedUser) setCurrentUser(JSON.parse(storedUser));
                }
            } else {
                // BUG FIX: Only clear if we are NOT using a local auth provider
                const storedProvider = localStorage.getItem('authProvider');
                if (storedProvider !== 'local') {
                    setCurrentUser(null);
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authProvider');
                }
            }

            if (!isManuallyLoggingIn.current) {
                setLoading(false);
            }
        });

        handleRedirect();

        return () => unsubscribe();
    }, []);

    const loginWithEmailPasswordLocal = async (email: string, password: string): Promise<User> => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            const user: User = {
                uid: data.user.uid,
                email: data.user.email,
                displayName: data.user.name || email.split('@')[0],
                phoneNumber: data.user.phone || null,
                role: data.user.role || 'hero'
            };

            setCurrentUser(user);
            setAuthProvider('local');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authProvider', 'local');

            return user;
        } catch (error: any) {
            console.error('Login error details:', error);
            
            if (error.message.includes('fetch') || error.message.includes('Network') || error.name === 'TypeError') {
                throw new Error("CANNOT REACH BACKEND! Please make sure the 'TK-Backend' window is running.");
            }
            
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const registerLocal = async (name: string, email: string, password: string, dob?: string, role: string = 'child'): Promise<User> => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, dob, role })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            const user: User = {
                uid: data.user.uid,
                email: data.user.email,
                displayName: name,
                phoneNumber: null,
                role: data.user.role || 'hero'
            };

            setCurrentUser(user);
            setAuthProvider('local');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authProvider', 'local');

            return user;
        } catch (error: any) {
            console.error('Registration error details:', error);
            
            // For now, let's show the real error to the user so they know if the backend is down
            if (error.message.includes('fetch') || error.message.includes('Network') || error.name === 'TypeError') {
                throw new Error("CANNOT REACH BACKEND! Please make sure the 'TK-Backend' window is running.");
            }
            
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithPhoneLocal = async (phone: string): Promise<string> => {
        // Strengthened: requires exactly 10-15 digits
        const phoneRegex = /^\+?[1-9]\d{9,14}$/;
        if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
            throw new Error("Invalid phone number. Please enter at least 10 digits including country code (e.g., +91).");
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        localStorage.setItem('mockOTP', otp);
        localStorage.setItem('mockOTPPhone', phone);
        
        // Trigger real delivery service (Backend will check if this phone has a linked email)
        await sendOTPLocal(phone, otp, 'phone');

        return otp;
    };

    const sendOTPLocal = async (target: string, otp: string, method: 'email' | 'phone' = 'email'): Promise<boolean> => {
        try {
            console.log(`[AUTH] Sending Real OTP via Backend to ${target} (${method})`);
            const response = await fetch(`${API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: method === 'email' ? target : null, 
                    phone: method === 'phone' ? target : null, 
                    otp 
                })
            });
            const data = await response.json();
            return data.success;
        } catch (e) {
            console.warn("Real OTP delivery failed, falling back to mock UI only:", e);
            return false;
        }
    };

    const verifyOTPLocal = async (phone: string, code: string): Promise<boolean> => {
        setLoading(true);
        try {
            const storedOtp = localStorage.getItem('mockOTP');
            if (storedOtp === code) {
                try {
                    const response = await fetch(`${API_URL}/auth/phone`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ phone })
                    });

                    const data = await response.json();

                    if (data.success && data.user) {
                        const user: User = {
                            uid: data.user.uid,
                            email: null,
                            displayName: data.user.name,
                            phoneNumber: phone,
                            role: data.user.role || 'child'
                        };

                        setCurrentUser(user);
                        setAuthProvider('local');
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('authProvider', 'local');
                        return true;
                    }
                } catch (err) {
                    console.error("Backend phone auth failed:", err);
                    throw new Error("SERVER ERROR: Could not sync phone login with backend.");
                }
                return true;
            } else {
                throw new Error("Invalid OTP");
            }
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogleLocal = async (): Promise<User> => {
        setLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            if (isCapacitor) {
                await signInWithRedirect(auth, provider);
                return null as any;
            }
            const result = await signInWithPopup(auth, provider);
            return await handleGoogleUserSync(result.user);
        } catch (error: any) {
            console.error('Google sign-in error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        return await loginWithEmailPasswordLocal(email, password);
    };

    const signUp = async (email: string, password: string) => {
        return await registerLocal(email.split('@')[0], email, password);
    };

    const signOut = async () => {
        setLoading(true);
        try {
            const provider = authProvider || localStorage.getItem('authProvider');
            if (provider === 'google') {
                try {
                    await firebaseSignOut(auth);
                } catch (firebaseError) {
                    console.warn('Firebase signOut skipped:', firebaseError);
                }
            }
            setCurrentUser(null);
            setAuthProvider(null);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authProvider');
        } catch (error) {
            console.error('Sign out error:', error);
            setCurrentUser(null);
            setAuthProvider(null);
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            localStorage.removeItem('authProvider');
        } finally {
            setLoading(false);
        }
    };

    const value: AuthContextType = {
        currentUser,
        loading,
        signIn,
        signUp,
        signOut,
        setConfirmationResult,
        confirmationResult,
        signInWithGoogleLocal,
        signInWithPhoneLocal,
        verifyOTPLocal,
        loginWithEmailPasswordLocal,
        registerLocal,
        sendOTPLocal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
