// Game Types for River Crossing Puzzle

export type CharacterType = 'farmer' | 'wolf' | 'sheep' | 'cabbage';

export type Side = 'left' | 'right';

export type GameState = 'tutorial' | 'playing' | 'won' | 'lost';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'auto';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Character {
  id: string;
  type: CharacterType;
  side: Side;
  inBoat: boolean;
  position: Position;
  selected: boolean;
}

export interface GameSettings {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  tutorialEnabled: boolean;
  graphicsQuality: GraphicsQuality;
}

export interface TutorialStep {
  id: number;
  text: string;
  highlight?: CharacterType | 'boat' | 'button';
  completed: boolean;
}

export interface GameStats {
  moves: number;
  timeElapsed: number; // in seconds
  stars: 0 | 1 | 2 | 3;
}

export const OPTIMAL_MOVES = 7;
export const TWO_STAR_MOVES = 9;
export const TWO_STAR_TIME = 180; // 3 minutes
export const THREE_STAR_TIME = 120; // 2 minutes
