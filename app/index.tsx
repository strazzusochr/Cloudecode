import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import GameScene from '../components/GameScene';
import GameHUD from '../game/ui/GameHUD';
import TutorialOverlay from '../game/ui/TutorialOverlay';
import VictoryScreen from '../game/ui/VictoryScreen';
import DefeatScreen from '../game/ui/DefeatScreen';
import PauseMenu from '../game/ui/PauseMenu';
import { GameState, GameStats, GameSettings, Character, Side } from '../types/game';

export default function GameScreen() {
  // Game state management
  const [gameState, setGameState] = useState<GameState>('tutorial');
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState<GameStats>({ moves: 0, timeElapsed: 0, stars: 0 });
  const [settings, setSettings] = useState<GameSettings>({
    musicEnabled: true,
    sfxEnabled: true,
    tutorialEnabled: true,
    graphicsQuality: 'auto',
  });

  // Character state
  const [characters, setCharacters] = useState<Character[]>([
    { id: 'farmer', type: 'farmer', side: 'left', inBoat: false, position: { x: -10, y: 0, z: 2 }, selected: false },
    { id: 'wolf', type: 'wolf', side: 'left', inBoat: false, position: { x: -10, y: 0, z: 0 }, selected: false },
    { id: 'sheep', type: 'sheep', side: 'left', inBoat: false, position: { x: -10, y: 0, z: -2 }, selected: false },
    { id: 'cabbage', type: 'cabbage', side: 'left', inBoat: false, position: { x: -10, y: 0, z: -4 }, selected: false },
  ]);

  const [boatSide, setBoatSide] = useState<Side>('left');
  // const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null); // Will be used later

  // Timer for game stats
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && !isPaused) {
      interval = setInterval(() => {
        setStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, isPaused]);

  // Character selection handler (to be implemented)
  const handleCharacterSelect = (characterId: string) => {
    if (gameState !== 'playing' && gameState !== 'tutorial') return;

    setCharacters(prev =>
      prev.map(char => ({
        ...char,
        selected: char.id === characterId,
      }))
    );
    // setSelectedCharacter(characterId); // Will be enabled later
    console.log('Character selected:', characterId);
  };

  // Load into boat handler (will be implemented with touch interaction)
  // Commented out temporarily to avoid unused warning
  // const handleLoadIntoBoat = () => {
  //   if (!selectedCharacter) return;
  //   const character = characters.find(c => c.id === selectedCharacter);
  //   if (!character || character.side !== boatSide) return;
  //   const inBoatCount = characters.filter(c => c.inBoat).length;
  //   if (inBoatCount >= 2) return;
  //   const farmerInBoat = characters.find(c => c.type === 'farmer' && c.inBoat);
  //   if (!farmerInBoat && character.type !== 'farmer') return;
  //   setCharacters(prev =>
  //     prev.map(char =>
  //       char.id === selectedCharacter
  //         ? { ...char, inBoat: true, selected: false }
  //         : char
  //     )
  //   );
  //   setSelectedCharacter(null);
  // };

  // Cross river handler
  const handleCrossRiver = () => {
    const farmerInBoat = characters.find(c => c.type === 'farmer' && c.inBoat);
    if (!farmerInBoat) return; // Farmer must steer

    // Move boat and characters
    const newSide: Side = boatSide === 'left' ? 'right' : 'left';

    setCharacters(prev =>
      prev.map(char => {
        if (char.inBoat) {
          return {
            ...char,
            side: newSide,
            inBoat: false,
            position: {
              ...char.position,
              x: newSide === 'left' ? -10 : 10,
            },
          };
        }
        return char;
      })
    );

    setBoatSide(newSide);
    setStats(prev => ({ ...prev, moves: prev.moves + 1 }));

    // Check for conflicts after move
    setTimeout(() => {
      checkGameRules();
    }, 100);
  };

  // Check win/lose conditions
  const checkGameRules = () => {
    const leftSide = characters.filter(c => c.side === 'left' && !c.inBoat);
    const rightSide = characters.filter(c => c.side === 'right' && !c.inBoat);

    // Check if farmer is on each side
    const farmerOnLeft = leftSide.some(c => c.type === 'farmer');
    const farmerOnRight = rightSide.some(c => c.type === 'farmer');

    // Check left side conflicts
    if (!farmerOnLeft && leftSide.length >= 2) {
      const hasWolf = leftSide.some(c => c.type === 'wolf');
      const hasSheep = leftSide.some(c => c.type === 'sheep');
      const hasCabbage = leftSide.some(c => c.type === 'cabbage');

      if (hasWolf && hasSheep) {
        setGameState('lost');
        return;
      }
      if (hasSheep && hasCabbage) {
        setGameState('lost');
        return;
      }
    }

    // Check right side conflicts
    if (!farmerOnRight && rightSide.length >= 2) {
      const hasWolf = rightSide.some(c => c.type === 'wolf');
      const hasSheep = rightSide.some(c => c.type === 'sheep');
      const hasCabbage = rightSide.some(c => c.type === 'cabbage');

      if (hasWolf && hasSheep) {
        setGameState('lost');
        return;
      }
      if (hasSheep && hasCabbage) {
        setGameState('lost');
        return;
      }
    }

    // Check win condition - all on right side
    if (rightSide.length === 4) {
      calculateStars();
      setGameState('won');
    }
  };

  const calculateStars = () => {
    const { moves, timeElapsed } = stats;
    let stars: 0 | 1 | 2 | 3 = 1;

    if (moves === 7 && timeElapsed <= 120) {
      stars = 3;
    } else if (moves <= 9 && timeElapsed <= 180) {
      stars = 2;
    }

    setStats(prev => ({ ...prev, stars }));
  };

  const handleRestart = () => {
    setCharacters([
      { id: 'farmer', type: 'farmer', side: 'left', inBoat: false, position: { x: -10, y: 0, z: 2 }, selected: false },
      { id: 'wolf', type: 'wolf', side: 'left', inBoat: false, position: { x: -10, y: 0, z: 0 }, selected: false },
      { id: 'sheep', type: 'sheep', side: 'left', inBoat: false, position: { x: -10, y: 0, z: -2 }, selected: false },
      { id: 'cabbage', type: 'cabbage', side: 'left', inBoat: false, position: { x: -10, y: 0, z: -4 }, selected: false },
    ]);
    setBoatSide('left');
    setStats({ moves: 0, timeElapsed: 0, stars: 0 });
    setGameState(settings.tutorialEnabled ? 'tutorial' : 'playing');
    // setSelectedCharacter(null); // Will be enabled later
  };

  const handleTutorialComplete = () => {
    setGameState('playing');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 3D Game Scene */}
      <GameScene
        characters={characters}
        boatSide={boatSide}
        quality={settings.graphicsQuality}
        onCharacterPress={handleCharacterSelect}
      />

      {/* Game HUD */}
      {(gameState === 'playing' || gameState === 'tutorial') && (
        <GameHUD
          moves={stats.moves}
          timeElapsed={stats.timeElapsed}
          onPause={() => setIsPaused(true)}
          onCrossRiver={handleCrossRiver}
          canCross={characters.some(c => c.type === 'farmer' && c.inBoat)}
        />
      )}

      {/* Tutorial Overlay */}
      {gameState === 'tutorial' && (
        <TutorialOverlay
          onComplete={handleTutorialComplete}
          onSkip={() => setGameState('playing')}
        />
      )}

      {/* Victory Screen */}
      {gameState === 'won' && (
        <VictoryScreen
          stats={stats}
          onRestart={handleRestart}
          onNextLevel={() => {}}
        />
      )}

      {/* Defeat Screen */}
      {gameState === 'lost' && (
        <DefeatScreen
          onRestart={handleRestart}
          onShowHint={() => {}}
        />
      )}

      {/* Pause Menu */}
      {isPaused && (
        <PauseMenu
          settings={settings}
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onSettings={(newSettings) => setSettings(newSettings)}
          onExit={() => {}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
  },
});
