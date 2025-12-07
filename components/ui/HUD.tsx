// Heads-Up Display

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime, getTimeWarningLevel, calculatePercentage } from '../../src/utils/timeUtils';

interface HUDProps {
  timeRemaining: number;
  lemmingsOut: number;
  lemmingsSaved: number;
  lemmingsRequired: number;
  totalLemmings: number;
}

export default function HUD({
  timeRemaining,
  lemmingsOut,
  lemmingsSaved,
  lemmingsRequired,
  totalLemmings,
}: HUDProps) {
  const percentage = calculatePercentage(lemmingsSaved, totalLemmings);
  const requiredPercentage = calculatePercentage(lemmingsRequired, totalLemmings);
  const timeWarning = getTimeWarningLevel(timeRemaining);

  const isOnTrack = percentage >= requiredPercentage || lemmingsSaved >= lemmingsRequired;

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View
        style={[
          styles.infoBox,
          timeWarning === 'warning' && styles.infoBoxWarning,
          timeWarning === 'critical' && styles.infoBoxCritical,
        ]}
      >
        <Text style={styles.label}>TIME</Text>
        <Text
          style={[
            styles.value,
            timeWarning === 'warning' && styles.valueWarning,
            timeWarning === 'critical' && styles.valueCritical,
          ]}
        >
          {formatTime(timeRemaining)}
        </Text>
      </View>

      {/* OUT Counter */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>OUT</Text>
        <Text style={styles.value}>{lemmingsOut}</Text>
      </View>

      {/* IN Counter (Saved) */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>IN</Text>
        <Text style={[styles.value, styles.valueGreen]}>{lemmingsSaved}</Text>
      </View>

      {/* Percentage */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>SAVED</Text>
        <Text
          style={[
            styles.value,
            isOnTrack ? styles.valueGreen : styles.valueRed,
          ]}
        >
          {percentage}%
        </Text>
        <Text style={styles.sublabel}>need {requiredPercentage}%</Text>
      </View>

      {/* Required Count */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>GOAL</Text>
        <Text style={styles.value}>
          {lemmingsSaved}/{lemmingsRequired}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  infoBox: {
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a4a6a',
    alignItems: 'center',
    minWidth: 70,
  },
  infoBoxWarning: {
    borderColor: '#ff8800',
    backgroundColor: 'rgba(46, 36, 26, 0.9)',
  },
  infoBoxCritical: {
    borderColor: '#ff0000',
    backgroundColor: 'rgba(46, 26, 26, 0.9)',
  },
  label: {
    color: '#888',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sublabel: {
    color: '#666',
    fontSize: 8,
    marginTop: 2,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  valueGreen: {
    color: '#0f0',
  },
  valueRed: {
    color: '#f00',
  },
  valueWarning: {
    color: '#ff8800',
  },
  valueCritical: {
    color: '#ff0000',
  },
});
