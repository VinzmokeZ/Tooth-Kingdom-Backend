import React, { useState } from 'react';
import { ScreenProps } from './types';
import {
  Eye, EyeOff, Mail, Lock, Smartphone, ArrowRight, Loader2,
  ChevronRight, User, Shield, MessageSquare, Bell, Sparkles, Scan, Fingerprint, Phone, Calendar, Check, X, GraduationCap
} from 'lucide-react';
import logoImage from '../../assets/5b0695099dfd67c35f14fc4f047da4df5ed6aa0e.png';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';

import { doc, setDoc } from 'firebase/firestore';
import { auth, db, USE_LOCAL_BACKEND, LOCAL_BACKEND_URL } from '../../lib/firebase';
import { NativeBiometric } from 'capacitor-native-biometric';
import { useAuth } from '../../context/AuthContext';


export function SignInScreen({ navigateTo }: ScreenProps) {
  const { loading: authLoading, setConfirmationResult, signInWithGoogleLocal, signInWithPhoneLocal, loginWithEmailPasswordLocal, registerLocal, sendOTPLocal } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [role, setRole] = useState<'child' | 'parent' | 'teacher'>('child');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [use2FA, setUse2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Validation State
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    symbol: false
  });

  const checkPasswordStrength = (pass: string) => {
    setPasswordCriteria({
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /[0-9]/.test(pass),
      symbol: /[^A-Za-z0-9]/.test(pass)
    });
    setPassword(pass);
  };

  const [mockSMS, setMockSMS] = useState<{ phone: string, code: string } | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Auto-fill effect
  React.useEffect(() => {
    const saved = localStorage.getItem('tooth_kingdom_remember_me');
    if (saved) {
      const { email: savedEmail, password: savedPassword, phone: savedPhone, method } = JSON.parse(saved);
      setEmail(savedEmail || '');
      setPassword(savedPassword || '');
      setPhone(savedPhone || '');
      setLoginMethod(method || 'email');
      setRememberMe(true);
    }
  }, []);

  const setupRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier.clear();
    }
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        console.log("Recaptcha resolved");
      }
    });
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone) {
      setError("Please enter your phone number");
      return;
    }

    try {
      if (USE_LOCAL_BACKEND) {
        // Save role for redirection bridge
        localStorage.setItem('pending_role', role);
        
        const code = await signInWithPhoneLocal(phone);
        // Show mock SMS notification
        setMockSMS({ phone, code });
        // Auto-hide after 8 seconds
        setTimeout(() => setMockSMS(null), 8000);

        // Special marker for OTP screen to use local verify
        (window as any).localOTPPhone = phone;
        navigateTo('otp-verification');
        return;
      }
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(confirmation);
      navigateTo('otp-verification');
    } catch (err: any) {
      console.error("Phone Auth Error:", err);
      setError(err.message);
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (loginMethod === 'phone') {
      return handlePhoneSubmit(e);
    }
    e.preventDefault();
    setError(null);


    try {
      if (USE_LOCAL_BACKEND) {
        if (isSignUp) {
          // Validate Password before submitting
          const { length, upper, lower, number, symbol } = passwordCriteria;
          if (!length || !upper || !lower || !number || !symbol) {
            setError("Please meet all password requirements!");
            return;
          }
          if (!dob) {
            setError("Please enter your date of birth!");
            return;
          }
        }

        // Save role to localStorage for OTP redirection bridge (for local backend mode)
        localStorage.setItem('pending_role', role);
        
        if (isSignUp) {
          await registerLocal(name, email, password, dob, role);
        } else {
          await loginWithEmailPasswordLocal(email, password);
        }

        // FORCE OTP SIMULATION as requested
        const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
        // Save for verification screen
        localStorage.setItem('mockOTP', mockOtp);

        // Notify backend service for REAL email delivery
        await sendOTPLocal(email, mockOtp, 'email');

        // Show validation notification
        setMockSMS({
          phone: "Local User",
          code: mockOtp
        });
        // Auto-hide
        setTimeout(() => setMockSMS(null), 10000);

        navigateTo('otp-verification');
        return;
      }

      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });

        // Create initial user document in Firestore
        console.log("Attempting to create user document for:", userCredential.user.uid);
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            name: name,
            email: email,
            selectedCharacter: null,
            currentStreak: 0,
            bestStreak: 0,
            totalDays: 0,
            completedChapters: 0,
            totalStars: 0,
            level: 1,
            achievements: [],
            unlockedRewards: [],
            brushingLogs: {},
            lastBrushedTimestamp: null,
            createdAt: new Date().toISOString()
          });
          console.log("Successfully created Firestore document");
        } catch (dbError) {
          console.error("Critical error creating Firestore document:", dbError);
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }



      // Navigate to OTP if 2FA is enabled, otherwise go to onboarding
      if (use2FA) {
        navigateTo('otp-verification');
      } else {
        navigateTo('onboarding');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSocialLogin = async (providerId: string) => {
    setError(null);
    let provider;

    switch (providerId) {
      case 'google':
        provider = new GoogleAuthProvider();
        break;
      case 'facebook':
        provider = new FacebookAuthProvider();
        break;
      case 'apple':
        provider = new OAuthProvider('apple.com');
        break;
      default:
        return;
    }

    try {
      if (providerId === 'google') {
        await signInWithGoogleLocal();
        navigateTo('onboarding');
        return;
      }

      await signInWithPopup(auth, provider);
      // Success!
      if (use2FA) {
        navigateTo('otp-verification');
      } else {
        navigateTo('onboarding');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };


  const handleAILogin = async (method: string) => {
    setError(null);

    try {
      const result = await NativeBiometric.isAvailable();

      if (result.isAvailable) {
        await NativeBiometric.verifyIdentity({
          reason: `Authenticate with ${method === 'face' ? 'Face ID' : 'Touch ID'} to access your kingdom!`,
          title: "Kingdom Guard Verification",
          subtitle: "Hero Identity Confirmation",
          description: "Scan your biometrics to enter Tooth Kingdom.",
        });

        // On success, navigate to the game
        navigateTo('onboarding');
      } else {
        // Fallback for demo purposes if not on mobile/unsupported
        console.log("Biometrics not available, using demo skip.");
        navigateTo('onboarding');
      }
    } catch (err: any) {
      setError(`Biometric verification failed: ${err.message} `);
    }
  };


  return (
    <div className="flex-1 h-full w-full bg-transparent flex flex-col overflow-y-auto relative transition-colors duration-500 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-purple-300 dark:bg-purple-900/30 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300 dark:bg-pink-900/30 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-cyan-300 dark:bg-cyan-900/30 rounded-full opacity-30 blur-xl"></div>

      {/* Floating tooth icons */}
      <div className="absolute top-20 right-16 text-6xl animate-float-slow opacity-40 dark:opacity-20">🦷</div>
      <div className="absolute bottom-40 left-12 text-4xl animate-float-delayed opacity-40 dark:opacity-20">✨</div>
      <div className="absolute top-1/2 left-8 text-5xl animate-float opacity-40 dark:opacity-20">🦷</div>

      {/* Mock SMS notification for Simulator Mode */}
      {mockSMS && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[9999] animate-bounce-in"
        >
          <div className="bg-black/90 backdrop-blur-xl rounded-[24px] p-4 border border-white/20 shadow-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💬</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-white font-bold text-sm">MESSAGES</span>
                <span className="text-white/40 text-[10px]">now</span>
              </div>
              <p className="text-white text-sm leading-tight">
                <span className="font-bold">Tooth Kingdom:</span> Your verification code is <span className="text-green-400 font-black tracking-widest bg-green-400/10 px-2 py-0.5 rounded-lg">{mockSMS.code}</span>
              </p>
            </div>
            <button
              onClick={() => setMockSMS(null)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <span className="text-white/40 font-bold">✕</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md mt-[-2rem]">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <img src={logoImage} alt="Tooth Kingdom Logo" className="w-64 h-auto drop-shadow-2xl transition-all hover:scale-105" />
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-base font-medium">
              Join the adventure to save smiles! 🌟
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white dark:bg-gray-900/60 rounded-3xl shadow-2xl p-8 backdrop-blur-md border-2 border-purple-100 dark:border-transparent dark:shadow-xl transition-colors">
            {/* Login Method Toggle */}
            <div className="flex justify-center gap-6 mb-6">
              <button
                type="button"
                onClick={() => setLoginMethod('email')}
                className={`flex flex-col items-center gap-2 transition-all ${loginMethod === 'email' ? 'text-purple-600 dark:text-purple-400 scale-110' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${loginMethod === 'email' ? 'bg-purple-100 dark:bg-purple-900/40 shadow-md' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <Mail className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Email</span>
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('phone')}
                className={`flex flex-col items-center gap-2 transition-all ${loginMethod === 'phone' ? 'text-pink-600 dark:text-pink-400 scale-110' : 'text-gray-400 dark:text-gray-500 opacity-60'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${loginMethod === 'phone' ? 'bg-pink-100 dark:bg-pink-900/40 shadow-md' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  <Phone className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold">Phone</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Hero Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your hero name"
                        className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-500"
                      />
                      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:text-white"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 px-1">
                      Choose Your Path
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'child', label: 'Hero', icon: Sparkles, color: 'purple' },
                        { id: 'parent', label: 'Parent', icon: Shield, color: 'indigo' },
                        { id: 'teacher', label: 'Teacher', icon: GraduationCap, color: 'blue' }
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as any)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-[1.5rem] border-2 transition-all active-pop ${
                            role === r.id
                              ? `bg-white dark:bg-${r.color}-900/30 border-${r.color}-500 text-${r.color}-600 dark:text-${r.color}-400 shadow-lg scale-105 z-10`
                              : 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-200'
                          }`}
                        >
                          <r.icon className={`w-6 h-6 mb-1.5 ${role === r.id ? `text-${r.color}-500` : 'text-gray-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-wider">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {loginMethod === 'email' ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hero@toothkingdom.com"
                        className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-500"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => checkPasswordStrength(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-3 pl-12 pr-12 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-500"
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicators (Only show during Signup) */}
                    {isSignUp && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1 ${passwordCriteria.length ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {passwordCriteria.length ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                          <span>8+ Characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.upper ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {passwordCriteria.upper ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.lower ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {passwordCriteria.lower ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.number ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {passwordCriteria.number ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center gap-1 ${passwordCriteria.symbol ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                          {passwordCriteria.symbol ? <Check className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                          <span>Symbol</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full px-4 py-3 pl-12 bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all dark:text-white dark:placeholder-gray-500"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 px-1">
                    Enter with country code (e.g., +63) for your real SMS code!
                  </p>
                </div>
              )}

              {!isSignUp && loginMethod === 'email' && (
                <div className="flex items-center justify-between mb-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 bg-gray-50 dark:bg-gray-800"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Remember Me</span>
                  </label>
                  <button type="button" className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700 dark:hover:text-purple-300">
                    Forgot password?
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-300 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all text-sm sm:text-base"
              >
                {loginMethod === 'phone' ? '📱 Send Verification Code' : (isSignUp ? '🚀 Start Adventure' : '🦷 Login to Kingdom')}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 font-medium backdrop-blur-md rounded-full">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3 flex flex-col items-center w-full">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={authLoading}
                className={`w-full py-3 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-3 group ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                className="w-full py-3 px-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    Login here
                  </button>
                </p>
              ) : (
                <p>
                  New to Tooth Kingdom?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300"
                  >
                    Create account
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* AI Authentication Options */}
          <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl shadow-2xl p-1 mt-6">
            <div className="bg-white dark:bg-gray-900 rounded-[22px] p-6">
              <div className="flex flex-col items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-xl">🤖</span>
                </div>
                <h3 className="font-black text-xl text-gray-900 dark:text-white text-center">AI-Powered Login</h3>
                <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-full flex items-center">
                  <img
                    src={logoImage}
                    alt="Tooth Kingdom"
                    className="w-12 h-6 object-contain drop-shadow-md"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
                Login instantly with our smart AI technology! 🚀
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleAILogin('face')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-gray-600 rounded-2xl hover:scale-105 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Scan className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Face ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAILogin('fingerprint')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-cyan-200 dark:border-gray-600 rounded-2xl hover:scale-105 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Fingerprint className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Touch ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAILogin('voice')}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border-2 border-green-200 dark:border-gray-600 rounded-2xl hover:scale-105 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Voice ID</span>
                </button>
              </div>

              {/* 2FA Toggle - Centered */}
              <div className="mt-5 pt-5 border-t-2 border-gray-100 dark:border-gray-800 flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-lg">🛡️</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-gray-900 dark:text-white">2FA Security</p>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Extra protection with OTP</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUse2FA(!use2FA)}
                  className={`relative w-14 h-7 rounded-full transition-all shadow-inner ${use2FA ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${use2FA ? 'translate-x-7' : 'translate-x-0'
                      }`}
                  >
                    <div className={`w-1 h-3 rounded-full ${use2FA ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            By continuing, you agree to our Terms & Privacy Policy
          </p>

          {/* Invisible Recaptcha */}
          <div id="recaptcha-container"></div>
        </div>
      </div>

      {/* Animated styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}
@keyframes float-slow {
  0%, 100% {
    transform: translateY(0px) rotate(-5deg);
  }
  50% {
    transform: translateY(-30px) rotate(5deg);
  }
}
@keyframes float-delayed {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-25px) scale(1.1);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
.animate-float-slow {
  animation: float-slow 6s ease-in-out infinite;
}
.animate-float-delayed {
  animation: float-delayed 5s ease-in-out infinite 1s;
}
` }} />
    </div>
  );
}