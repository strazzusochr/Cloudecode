import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';

// Note: Full 3D implementation requires @react-three/fiber
// This is a placeholder that shows the UI and settings

export default function TechDemoScreen() {
  const [settings, setSettings] = useState({
    shadows: true,
    ssao: true,
    bloom: true,
    dof: false,
    antialiasing: true,
    reflections: true,
  });

  const [stats, setStats] = useState({
    fps: 60,
    drawCalls: 45,
    triangles: 125000,
    memory: 256,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>HIGH-FIDELITY TECH DEMO</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 3D Canvas Placeholder */}
      <View style={styles.canvasContainer}>
        <View style={styles.canvas}>
          <Text style={styles.canvasTitle}>High-Poly 3D Scene</Text>
          <Text style={styles.canvasSubtext}>100,000+ Polygons</Text>
          <Text style={styles.canvasSubtext}>PBR Materials + Post-Processing</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureText}>✓ Dynamic Shadows</Text>
            <Text style={styles.featureText}>✓ Screen Space Ambient Occlusion</Text>
            <Text style={styles.featureText}>✓ Bloom Effects</Text>
            <Text style={styles.featureText}>✓ Environment Mapping</Text>
            <Text style={styles.featureText}>✓ Toon Shading</Text>
          </View>
        </View>
      </View>

      {/* Performance Stats */}
      <View style={styles.statsPanel}>
        <Text style={styles.statsTitle}>PERFORMANCE</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.fps}</Text>
            <Text style={styles.statLabel}>FPS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.drawCalls}</Text>
            <Text style={styles.statLabel}>Draw Calls</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(stats.triangles / 1000).toFixed(0)}K</Text>
            <Text style={styles.statLabel}>Triangles</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.memory}MB</Text>
            <Text style={styles.statLabel}>Memory</Text>
          </View>
        </View>
      </View>

      {/* Settings Panel */}
      <View style={styles.settingsPanel}>
        <Text style={styles.settingsTitle}>RENDERING SETTINGS</Text>
        <View style={styles.settingsList}>
          {Object.entries(settings).map(([key, value]) => (
            <View key={key} style={styles.settingRow}>
              <Text style={styles.settingLabel}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Switch
                value={value}
                onValueChange={() => toggleSetting(key as keyof typeof settings)}
                trackColor={{ false: '#3a3a5e', true: '#4CAF50' }}
                thumbColor={value ? '#fff' : '#888'}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tech Demo showcasing advanced 3D rendering capabilities
        </Text>
        <Text style={styles.footerSubtext}>
          React Three Fiber + Three.js + Post-Processing
        </Text>
      </View>
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
    padding: 15,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00BCD4',
    letterSpacing: 2,
  },
  placeholder: {
    width: 80,
  },
  canvasContainer: {
    flex: 1,
    margin: 15,
    borderRadius: 12,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#0a0a1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasTitle: {
    color: '#00BCD4',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  canvasSubtext: {
    color: '#666',
    fontSize: 16,
    marginBottom: 5,
  },
  featureList: {
    marginTop: 30,
    alignItems: 'flex-start',
  },
  featureText: {
    color: '#4CAF50',
    fontSize: 14,
    marginBottom: 5,
  },
  statsPanel: {
    position: 'absolute',
    top: 70,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 12,
    minWidth: 200,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  settingsPanel: {
    position: 'absolute',
    top: 70,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 15,
    borderRadius: 12,
    minWidth: 220,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingsList: {
    gap: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#3a3a5e',
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
  },
  footerSubtext: {
    color: '#666',
    fontSize: 10,
    marginTop: 3,
  },
});
