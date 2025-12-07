import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { useSoundStore } from '../../src/stores/soundStore';
import AudioSettings from '../../components/ui/AudioSettings';

const { width } = Dimensions.get('window');

export default function MenuScreen() {
  const { playMusic, playSound, preloadAllSounds, isLoaded } = useSoundStore();

  // Initialize audio on mount
  useEffect(() => {
    if (!isLoaded) {
      preloadAllSounds().then(() => {
        playMusic('menu', true);
      });
    } else {
      playMusic('menu', true);
    }
  }, []);

  const handleMenuPress = (route: string) => {
    playSound('click');
    router.push(route as any);
  };
  const menuItems = [
    { label: 'PLAY', route: '/(game)/level-select/FUN' as const, color: '#4CAF50' },
    { label: 'EDITOR', route: '/(game)/editor' as const, color: '#2196F3' },
    { label: 'BROWSE LEVELS', route: '/(game)/browse' as const, color: '#FF9800' },
    { label: 'SETTINGS', route: '/(game)/settings' as const, color: '#607D8B' },
    { label: 'ASSET MANAGER', route: '/(game)/asset-manager' as const, color: '#9C27B0' },
    { label: 'SCENE EXPLORER', route: '/(game)/scene-explorer' as const, color: '#E91E63' },
    { label: 'TECH DEMO', route: '/(game)/tech-demo' as const, color: '#00BCD4' },
  ];

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>LEMMINGS</Text>
        <Text style={styles.subtitle}>3D CLONE</Text>
        <Text style={styles.version}>PSP 2006 Edition</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuButton, { borderColor: item.color }]}
            onPress={() => handleMenuPress(item.route)}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuButtonText, { color: item.color }]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Audio Controls */}
      <View style={styles.audioControls}>
        <AudioSettings compact />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>High-End 3D Web Game</Text>
        <Text style={styles.footerText}>100,000+ Polygons</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#00ff00',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 12,
    marginTop: -10,
  },
  version: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  menuContainer: {
    width: Math.min(400, width - 40),
    gap: 15,
  },
  menuButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
  },
  audioControls: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
});
