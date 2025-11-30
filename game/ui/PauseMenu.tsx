import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Switch,
  Dimensions,
} from 'react-native';
import { GameSettings } from '../../types/game';

const { width } = Dimensions.get('window');

interface PauseMenuProps {
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onSettings: (settings: GameSettings) => void;
  onExit: () => void;
}

export default function PauseMenu({
  settings,
  onResume,
  onRestart,
  onSettings,
  onExit,
}: PauseMenuProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettings(newSettings);
  };

  if (showSettings) {
    return (
      <Modal transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Einstellungen ⚙️</Text>

            {/* Music Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Musik 🎵</Text>
              <Switch
                value={localSettings.musicEnabled}
                onValueChange={(value) => handleSettingChange('musicEnabled', value)}
                trackColor={{ false: '#CCC', true: '#4CAF50' }}
                thumbColor="#FFF"
              />
            </View>

            {/* SFX Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Soundeffekte 🔊</Text>
              <Switch
                value={localSettings.sfxEnabled}
                onValueChange={(value) => handleSettingChange('sfxEnabled', value)}
                trackColor={{ false: '#CCC', true: '#4CAF50' }}
                thumbColor="#FFF"
              />
            </View>

            {/* Tutorial Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tutorial 📖</Text>
              <Switch
                value={localSettings.tutorialEnabled}
                onValueChange={(value) => handleSettingChange('tutorialEnabled', value)}
                trackColor={{ false: '#CCC', true: '#4CAF50' }}
                thumbColor="#FFF"
              />
            </View>

            {/* Graphics Quality */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Grafik-Qualität</Text>
              <View style={styles.qualityButtons}>
                {(['auto', 'low', 'medium', 'high'] as const).map((quality) => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityButton,
                      localSettings.graphicsQuality === quality &&
                        styles.qualityButtonActive,
                    ]}
                    onPress={() => handleSettingChange('graphicsQuality', quality)}
                  >
                    <Text
                      style={[
                        styles.qualityButtonText,
                        localSettings.graphicsQuality === quality &&
                          styles.qualityButtonTextActive,
                      ]}
                    >
                      {quality === 'auto'
                        ? 'Auto'
                        : quality === 'low'
                        ? 'Niedrig'
                        : quality === 'medium'
                        ? 'Mittel'
                        : 'Hoch'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Back Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.primaryButtonText}>← Zurück</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Pause ⏸</Text>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuButton} onPress={onResume}>
              <Text style={styles.menuButtonIcon}>▶️</Text>
              <Text style={styles.menuButtonText}>Weiterspielen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton} onPress={onRestart}>
              <Text style={styles.menuButtonIcon}>🔄</Text>
              <Text style={styles.menuButtonText}>Neustart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.menuButtonIcon}>⚙️</Text>
              <Text style={styles.menuButtonText}>Einstellungen</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuButton} onPress={onExit}>
              <Text style={styles.menuButtonIcon}>🚪</Text>
              <Text style={styles.menuButtonText}>Level verlassen</Text>
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    width: Math.min(width - 40, 400),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  menuContainer: {
    gap: 12,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  menuButtonIcon: {
    fontSize: 24,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  qualityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DDD',
    backgroundColor: '#FFF',
  },
  qualityButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  qualityButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  qualityButtonTextActive: {
    color: '#4CAF50',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
});
