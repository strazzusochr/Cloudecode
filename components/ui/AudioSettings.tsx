// Audio Settings UI Component

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSoundStore } from '../../src/stores/soundStore';

interface AudioSettingsProps {
  compact?: boolean;
}

export default function AudioSettings({ compact = false }: AudioSettingsProps) {
  const {
    sfxVolume,
    musicVolume,
    isSfxMuted,
    isMusicMuted,
    setSfxVolume,
    setMusicVolume,
    toggleSfxMute,
    toggleMusicMute,
    playSound,
  } = useSoundStore();

  const handleSfxVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, sfxVolume + delta));
    setSfxVolume(newVolume);
    playSound('click');
  };

  const handleMusicVolumeChange = (delta: number) => {
    const newVolume = Math.max(0, Math.min(1, musicVolume + delta));
    setMusicVolume(newVolume);
  };

  const handleSfxMuteToggle = () => {
    toggleSfxMute();
    if (!isSfxMuted) {
      // Will be muted after toggle, so don't play sound
    } else {
      playSound('click');
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <TouchableOpacity
          style={[styles.iconButton, isSfxMuted && styles.mutedButton]}
          onPress={handleSfxMuteToggle}
        >
          <Text style={styles.iconText}>{isSfxMuted ? '🔇' : '🔊'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, isMusicMuted && styles.mutedButton]}
          onPress={toggleMusicMute}
        >
          <Text style={styles.iconText}>{isMusicMuted ? '🎵' : '🎶'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Audio Settings</Text>

      {/* SFX Volume */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Sound Effects</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => handleSfxVolumeChange(-0.1)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.volumeBarContainer}>
            <View
              style={[
                styles.volumeBar,
                { width: `${sfxVolume * 100}%` },
                isSfxMuted && styles.mutedBar,
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => handleSfxVolumeChange(0.1)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.muteButton, isSfxMuted && styles.mutedButton]}
            onPress={handleSfxMuteToggle}
          >
            <Text style={styles.muteText}>{isSfxMuted ? 'OFF' : 'ON'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Music Volume */}
      <View style={styles.settingRow}>
        <Text style={styles.label}>Music</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => handleMusicVolumeChange(-0.1)}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <View style={styles.volumeBarContainer}>
            <View
              style={[
                styles.volumeBar,
                { width: `${musicVolume * 100}%` },
                isMusicMuted && styles.mutedBar,
              ]}
            />
          </View>
          <TouchableOpacity
            style={styles.volumeButton}
            onPress={() => handleMusicVolumeChange(0.1)}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.muteButton, isMusicMuted && styles.mutedButton]}
            onPress={toggleMusicMute}
          >
            <Text style={styles.muteText}>{isMusicMuted ? 'OFF' : 'ON'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Volume percentages */}
      <View style={styles.percentageRow}>
        <Text style={styles.percentageText}>
          SFX: {Math.round(sfxVolume * 100)}%
        </Text>
        <Text style={styles.percentageText}>
          Music: {Math.round(musicVolume * 100)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    minWidth: 300,
  },
  compactContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  settingRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  volumeBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  mutedBar: {
    backgroundColor: '#666',
  },
  muteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  mutedButton: {
    backgroundColor: '#666',
  },
  muteText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  percentageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  percentageText: {
    fontSize: 12,
    color: '#888',
  },
});
