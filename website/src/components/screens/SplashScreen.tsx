import React from 'react';
import { ScreenProps } from './types';
import logoImage from '../../assets/0e08d80797dd9be25d0e92064648e8bd56d6c30c.png';

export function SplashScreen({ navigateTo }: ScreenProps) {
  return (
    <div className="h-full bg-gradient-to-b from-purple-100 via-blue-50 to-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Playful background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-40 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 translate-x-1/2 translate-y-1/2"></div>

      <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-sm">
        {/* Logo - Removed solid white box, added gentle float only */}
        <div className="w-64 h-64 mb-10 flex items-center justify-center float-gentle">
          <img
            src={logoImage}
            alt="Tooth Kingdom"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title */}
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
    </div>
  );
}
