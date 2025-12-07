// Minimap Component

import React, { useMemo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../src/stores/gameStore';
import { queries } from '../ecs/index';
import { getTerrainData, getTerrainDimensions, TerrainType } from '../src/terrain/terrainUtils';
import { getThemeConfig } from '../src/themes';

const MINIMAP_WIDTH = 150;
const MINIMAP_HEIGHT = 80;

export default function Minimap() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const setCameraPosition = useGameStore((state) => state.setCameraPosition);

  if (!currentLevel) return null;

  const handlePress = (event: any) => {
    // Calculate normalized position
    const { locationX, locationY } = event.nativeEvent;
    const normalizedX = (locationX / MINIMAP_WIDTH) * currentLevel.width;
    const normalizedY = (locationY / MINIMAP_HEIGHT) * currentLevel.height;

    setCameraPosition({
      x: normalizedX * 0.1,
      y: -normalizedY * 0.1,
      z: 15,
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Canvas
        orthographic
        camera={{ zoom: 1, position: [0, 0, 10], near: 0.1, far: 100 }}
        style={styles.canvas}
      >
        <MinimapContent level={currentLevel} />
      </Canvas>

      {/* Border overlay */}
      <View style={styles.border} pointerEvents="none" />
    </TouchableOpacity>
  );
}

function MinimapContent({ level }: { level: any }) {
  const terrainRef = useRef<THREE.Mesh>(null);
  const lemmingPointsRef = useRef<THREE.Points>(null);
  const theme = useMemo(() => getThemeConfig(level.themeId), [level.themeId]);

  // Generate terrain texture
  const terrainTexture = useMemo(() => {
    const terrainData = getTerrainData();
    const { width, height } = getTerrainDimensions();

    // Create canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const imageData = ctx.createImageData(width, height);

      for (let i = 0; i < terrainData.length; i++) {
        const pixel = i * 4;
        const type = terrainData[i];

        let r = 0, g = 0, b = 0, a = 100;

        switch (type) {
          case TerrainType.SOLID:
            r = parseInt(theme.solidColor.slice(1, 3), 16);
            g = parseInt(theme.solidColor.slice(3, 5), 16);
            b = parseInt(theme.solidColor.slice(5, 7), 16);
            a = 255;
            break;
          case TerrainType.STEEL:
            r = 128; g = 128; b = 128; a = 255;
            break;
          case TerrainType.WATER:
            r = 0; g = 100; b = 255; a = 255;
            break;
          case TerrainType.LAVA:
            r = 255; g = 50; b = 0; a = 255;
            break;
          case TerrainType.SPAWN:
            r = 0; g = 255; b = 0; a = 255;
            break;
          case TerrainType.EXIT:
            r = 255; g = 255; b = 0; a = 255;
            break;
        }

        imageData.data[pixel] = r;
        imageData.data[pixel + 1] = g;
        imageData.data[pixel + 2] = b;
        imageData.data[pixel + 3] = a;
      }

      ctx.putImageData(imageData, 0, 0);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    return texture;
  }, [level, theme]);

  // Update lemming points every frame
  useFrame(() => {
    if (!lemmingPointsRef.current) return;

    const activeLemmings = queries.getActiveLemmings();
    const { width, height } = getTerrainDimensions();

    const positions: number[] = [];
    const colors: number[] = [];

    for (const lemming of activeLemmings) {
      // Convert world position to minimap position
      const x = (lemming.position.x / 0.1 / width - 0.5) * 10;
      const y = (-lemming.position.y / 0.1 / height - 0.5) * -5.33;

      positions.push(x, y, 0.1);

      // Color based on state
      if (lemming.state === 'BLOCKING') {
        colors.push(1, 0, 0);
      } else if (lemming.bomberTimer > 0) {
        colors.push(1, 0.5, 0);
      } else {
        colors.push(0, 1, 0);
      }
    }

    const geometry = lemmingPointsRef.current.geometry as THREE.BufferGeometry;

    if (positions.length > 0) {
      geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
      );
      geometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(colors, 3)
      );
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  });

  const { width, height } = getTerrainDimensions();
  const aspectRatio = width / height;
  const mapWidth = 10;
  const mapHeight = mapWidth / aspectRatio;

  return (
    <>
      {/* Terrain background */}
      <mesh ref={terrainRef}>
        <planeGeometry args={[mapWidth, mapHeight]} />
        <meshBasicMaterial map={terrainTexture} transparent />
      </mesh>

      {/* Lemming points */}
      <points ref={lemmingPointsRef}>
        <bufferGeometry />
        <pointsMaterial size={0.2} vertexColors />
      </points>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 70,
    right: 10,
    width: MINIMAP_WIDTH,
    height: MINIMAP_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#111',
  },
  border: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#4a4a6a',
    borderRadius: 8,
  },
});
