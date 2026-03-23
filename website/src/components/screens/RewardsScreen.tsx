import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Star, Lock, Sparkles, BookOpen, Flame, Target } from 'lucide-react';
import { TransparentImage } from '../common/TransparentImage';
import { AnimatedBackground } from '../AnimatedBackground';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useEffect } from 'react';

const rewards = [
  { id: 1, name: 'Golden Crown', thumbnail: '/thumbnails/reward_golden_crown.png', stars: 0, unlocked: true, equipped: true },
  { id: 2, name: 'Star Wand', thumbnail: '/thumbnails/reward_star_wand.png', stars: 50, unlocked: false, equipped: false },
  { id: 3, name: 'Dragon Shield', thumbnail: '/thumbnails/reward_dragon_shield.png', stars: 100, unlocked: false, equipped: false },
  { id: 4, name: 'Unicorn Horn', thumbnail: '/thumbnails/reward_unicorn_horn.png', stars: 150, unlocked: false, equipped: false },
  { id: 5, name: 'Hero Cape', thumbnail: '/thumbnails/reward_hero_cape.png', stars: 200, unlocked: false, equipped: false },
  { id: 6, name: 'Magical Brush', thumbnail: '/thumbnails/reward_magical_brush.png', stars: 250, unlocked: false, equipped: false },
  { id: 7, name: 'Fire Wings', thumbnail: '/thumbnails/reward_fire_wings.png', stars: 75, unlocked: false, equipped: false },
  { id: 8, name: 'Mystic Orb', thumbnail: '/thumbnails/reward_mystic_orb.png', stars: 100, unlocked: false, equipped: false },
  { id: 9, name: 'Trophy Cup', thumbnail: '/thumbnails/reward_trophy_cup.png', stars: 150, unlocked: false, equipped: false },
  { id: 10, name: 'Royal Scepter', thumbnail: '/thumbnails/reward_royal_scepter.png', stars: 200, unlocked: false, equipped: false },
];

export function RewardsScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked'>('all');
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);

  const handleBack = () => {
    if (currentUser?.role === 'parent') navigateTo('parent-dashboard');
    else if (currentUser?.role === 'teacher') navigateTo('teacher-dashboard');
    else navigateTo('dashboard');
  };

  useEffect(() => {
    if (currentUser?.uid) {
        fetch(`${API_URL}/users/${currentUser.uid}`)
            .then(res => res.json())
            .then(data => {
                if (data.gameStats?.unlocked_rewards) {
                    setUnlockedIds(JSON.parse(data.gameStats.unlocked_rewards));
                }
            })
            .catch(err => console.error("Failed to fetch rewards:", err));
    }
  }, [currentUser]);

  const filteredRewards = rewards.map(reward => {
    const isUnlocked = unlockedIds.includes(reward.id) || reward.stars === 0;
    const isEquipped = userData.selectedCharacter === reward.id;
    return { ...reward, unlocked: isUnlocked, equipped: isEquipped };
  }).filter(r => activeTab === 'all' || r.unlocked);

  const handleAction = async (reward: any) => {
    if (reward.unlocked) {
      updateUserData({ selectedCharacter: reward.id });
    } else if (userData.totalStars >= reward.stars) {
      try {
        const res = await fetch(`${API_URL}/rewards/unlock?uid=${currentUser?.uid}&reward_id=${reward.id}&cost=${reward.stars}`, {
            method: 'POST'
        });
        const data = await res.json();
        if (data.success) {
            setUnlockedIds(prev => [...prev, reward.id]);
            updateUserData({
                totalStars: userData.totalStars - reward.stars
            });
        }
      } catch (e) {
        console.error("Unlock failed:", e);
      }
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-50 flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 text-white px-5 pt-5 pb-6 z-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        <div className="flex items-center gap-3 mb-5">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold flex-1">Rewards Collection</h1>
        </div>

        {/* Stars balance */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30 flex items-center justify-center gap-3">
          <Star className="w-7 h-7 fill-yellow-300 text-yellow-300" />
          <div>
            <p className="text-white/80 text-xs">Your Stars</p>
            <p className="text-2xl font-bold">{userData.totalStars}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-white/20 backdrop-blur-md border-b border-white/30 px-5 py-3 z-10">
        <div className="flex gap-2 bg-black/10 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${activeTab === 'all'
              ? 'bg-white text-purple-600 shadow-lg scale-105'
              : 'text-white/70 hover:text-white'
              }`}
          >
            All Rewards
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'unlocked'
              ? 'bg-white text-purple-600 shadow-lg scale-105'
              : 'text-white/70 hover:text-white'
              }`}
          >
            Unlocked ({unlockedIds.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="grid grid-cols-2 gap-4">
          {filteredRewards.map((reward) => (
            <div
              key={reward.id}
              className={`glass-card rounded-[2rem] p-5 shadow-lg transition-all border border-white/30 ${reward.unlocked ? 'hover:shadow-xl hover:scale-[1.03]' : 'opacity-70 grayscale-[0.5]'
                }`}
            >
              {/* Reward image */}
              <div className="relative">
                <div className={`aspect-square bg-white rounded-3xl flex items-center justify-center mb-4 transition-transform hover:scale-110 overflow-hidden relative shadow-sm`}>
                  <img
                    src={reward.thumbnail}
                    alt={reward.name}
                    className="w-full h-full object-contain p-2 animate-float-ultra drop-shadow-2xl"
                  />
                  {!reward.unlocked && (
                    <div className="absolute inset-0 bg-gray-900/10 rounded-3xl flex items-center justify-center backdrop-blur-[2px]">
                      <Lock className="w-10 h-10 text-white/90 drop-shadow-lg" />
                    </div>
                  )}
                </div>
                {reward.equipped && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                    Equipped
                  </div>
                )}
              </div>

              {/* Reward info */}
              <h3 className="font-bold text-gray-900 text-sm mb-1 text-center">
                {reward.name}
              </h3>

              {/* Action */}
              <button
                onClick={() => handleAction(reward)}
                className={`w-full h-9 rounded-xl text-sm font-medium transition-all ${reward.unlocked
                  ? reward.equipped
                    ? 'bg-green-100 text-green-700 cursor-default'
                    : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  : userData.totalStars >= reward.stars
                    ? 'bg-amber-500 text-white hover:bg-amber-600'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {reward.unlocked
                  ? reward.equipped ? 'Equipped' : 'Equip'
                  : userData.totalStars >= reward.stars ? `Unlock (${reward.stars})` : `${reward.stars} Stars Needed`}
              </button>
            </div>
          ))}
        </div>

        {/* How to earn section */}
        <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900">How to Earn Stars</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: BookOpen, iconColor: 'text-purple-600', text: 'Complete lessons & chapters' },
              { icon: Flame, iconColor: 'text-orange-600', text: 'Maintain your daily streak' },
              { icon: Target, iconColor: 'text-rose-600', text: 'Achieve daily goals' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>
                <p className="text-gray-700 text-sm font-bold">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
