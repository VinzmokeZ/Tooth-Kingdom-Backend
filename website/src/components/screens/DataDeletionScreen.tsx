import React, { useState } from 'react';
import { Trash2, ArrowLeft, Mail, AlertTriangle, CheckCircle, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DataDeletionScreenProps {
  navigateTo: (screen: string) => void;
  isWebPreview?: boolean;
}

export function DataDeletionScreen({ navigateTo, isWebPreview }: DataDeletionScreenProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send a deletion request to the backend
    setTimeout(() => setIsSubmitted(true), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 flex-none sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigateTo('splash')}
            className="flex items-center gap-2 text-purple-600 font-medium hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ShieldOff className="w-6 h-6 text-red-500" />
            <span className="font-bold text-gray-900">Data Control</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pt-8 pb-16 px-6 text-gray-700 leading-relaxed">
        <div className="max-w-xl mx-auto space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
          >
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-black text-gray-900">Delete Account & Data</h1>
              <p className="mt-2 text-gray-500">
                You have the right to request the permanent deletion of your account and all associated data.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-none" />
                    <div>
                      <h3 className="font-bold text-amber-900">Important Information</h3>
                      <p className="text-sm text-amber-800 leading-relaxed mt-1">
                        Deletion is permanent. You will lose all game progress, rewards, achievements, and statistics. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 px-1">Registered Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="your@email.com"
                        className="w-full h-14 px-5 rounded-2xl bg-gray-50 border-2 border-gray-100 outline-none focus:border-purple-400 focus:bg-white transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full h-14 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                    >
                      Request Permanent Deletion
                    </button>
                    <p className="text-[11px] text-center text-gray-400 mt-4 leading-relaxed">
                      By clicking "Request Permanent Deletion", you agree that our support team will verify your identity via email before processing the final deletion within 30 days.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h2>
                  <p className="text-gray-500 max-w-xs mx-auto mb-8">
                    We've received your data deletion request. Please check your email for a verification link to confirm your identity.
                  </p>
                  <button 
                    onClick={() => navigateTo('splash')}
                    className="px-8 h-12 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-md"
                  >
                    Back to Home
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              Manual Request
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Alternatively, you can send an email to **delete@toothkingdom.app** with the subject **"Account Deletion Request"** from your registered email address. Include your username for faster verification.
            </p>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">What Data is Deleted?</h3>
              <ul className="grid grid-cols-2 gap-3 text-sm">
                <li className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  Email & Password
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  Brushing History
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  XP & Levels
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                  Rewards & Stars
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <p>© 2026 Tooth Kingdom Adventure. All rights reserved.</p>
      </footer>
    </div>
  );
}
