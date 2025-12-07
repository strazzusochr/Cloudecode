// Skill Panel - Original-style UI

import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { SkillType, SkillCounts } from '../src/types/game';

const SKILLS: SkillType[] = [
  'CLIMBER',
  'FLOATER',
  'BOMBER',
  'BLOCKER',
  'BUILDER',
  'BASHER',
  'MINER',
  'DIGGER',
];

const SKILL_ICONS: Record<SkillType, string> = {
  CLIMBER: 'CL',
  FLOATER: 'FL',
  BOMBER: 'BO',
  BLOCKER: 'BL',
  BUILDER: 'BU',
  BASHER: 'BA',
  MINER: 'MI',
  DIGGER: 'DI',
};

const SKILL_COLORS: Record<SkillType, string> = {
  CLIMBER: '#00ff00',
  FLOATER: '#00ffff',
  BOMBER: '#ff0000',
  BLOCKER: '#ff8800',
  BUILDER: '#ffff00',
  BASHER: '#ff00ff',
  MINER: '#8888ff',
  DIGGER: '#88ff88',
};

interface SkillPanelProps {
  selectedSkill: SkillType | null;
  onSkillSelect: (skill: SkillType) => void;
  skillCounts: SkillCounts;
  releaseRate: number;
  onReleaseRateChange: (rate: number) => void;
  onNuke: () => void;
  onPause: () => void;
  isPaused: boolean;
}

export default function SkillPanel({
  selectedSkill,
  onSkillSelect,
  skillCounts,
  releaseRate,
  onReleaseRateChange,
  onNuke,
  onPause,
  isPaused,
}: SkillPanelProps) {
  // Nuke requires double-click
  const [nukeClickCount, setNukeClickCount] = useState(0);

  const handleReleaseRateIncrease = useCallback(() => {
    onReleaseRateChange(Math.min(99, releaseRate + 1));
  }, [releaseRate, onReleaseRateChange]);

  const handleNukePress = useCallback(() => {
    if (nukeClickCount === 0) {
      setNukeClickCount(1);
      // Reset after 1 second
      setTimeout(() => setNukeClickCount(0), 1000);
    } else {
      setNukeClickCount(0);
      onNuke();
    }
  }, [nukeClickCount, onNuke]);

  return (
    <View style={styles.container}>
      {/* Release Rate */}
      <View style={styles.releaseRateContainer}>
        <TouchableOpacity
          style={[styles.rateButton, styles.rateButtonDisabled]}
          disabled
        >
          <Text style={styles.rateButtonText}>-</Text>
        </TouchableOpacity>

        <View style={styles.releaseRateDisplay}>
          <Text style={styles.releaseRateLabel}>RATE</Text>
          <Text style={styles.releaseRateValue}>
            {releaseRate.toString().padStart(2, '0')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.rateButton}
          onPress={handleReleaseRateIncrease}
        >
          <Text style={styles.rateButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Skill Buttons */}
      <View style={styles.skillsContainer}>
        {SKILLS.map((skill) => (
          <TouchableOpacity
            key={skill}
            style={[
              styles.skillButton,
              { borderColor: SKILL_COLORS[skill] },
              selectedSkill === skill && styles.skillButtonSelected,
              skillCounts[skill] === 0 && styles.skillButtonDisabled,
            ]}
            onPress={() => skillCounts[skill] > 0 && onSkillSelect(skill)}
            disabled={skillCounts[skill] === 0}
          >
            <Text
              style={[
                styles.skillIcon,
                { color: SKILL_COLORS[skill] },
                skillCounts[skill] === 0 && styles.skillIconDisabled,
              ]}
            >
              {SKILL_ICONS[skill]}
            </Text>
            <Text
              style={[
                styles.skillCount,
                skillCounts[skill] === 0 && styles.skillCountDisabled,
              ]}
            >
              {skillCounts[skill]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Pause Button */}
        <TouchableOpacity
          style={[styles.controlButton, isPaused && styles.controlButtonActive]}
          onPress={onPause}
        >
          <Text style={styles.controlButtonText}>{isPaused ? '▶' : '⏸'}</Text>
        </TouchableOpacity>

        {/* Nuke Button */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.nukeButton,
            nukeClickCount > 0 && styles.nukeButtonArmed,
          ]}
          onPress={handleNukePress}
        >
          <Text style={styles.controlButtonText}>
            {nukeClickCount > 0 ? '⚠' : '☢'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#1a1a2e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: '#4a4a6a',
  },
  releaseRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    padding: 5,
  },
  rateButton: {
    width: 30,
    height: 30,
    backgroundColor: '#3a3a5e',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rateButtonDisabled: {
    opacity: 0.3,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  releaseRateDisplay: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  releaseRateLabel: {
    color: '#888',
    fontSize: 8,
    fontWeight: 'bold',
  },
  releaseRateValue: {
    color: '#0f0',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  skillsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  skillButton: {
    width: 55,
    height: 60,
    backgroundColor: '#2a2a4e',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  skillButtonSelected: {
    backgroundColor: '#4a4a8e',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  skillButtonDisabled: {
    opacity: 0.4,
  },
  skillIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  skillIconDisabled: {
    color: '#666',
  },
  skillCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  skillCountDisabled: {
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 15,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: '#2a2a4e',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a4a6a',
  },
  controlButtonActive: {
    backgroundColor: '#4a4a8e',
    borderColor: '#0f0',
  },
  controlButtonText: {
    fontSize: 20,
  },
  nukeButton: {
    backgroundColor: '#4a2a2a',
    borderColor: '#8a2a2a',
  },
  nukeButtonArmed: {
    backgroundColor: '#8a2a2a',
    borderColor: '#f00',
    shadowColor: '#f00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
});
