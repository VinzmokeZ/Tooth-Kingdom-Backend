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
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

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
    sendOTPLocal: (target: string, code: string, method: 'email' | 'phone') => Promise<void>;
    loginWithEmailPasswordLocal: (email: string, password: string) => Promise<User>;
    registerLocal: (name: string, email: string, password: string, dob?: string, role?: string) => Promise<User>;
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

    // v5.0 Senior Fix: Use CapacitorHttp for Android Reliability
    const handleGoogleUserSync = async (firebaseUser: any) => {
        let user: User;
        try {
            // Native-Safe Sync via CapacitorHttp
            const options = {
                url: `${API_URL}/auth/google`,
                headers: { 'Content-Type': 'application/json' },
                data: {
                    email: firebaseUser.email,
                    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                    provider: 'google',
                    provider_id: firebaseUser.uid
                }
            };

            const res: HttpResponse = await CapacitorHttp.post(options);
            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || 'Google sign-in sync failed');
            }

            user = {
                uid: data.user.id.toString(),
                email: data.user.email,
                displayName: data.user.name,
                phoneNumber: data.user.phone || null,
                role: data.user.role || 'child'
            };

            setAuthProvider('google');
            localStorage.setItem('authToken', data.token);

        } catch (fetchError: any) {
            console.warn('Backend sync failed, falling back to offline mode:', fetchError);
            user = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Google User',
                phoneNumber: firebaseUser.phoneNumber || null,
                role: 'child'
            };
            localStorage.setItem('authToken', 'offline-google-token');
        }

        setCurrentUser(user);
        setAuthProvider('google');
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authProvider', 'google');
        return user;
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
            const storedUser = localStorage.getItem('currentUser');
            const token = localStorage.getItem('authToken');

            if (firebaseUser) {
                // Trigger Sync on connection if not yet synced properly
                if (firebaseUser && (!storedUser || JSON.parse(storedUser).uid !== firebaseUser.uid)) {
                   await handleGoogleUserSync(firebaseUser);
                } else if (storedUser && token) {
                    setCurrentUser(JSON.parse(storedUser));
                }
            } else if (storedUser && token) {
                // Allow persistent session for local/offline mode
                setCurrentUser(JSON.parse(storedUser));
            } else {
                setCurrentUser(null);
                localStorage.removeItem('currentUser');
                localStorage.removeItem('authToken');
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
            const options = {
                url: `${API_URL}/auth/login`,
                headers: { 'Content-Type': 'application/json' },
                data: { email, password }
            };
            const res: HttpResponse = await CapacitorHttp.post(options);
            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            const user: User = {
                uid: data.user.id.toString(),
                email: data.user.email,
                displayName: data.user.name || email.split('@')[0],
                phoneNumber: data.user.phone || null,
                role: data.user.role || 'child'
            };

            setCurrentUser(user);
            setAuthProvider('local');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authProvider', 'local');

            return user;
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.message?.includes('fetch') || error.message?.includes('Network') || error.name === 'TypeError') {
                const offlineUser: User = {
                    uid: 'offline_' + Date.now(),
                    email: email,
                    displayName: email.split('@')[0],
                    phoneNumber: null,
                    role: 'child'
                };
                setCurrentUser(offlineUser);
                setAuthProvider('local');
                localStorage.setItem('currentUser', JSON.stringify(offlineUser));
                localStorage.setItem('authToken', 'offline-token');
                localStorage.setItem('authProvider', 'local');
                return offlineUser;
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const registerLocal = async (name: string, email: string, password: string, dob?: string, role: string = 'child'): Promise<User> => {
        setLoading(true);
        try {
            const options = {
                url: `${API_URL}/auth/register`,
                headers: { 'Content-Type': 'application/json' },
                data: { email, password, name, dob, role }
            };
            const res: HttpResponse = await CapacitorHttp.post(options);
            const data = res.data;

            if (!data.success) {
                throw new Error(data.message || 'Registration failed');
            }

            const user: User = {
                uid: data.user.id.toString(),
                email: data.user.email,
                displayName: name,
                phoneNumber: null,
                role: data.user.role || 'child'
            };

            setCurrentUser(user);
            setAuthProvider('local');
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('authProvider', 'local');

            return user;
        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.message?.includes('fetch') || error.message?.includes('Network') || error.name === 'TypeError') {
                const offlineUser: User = {
                    uid: 'offline_' + Date.now(),
                    email: email,
                    displayName: name,
                    phoneNumber: null,
                    role: role
                };
                setCurrentUser(offlineUser);
                setAuthProvider('local');
                localStorage.setItem('currentUser', JSON.stringify(offlineUser));
                localStorage.setItem('authToken', 'offline-token');
                localStorage.setItem('authProvider', 'local');
                return offlineUser;
            }
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const signInWithPhoneLocal = async (phone: string): Promise<string> => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        try {
            const options = {
                url: `${API_URL}/debug/log`,
                headers: { 'Content-Type': 'application/json' },
                data: { message: `OTP for ${phone}: ${otp}` }
            };
            CapacitorHttp.post(options).catch(() => { });
        } catch (e) { }

        localStorage.setItem('mockOTP', otp);
        localStorage.setItem('mockOTPPhone', phone);
        
        await sendOTPLocal(phone, otp, 'phone');
        return otp;
    };

    const sendOTPLocal = async (target: string, code: string, method: 'email' | 'phone') => {
        try {
            const options = {
                url: `${API_URL}/auth/send-otp`,
                headers: { 'Content-Type': 'application/json' },
                data: { 
                    [method === 'email' ? 'email' : 'phone']: target, 
                    otp: code 
                }
            };
            await CapacitorHttp.post(options);
        } catch (e) {
            console.warn("Failed to trigger real OTP delivery:", e);
        }
    };

    const verifyOTPLocal = async (phone: string, code: string): Promise<boolean> => {
        setLoading(true);
        try {
            const storedOtp = localStorage.getItem('mockOTP');
            if (storedOtp === code) {
                try {
                    const options = {
                        url: `${API_URL}/auth/phone`,
                        headers: { 'Content-Type': 'application/json' },
                        data: { phone }
                    };
                    const res: HttpResponse = await CapacitorHttp.post(options);
                    const data = res.data;

                    if (data.success && data.user) {
                        const user: User = {
                            uid: data.user.id.toString(),
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
                }

                const storedUser = localStorage.getItem('currentUser');
                const existingRole = storedUser ? JSON.parse(storedUser).role : 'child';

                const user: User = {
                    uid: 'phone_' + Date.now(),
                    email: null,
                    displayName: 'Mobile Hero',
                    phoneNumber: phone,
                    role: existingRole
                };
                setCurrentUser(user);
                setAuthProvider('local');
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('authToken', 'offline-phone-token');
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
        return await registerLocal(email, password, email.split('@')[0]);
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
        sendOTPLocal,
        loginWithEmailPasswordLocal,
        registerLocal
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
