import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { OPTIMAL_MOVES, Character } from '../../types/game';

interface GameHUDProps {
  moves: number;
  timeElapsed: number;
  onPause: () => void;
  onCrossRiver: () => void;
  canCross: boolean;
  characters: Character[];
  boatSide: 'left' | 'right';
  onLoadCharacter?: () => void;
  onUnloadCharacter?: () => void;
  isAnimating?: boolean;
}

export default function GameHUD({
  moves,
  timeElapsed,
  onPause,
  onCrossRiver,
  canCross,
  characters,
  boatSide,
  onLoadCharacter,
  onUnloadCharacter,
  isAnimating = false,
}: GameHUDProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarDisplay = () => {
    if (moves <= OPTIMAL_MOVES && timeElapsed <= 120) return '⭐⭐⭐';
    if (moves <= 9 && timeElapsed <= 180) return '⭐⭐';
    return '⭐';
  };

  // Get selected character
  const selectedChar = characters.find((c) => c.selected);
  const inBoatCount = characters.filter((c) => c.inBoat).length;
  const farmerInBoat = characters.some((c) => c.type === 'farmer' && c.inBoat);

  // Determine if we can load the selected character
  const canLoad =
    selectedChar &&
    !selectedChar.inBoat &&
    selectedChar.side === boatSide &&
    inBoatCount < 2 &&
    (selectedChar.type === 'farmer' || farmerInBoat);

  // Determine if we can unload the selected character
  const canUnload = selectedChar && selectedChar.inBoat;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        {/* Moves Counter */}
        <View style={styles.counterBox}>
          <Text style={styles.label}>Züge</Text>
          <Text style={styles.value}>{moves}/{OPTIMAL_MOVES}</Text>
        </View>

        {/* Level Title */}
        <View style={styles.centerBox}>
          <Text style={styles.levelTitle}>Level 1 - Tutorial</Text>
          <Text style={styles.stars}>{getStarDisplay()}</Text>
          {/* Boat Capacity Indicator */}
          {inBoatCount > 0 && (
            <View style={styles.boatCapacity}>
              <Text style={styles.boatCapacityText}>
                🚣 {inBoatCount}/2
              </Text>
            </View>
          )}
        </View>

        {/* Time Counter */}
        <View style={styles.counterBox}>
          <Text style={styles.label}>Zeit</Text>
          <Text style={styles.value}>{formatTime(timeElapsed)}</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomBar}>
        {/* Pause Button */}
        <TouchableOpacity style={styles.iconButton} onPress={onPause}>
          <Text style={styles.iconText}>⏸</Text>
        </TouchableOpacity>

        {/* Character Control Buttons */}
        <View style={styles.centerControls}>
          {/* Load Button */}
          {canLoad && onLoadCharacter && !isAnimating && (
            <TouchableOpacity
              style={[styles.actionButton, styles.loadButton]}
              onPress={onLoadCharacter}
            >
              <Text style={styles.actionButtonText}>↓ EINSTEIGEN</Text>
            </TouchableOpacity>
          )}

          {/* Unload Button */}
          {canUnload && onUnloadCharacter && !isAnimating && (
            <TouchableOpacity
              style={[styles.actionButton, styles.unloadButton]}
              onPress={onUnloadCharacter}
            >
              <Text style={styles.actionButtonText}>↑ AUSSTEIGEN</Text>
            </TouchableOpacity>
          )}

          {/* Cross River Button */}
          <TouchableOpacity
            style={[
              styles.mainButton,
              canCross && !isAnimating ? styles.mainButtonActive : styles.mainButtonInactive,
            ]}
            onPress={onCrossRiver}
            disabled={!canCross || isAnimating}
          >
            <Text style={styles.mainButtonText}>
              {isAnimating ? '🚣 ...' : canCross ? 'ÜBERSETZEN 🚣' : 'Warte...'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Button */}
        <TouchableOpacity style={styles.iconButton}>
          <Text style={styles.iconText}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  counterBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  centerBox: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  stars: {
    fontSize: 20,
    marginTop: 4,
  },
  boatCapacity: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  boatCapacityText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  centerControls: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconText: {
    fontSize: 24,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 160,
  },
  loadButton: {
    backgroundColor: '#2196F3',
  },
  unloadButton: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainButtonActive: {
    backgroundColor: '#4CAF50',
  },
  mainButtonInactive: {
    backgroundColor: '#CCCCCC',
  },
  mainButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
