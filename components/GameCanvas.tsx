// Main 3D Game Canvas

import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, Text } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../src/stores/gameStore';
import { world, queries } from '../ecs/index';
import { getTerrainData, getTerrainDimensions, TerrainType } from '../src/terrain/terrainUtils';
import { getThemeConfig } from '../src/themes';
import ParticleManager, { ParticleManagerRef } from './particles/ParticleManager';

// Camera modes
type CameraMode = 'free' | 'follow';

interface GameCanvasProps {
  levelId: string;
}

export default function GameCanvas({ levelId }: GameCanvasProps) {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const [cameraMode, setCameraMode] = useState<CameraMode>('free');
  const [followIndex, setFollowIndex] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(1);

  const toggleCameraMode = useCallback(() => {
    setCameraMode((prev) => (prev === 'free' ? 'follow' : 'free'));
  }, []);

  const cycleFollowTarget = useCallback(() => {
    const entities = queries.getActiveLemmings();
    if (entities.length > 0) {
      setFollowIndex((prev) => (prev + 1) % entities.length);
    }
  }, []);

  const adjustSpeed = useCallback((delta: number) => {
    setGameSpeed((prev) => Math.max(0.25, Math.min(3, prev + delta)));
  }, []);

  // Expose game speed to game store
  useEffect(() => {
    // Update game speed multiplier in store if available
    const { setGameSpeed: storeSetSpeed } = useGameStore.getState() as any;
    if (storeSetSpeed) {
      storeSetSpeed(gameSpeed);
    }
  }, [gameSpeed]);

  if (!currentLevel) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={Platform.OS === 'web' ? [1, 2] : 1}
        style={styles.canvas}
      >
        <SceneContent
          level={currentLevel}
          cameraMode={cameraMode}
          followIndex={followIndex}
          gameSpeed={gameSpeed}
        />
      </Canvas>

      {/* Camera Controls Overlay */}
      <View style={styles.cameraControls}>
        <TouchableOpacity
          style={[styles.cameraButton, cameraMode === 'follow' && styles.activeButton]}
          onPress={toggleCameraMode}
        >
          <Text style={styles.buttonText}>
            {cameraMode === 'free' ? 'FREE' : 'FOLLOW'}
          </Text>
        </TouchableOpacity>

        {cameraMode === 'follow' && (
          <TouchableOpacity style={styles.cameraButton} onPress={cycleFollowTarget}>
            <Text style={styles.buttonText}>NEXT</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Speed Controls Overlay */}
      <View style={styles.speedControls}>
        <TouchableOpacity style={styles.speedButton} onPress={() => adjustSpeed(-0.25)}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.speedText}>{gameSpeed.toFixed(2)}x</Text>
        <TouchableOpacity style={styles.speedButton} onPress={() => adjustSpeed(0.25)}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface SceneContentProps {
  level: any;
  cameraMode: CameraMode;
  followIndex: number;
  gameSpeed: number;
}

function SceneContent({ level, cameraMode, followIndex, gameSpeed }: SceneContentProps) {
  const theme = useMemo(() => getThemeConfig(level.themeId), [level.themeId]);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[level.width * 0.05, -level.height * 0.05, 15]}
        fov={60}
      />

      {/* Camera Controller */}
      <CameraController
        cameraRef={cameraRef}
        controlsRef={controlsRef}
        cameraMode={cameraMode}
        followIndex={followIndex}
        level={level}
      />

      {/* Controls */}
      <OrbitControls
        ref={controlsRef}
        enablePan={cameraMode === 'free'}
        enableZoom
        enableRotate={false}
        minDistance={5}
        maxDistance={30}
        panSpeed={0.5}
      />

      {/* Lighting */}
      <ambientLight intensity={theme.ambientLight} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight
        color={theme.skyColor}
        groundColor={theme.groundColor}
        intensity={0.4}
      />

      {/* Background */}
      <color attach="background" args={[theme.backgroundColor]} />

      {/* Fog */}
      <fog attach="fog" args={[theme.fogColor, 10, 50]} />

      {/* Terrain */}
      <TerrainMesh level={level} theme={theme} />

      {/* Lemmings */}
      <LemmingsRenderer />

      {/* Spawn/Exit Markers */}
      <SpawnMarker position={level.spawnPosition} />
      <ExitMarker position={level.exitPosition} />

      {/* Particle Effects */}
      <ParticleManager />
    </>
  );
}

// Terrain Mesh Component
function TerrainMesh({ level, theme }: { level: any; theme: any }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const terrainData = getTerrainData();
    const { width, height } = getTerrainDimensions();

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    let vertexIndex = 0;
    const scale = 0.1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const type = terrainData[y * width + x];
        if (type === TerrainType.AIR) continue;

        // Determine color based on type
        let color = new THREE.Color(theme.solidColor);
        if (type === TerrainType.STEEL) color = new THREE.Color(theme.steelColor);
        else if (type === TerrainType.WATER) color = new THREE.Color(theme.waterColor);
        else if (type === TerrainType.LAVA) color = new THREE.Color(theme.lavaColor);

        // Add quad vertices
        const px = x * scale;
        const py = -y * scale;
        const s = scale;

        vertices.push(
          px, py, 0,
          px + s, py, 0,
          px + s, py - s, 0,
          px, py - s, 0
        );

        // Colors for each vertex
        for (let i = 0; i < 4; i++) {
          colors.push(color.r, color.g, color.b);
        }

        // Indices for two triangles
        indices.push(
          vertexIndex, vertexIndex + 1, vertexIndex + 2,
          vertexIndex, vertexIndex + 2, vertexIndex + 3
        );

        vertexIndex += 4;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return geo;
  }, [level, theme]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshToonMaterial vertexColors side={THREE.DoubleSide} />
    </mesh>
  );
}

