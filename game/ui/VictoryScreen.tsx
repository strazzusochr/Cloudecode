import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { GameStats, OPTIMAL_MOVES } from '../../types/game';

const { width, height } = Dimensions.get('window');

interface VictoryScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onNextLevel: () => void;
}

export default function VictoryScreen({ stats, onRestart, onNextLevel }: VictoryScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animate card entrance
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Animate confetti
    confettiAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000,
        delay: index * 50,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarText = () => {
    switch (stats.stars) {
      case 3:
        return '⭐⭐⭐ PERFEKT!';
      case 2:
        return '⭐⭐ SEHR GUT!';
      case 1:
        return '⭐ GESCHAFFT!';
      default:
        return '✓ GESCHAFFT!';
    }
  };

  const getMessage = () => {
    if (stats.stars === 3) {
      return 'Du hast die optimale Lösung gefunden! Unglaublich!';
    } else if (stats.stars === 2) {
      return 'Sehr gut gemacht! Versuche es in 7 Zügen für 3 Sterne!';
    } else {
      return 'Level geschafft! Kannst du es besser machen?';
    }
  };

  return (
    <Modal transparent animationType="none">
      <View style={styles.overlay}>
        {/* Confetti */}
        {confettiAnims.map((anim, index) => {
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-50, height],
          });

          const translateX = Math.sin(index) * 100;
          const rotation = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '720deg'],
          });

          const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'];
          const color = colors[index % colors.length];

          return (
            <Animated.View
              key={index}
              style={[
                styles.confetti,
                {
                  left: (index * width) / 20,
                  backgroundColor: color,
                  transform: [
                    { translateY },
                    { translateX },
                    { rotate: rotation },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Victory Card */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>LEVEL 1 GESCHAFFT!</Text>

          <Text style={styles.starText}>{getStarText()}</Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Züge</Text>
              <Text style={styles.statValue}>{stats.moves}</Text>
              <Text style={styles.statOptimal}>
                {stats.moves === OPTIMAL_MOVES ? '✓ Optimal!' : `Optimal: ${OPTIMAL_MOVES}`}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Zeit</Text>
              <Text style={styles.statValue}>{formatTime(stats.timeElapsed)}</Text>
              <Text style={styles.statOptimal}>
                {stats.timeElapsed <= 120 ? '✓ Schnell!' : 'Ziel: 2:00'}
              </Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>{getMessage()}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onRestart}>
              <Text style={styles.secondaryButtonText}>🔄 Nochmal</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={onNextLevel}>
              <Text style={styles.primaryButtonText}>Weiter zu Level 2 →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: Math.min(width - 40, 500),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  starText: {
    fontSize: 32,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  statOptimal: {
    fontSize: 12,
    color: '#999',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
});
