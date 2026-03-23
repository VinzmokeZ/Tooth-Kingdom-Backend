import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, ShoppingBag, Sparkles, Shield, Zap, Coffee, Star, Heart, Coins, Flame } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { TransparentImage } from '../common/TransparentImage';

interface ShopItem {
    id: number;
    name: string;
    category: 'gear' | 'consumable' | 'buff';
    price: number;
    icon: any;
    thumbnail: string;
    description: string;
    effect: string;
    color: string;
}

export function KingdomBazaarScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
    const [selectedCategory, setSelectedCategory] = useState<'all' | 'gear' | 'consumable' | 'buff'>('all');

    const SHOP_ITEMS: ShopItem[] = [
        { id: 1, name: 'Golden Tooth-Brush', category: 'gear', price: 150, icon: Sparkles, thumbnail: '/thumbnails/item_golden_toothbrush.png', description: 'A legendary brush with extra shine.', effect: '+10% XP Gain', color: 'from-yellow-400 to-amber-600' },
        { id: 2, name: 'Crystal Shield', category: 'gear', price: 300, icon: Shield, thumbnail: '/thumbnails/item_crystal_shield.png', description: 'Protects your enamel from sugar attacks.', effect: '-20% Health Loss', color: 'from-blue-400 to-indigo-600' },
        { id: 3, name: 'Minty Elixir', category: 'consumable', price: 50, icon: Flame, thumbnail: '/thumbnails/item_minty_elixir.png', description: 'Instantly restores 25 Enamel Health.', effect: 'Restore 25 HP', color: 'from-green-400 to-emerald-600' },
        { id: 4, name: 'Sparkle Cape', category: 'gear', price: 500, icon: Zap, thumbnail: '/thumbnails/item_sparkle_cape.png', description: 'Look fabulous while fighting cavities.', effect: '+5% All Stats', color: 'from-purple-400 to-pink-600' },
        { id: 5, name: 'Berry Buff', category: 'buff', price: 100, icon: Coffee, thumbnail: '/thumbnails/item_berry_buff.png', description: 'Boosts your focus for 24 hours.', effect: 'Double Rewards', color: 'from-orange-400 to-red-500' },
    ];

    const filteredItems = selectedCategory === 'all'
        ? SHOP_ITEMS
        : SHOP_ITEMS.filter(item => item.category === selectedCategory);

    const handlePurchase = (item: ShopItem) => {
        if ((userData.gold || 0) >= item.price) {
            const newInventory = [...(userData.inventory || []), { id: item.id, type: item.category }];
            const updates: any = {
                gold: userData.gold - item.price,
                inventory: newInventory
            };

            // Apply instant effects for consumables
            if (item.id === 3) updates.enamelHealth = Math.min(100, (userData.enamelHealth || 100) + 30);

            updateUserData(updates);
            alert(`Success! You bought ${item.name}!`);
        } else {
            alert("Not enough Gold! Complete more quests to earn more.");
        }
    };

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col items-stretch">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-lg px-5 pt-5 pb-6 z-20 border-b border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all animate-float hover:-translate-x-1">
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <div className="flex flex-col items-center">
                        <h1 className="font-black text-xl tracking-wider uppercase text-gray-900">Kingdom Bazaar</h1>
                        <p className="text-[10px] font-bold text-purple-500 tracking-[0.2em]">EQUIPMENT & BREWS</p>
                    </div>
                    <div className="bg-amber-100/50 px-3 py-1.5 rounded-full border border-amber-200/50 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-600" />
                        <span className="font-black text-sm text-amber-700">{userData.gold}</span>
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {['all', 'gear', 'consumable', 'buff'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border animate-float ${selectedCategory === cat
                                ? 'bg-purple-600 text-white border-purple-400 shadow-lg hover:-translate-y-1'
                                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:-translate-y-0.5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
                <div className="grid grid-cols-1 gap-4">
                    {filteredItems.map((item) => {
                        const isOwned = userData.inventory?.some(inv => inv.id === item.id);
                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-[2rem] p-4 border border-gray-100 flex items-center gap-5 hover:shadow-xl transition-all group shadow-sm"
                            >
                                <div className="w-20 h-20 flex items-center justify-center relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500 bg-white rounded-2xl overflow-hidden shadow-sm">
                                    {/* High-Fidelity Asset with Floating Animation */}
                                    <img
                                        src={item.thumbnail}
                                        alt={item.name}
                                        className="w-full h-full object-contain animate-float-ultra p-1 drop-shadow-2xl"
                                    />
                                    <item.icon className="w-10 h-10 text-purple-600 hidden animate-pulse" />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-black text-base text-gray-900 mb-1">{item.name}</h3>
                                    <p className="text-[10px] text-gray-400 mb-2 leading-tight font-bold">{item.description}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-purple-100 px-2 py-0.5 rounded-md text-[9px] font-black text-purple-600 uppercase tracking-tighter">{item.effect}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2 text-right">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-black text-lg text-amber-600">{item.price}</span>
                                        <Coins className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <button
                                        onClick={() => handlePurchase(item)}
                                        disabled={isOwned && item.category === 'gear'}
                                        className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all animate-float ${isOwned && item.category === 'gear'
                                            ? 'bg-green-100 text-green-600 border border-green-200 cursor-not-allowed'
                                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md active:scale-95 hover:-translate-y-1'
                                            }`}
                                    >
                                        {isOwned && item.category === 'gear' ? 'OWNED' : 'BUY'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Inventory Hint */}
                <div className="bg-gray-100/50 rounded-2xl p-4 border border-gray-200/50 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">You have {userData.inventory?.length || 0} items in your hoard</p>
                </div>
            </div>
        </div>
    );
}
