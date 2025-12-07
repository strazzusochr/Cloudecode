import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';

// Note: Full 3D implementation requires @react-three/fiber
// This is a placeholder that shows the UI structure

export default function SceneExplorerScreen() {
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 5, z: 0 });
  const [objectCount, setObjectCount] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handlePointerLockChange = () => {
        setIsPointerLocked(document.pointerLockElement !== null);
      };

      document.addEventListener('pointerlockchange', handlePointerLockChange);
      return () => {
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
      };
    }
  }, []);

  const handleCanvasClick = () => {
    if (Platform.OS === 'web' && !isPointerLocked) {
      document.body.requestPointerLock?.();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'<'} EXIT</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SCENE EXPLORER</Text>
        <View style={styles.headerRight}>
          <Text style={styles.fpsText}>FPS: 60</Text>
        </View>
      </View>

      {/* 3D Canvas Placeholder */}
      <TouchableOpacity
        style={styles.canvasContainer}
        onPress={handleCanvasClick}
        activeOpacity={1}
      >
        <View style={styles.canvas}>
          <Text style={styles.canvasTitle}>First-Person 3D Scene</Text>
          <Text style={styles.canvasSubtext}>
            {Platform.OS === 'web'
              ? isPointerLocked
                ? 'Press ESC to release cursor'
                : 'Click to enable mouse look'
              : '3D rendering requires web platform'}
          </Text>

          {/* Crosshair */}
          <View style={styles.crosshair}>
            <View style={styles.crosshairH} />
            <View style={styles.crosshairV} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Controls Info */}
      <View style={styles.controlsOverlay}>
        <Text style={styles.controlsTitle}>CONTROLS</Text>
        <Text style={styles.controlText}>WASD - Move</Text>
        <Text style={styles.controlText}>Mouse - Look</Text>
        <Text style={styles.controlText}>Space - Jump</Text>
        <Text style={styles.controlText}>E - Place Object</Text>
        <Text style={styles.controlText}>R - Remove Object</Text>
        <Text style={styles.controlText}>1-9 - Select Object</Text>
      </View>

      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <Text style={styles.statsText}>
          Position: ({playerPosition.x.toFixed(1)}, {playerPosition.y.toFixed(1)},{' '}
          {playerPosition.z.toFixed(1)})
        </Text>
        <Text style={styles.statsText}>Objects: {objectCount}</Text>
      </View>

      {/* Object Palette */}
      <View style={styles.objectPalette}>
        <Text style={styles.paletteTitle}>OBJECTS</Text>
        <View style={styles.paletteItems}>
          {['Cube', 'Sphere', 'Cylinder', 'Cone', 'Tree', 'Rock'].map((obj, i) => (
            <TouchableOpacity key={obj} style={styles.paletteItem}>
              <Text style={styles.paletteItemNumber}>{i + 1}</Text>
              <Text style={styles.paletteItemText}>{obj}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save/Load Controls */}
      <View style={styles.sceneControls}>
        <TouchableOpacity style={styles.sceneButton}>
          <Text style={styles.sceneButtonText}>SAVE SCENE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sceneButton}>
          <Text style={styles.sceneButtonText}>LOAD SCENE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sceneButton, styles.clearButton]}>
          <Text style={styles.sceneButtonText}>CLEAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E91E63',
    letterSpacing: 2,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  fpsText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  canvasContainer: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasTitle: {
    color: '#666',
    fontSize: 24,
    fontWeight: 'bold',
  },
  canvasSubtext: {
    color: '#444',
    fontSize: 14,
    marginTop: 10,
  },
  crosshair: {
    position: 'absolute',
    width: 20,
    height: 20,
  },
  crosshairH: {
    position: 'absolute',
    top: 9,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#fff',
  },
  crosshairV: {
    position: 'absolute',
    left: 9,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#fff',
  },
  controlsOverlay: {
    position: 'absolute',
    left: 20,
    bottom: 80,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  controlsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controlText: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 3,
  },
  statsOverlay: {
    position: 'absolute',
    left: 20,
    top: 60,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
  },
  statsText: {
    color: '#4CAF50',
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  objectPalette: {
    position: 'absolute',
    right: 20,
    top: 60,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    width: 120,
  },
  paletteTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  paletteItems: {
    gap: 5,
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  paletteItemNumber: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
    width: 20,
  },
  paletteItemText: {
    color: '#fff',
    fontSize: 12,
  },
  sceneControls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    gap: 10,
  },
  sceneButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  sceneButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
