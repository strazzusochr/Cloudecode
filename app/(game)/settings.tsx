import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Switch,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSoundStore } from '../../src/stores/soundStore';
import { useProgressStore } from '../../src/stores/progressStore';
import AudioSettings from '../../components/ui/AudioSettings';

const { width } = Dimensions.get('window');

interface SettingToggleProps {
  label: string;
  value: boolean;
  onToggle: () => void;
  description?: string;
}

function SettingToggle({ label, value, onToggle, description }: SettingToggleProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#444', true: '#4CAF50' }}
        thumbColor={value ? '#fff' : '#888'}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const { playSound, resetProgress } = {
    playSound: useSoundStore((s) => s.playSound),
    resetProgress: useProgressStore((s) => s.resetProgress),
  };
  const { getTotalStars, getTotalCompleted } = useProgressStore();

  // Graphics settings (stored locally for now)
  const [showParticles, setShowParticles] = useState(true);
  const [showShadows, setShowShadows] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [confirmResetModal, setConfirmResetModal] = useState(false);

  const totalStars = getTotalStars();
  const totalCompleted = getTotalCompleted();

  const handleBack = () => {
    playSound('click');
    router.back();
  };

  const handleResetProgress = () => {
    setConfirmResetModal(true);
  };

  const confirmReset = () => {
    resetProgress();
    setConfirmResetModal(false);
    playSound('click');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SETTINGS</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          <View style={styles.sectionContent}>
            <AudioSettings />
          </View>
        </View>

        {/* Graphics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GRAPHICS</Text>
          <View style={styles.sectionContent}>
            <SettingToggle
              label="Particle Effects"
              value={showParticles}
              onToggle={() => setShowParticles(!showParticles)}
              description="Explosions, digging particles, etc."
            />
            <SettingToggle
              label="Shadows"
              value={showShadows}
              onToggle={() => setShowShadows(!showShadows)}
              description="Dynamic shadows (may affect performance)"
            />
            <SettingToggle
              label="Minimap"
              value={showMinimap}
              onToggle={() => setShowMinimap(!showMinimap)}
              description="Show level overview during gameplay"
            />
          </View>
        </View>

        {/* Controls Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KEYBOARD SHORTCUTS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>1-8</Text>
              <Text style={styles.shortcutDesc}>Select skills</Text>
            </View>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>P / ESC</Text>
              <Text style={styles.shortcutDesc}>Pause / Resume</Text>
            </View>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>+ / -</Text>
              <Text style={styles.shortcutDesc}>Adjust release rate</Text>
            </View>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>Mouse</Text>
              <Text style={styles.shortcutDesc}>Click lemming to assign skill</Text>
            </View>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>Drag</Text>
              <Text style={styles.shortcutDesc}>Rotate camera view</Text>
            </View>
            <View style={styles.shortcutRow}>
              <Text style={styles.shortcutKey}>Scroll</Text>
              <Text style={styles.shortcutDesc}>Zoom in/out</Text>
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROGRESS</Text>
          <View style={styles.sectionContent}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalCompleted}</Text>
                <Text style={styles.statLabel}>Levels Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalStars}</Text>
                <Text style={styles.statLabel}>Total Stars</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor(totalCompleted / 120 * 100)}%</Text>
                <Text style={styles.statLabel}>Game Progress</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetProgress}
            >
              <Text style={styles.resetButtonText}>RESET ALL PROGRESS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.sectionContent}>
            <Text style={styles.aboutText}>Lemmings 3D Clone</Text>
            <Text style={styles.aboutSubtext}>PSP 2006 Edition</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutTech}>
              Built with React Native, Expo, Three.js
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Reset Confirmation Modal */}
      {confirmResetModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Reset Progress?</Text>
            <Text style={styles.modalText}>
              This will delete all your saved progress, including completed levels and stars.
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setConfirmResetModal(false)}
              >
                <Text style={styles.modalButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmReset}
              >
                <Text style={styles.modalButtonText}>RESET</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 4,
  },
  placeholder: {
    width: 80,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    letterSpacing: 2,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a5e',
  },
  shortcutKey: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
    width: 80,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  shortcutDesc: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  aboutText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  aboutSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  aboutVersion: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  aboutTech: {
    fontSize: 11,
    color: '#555',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Math.min(400, width - 40),
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  confirmButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
