import React, { useState } from 'react';
import { ScreenProps } from './types';
import { User, ChevronRight, Sparkles, GraduationCap, Heart, Check } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const onboardingSteps = [
  {
    image: '/thumbnails/onboarding_brush.png',
    title: 'Learn Proper Brushing',
    description: 'Master the art of brushing with fun interactive lessons and defeat the Sugar Bugs!',
    color: 'from-purple-400 to-pink-400'
  },
  {
    image: '/thumbnails/onboarding_shield.png',
    title: 'Build Healthy Habits',
    description: 'Track your daily brushing routine and build a powerful streak to protect your smile!',
    color: 'from-blue-400 to-cyan-400'
  },
  {
    image: '/thumbnails/onboarding_treasure.png',
    title: 'Earn Rewards & Unlock Treasures',
    description: 'Complete chapters, earn stars, and unlock amazing rewards in the Tooth Kingdom!',
    color: 'from-amber-400 to-orange-400'
  }
];

export function OnboardingScreen({ navigateTo }: ScreenProps) {
  const { userData, updateUserData } = useGame();

  // Safety check to prevent white screen if context is not ready
  if (!userData) {
    console.warn('[SCREEN] OnboardingScreen - userData is missing, waiting...');
    return <div className="flex-1 h-full w-full bg-white flex items-center justify-center p-8 text-gray-400 font-bold">Loading Hero Kingdom...</div>;
  }

  // Determine if we need to show the Name Entry screen
  // If name is one of the defaults, we force the user to enter a name
  const defaults = ['Champion', 'Hero', 'Mobile Hero'];
  const [showNameScreen, setShowNameScreen] = useState(defaults.includes(userData?.name || ''));
  const [heroName, setHeroName] = useState('');

  const [step, setStep] = useState(0);
  const currentStep = onboardingSteps[step];

  console.log('[DEBUG] OnboardingScreen - Step:', step, 'showNameScreen:', showNameScreen);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroName.trim().length > 0) {
      updateUserData({ name: heroName.trim() });
      setShowNameScreen(false);
    }
  };

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      navigateTo('character-select');
    }
  };

  // ----------------------------------------------------
  // RENDER: NAME ENTRY SCREEN
  // ----------------------------------------------------
  // ----------------------------------------------------
  if (showNameScreen) {
    return (
      <div className="flex-1 h-full w-full flex flex-col items-center p-6 relative overflow-y-auto bg-transparent touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="w-full max-w-sm bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-8 border-2 border-purple-100 animate-slideUp z-10 text-center absolute top-20">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-6">
            <User className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
            Welcome, Hero!
          </h2>
          <p className="text-gray-500 mb-8 font-bold text-sm leading-tight">
            Every hero needs a name.<br />What should we call you?
          </p>

          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                placeholder="Enter your hero name"
                className="w-full px-5 py-4 pl-12 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all text-lg font-black text-gray-800 placeholder-gray-400 shadow-inner"
                autoFocus
                required
              />
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-purple-400" />
            </div>

            <button
              type="submit"
              disabled={heroName.trim().length === 0}
              className={`w-full py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-2 uppercase tracking-widest ${heroName.trim().length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              Start Adventure
              <ChevronRight className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: TUTORIAL / ONBOARDING
  // ----------------------------------------------------
  return (
    <div className="flex-1 h-full w-full bg-transparent flex flex-col relative overflow-y-auto touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>

      {/* Skip button */}
      <div className="p-5 flex justify-end relative z-10">
        <button
          onClick={() => navigateTo('character-select')}
          className="text-purple-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-50 transition-all"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative z-10 py-12">
        {/* Icon with gradient background */}
        <div
          className={`w-44 h-44 rounded-full bg-gradient-to-br ${currentStep.color} flex items-center justify-center mb-12 float-gentle overflow-hidden relative group shrink-0`}
          style={{
            boxShadow: '0 16px 48px rgba(0,0,0,0.12), 0 6px 20px rgba(0,0,0,0.08)',
          }}
        >
          <img
            src={currentStep.image}
            alt={currentStep.title}
            className="w-32 h-32 object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Title */}
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-4 leading-tight">
          {currentStep.title}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 leading-relaxed max-w-2xl text-lg">
          {currentStep.description}
        </p>
      </div>

      {/* Progress indicators */}
      <div className="flex justify-center gap-3 mb-8 relative z-10">
        {onboardingSteps.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === step ? 'w-10 bg-purple-600' : 'w-2.5 bg-gray-200'
              }`}
            style={
              i === step
                ? { boxShadow: '0 2px 8px rgba(124, 58, 237, 0.4)' }
                : undefined
            }
          />
        ))}
      </div>

      {/* Next button */}
      <div className="px-6 pb-8 relative z-10 max-w-4xl mx-auto w-full">
        <button
          onClick={handleNext}
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl"
        >
          {step < onboardingSteps.length - 1 ? 'Next Step' : 'Get Started'}
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Animated styles for Name Screen */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      ` }} />
    </div>
  );
}
