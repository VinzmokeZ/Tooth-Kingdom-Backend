import { useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';

type SoundType = 'click' | 'success' | 'achievement' | 'levelUp';

const SOUND_URLS: Record<SoundType, string> = {
    click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    success: 'https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3',
    achievement: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
    levelUp: 'https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3',
};

export const useSound = () => {
    const { userData } = useGame();
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

    // Preload sounds
    useEffect(() => {
        Object.entries(SOUND_URLS).forEach(([key, url]) => {
            if (!audioRefs.current[key]) {
                const audio = new Audio(url);
                audio.preload = 'auto';
                audioRefs.current[key] = audio;
            }
        });
    }, []);

    const playSound = (type: SoundType) => {
        // Respect user settings
        if (userData.settings && userData.settings.sound === false) return;

        const audio = audioRefs.current[type];
        if (audio) {
            // Reset to start if it's already playing (allows rapid clicks)
            audio.currentTime = 0;
            audio.play().catch(err => console.warn('Audio playback failed:', err));
        }
    };

    return { playSound };
};
