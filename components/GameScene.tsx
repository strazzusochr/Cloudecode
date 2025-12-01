import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Character, GraphicsQuality } from '../types/game';
import {
  createDetailedFarmer,
  createDetailedWolf,
  createDetailedSheep,
  createDetailedCabbage,
} from './models/CharacterModels';
import {
  createDetailedBoat,
  createDetailedTree,
  createFlower,
  createRock,
  createBush,
  createButterfly,
  createCloud,
  createSun,
} from './models/EnvironmentModels';
import {
  createAdvancedTerrain,
  createAnimatedWater,
  updateWaterAnimation,
  createSkyGradient,
  createGrassBlades,
} from './models/TerrainSystem';

interface GameSceneProps {
  characters: Character[];
  boatSide: 'left' | 'right';
  quality: GraphicsQuality;
  onCharacterPress?: (characterId: string) => void; // Optional for now
}

export default function GameScene({ characters, boatSide, quality }: GameSceneProps) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const meshesRef = useRef<Map<string, THREE.Group | THREE.Mesh>>(new Map());
  const butterfliesRef = useRef<THREE.Group[]>([]);
  const waterRef = useRef<THREE.Mesh | null>(null);

  const onContextCreate = async (gl: any) => {
    // Initialize renderer with enhanced settings
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor('#87CEEB'); // Sky blue (will be overridden by gradient)

    // Enable shadows
    if (quality !== 'low') {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows
    }

    // Enable tone mapping for better colors
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#B0E2FF', 60, 120); // Light blue fog
    sceneRef.current = scene;

    // Create camera with wider field of view for better scene coverage
    const camera = new THREE.PerspectiveCamera(
      55,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 22);
    camera.lookAt(0, 2, 0);
    cameraRef.current = camera;

    // Lighting setup
    setupLighting(scene, quality);

    // Create environment
    createEnvironment(scene, quality);

    // Create characters
    createCharacters(scene, characters);

    // Create boat
    createBoat(scene, boatSide);

    // Animation loop
    let frameId: number;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Update animations
      updateAnimations();

      // Render
      renderer.render(scene, camera);
      gl.endFrameEXP();
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  };

  const setupLighting = (scene: THREE.Scene, quality: GraphicsQuality) => {
    // Warm ambient light (reduced for better AO visibility)
    const ambientLight = new THREE.AmbientLight(0xFFE5B4, 0.4);
    scene.add(ambientLight);

    // Main directional light (sun) with warm tone
    const sunLight = new THREE.DirectionalLight(0xFFF8DC, 1.2);
    sunLight.position.set(15, 20, 10);
    sunLight.castShadow = quality !== 'low';

    if (quality !== 'low') {
      sunLight.shadow.mapSize.width = quality === 'high' ? 4096 : 2048;
      sunLight.shadow.mapSize.height = quality === 'high' ? 4096 : 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 100;
      sunLight.shadow.camera.left = -20;
      sunLight.shadow.camera.right = 20;
      sunLight.shadow.camera.top = 20;
      sunLight.shadow.camera.bottom = -20;
      sunLight.shadow.bias = -0.0001;
      sunLight.shadow.radius = 4; // Soft shadows
    }

    scene.add(sunLight);

    // Hemisphere light for natural sky/ground lighting (provides ambient occlusion effect)
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x3D5016, 0.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // Fill light for softer shadows
    const fillLight = new THREE.DirectionalLight(0xB0E2FF, 0.25);
    fillLight.position.set(-10, 10, -5);
    scene.add(fillLight);

    // Rim light for depth
    const rimLight = new THREE.DirectionalLight(0xFFFFE0, 0.15);
    rimLight.position.set(0, 5, -15);
    scene.add(rimLight);

    // Additional AO-like lighting from below (subtle)
    if (quality !== 'low') {
      const aoLight = new THREE.DirectionalLight(0x4F7F4F, 0.15);
      aoLight.position.set(0, -5, 0);
      scene.add(aoLight);
    }
  };

  const createEnvironment = (scene: THREE.Scene, quality: GraphicsQuality) => {
    // Create sky gradient
    createSkyGradient(scene);

    // Add sun
    const sun = createSun();
    sun.position.set(20, 30, -15);
    scene.add(sun);

    // Left shore (advanced terrain)
    const leftShore = createAdvancedTerrain('left', 12, 20);
    leftShore.position.set(-12, 0, 0);
    scene.add(leftShore);

    // Right shore (advanced terrain)
    const rightShore = createAdvancedTerrain('right', 12, 20);
    rightShore.position.set(12, 0, 0);
    scene.add(rightShore);

    // Add grass blades for detail (if high quality)
    if (quality === 'high' || quality === 'medium') {
      const leftGrass = createGrassBlades(300, { x: -12, z: 0, width: 10, depth: 18 });
      scene.add(leftGrass);

      const rightGrass = createGrassBlades(300, { x: 12, z: 0, width: 10, depth: 18 });
      scene.add(rightGrass);
    }

    // Animated water river
    const water = createAnimatedWater(8, 20);
    water.position.set(0, 0, 0);
    scene.add(water);
    waterRef.current = water;

    // Add detailed tree on left shore
    const tree = createDetailedTree(1.5);
    tree.position.set(-14, 0, -6);
    tree.castShadow = true;
    scene.add(tree);

    // Add background bushes
    if (quality !== 'low') {
      // Right side bushes
      const bush1 = createBush(1.2);
      bush1.position.set(14, 0, 5);
      scene.add(bush1);

      const bush2 = createBush(0.9);
      bush2.position.set(13, 0, -3);
      scene.add(bush2);

      // Left side bushes
      const bush3 = createBush(1.0);
      bush3.position.set(-13, 0, 3);
      scene.add(bush3);
    }

    // Add flowers on left shore
    addDetailedFlowers(scene, -12, 15);

    // Add flowers on right shore
    addDetailedFlowers(scene, 12, 12);

    // Add rocks/stones
    addRocks(scene, -12, 5);
    addRocks(scene, 12, 4);

    // Add 3D clouds
    addDetailedClouds(scene, quality);

    // Add animated butterflies
    if (quality !== 'low') {
      addButterflies(scene);
    }
  };

  const addDetailedFlowers = (scene: THREE.Scene, x: number, count: number) => {
    const flowerTypes: Array<'poppy' | 'daisy' | 'pink'> = ['poppy', 'daisy', 'pink'];

    for (let i = 0; i < count; i++) {
      const type = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
      const flower = createFlower(type);

      flower.position.set(
        x + (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 16
      );

      flower.rotation.y = Math.random() * Math.PI * 2;
      flower.castShadow = true;
      scene.add(flower);
    }
  };

  const addRocks = (scene: THREE.Scene, x: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const rock = createRock(0.5 + Math.random() * 0.8);

      rock.position.set(
        x + (Math.random() - 0.5) * 8,
        0,
        (Math.random() - 0.5) * 16
      );

      rock.castShadow = true;
      scene.add(rock);
    }
  };

  const addDetailedClouds = (scene: THREE.Scene, quality: GraphicsQuality) => {
    if (quality === 'low') return;

    const cloudCount = quality === 'high' ? 6 : 4;

    for (let i = 0; i < cloudCount; i++) {
      const cloud = createCloud(1.5 + Math.random() * 0.5);

      cloud.position.set(
        (Math.random() - 0.5) * 40,
        18 + Math.random() * 8,
        -10 + (Math.random() - 0.5) * 30
      );

      scene.add(cloud);
    }
  };

  const addButterflies = (scene: THREE.Scene) => {
    const butterflyColors = [0xFF6B6B, 0xFFD700, 0xFF8C00, 0xFFFFFF, 0xFFB6C1];

    for (let i = 0; i < 5; i++) {
      const color = butterflyColors[Math.floor(Math.random() * butterflyColors.length)];
      const butterfly = createButterfly(color);

      butterfly.position.set(
        (Math.random() - 0.5) * 20,
        1 + Math.random() * 3,
        (Math.random() - 0.5) * 16
      );

      butterfly.userData = {
        startX: butterfly.position.x,
        startY: butterfly.position.y,
        startZ: butterfly.position.z,
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
      };

      butterfliesRef.current.push(butterfly);
      scene.add(butterfly);
    }
  };

  const createCharacters = (scene: THREE.Scene, characters: Character[]) => {
    characters.forEach(char => {
      const mesh = createCharacterMesh(char.type);
      mesh.position.set(char.position.x, char.position.y, char.position.z);

      // Store the original Y position for animation
      mesh.userData = {
        id: char.id,
        type: char.type,
        originalY: mesh.position.y // Store the base Y position including model offset
      };

      mesh.castShadow = true;
      scene.add(mesh);
      meshesRef.current.set(char.id, mesh);
    });
  };

  const createCharacterMesh = (type: string): THREE.Group => {
    let characterGroup: THREE.Group;

    switch (type) {
      case 'farmer':
        characterGroup = createDetailedFarmer();
        // Farmer model is already positioned correctly with feet at y=0
        break;

      case 'wolf':
        characterGroup = createDetailedWolf();
        // Wolf model is already positioned correctly
        break;

      case 'sheep':
        characterGroup = createDetailedSheep();
        // Sheep model is already positioned correctly
        break;

      case 'cabbage':
        characterGroup = createDetailedCabbage();
        // Cabbage model is already positioned correctly
        break;

      default:
        characterGroup = new THREE.Group();
        const defaultMesh = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.5, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xFF0000 })
        );
        characterGroup.add(defaultMesh);
    }

    return characterGroup;
  };

  const createBoat = (scene: THREE.Scene, side: 'left' | 'right') => {
    const boat = createDetailedBoat();
    boat.position.set(side === 'left' ? -4 : 4, 0.15, 0);
    boat.userData = { id: 'boat' };
    boat.castShadow = true;
    boat.receiveShadow = true;
    scene.add(boat);
    meshesRef.current.set('boat', boat);
  };

  const updateAnimations = () => {
    const time = Date.now() * 0.001;

    // Update water animation
    if (waterRef.current) {
      updateWaterAnimation(waterRef.current, time);
    }

    // Gentle bobbing animation for characters
    meshesRef.current.forEach((mesh, id) => {
      if (id !== 'boat' && mesh.userData.originalY !== undefined) {
        const bobAmount = Math.sin(time * 2 + mesh.position.x) * 0.03;
        mesh.position.y = mesh.userData.originalY + bobAmount;
      }
    });

    // Animate butterflies
    butterfliesRef.current.forEach((butterfly) => {
      const { startX, startY, startZ, speed, phase } = butterfly.userData;

      // Figure-8 flight pattern
      const t = time * speed + phase;
      butterfly.position.x = startX + Math.sin(t) * 2;
      butterfly.position.y = startY + Math.sin(t * 2) * 0.5;
      butterfly.position.z = startZ + Math.cos(t) * 1.5;

      // Rotate butterfly to face movement direction
      butterfly.rotation.y = Math.sin(t) * 0.5;

      // Animate wings
      if (butterfly.userData.wings) {
        const wingAngle = Math.sin(t * 8) * 0.3;
        butterfly.userData.wings.forEach((wing: THREE.Mesh, i: number) => {
          if (i < 2) {
            // Left wings
            wing.rotation.y = -Math.PI / 6 + wingAngle;
          } else {
            // Right wings
            wing.rotation.y = Math.PI / 6 - wingAngle;
          }
        });
      }
    });
  };

  return <GLView style={styles.glView} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  glView: {
    flex: 1,
  },
});
