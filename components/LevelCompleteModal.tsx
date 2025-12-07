// Level Complete Modal

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { calculatePercentage } from '../src/utils/timeUtils';

const { width } = Dimensions.get('window');

interface LevelCompleteModalProps {
  success: boolean;
  saved: number;
  required: number;
  total: number;
  onRetry: () => void;
  onExit: () => void;
}

export default function LevelCompleteModal({
  success,
  saved,
  required,
  total,
  onRetry,
  onExit,
}: LevelCompleteModalProps) {
  const percentage = calculatePercentage(saved, total);
  const requiredPercentage = calculatePercentage(required, total);

  // Calculate stars based on performance
  const getStars = () => {
    if (!success) return 0;
    const extra = saved - required;
    if (extra >= 10) return 3;
    if (extra >= 5) return 2;
    return 1;
  };

  const stars = getStars();

  // Get message based on result
  const getMessage = () => {
    if (!success) {
      if (saved === 0) return "Not a single lemming saved!";
      if (saved < required / 2) return "You need more practice!";
      return "So close! Try again!";
    }

    if (stars === 3) return "PERFECT! All lemmings saved!";
    if (stars === 2) return "Great job! Well done!";
    return "Level Complete!";
  };

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, success ? styles.modalSuccess : styles.modalFail]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, success ? styles.titleSuccess : styles.titleFail]}>
              {success ? 'VICTORY!' : 'GAME OVER'}
            </Text>
          </View>

          {/* Stars (only for success) */}
          {success && (
            <View style={styles.starsContainer}>
              {[1, 2, 3].map((i) => (
                <Text
                  key={i}
                  style={[styles.star, i <= stars ? styles.starActive : styles.starInactive]}
                >
                  ★
                </Text>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Saved:</Text>
              <Text style={[styles.statValue, saved >= required ? styles.statValueGood : styles.statValueBad]}>
                {saved} / {total}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Required:</Text>
              <Text style={styles.statValue}>
                {required} ({requiredPercentage}%)
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Your Score:</Text>
              <Text style={[styles.statValue, success ? styles.statValueGood : styles.statValueBad]}>
                {percentage}%
              </Text>
            </View>
          </View>

          {/* Message */}
          <Text style={styles.message}>{getMessage()}</Text>

          {/* Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.retryButton]}
              onPress={onRetry}
            >
              <Text style={styles.buttonText}>RETRY</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exitButton]}
              onPress={onExit}
            >
              <Text style={styles.buttonText}>EXIT</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  modal: {
    width: Math.min(400, width - 40),
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
  },
  modalSuccess: {
    backgroundColor: '#1a2e1a',
    borderColor: '#4CAF50',
  },
  modalFail: {
    backgroundColor: '#2e1a1a',
    borderColor: '#f44336',
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  titleSuccess: {
    color: '#4CAF50',
  },
  titleFail: {
    color: '#f44336',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  star: {
    fontSize: 40,
  },
  starActive: {
    color: '#FFD700',
    textShadowColor: '#FFD700',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  starInactive: {
    color: '#444',
  },
  statsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 14,
  },
  statValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  statValueGood: {
    color: '#4CAF50',
  },
  statValueBad: {
    color: '#f44336',
  },
  message: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#4CAF50',
  },
  exitButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
