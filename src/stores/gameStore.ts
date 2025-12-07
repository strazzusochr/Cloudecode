// Main Game Store with Zustand

import { create } from 'zustand';
import type { LevelData, SkillType, SkillCounts, GameStatus, Vector3 } from '../types/game';
import { world, assignSkill, queries, type LemmingEntity } from '../../ecs/index';
import { updateAllLemmings } from '../../ecs/systems/stateMachine';
import { loadTerrainFromLevel, getTerrainDimensions } from '../terrain/terrainUtils';

interface GameStore {
  // Level info
  currentLevel: LevelData | null;

  // Game status
  gameState: GameStatus;
  isPaused: boolean;
  isComplete: boolean;

  // Counters
  lemmingsOut: number;
  lemmingsSaved: number;
  lemmingsRequired: number;
  totalLemmings: number;
  timeRemaining: number;

  // Skill selection
  selectedSkill: SkillType | null;
  skillCounts: SkillCounts;

  // Release rate
  releaseRate: number;
  spawnTimer: number;
  spawnInterval: number;

  // Camera
  cameraPosition: Vector3;

  // Actions
  initLevel: (level: LevelData) => void;
  updateGameTime: (delta: number) => void;
  setSelectedSkill: (skill: SkillType | null) => void;
  assignSkillToLemming: (lemmingId: string) => boolean;
  setReleaseRate: (rate: number) => void;
  togglePause: () => void;
  nukeAllLemmings: () => void;
  checkWinCondition: () => boolean;
  checkLoseCondition: () => boolean;
  setCameraPosition: (pos: Vector3) => void;
  incrementSaved: () => void;
  reset: () => void;
}

