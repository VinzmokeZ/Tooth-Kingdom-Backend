import React, { useState } from 'react';
import { ScreenProps } from './types';
import { Check } from 'lucide-react';
import { characters } from '../../data/characters';
import { AnimatedBackground } from '../AnimatedBackground';

export function CharacterSelectScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const handleSelect = (charId: number) => {
    updateUserData({ selectedCharacter: charId });
  };

  const handleContinue = () => {
    if (userData.selectedCharacter !== null) {
      navigateTo('dashboard');
    }
  };

  return (
    <div className="h-full bg-transparent flex flex-col relative overflow-hidden">

      {/* Header */}
      <div className="p-6 pb-4 relative z-10">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-2 leading-tight">
          Choose Your Hero! 🦷✨
        </h1>
        <p className="text-center text-gray-600 text-base">
          Pick your adventure companion to save the Tooth Kingdom!
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 relative z-10 w-full">
        {/* Inline chibi artwork for hero selection */}
        <div className="w-full flex flex-col items-center gap-6 max-w-7xl mx-auto">
          <div className="w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 shadow-xl border border-purple-100/50">
            <div className="flex justify-between items-center gap-3">
              {characters.map((char) => (
                <button
                  type="button"
                  key={char.id}
                  id={`hero-${char.name.toLowerCase()}`}
                  onClick={() => handleSelect(char.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(char.id);
                    }
                  }}
                  aria-label={`Select ${char.name}`}
                  className={`relative flex flex-col items-center p-2 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-purple-300 ${userData.selectedCharacter === char.id ? 'ring-4 ring-purple-600 scale-105 bg-white' : 'bg-white hover:scale-105 active:scale-95'
                    }`}
                >
                  <img src={char.image} alt={char.name} className="w-24 h-24 object-contain" />
                  <div className="text-sm font-medium text-gray-900 mt-2">{char.name}</div>

                  {userData.selectedCharacter === char.id && (
                    <div
                      className="absolute -top-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center"
                      style={{ boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)' }}
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500">Using chibi art for hero selection.</div>
        </div>
      </div>

      {/* Continue button */}
      <div className="p-6 pt-4 relative z-10 max-w-4xl mx-auto w-full">
        <button
          onClick={handleContinue}
          disabled={userData.selectedCharacter === null}
          className={`w-full h-16 rounded-2xl font-bold text-lg transition-all transform shadow-xl ${userData.selectedCharacter !== null
            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:scale-105 active:scale-95'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed border-none shadow-none'
            }`}
        >
          {userData.selectedCharacter !== null ? '🚀 Start Your Adventure' : 'Choose a Hero First'}
        </button>
      </div>
    </div>
  );
}