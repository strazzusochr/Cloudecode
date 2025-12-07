// Core Game Types

export type LemmingState =
  | 'WALKING'
  | 'FALLING'
  | 'FLOATING'
  | 'CLIMBING'
  | 'BOMBING'
  | 'EXPLODING'
  | 'BLOCKING'
  | 'BUILDING'
  | 'BASHING'
  | 'MINING'
  | 'DIGGING'
  | 'TURNING'
  | 'LANDING'
  | 'SPLATTING'
  | 'DROWNING'
  | 'EXITING'
  | 'DEAD'
  | 'SAVED';

export type SkillType =
  | 'CLIMBER'
  | 'FLOATER'
  | 'BOMBER'
  | 'BLOCKER'
  | 'BUILDER'
  | 'BASHER'
  | 'MINER'
  | 'DIGGER';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';

export type LevelCategory = 'FUN' | 'TRICKY' | 'TAXING' | 'MAYHEM' | 'CUSTOM';

export type ThemeId = 'dirt' | 'fire' | 'marble' | 'crystal' | 'brick';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface SkillCounts {
  CLIMBER: number;
  FLOATER: number;
  BOMBER: number;
  BLOCKER: number;
  BUILDER: number;
  BASHER: number;
  MINER: number;
  DIGGER: number;
}

export interface LevelData {
  id: string;
  name: string;
  category: LevelCategory;
  themeId: ThemeId;

  // Dimensions
  width: number;
  height: number;

  // Terrain (2D array as 1D)
  terrain: number[];

  // Spawn/Exit
  spawnPosition: { x: number; y: number };
  exitPosition: { x: number; y: number };

  // Game parameters
  totalLemmings: number;
  requiredSaved: number;
  releaseRate: number;
  timeLimit: number; // seconds

  // Available skills
  skills: SkillCounts;
}

export interface LemmingEntity {
  // Transform
  id: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;

  // State
  state: LemmingState;
  previousState: LemmingState;
  direction: 1 | -1;

  // Permanent Skills
  isClimber: boolean;
  isFloater: boolean;

  // State-specific data
  fallStartY: number;
  bomberTimer: number;
  builderBricks: number;
  buildTimer: number;
  countdownValue: number;
  animationProgress: number;

  // Visual flags
  showUmbrella: boolean;
  showClimbingGear: boolean;
  showMiningHelmet: boolean;
  showCountdown: boolean;
  isBlocking: boolean;
  isDead: boolean;

  // Animation
  animation: string;
  animationSpeed: number;

  // Rendering
  instanceIndex: number;
}

export interface GameState {
  // Level info
  currentLevel: LevelData | null;

  // Game status
  gameStatus: GameStatus;
  isPaused: boolean;
  isComplete: boolean;

  // Counters
  lemmingsOut: number;
  lemmingsSaved: number;
  lemmingsRequired: number;
  totalLemmings: number;
  timeRemaining: number;

  // Current selection
  selectedSkill: SkillType | null;
  skillCounts: SkillCounts;

  // Settings
  releaseRate: number;
  spawnTimer: number;

  // Camera
  cameraPosition: Vector3;
}
