// Progress Store - Tracks completed levels and best scores

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  stars: number; // 1-3 stars based on performance
  bestTime: number; // Best completion time in seconds
  bestSaved: number; // Best number of lemmings saved
  attempts: number; // Total attempts
  firstCompletedAt?: number; // Timestamp of first completion
  lastPlayedAt: number; // Timestamp of last attempt
}

export interface CategoryProgress {
  category: string;
  completedCount: number;
  totalStars: number;
  perfectCount: number; // Levels with 3 stars
}

interface ProgressStore {
  // Level progress
  levelProgress: Record<string, LevelProgress>;

  // Computed category stats
  getCategoryProgress: (category: string) => CategoryProgress;

  // Actions
  recordLevelAttempt: (levelId: string) => void;
  recordLevelComplete: (
    levelId: string,
    saved: number,
    required: number,
    total: number,
    timeRemaining: number,
    timeLimit: number
  ) => void;
  getLevelProgress: (levelId: string) => LevelProgress | null;
  isLevelUnlocked: (levelId: string, levelNum: number) => boolean;
  getTotalStars: () => number;
  getTotalCompleted: () => number;
  resetProgress: () => void;
}

// Calculate stars based on performance
function calculateStars(saved: number, required: number, total: number): number {
  const savePercentage = saved / total;

  if (savePercentage >= 0.9) return 3; // 90%+ = 3 stars
  if (savePercentage >= 0.7) return 2; // 70%+ = 2 stars
  return 1; // Minimum requirement met = 1 star
}

// Default progress for a new level
function createDefaultProgress(levelId: string): LevelProgress {
  return {
    levelId,
    completed: false,
    stars: 0,
    bestTime: Infinity,
    bestSaved: 0,
    attempts: 0,
    lastPlayedAt: Date.now(),
  };
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      levelProgress: {},

      getCategoryProgress: (category: string): CategoryProgress => {
        const { levelProgress } = get();
        const categoryLower = category.toLowerCase();

        let completedCount = 0;
        let totalStars = 0;
        let perfectCount = 0;

        Object.values(levelProgress).forEach((progress) => {
          if (progress.levelId.startsWith(categoryLower)) {
            if (progress.completed) {
              completedCount++;
              totalStars += progress.stars;
              if (progress.stars === 3) perfectCount++;
            }
          }
        });

        return {
          category,
          completedCount,
          totalStars,
          perfectCount,
        };
      },

      recordLevelAttempt: (levelId: string) => {
        set((state) => {
          const existing = state.levelProgress[levelId] || createDefaultProgress(levelId);
          return {
            levelProgress: {
              ...state.levelProgress,
              [levelId]: {
                ...existing,
                attempts: existing.attempts + 1,
                lastPlayedAt: Date.now(),
              },
            },
          };
        });
      },

      recordLevelComplete: (
        levelId: string,
        saved: number,
        required: number,
        total: number,
        timeRemaining: number,
        timeLimit: number
      ) => {
        const stars = calculateStars(saved, required, total);
        const completionTime = timeLimit - timeRemaining;

        set((state) => {
          const existing = state.levelProgress[levelId] || createDefaultProgress(levelId);
          const isNewBest = saved > existing.bestSaved ||
            (saved === existing.bestSaved && completionTime < existing.bestTime);

          return {
            levelProgress: {
              ...state.levelProgress,
              [levelId]: {
                ...existing,
                completed: true,
                stars: Math.max(existing.stars, stars),
                bestTime: Math.min(existing.bestTime, completionTime),
                bestSaved: Math.max(existing.bestSaved, saved),
                firstCompletedAt: existing.firstCompletedAt || Date.now(),
                lastPlayedAt: Date.now(),
              },
            },
          };
        });
      },

      getLevelProgress: (levelId: string): LevelProgress | null => {
        return get().levelProgress[levelId] || null;
      },

      isLevelUnlocked: (levelId: string, levelNum: number): boolean => {
        // First level of each category is always unlocked
        if (levelNum === 1) return true;

        // Check if previous level is completed
        const parts = levelId.split('-');
        if (parts.length !== 2) return false;

        const category = parts[0];
        const prevLevelId = `${category}-${levelNum - 1}`;
        const prevProgress = get().levelProgress[prevLevelId];

        return prevProgress?.completed || false;
      },

      getTotalStars: (): number => {
        return Object.values(get().levelProgress).reduce(
          (total, progress) => total + progress.stars,
          0
        );
      },

      getTotalCompleted: (): number => {
        return Object.values(get().levelProgress).filter(
          (progress) => progress.completed
        ).length;
      },

      resetProgress: () => {
        set({ levelProgress: {} });
      },
    }),
    {
      name: 'lemmings-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
