import React, { useEffect, useCallback, useState, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameStore } from '../../../src/stores/gameStore';
import { useSoundStore, getMusicTrackForCategory } from '../../../src/stores/soundStore';
import { useProgressStore } from '../../../src/stores/progressStore';
import { getLevelById } from '../../../src/levels/levelData';
import GameCanvas from '../../../components/GameCanvas';
import SkillPanel from '../../../components/SkillPanel';
import HUD from '../../../components/ui/HUD';
import Minimap from '../../../components/Minimap';
import LevelCompleteModal from '../../../components/LevelCompleteModal';
import PauseMenu from '../../../components/ui/PauseMenu';
import LoadingScreen from '../../../components/ui/LoadingScreen';
import type { SkillType } from '../../../src/types/game';

// Skill keyboard mappings (1-8 for skills)
const SKILL_KEYS: Record<string, SkillType> = {
  '1': 'CLIMBER',
  '2': 'FLOATER',
  '3': 'BOMBER',
  '4': 'BLOCKER',
  '5': 'BUILDER',
  '6': 'BASHER',
  '7': 'MINER',
  '8': 'DIGGER',
};

export default function PlayScreen() {
  const { levelId } = useLocalSearchParams<{ levelId: string }>();
  const [isReady, setIsReady] = useState(false);

  const {
    initLevel,
    updateGameTime,
    checkWinCondition,
    checkLoseCondition,
    gameState,
    lemmingsOut,
    lemmingsSaved,
    lemmingsRequired,
    totalLemmings,
    timeRemaining,
    isPaused,
    isComplete,
    selectedSkill,
    setSelectedSkill,
    skillCounts,
    releaseRate,
    setReleaseRate,
    nukeAllLemmings,
    togglePause,
  } = useGameStore();

  const { playSound, preloadAllSounds, playMusic, stopMusic } = useSoundStore();
  const { recordLevelAttempt, recordLevelComplete } = useProgressStore();
  const progressRecordedRef = useRef(false);
  const currentLevelRef = useRef<any>(null);

  // Initialize level
  useEffect(() => {
    const level = getLevelById(levelId || '');
    if (level) {
      currentLevelRef.current = level;
      progressRecordedRef.current = false;
      initLevel(level);
      recordLevelAttempt(levelId || '');
      preloadAllSounds().then(() => {
        // Play music based on level category
        const category = level.category?.toLowerCase() || 'fun';
        const musicTrack = getMusicTrackForCategory(category);
        playMusic(musicTrack, true);
        setIsReady(true);
      });
    }

    // Stop music when leaving the screen
    return () => {
      stopMusic();
    };
  }, [levelId]);

  // Game loop timer
  useEffect(() => {
    if (!isReady || isPaused || isComplete) return;

    const interval = setInterval(() => {
      updateGameTime(1 / 60);

      if (checkWinCondition()) {
        playSound('level_complete');
        playMusic('victory', false);
        // Record progress only once
        if (!progressRecordedRef.current && currentLevelRef.current) {
          progressRecordedRef.current = true;
          recordLevelComplete(
            levelId || '',
            lemmingsSaved,
            lemmingsRequired,
            totalLemmings,
            timeRemaining,
            currentLevelRef.current.timeLimit || 300
          );
        }
      } else if (checkLoseCondition()) {
        playSound('level_fail');
        playMusic('defeat', false);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isReady, isPaused, isComplete, lemmingsSaved, timeRemaining]);

  const handleSkillSelect = useCallback((skill: SkillType) => {
    setSelectedSkill(skill);
    playSound('click');
  }, []);

  const handleNuke = useCallback(() => {
    nukeAllLemmings();
    playSound('explosion');
  }, []);

  const handleRetry = useCallback(() => {
    const level = getLevelById(levelId || '');
    if (level) initLevel(level);
  }, [levelId]);

  const handleExit = useCallback(() => {
    router.back();
  }, []);

  const handleNextLevel = useCallback(() => {
    // Parse current level ID to get next level
    const parts = (levelId || '').split('-');
    if (parts.length === 2) {
      const category = parts[0];
      const currentNum = parseInt(parts[1], 10);
      const nextNum = currentNum + 1;

      // Check if next level exists (max 30 per category)
      if (nextNum <= 30) {
        const nextLevelId = `${category}-${nextNum}`;
        router.replace(`/(game)/play/${nextLevelId}`);
      }
    }
  }, [levelId]);

  // Check if there's a next level
  const hasNextLevel = (() => {
    const parts = (levelId || '').split('-');
    if (parts.length === 2) {
      const currentNum = parseInt(parts[1], 10);
      return currentNum < 30;
    }
    return false;
  })();

  const handlePause = useCallback(() => {
    togglePause();
    playSound('click');
  }, []);

  const handleResume = useCallback(() => {
    if (isPaused) {
      togglePause();
      playSound('click');
    }
  }, [isPaused]);

  // Keyboard shortcuts (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keys if level is complete
      if (isComplete) return;

      const key = e.key.toLowerCase();

      // Pause/Resume
      if (key === 'escape' || key === 'p') {
        e.preventDefault();
        togglePause();
        playSound('click');
        return;
      }

      // Only handle other keys if not paused
      if (isPaused) return;

      // Skill selection (1-8)
      if (SKILL_KEYS[e.key]) {
        e.preventDefault();
        setSelectedSkill(SKILL_KEYS[e.key]);
        playSound('click');
        return;
      }

      // Release rate adjustment
      if (key === '+' || key === '=') {
        e.preventDefault();
        setReleaseRate(Math.min(99, releaseRate + 5));
        return;
      }
      if (key === '-' || key === '_') {
        e.preventDefault();
        setReleaseRate(Math.max(1, releaseRate - 5));
        return;
      }

      // Nuke (n key with confirmation)
      if (key === 'n') {
        e.preventDefault();
        // Double press required for safety - just flash warning for now
        return;
      }

      // Fast forward (hold space) - would need special handling
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isComplete, releaseRate]);

  // Get level name for pause menu
  const levelName = currentLevelRef.current?.name || levelId;

  if (!isReady) {
    return (
      <LoadingScreen
        message="Preparing level..."
        levelName={levelName}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* 3D Game Canvas */}
      <GameCanvas levelId={levelId || ''} />

      {/* HUD */}
      <HUD
        timeRemaining={timeRemaining}
        lemmingsOut={lemmingsOut}
        lemmingsSaved={lemmingsSaved}
        lemmingsRequired={lemmingsRequired}
        totalLemmings={totalLemmings}
      />

      {/* Minimap */}
      <Minimap />

      {/* Skill Panel */}
      <SkillPanel
        selectedSkill={selectedSkill}
        onSkillSelect={handleSkillSelect}
        skillCounts={skillCounts}
        releaseRate={releaseRate}
        onReleaseRateChange={setReleaseRate}
        onNuke={handleNuke}
        onPause={handlePause}
        isPaused={isPaused}
      />

      {/* Pause Menu */}
      <PauseMenu
        visible={isPaused && !isComplete}
        levelName={levelName}
        onResume={handleResume}
        onRestart={handleRetry}
        onExit={handleExit}
      />

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelCompleteModal
          success={gameState === 'won'}
          saved={lemmingsSaved}
          required={lemmingsRequired}
          total={totalLemmings}
          onRetry={handleRetry}
          onExit={handleExit}
          onNextLevel={handleNextLevel}
          hasNextLevel={hasNextLevel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
