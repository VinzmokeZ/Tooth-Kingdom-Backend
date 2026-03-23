import React from 'react';
import { Shield, ArrowLeft, FileText, Lock, Eye, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface PrivacyPolicyScreenProps {
  navigateTo: (screen: string) => void;
  isWebPreview?: boolean;
}

export function PrivacyPolicyScreen({ navigateTo, isWebPreview }: PrivacyPolicyScreenProps) {
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
            <Shield className="w-6 h-6 text-purple-500" />
            <span className="font-bold text-gray-900">Privacy Center</span>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pt-8 pb-16 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-black mb-4">Privacy Policy</h1>
            <p className="opacity-90 leading-relaxed">
              Your trust is our priority. This policy explains how Tooth Kingdom Adventure handles your personal information with care and security.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Last Updated: March 2026</span>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Global Standard</span>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-500" />
                1. Data We Collect
              </h2>
              <p className="mb-4">
                Tooth Kingdom Adventure is designed to minimize data collection. We collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email, and password (hashed securely).</li>
                <li><strong>Profile Information:</strong> Age (DOB) and optional phone number.</li>
                <li><strong>Game Progress:</strong> Level, XP, Gold, and brushing habit logs.</li>
                <li><strong>Photos:</strong> Only if you choose to upload a custom avatar. We do not use these for any other purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-500" />
                2. How We Use Data
              </h2>
              <p>
                We use your data solely to provide and improve the game experience:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>To synchronize your game progress across devices.</li>
                <li>To provide parenting and educational insights about dental health.</li>
                <li>To manage rewards and achievements in the Tooth Kingdom.</li>
                <li>We **NEVER** sell your data to third parties.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                3. Data Security
              </h2>
              <p>
                All data is stored using industry-standard encryption (AES-256 for storage and TLS/SSL for transmission). Your passwords are never stored in plain text; they are hashed using robust cryptographic algorithms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Children's Privacy</h2>
              <p>
                Tooth Kingdom Adventure is intended for families. We encourage parents to supervise their children's use of the app. We do not knowingly collect personal information from children under 13 without verifiable parental consent through the registration process.
              </p>
            </section>

            <section className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
              <h2 className="text-xl font-bold text-purple-900 mb-4">5. Contact Us</h2>
              <p className="text-purple-800">
                If you have questions about this Privacy Policy or our treatment of your personal data, please contact our support team at **support@toothkingdom.app**.
              </p>
            </section>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 px-6 text-center text-sm text-gray-400">
        <p>© 2026 Tooth Kingdom Adventure. All rights reserved.</p>
      </footer>
    </div>
  );
}
