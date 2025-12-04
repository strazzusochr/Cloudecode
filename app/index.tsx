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

  // Character selection handler
  const handleCharacterSelect = (characterId: string) => {
    if (gameState !== 'playing' && gameState !== 'tutorial') return;

    setCharacters(prev =>
      prev.map(char => ({
        ...char,
        selected: char.id === characterId,
      }))
    );
  };

  // Get boat position
  const getBoatPosition = () => {
    const boatX = boatSide === 'left' ? -4 : 4;
    const boatZ = 0;
    return { x: boatX, z: boatZ };
  };

  // Load character into boat
  const handleLoadIntoBoat = () => {
    const selectedChar = characters.find(c => c.selected);
    if (!selectedChar) return;

    const character = characters.find(c => c.id === selectedChar.id);
    if (!character || character.side !== boatSide) return;

    const inBoatCount = characters.filter(c => c.inBoat).length;
    if (inBoatCount >= 2) return;

    const farmerInBoat = characters.find(c => c.type === 'farmer' && c.inBoat);
    if (!farmerInBoat && character.type !== 'farmer') return;

    const boatPos = getBoatPosition();
    const inBoatChars = characters.filter(c => c.inBoat);
    const offset = inBoatChars.length === 0 ? -1 : 1;

    setCharacters(prev =>
      prev.map(char =>
        char.id === selectedChar.id
          ? {
              ...char,
              inBoat: true,
              selected: false,
              position: { x: boatPos.x + offset, y: 0.3, z: boatPos.z },
            }
          : char
      )
    );
  };

  // Unload character from boat
  const handleUnloadFromBoat = () => {
    const selectedChar = characters.find(c => c.selected);
    if (!selectedChar || !selectedChar.inBoat) return;

    const shoreX = boatSide === 'left' ? -10 : 10;
    const inBoatChars = characters.filter(c => c.inBoat && c.id !== selectedChar.id);
    const shoreOffset = (inBoatChars.length % 2) * 2 - 2;

    setCharacters(prev =>
      prev.map(char =>
        char.id === selectedChar.id
          ? {
              ...char,
              inBoat: false,
              selected: false,
              position: { x: shoreX, y: 0, z: shoreOffset },
            }
          : char
      )
    );
  };

  // Cross river handler
  const handleCrossRiver = () => {
    const farmerInBoat = characters.find(c => c.type === 'farmer' && c.inBoat);
    if (!farmerInBoat) return; // Farmer must steer

    // Move boat and characters
    const newSide: Side = boatSide === 'left' ? 'right' : 'left';
    const newBoatX = newSide === 'left' ? -4 : 4;
    const inBoatCharacters = characters.filter(c => c.inBoat);

    setCharacters(prev =>
      prev.map(char => {
        if (char.inBoat) {
          // Calculate offset for characters in boat (same as when loading)
          const charIndex = inBoatCharacters.findIndex(c => c.id === char.id);
          const offset = charIndex === 0 ? -1 : 1;

          return {
            ...char,
            side: newSide,
            position: {
              x: newBoatX + offset,
              y: 0.3,
              z: 0,
            },
          };
        }
        return char;
      })
    );

    setBoatSide(newSide);
    setStats(prev => ({ ...prev, moves: prev.moves + 1 }));

    // Check for conflicts after move (wait for animation)
    setTimeout(() => {
      checkGameRules();
    }, 800);
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
          characters={characters}
          boatSide={boatSide}
          onLoadCharacter={handleLoadIntoBoat}
          onUnloadCharacter={handleUnloadFromBoat}
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