// Lemmings Renderer
function LemmingsRenderer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [lemmingCount, setLemmingCount] = useState(0);

  // Create lemming geometry (simple capsule-like shape)
  const geometry = useMemo(() => {
    const geo = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
    return geo;
  }, []);

  // Create material
  const material = useMemo(() => {
    return new THREE.MeshToonMaterial({
      color: '#ffcccc', // Pink skin tone
    });
  }, []);

  // Update instances every frame
  useFrame(() => {
    if (!meshRef.current) return;

    const entities = queries.getActiveLemmings();
    const dummy = new THREE.Object3D();

    entities.forEach((entity, index) => {
      dummy.position.set(
        entity.position.x,
        entity.position.y + 0.3, // Offset to stand on ground
        entity.position.z
      );
      dummy.rotation.y = entity.rotation.y;
      dummy.scale.setScalar(entity.scale.x);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(index, dummy.matrix);

      // Set color based on state
      const color = getLemmingColor(entity.state);
      meshRef.current!.setColorAt(index, color);
    });

    meshRef.current.count = entities.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }

    setLemmingCount(entities.length);
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, 200]}
      frustumCulled={false}
    />
  );
}

// Get color based on lemming state
function getLemmingColor(state: string): THREE.Color {
  switch (state) {
    case 'BLOCKING':
      return new THREE.Color('#ff0000');
    case 'BOMBING':
      return new THREE.Color('#ff8800');
    case 'BUILDING':
      return new THREE.Color('#00ff00');
    case 'BASHING':
    case 'MINING':
    case 'DIGGING':
      return new THREE.Color('#888800');
    case 'CLIMBING':
      return new THREE.Color('#0088ff');
    case 'FLOATING':
      return new THREE.Color('#00ffff');
    default:
      return new THREE.Color('#ffcccc');
  }
}

// Spawn Marker
function SpawnMarker({ position }: { position: { x: number; y: number } }) {
  const scale = 0.1;
  return (
    <group position={[position.x * scale, -position.y * scale, 0.5]}>
      <mesh>
        <boxGeometry args={[0.5, 0.8, 0.3]} />
        <meshToonMaterial color="#00ff00" />
      </mesh>
      {/* Door shape */}
      <mesh position={[0, -0.2, 0.2]}>
        <boxGeometry args={[0.3, 0.5, 0.1]} />
        <meshBasicMaterial color="#004400" />
      </mesh>
    </group>
  );
}

// Exit Marker
function ExitMarker({ position }: { position: { x: number; y: number } }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const scale = 0.1;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 2;
    }
  });

  return (
    <group position={[position.x * scale, -position.y * scale, 0.5]}>
      <mesh>
        <boxGeometry args={[0.6, 1, 0.3]} />
        <meshToonMaterial color="#ffff00" />
      </mesh>
      {/* Rotating beacon */}
      <mesh ref={meshRef} position={[0, 0.7, 0]}>
        <coneGeometry args={[0.2, 0.3, 8]} />
        <meshBasicMaterial color="#ffff00" />
      </mesh>
    </group>
  );
}

// Camera Controller for follow mode
interface CameraControllerProps {
  cameraRef: React.RefObject<THREE.PerspectiveCamera>;
  controlsRef: React.RefObject<any>;
  cameraMode: CameraMode;
  followIndex: number;
  level: any;
}

function CameraController({
  cameraRef,
  controlsRef,
  cameraMode,
  followIndex,
  level,
}: CameraControllerProps) {
  const targetPosition = useRef(new THREE.Vector3());
  const scale = 0.1;

  useFrame(() => {
    if (cameraMode !== 'follow' || !cameraRef.current || !controlsRef.current) return;

    const entities = queries.getActiveLemmings();
    if (entities.length === 0) return;

    const safeIndex = Math.min(followIndex, entities.length - 1);
    const entity = entities[safeIndex];
    if (!entity) return;

    // Calculate target position
    const targetX = entity.position.x;
    const targetY = entity.position.y + 0.5;

    // Smooth camera follow
    targetPosition.current.lerp(
      new THREE.Vector3(targetX, targetY, 10),
      0.05
    );

    // Update camera position
    cameraRef.current.position.x = targetPosition.current.x;
    cameraRef.current.position.y = targetPosition.current.y;

    // Update orbit controls target
    controlsRef.current.target.set(targetX, targetY, 0);
    controlsRef.current.update();
  });

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  canvas: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  cameraButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#444',
  },
  activeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.6)',
    borderColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  speedControls: {
    position: 'absolute',
    top: 10,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  speedButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
});
