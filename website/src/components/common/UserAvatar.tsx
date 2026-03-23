import React from 'react';

import { characters, getCharacter } from '../../data/characters';

interface UserAvatarProps {
  characterId: number | null;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showBackground?: boolean;
  className?: string;
}

export function UserAvatar({
  characterId,
  size = 'medium',
  showBackground = true,
  className = ''
}: UserAvatarProps) {
  const character = getCharacter(characterId);

  if (!character) {
    return null;
  }

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
    xlarge: 'w-48 h-48'
  };

  const sizeClass = sizeClasses[size];

  if (showBackground) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br ${character.color} rounded-full flex items-center justify-center overflow-hidden ${className}`}
        style={{
          boxShadow: '0 6px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <img
          src={character.image}
          alt={character.name}
          className="w-full h-full object-contain scale-110"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} ${className}`}>
      <img
        src={character.image}
        alt={character.name}
        className="w-full h-full object-contain"
      />
    </div>
  );
}

export function getCharacterName(characterId: number | null): string {
  const character = getCharacter(characterId);
  return character?.name || 'Hero';
}

export function getCharacterColor(characterId: number | null): string {
  const character = getCharacter(characterId);
  return character?.color || 'from-gray-400 to-gray-500';
}