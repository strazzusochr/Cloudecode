import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useGameStore } from '../../../src/stores/gameStore';
import { useSoundStore } from '../../../src/stores/soundStore';
import { getLevelById } from '../../../src/levels/levelData';
import GameCanvas from '../../../components/GameCanvas';
import SkillPanel from '../../../components/SkillPanel';
import HUD from '../../../components/ui/HUD';
import Minimap from '../../../components/Minimap';
import LevelCompleteModal from '../../../components/LevelCompleteModal';
import type { SkillType } from '../../../src/types/game';

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

  const { playSound, preloadAllSounds } = useSoundStore();

  // Initialize level
  useEffect(() => {
    const level = getLevelById(levelId || '');
    if (level) {
      initLevel(level);
      preloadAllSounds().then(() => setIsReady(true));
    }
  }, [levelId]);

  // Game loop timer
  useEffect(() => {
    if (!isReady || isPaused || isComplete) return;

    const interval = setInterval(() => {
      updateGameTime(1 / 60);

      if (checkWinCondition()) {
        playSound('yippee');
      } else if (checkLoseCondition()) {
        playSound('oh_no');
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [isReady, isPaused, isComplete]);

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

  const handlePause = useCallback(() => {
    togglePause();
    playSound('click');
  }, []);

  if (!isReady) {
    return <View style={styles.container} />;
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

      {/* Level Complete Modal */}
      {isComplete && (
        <LevelCompleteModal
          success={gameState === 'won'}
          saved={lemmingsSaved}
          required={lemmingsRequired}
          total={totalLemmings}
          onRetry={handleRetry}
          onExit={handleExit}
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
