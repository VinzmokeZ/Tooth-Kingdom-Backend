import React from 'react';
import { EnamelCastleSiege } from './EnamelCastleSiege';
import { SugarBugInvasion } from './SugarBugInvasion';
import { RoyalRopeRescue } from './RoyalRopeRescue';
import { KingsBanquet } from './KingsBanquet';
import { WiseKnightsTrial } from './WiseKnightsTrial';
import { DeepCleanChallenge } from './DeepCleanChallenge';
import { ExternalGameWrapper } from './ExternalGameWrapper';
import { chapters } from '../../data/chapters';

interface GameEngineProps {
  chapterId: number;
  onExit: () => void;
  onComplete: (score: number, stars: number) => void;
}

// Map chapter IDs to games
// Chapter 1: Brushing - Enamel Castle Siege
// Chapter 2: Bacteria - Shark Dentist (External)
// Chapter 3: Flossing - Royal Rope Rescue
// Chapter 4: Nutrition - King's Banquet
// Chapter 5: Mastery - Wise Knight's Trial

export function GameEngine({ chapterId, onExit, onComplete }: GameEngineProps) {
  // Find chapter data
  const chapterData = chapters.find(c => c.id === chapterId);

  // Common wrapper for all games - ensures proper sizing within PhoneFrame
  const GameWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {children}
    </div>
  );

  // Render the appropriate game based on chapter ID
  switch (chapterId) {
    case 1:
      if (chapterData?.gameType === 'external' && chapterData.gameUrl) {
        return (
          <GameWrapper>
            <ExternalGameWrapper
              url={chapterData.gameUrl}
              chapterId={chapterId}
              onComplete={onComplete}
              onExit={onExit}
            />
          </GameWrapper>
        );
      }
      return (
        <GameWrapper>
          <EnamelCastleSiege
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    case 2:
      if (chapterData?.gameType === 'external' && chapterData.gameUrl) {
        return (
          <GameWrapper>
            <ExternalGameWrapper
              url={chapterData.gameUrl}
              chapterId={chapterId}
              onComplete={onComplete}
              onExit={onExit}
            />
          </GameWrapper>
        );
      }
      // Fallback to original if data is missing
      return (
        <GameWrapper>
          <SugarBugInvasion
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    case 3:
      return (
        <GameWrapper>
          <RoyalRopeRescue
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    case 4:
      return (
        <GameWrapper>
          <KingsBanquet
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    case 5:
      return (
        <GameWrapper>
          <WiseKnightsTrial
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    case 6:
      if (chapterData?.gameType === 'external' && chapterData.gameUrl) {
        return (
          <GameWrapper>
            <ExternalGameWrapper
              url={chapterData.gameUrl}
              chapterId={chapterId}
              onComplete={onComplete}
              onExit={onExit}
            />
          </GameWrapper>
        );
      }
      return (
        <GameWrapper>
          <DeepCleanChallenge
            onComplete={onComplete}
            onExit={onExit}
          />
        </GameWrapper>
      );

    default:
      // Fallback for unknown chapters
      return (
        <GameWrapper>
          <div className="w-full h-full bg-gradient-to-b from-purple-600 to-indigo-800 flex flex-col items-center justify-center p-6">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-white mb-2">Coming Soon!</h2>
            <p className="text-white/70 text-center mb-6">
              This adventure is still being prepared...
            </p>
            <button
              onClick={onExit}
              className="bg-white/20 text-white font-bold py-3 px-8 rounded-full"
            >
              Go Back
            </button>
          </div>
        </GameWrapper>
      );
  }
}