const defaultSkillCounts: SkillCounts = {
  CLIMBER: 0,
  FLOATER: 0,
  BOMBER: 0,
  BLOCKER: 0,
  BUILDER: 0,
  BASHER: 0,
  MINER: 0,
  DIGGER: 0,
};

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  currentLevel: null,
  gameState: 'idle',
  isPaused: false,
  isComplete: false,
  lemmingsOut: 0,
  lemmingsSaved: 0,
  lemmingsRequired: 0,
  totalLemmings: 0,
  timeRemaining: 0,
  selectedSkill: null,
  skillCounts: { ...defaultSkillCounts },
  releaseRate: 50,
  spawnTimer: 0,
  spawnInterval: 1,
  cameraPosition: { x: 0, y: 0, z: 10 },

  // Initialize level
  initLevel: (level: LevelData) => {
    // Reset ECS world
    world.reset();

    // Load terrain
    loadTerrainFromLevel(level.terrain, level.width, level.height);

    // Calculate spawn interval from release rate
    const spawnInterval = 4 - (level.releaseRate / 100) * 3.5;

    set({
      currentLevel: level,
      gameState: 'playing',
      isPaused: false,
      isComplete: false,
      lemmingsOut: 0,
      lemmingsSaved: 0,
      lemmingsRequired: level.requiredSaved,
      totalLemmings: level.totalLemmings,
      timeRemaining: level.timeLimit,
      selectedSkill: null,
      skillCounts: { ...level.skills },
      releaseRate: level.releaseRate,
      spawnTimer: 0,
      spawnInterval,
      cameraPosition: {
        x: level.spawnPosition.x * 0.1,
        y: -level.spawnPosition.y * 0.1,
        z: 10,
      },
    });
  },

  // Update game time and spawn lemmings
  updateGameTime: (delta: number) => {
    const state = get();
    if (state.isPaused || state.isComplete || !state.currentLevel) return;

    // Update time
    let newTimeRemaining = state.timeRemaining - delta;
    if (newTimeRemaining < 0) newTimeRemaining = 0;

    // Spawn lemmings
    let newSpawnTimer = state.spawnTimer + delta;
    let newLemmingsOut = state.lemmingsOut;

    while (
      newSpawnTimer >= state.spawnInterval &&
      newLemmingsOut < state.totalLemmings
    ) {
      newSpawnTimer -= state.spawnInterval;

      // Spawn lemming at spawn position
      const spawnPos = state.currentLevel.spawnPosition;
      world.add(
        {
          x: spawnPos.x * 0.1,
          y: -spawnPos.y * 0.1,
          z: 0,
        },
        1
      );
      newLemmingsOut++;
    }

    // Update all lemmings
    const exitPos = state.currentLevel.exitPosition;
    updateAllLemmings(delta, {
      x: exitPos.x * 0.1,
      y: -exitPos.y * 0.1,
    });

    // Count saved lemmings
    const savedCount = queries.getSavedLemmings().length;

    set({
      timeRemaining: newTimeRemaining,
      spawnTimer: newSpawnTimer,
      lemmingsOut: newLemmingsOut,
      lemmingsSaved: savedCount,
    });
  },

  // Set selected skill
  setSelectedSkill: (skill: SkillType | null) => {
    set({ selectedSkill: skill });
  },

  // Assign skill to lemming
  assignSkillToLemming: (lemmingId: string) => {
    const state = get();
    if (!state.selectedSkill) return false;

    const entity = world.getById(lemmingId);
    if (!entity) return false;

    // Check if we have this skill available
    if (state.skillCounts[state.selectedSkill] <= 0) return false;

    // Try to assign
    const success = assignSkill(entity, state.selectedSkill);

    if (success) {
      set({
        skillCounts: {
          ...state.skillCounts,
          [state.selectedSkill]: state.skillCounts[state.selectedSkill] - 1,
        },
      });
    }

    return success;
  },

  // Set release rate
  setReleaseRate: (rate: number) => {
    const currentRate = get().releaseRate;
    // Can only increase, never decrease below current
    const newRate = Math.max(currentRate, Math.min(99, rate));
    const spawnInterval = 4 - (newRate / 100) * 3.5;
    set({ releaseRate: newRate, spawnInterval });
  },

  // Toggle pause
  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  // Nuke all lemmings
  nukeAllLemmings: () => {
    const activeLemmings = queries.getActiveLemmings();
    for (const lemming of activeLemmings) {
      if (lemming.state !== 'BOMBING' && lemming.state !== 'EXPLODING') {
        assignSkill(lemming, 'BOMBER');
      }
    }
  },

  // Check win condition
  checkWinCondition: () => {
    const state = get();
    if (state.isComplete) return false;

    const activeLemmings = queries.getActiveLemmings();
    const allOut = state.lemmingsOut >= state.totalLemmings;
    const allDone = activeLemmings.length === 0;

    if (allOut && allDone && state.lemmingsSaved >= state.lemmingsRequired) {
      set({ gameState: 'won', isComplete: true });
      return true;
    }

    return false;
  },

  // Check lose condition
  checkLoseCondition: () => {
    const state = get();
    if (state.isComplete) return false;

    // Time ran out
    if (state.timeRemaining <= 0) {
      set({ gameState: 'lost', isComplete: true });
      return true;
    }

    // Can't possibly win anymore
    const activeLemmings = queries.getActiveLemmings();
    const potentialSaved = state.lemmingsSaved + activeLemmings.length;
    const remainingToSpawn = state.totalLemmings - state.lemmingsOut;

    if (potentialSaved + remainingToSpawn < state.lemmingsRequired) {
      set({ gameState: 'lost', isComplete: true });
      return true;
    }

    return false;
  },

  // Set camera position
  setCameraPosition: (pos: Vector3) => {
    set({ cameraPosition: pos });
  },

  // Increment saved (called from ECS)
  incrementSaved: () => {
    set((state) => ({ lemmingsSaved: state.lemmingsSaved + 1 }));
  },

  // Reset store
  reset: () => {
    world.reset();
    set({
      currentLevel: null,
      gameState: 'idle',
      isPaused: false,
      isComplete: false,
      lemmingsOut: 0,
      lemmingsSaved: 0,
      lemmingsRequired: 0,
      totalLemmings: 0,
      timeRemaining: 0,
      selectedSkill: null,
      skillCounts: { ...defaultSkillCounts },
      releaseRate: 50,
      spawnTimer: 0,
      spawnInterval: 1,
      cameraPosition: { x: 0, y: 0, z: 10 },
    });
  },
}));
