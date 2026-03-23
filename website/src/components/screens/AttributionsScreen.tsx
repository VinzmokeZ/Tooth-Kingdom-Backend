import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Shield, Gamepad2, Palette, FileText, ExternalLink, Copyright, Award } from 'lucide-react';
import { AnimatedBackground } from '../AnimatedBackground';

export function AttributionsScreen({ navigateTo }: ScreenProps) {
  const sections = [
    {
      title: 'Game Licenses',
      icon: Gamepad2,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      items: [
        { name: 'Cavity Miner', provider: 'TubClub', type: 'Unity WebGL' },
        { name: 'Shark Dentist', provider: 'Godot Engine', type: 'Godot Web Export' },
        { name: 'Beatrix: Battle Dentist', provider: 'GameMaker', type: 'GX.games/HTML5' }
      ]
    },
    {
      title: 'Art & UI Assets',
      icon: Palette,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      items: [
        { name: 'Chibi Hero Characters', provider: 'Custom Studio Assets', type: 'SVG/Vector' },
        { name: 'UI Components', provider: 'shadcn/ui', type: 'MIT License' },
        { name: 'Icons', provider: 'Lucide React', type: 'ISC License' },
        { name: 'Photography', provider: 'Unsplash', type: 'Unsplash License' }
      ]
    },
    {
      title: 'Legal & Privacy',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      items: [
        { name: 'Privacy Policy', provider: 'Tooth Kingdom Adventure', type: 'Required for Play Store' },
        { name: 'Terms of Service', provider: 'Tooth Kingdom Adventure', type: 'v1.0' },
        { name: 'COPPA Compliance', provider: 'Children Protection', type: 'Active' }
      ]
    }
  ];

  return (
    <div className="h-full bg-transparent flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Header */}
      <div className="sticky top-0 bg-white/80 border-b border-gray-100 px-5 py-4 z-50 flex items-center gap-3 backdrop-blur-md">
        <button 
          onClick={() => navigateTo('settings')} 
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all cursor-pointer pointer-events-auto"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Legal & Credits</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 relative z-10 px-5 pt-6 space-y-8">
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <Copyright className="absolute bottom-4 right-4 w-12 h-12 opacity-10" />
          <h2 className="text-lg font-black mb-2 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Kingdom Attributions
          </h2>
          <p className="text-sm font-medium opacity-80 leading-relaxed">
            Tooth Kingdom Adventure is built with love using amazing open-source technology and creative assets from around the world.
          </p>
        </div>

        {/* Attribution Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className={`p-2 rounded-xl ${section.bg} ${section.color}`}>
                <section.icon className="w-4 h-4" />
              </div>
              <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                {section.title}
              </h3>
            </div>

            <div className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx}
                  className="w-full flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm transition-all hover:bg-white/80"
                >
                  <div className="flex flex-col">
                    <span className="font-black text-gray-900 text-sm tracking-tight">{item.name}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {item.provider}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100 uppercase">
                      {item.type}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer Info */}
        <div className="pt-8 text-center space-y-2 pb-10">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            v1.0.0 Production Build
          </p>
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-indigo-400">
            <Shield className="w-3 h-3" />
            Secure & COPPA Compliant
          </div>
        </div>
      </div>
    </div>
  );
}
