import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { OPTIMAL_MOVES } from '../../types/game';

interface GameHUDProps {
  moves: number;
  timeElapsed: number;
  onPause: () => void;
  onCrossRiver: () => void;
  canCross: boolean;
}

export default function GameHUD({
  moves,
  timeElapsed,
  onPause,
  onCrossRiver,
  canCross,
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

        {/* Cross River Button */}
        <TouchableOpacity
          style={[
            styles.mainButton,
            canCross ? styles.mainButtonActive : styles.mainButtonInactive,
          ]}
          onPress={onCrossRiver}
          disabled={!canCross}
        >
          <Text style={styles.mainButtonText}>
            {canCross ? 'ÜBERSETZEN 🚣' : 'Warte...'}
          </Text>
        </TouchableOpacity>

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
