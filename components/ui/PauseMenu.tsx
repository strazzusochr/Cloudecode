// Pause Menu Component

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import AudioSettings from './AudioSettings';

const { width } = Dimensions.get('window');

interface PauseMenuProps {
  visible: boolean;
  levelName?: string;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export default function PauseMenu({
  visible,
  levelName = 'Level',
  onResume,
  onRestart,
  onExit,
}: PauseMenuProps) {
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>PAUSED</Text>
            {levelName && <Text style={styles.levelName}>{levelName}</Text>}
          </View>

          {/* Menu Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.resumeButton]}
              onPress={onResume}
            >
              <Text style={styles.buttonText}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.restartButton]}
              onPress={onRestart}
            >
              <Text style={styles.buttonText}>RESTART</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.settingsButton]}
              onPress={() => setShowAudioSettings(!showAudioSettings)}
            >
              <Text style={styles.buttonText}>
                {showAudioSettings ? 'HIDE AUDIO' : 'AUDIO'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.exitButton]}
              onPress={onExit}
            >
              <Text style={styles.buttonText}>EXIT</Text>
            </TouchableOpacity>
          </View>

          {/* Audio Settings Panel */}
          {showAudioSettings && (
            <View style={styles.audioPanel}>
              <AudioSettings />
            </View>
          )}

          {/* Keyboard Hints */}
          <View style={styles.hintsContainer}>
            <Text style={styles.hintText}>Press ESC or P to resume</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Math.min(400, width - 40),
    borderRadius: 16,
    padding: 24,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 6,
  },
  levelName: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  restartButton: {
    backgroundColor: 'transparent',
    borderColor: '#FF9800',
  },
  settingsButton: {
    backgroundColor: 'transparent',
    borderColor: '#2196F3',
  },
  exitButton: {
    backgroundColor: 'transparent',
    borderColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  audioPanel: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  hintsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#666',
  },
});
