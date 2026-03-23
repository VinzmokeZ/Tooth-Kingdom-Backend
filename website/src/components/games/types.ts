// Game types for Tooth Kingdom Adventure
export interface GameProps {
  onComplete: (score: number, stars: number) => void;
  onExit?: () => void;
}

export type GameScreen = 'start' | 'playing' | 'victory';

export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'plaque' | 'candy' | 'bacteria';
  health: number;
  maxHealth: number;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'sticky-candy' | 'plaque-wall';
}

// Chapter to Game mapping
export const CHAPTER_GAME_MAP: Record<number, string> = {
  1: 'brushing',      // Enamel Castle Siege
  2: 'bacteria',      // Sugar Bug Invasion
  3: 'flossing',      // Royal Rope Rescue
  4: 'nutrition',     // The King's Banquet
  5: 'mastery',       // Wise Knight's Trial
};

export function calculateStars(score: number, maxScore: number): 1 | 2 | 3 {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return 3;
  if (percentage >= 50) return 2;
  return 1;
}
