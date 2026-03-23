import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, ChevronRight, Bell, Globe, Shield, Moon, Volume2, Info, HelpCircle } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { AnimatedBackground } from '../AnimatedBackground';

export function SettingsScreen({ navigateTo }: ScreenProps) {
  const { userData, updateUserData } = useGame();
  const { signOut, currentUser } = useAuth();

  // Role-aware back navigation: parents/teachers go back to their portal, not the child dashboard
  const handleBack = () => {
    if (currentUser?.role === 'parent') {
      navigateTo('parent-dashboard');
    } else if (currentUser?.role === 'teacher') {
      navigateTo('teacher-dashboard');
    } else {
      navigateTo('dashboard');
    }
  };

  const settings = userData.settings || { darkMode: false, notifications: true, sound: true };

  const toggleSetting = (key: keyof typeof settings) => {
    updateUserData({ settings: { ...settings, [key]: !settings[key] } });
  };

  return (
    <div className="h-full bg-transparent flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      <div className="sticky top-0 bg-white/80 border-b border-gray-100 px-5 py-4 z-50 flex items-center gap-3 backdrop-blur-md transition-colors relative">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-all relative z-[60] cursor-pointer pointer-events-auto"><ChevronLeft className="w-6 h-6 text-gray-700" /></button>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 relative z-10 px-5 pt-4">
        <div className="mb-8">
          <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 px-2">Account</h3>
          <button onClick={() => navigateTo('profile')} className="w-full flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 transition-all hover:shadow-xl hover:border-purple-300 group">
            <UserAvatar characterId={userData.selectedCharacter} size="medium" />
            <div className="flex-1 text-left">
              <h4 className="font-black text-gray-900">{userData.name || 'Champion'}</h4>
              <p className="text-xs font-bold text-purple-600/70 uppercase tracking-tight">Level {userData.level}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
          </button>
        </div>
        <div className="space-y-3">
          <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-3 px-2">App Settings</h3>
          {[
            { id: 'sound', label: 'Sound Effects', icon: Volume2, color: 'bg-pink-100 text-pink-600' },
            { id: 'notifications', label: 'Push Notifications', icon: Bell, color: 'bg-amber-100 text-amber-600' }
          ].map(item => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="font-black text-gray-900 tracking-tight">{item.label}</span>
              </div>
              <button
                onClick={() => toggleSetting(item.id as keyof typeof settings)}
                className={`relative w-14 h-8 rounded-full transition-all shadow-inner ${settings[item.id as keyof typeof settings] ? 'bg-purple-600 shadow-purple-900/20' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${settings[item.id as keyof typeof settings] ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          ))}

          {/* Legal & Credits Navigation Button */}
          <button 
            onClick={() => navigateTo('attributions')}
            className="w-full flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 transition-all hover:bg-white/80 active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-black text-gray-900 tracking-tight">Legal & Credits</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </button>
        </div>

        <div className="mt-12 px-2">
          <button
            onClick={() => signOut().then(() => navigateTo('signin'))}
            className="w-full h-14 bg-red-50/80 backdrop-blur-sm border-2 border-red-100 text-red-600 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all hover:bg-red-500 hover:text-white hover:border-red-500 active:scale-95 shadow-lg shadow-red-200/50"
          >
            Sign Out From Kingdom
          </button>
        </div>
      </div>
    </div>
  );
}
