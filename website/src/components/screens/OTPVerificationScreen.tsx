import React, { useState, useRef, useEffect } from 'react';
import { ScreenProps } from './types';
import { ArrowLeft, Shield, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { USE_LOCAL_BACKEND } from '../../lib/firebase';

export function OTPVerificationScreen({ navigateTo }: ScreenProps) {
  const { confirmationResult, verifyOTPLocal, sendOTPLocal } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(10);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [mockSMS, setMockSMS] = useState<{ phone: string, code: string } | null>(null);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Show initial OTP notification on mount (Simulate receiving the first SMS)
    const storedOtp = localStorage.getItem('mockOTP');
    const storedPhone = localStorage.getItem('mockOTPPhone') || 'Hero';
    if (storedOtp) {
      setTimeout(() => {
        setMockSMS({ phone: storedPhone, code: storedOtp });
        // Hide after 10s
        setTimeout(() => setMockSMS(null), 10000);
      }, 500); // Slight delay for effect
    }
  }, []);

  useEffect(() => {
    // Redirect if no confirmation result (hero tried to jump link)
    if (!confirmationResult && process.env.NODE_ENV === 'production' && !USE_LOCAL_BACKEND) {
      navigateTo('signin');
    }

    // Timer for resend
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, confirmationResult]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeToVerify = otp.join('')) => {
    if (codeToVerify.length !== 6) return;

    setError(null);
    setIsVerifying(true);

    try {
      if (USE_LOCAL_BACKEND) {
        setIsVerifying(true);
        // Add artificial delay for feel
        setTimeout(async () => {
          const storedOTP = localStorage.getItem('mockOTP');
          if (otp.join('') === storedOTP || (otp.join('') === '123456')) {
            const phone = localStorage.getItem('mockOTPPhone') || 'local-hero';
            const success = await verifyOTPLocal(phone, otp.join(''));
            if (success) {
              // Navigation logic based on role ( bridge from SignIn )
              const pendingRole = localStorage.getItem('pending_role');
              
              if (pendingRole === 'parent') {
                navigateTo('parent-dashboard');
              } else if (pendingRole === 'teacher') {
                navigateTo('teacher-dashboard');
              } else {
                navigateTo('onboarding');
              }
              
              localStorage.removeItem('pending_role'); // Clean up
              localStorage.removeItem('mockOTP');
            } else {
              setError("Verification failed. Please try again.");
            }
          } else {
            setError("Invalid verification code. Try 123456 or check notification.");
          }
          setIsVerifying(false);
        }, 1500);
        return;
      }

      if (!confirmationResult) {
        // For development/demo if navigated directly
        console.log("No confirmation result, using demo skip");
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigateTo('onboarding');
        return;
      }

      await confirmationResult.confirm(codeToVerify);
      // Success! AuthContext will update currentUser, GameContext will handle Firestore
      navigateTo('onboarding');
    } catch (err: any) {
      console.error("Verification failed:", err);
      setError(err.message === 'Firebase: Error (auth/invalid-verification-code).'
        ? "Oops! That code doesn't look right. Please check your text messages! 📱"
        : err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    // Generate new mock OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const phone = localStorage.getItem('mockOTPPhone') || 'Hero';
    const email = localStorage.getItem('currentUser') 
      ? JSON.parse(localStorage.getItem('currentUser')!).email 
      : null;

    // Trigger real delivery via backend
    if (USE_LOCAL_BACKEND) {
        const target = email || phone;
        const method = email ? 'email' : 'phone';
        await sendOTPLocal(target, newOtp, method as any);
    }

    // Update local storage
    localStorage.setItem('mockOTP', newOtp);

    // Show notification
    setMockSMS({ phone, code: newOtp });

    // Reset timer
    setResendTimer(10);

    // Hide notification after 10s
    setTimeout(() => setMockSMS(null), 10000);
  };

  return (
    <div className="flex-1 h-full w-full bg-transparent flex flex-col overflow-hidden relative">

      {/* Header */}
      <div className="relative z-10 p-6">
        <button
          onClick={() => navigateTo('signin')}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 w-full">
        <div className="w-full max-w-2xl">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-4 shadow-2xl transform hover:scale-110 transition-transform relative">
              <Shield className="w-12 h-12 text-white" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center border-4 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Kingdom Guard
            </h1>
            <p className="text-gray-600 text-sm px-4">
              We've sent a 6-digit verification code to your phone. Enter it to enter the Kingdom! 🛡️✨
            </p>
          </div>

          {/* OTP Input Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm border-2 border-purple-100 mb-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={isVerifying}
                  className={`w-10 h-14 text-center text-2xl font-bold bg-gray-50 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${digit ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                />
              ))}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-xl text-center border border-red-100">
                {error}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying || otp.some(digit => !digit)}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${isVerifying || otp.some(digit => !digit)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-xl hover:scale-105 active:scale-95'
                }`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Gaining Entry...
                </span>
              ) : (
                '🛡️ Enter Kingdom'
              )}
            </button>

            {/* Resend */}
            <div className="mt-6 text-center">
              <button
                onClick={handleResend}
                disabled={resendTimer > 0}
                className={`text-sm font-semibold flex items-center justify-center gap-2 mx-auto ${resendTimer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-purple-600 hover:text-purple-700'
                  }`}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Didn't receive code? Try again"}
              </button>
            </div>
          </div>

          {/* AI Helper Tip */}
          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-2xl p-4 border-2 border-cyan-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  AI Guard Tip 💡
                </h3>
                <p className="text-xs text-gray-700">
                  Real Heroes never share their codes! This code is for your phone only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mock SMS Notification for Simulator */}
      {mockSMS && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-black text-white p-4 rounded-2xl shadow-2xl z-50 animate-slideDown border-2 border-green-500/50">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-2xl">💬</span>
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-green-400 text-sm uppercase tracking-wider">New Message</h4>
              <p className="text-xs font-medium text-gray-300 mt-1">
                Your verification code is:
              </p>
              <div className="text-3xl font-black text-white tracking-[0.2em] mt-1 text-shadow-glow">
                {mockSMS.code}
              </div>
            </div>
            <button
              onClick={() => setMockSMS(null)}
              className="p-1 hover:bg-white/10 rounded-full"
            >
              <span className="text-gray-400 font-bold">✕</span>
            </button>
          </div>
        </div>
      )}

      {/* Animated styles */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
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