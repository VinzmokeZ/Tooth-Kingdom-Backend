import React from 'react';
import { ScreenProps } from './types';
import { AnimatedBackground } from '../AnimatedBackground';

export function SplashScreen({ navigateTo }: ScreenProps) {
  // Use the specific vibrant logo from public/thumbnails as requested
  const logoPath = '/thumbnails/0e08d80797dd9be25d0e92064648e8bd56d6c30c.png';

  return (
    <div className="h-full bg-transparent flex flex-col items-center justify-center p-8 relative overflow-hidden">

      <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-sm">
        {/* Correct Vibrant Logo - Circular outline as requested */}
        <div className="w-64 h-64 mb-10 flex items-center justify-center float-gentle rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white/20 backdrop-blur-sm">
          <img
            src={logoPath}
            alt="Tooth Kingdom"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title - Restored to original position below logo */}
        <h1 className="text-5xl font-extrabold text-center mb-4 text-gray-900 tracking-tight">
          Tooth Kingdom
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Adventure
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-center text-gray-600 text-lg max-w-xs leading-relaxed mb-12">
          Embark on a magical journey to save your smile and defeat the Sugar Bugs!
        </p>

        {/* CTA Button */}
        <button
          onClick={() => navigateTo('onboarding')}
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-xl rounded-3xl transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl"
          style={{
            boxShadow: '0 12px 24px -6px rgba(124, 58, 237, 0.5)',
          }}
        >
          Start Adventure
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      ` }} />
    </div>
  );
}
