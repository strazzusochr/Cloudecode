import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Character, GraphicsQuality } from '../types/game';

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
  const meshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const onContextCreate = async (gl: any) => {
    // Initialize renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor('#87CEEB'); // Sky blue
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog('#87CEEB', 40, 100);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);
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
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xfff5e1, 0.8);
    sunLight.position.set(10, 15, 5);
    sunLight.castShadow = quality !== 'low';

    if (quality !== 'low') {
      sunLight.shadow.mapSize.width = quality === 'high' ? 2048 : 1024;
      sunLight.shadow.mapSize.height = quality === 'high' ? 2048 : 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 50;
    }

    scene.add(sunLight);

    // Hemisphere light for natural sky/ground lighting
    const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.4);
    scene.add(hemiLight);
  };

  const createEnvironment = (scene: THREE.Scene, quality: GraphicsQuality) => {
    // Left shore (grass)
    const leftShoreGeometry = new THREE.BoxGeometry(12, 0.5, 20);
    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.9,
      metalness: 0.1,
    });
    const leftShore = new THREE.Mesh(leftShoreGeometry, grassMaterial);
    leftShore.position.set(-12, -0.25, 0);
    leftShore.receiveShadow = true;
    scene.add(leftShore);

    // Right shore (grass)
    const rightShore = new THREE.Mesh(leftShoreGeometry, grassMaterial);
    rightShore.position.set(12, -0.25, 0);
    rightShore.receiveShadow = true;
    scene.add(rightShore);

    // River (water)
    const riverGeometry = new THREE.PlaneGeometry(8, 20);
    const waterMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A90E2,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const river = new THREE.Mesh(riverGeometry, waterMaterial);
    river.rotation.x = -Math.PI / 2;
    river.position.y = 0;
    scene.add(river);

    // Add flowers on left shore
    if (quality !== 'low') {
      addFlowers(scene, -12, 5);
    }

    // Add flowers on right shore
    if (quality !== 'low') {
      addFlowers(scene, 12, 3);
    }

    // Add tree on left shore
    if (quality !== 'low') {
      addTree(scene, -14, -6);
    }

    // Add clouds
    if (quality === 'high') {
      addClouds(scene);
    }
  };

  const addFlowers = (scene: THREE.Scene, x: number, count: number) => {
    const flowerColors = [0xFF6B6B, 0xFFD93D, 0xFFFFFF];

    for (let i = 0; i < count; i++) {
      const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
      const flowerMaterial = new THREE.MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
      });
      const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);

      flower.position.set(
        x + (Math.random() - 0.5) * 4,
        0.2,
        (Math.random() - 0.5) * 16
      );

      scene.add(flower);
    }
  };

  const addTree = (scene: THREE.Scene, x: number, z: number) => {
    // Tree trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 1.5, z);
    trunk.castShadow = true;
    scene.add(trunk);

    // Tree foliage
    const foliageGeometry = new THREE.SphereGeometry(2, 12, 12);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.set(x, 4, z);
    foliage.castShadow = true;
    scene.add(foliage);
  };

  const addClouds = (scene: THREE.Scene) => {
    const cloudMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < 3; i++) {
      const cloud = new THREE.Group();

      // Cloud made of spheres
      for (let j = 0; j < 3; j++) {
        const cloudPart = new THREE.Mesh(
          new THREE.SphereGeometry(1 + Math.random(), 8, 8),
          cloudMaterial
        );
        cloudPart.position.set(j * 1.5, 0, 0);
        cloud.add(cloudPart);
      }

      cloud.position.set(
        (Math.random() - 0.5) * 20,
        15 + Math.random() * 5,
        (Math.random() - 0.5) * 20
      );

      scene.add(cloud);
    }
  };

  const createCharacters = (scene: THREE.Scene, characters: Character[]) => {
    characters.forEach(char => {
      const mesh = createCharacterMesh(char.type);
      mesh.position.set(char.position.x, char.position.y, char.position.z);
      mesh.userData = { id: char.id, type: char.type };
      mesh.castShadow = true;
      scene.add(mesh);
      meshesRef.current.set(char.id, mesh);
    });
  };

  const createCharacterMesh = (type: string): THREE.Mesh => {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;

    switch (type) {
      case 'farmer':
        // Simple farmer representation
        geometry = new THREE.CapsuleGeometry(0.4, 1.2, 8, 16);
        material = new THREE.MeshStandardMaterial({ color: 0x4169E1 }); // Blue shirt
        break;

      case 'wolf':
        // Wolf as elongated box with sphere head
        const wolfGroup = new THREE.Group();
        const wolfBody = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.4, 1.2),
          new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        wolfBody.position.y = 0.3;

        const wolfHead = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0x696969 })
        );
        wolfHead.position.set(0, 0.3, 0.8);

        wolfGroup.add(wolfBody);
        wolfGroup.add(wolfHead);
        return wolfGroup as any;

      case 'sheep':
        // Fluffy sheep
        geometry = new THREE.SphereGeometry(0.5, 12, 12);
        material = new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
          roughness: 1.0,
        });
        break;

      case 'cabbage':
        // Cabbage as green sphere
        geometry = new THREE.SphereGeometry(0.4, 12, 12);
        material = new THREE.MeshStandardMaterial({
          color: 0x90EE90,
          roughness: 0.8,
        });
        break;

      default:
        geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 0.5;
    return mesh;
  };

  const createBoat = (scene: THREE.Scene, side: 'left' | 'right') => {
    const boatGroup = new THREE.Group();

    // Boat hull
    const hullGeometry = new THREE.BoxGeometry(2, 0.4, 1.2);
    const hullMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.castShadow = true;
    boatGroup.add(hull);

    // Boat seats
    const seatGeometry = new THREE.BoxGeometry(1.6, 0.1, 0.3);
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
    const seat1 = new THREE.Mesh(seatGeometry, seatMaterial);
    seat1.position.set(0, 0.25, 0.3);
    boatGroup.add(seat1);

    const seat2 = new THREE.Mesh(seatGeometry, seatMaterial);
    seat2.position.set(0, 0.25, -0.3);
    boatGroup.add(seat2);

    boatGroup.position.set(side === 'left' ? -4 : 4, 0.1, 0);
    boatGroup.userData = { id: 'boat' };
    scene.add(boatGroup);
    meshesRef.current.set('boat', boatGroup as any);
  };

  const updateAnimations = () => {
    // Simple idle animations for characters
    const time = Date.now() * 0.001;

    meshesRef.current.forEach((mesh, id) => {
      if (id !== 'boat') {
        // Gentle bobbing animation
        mesh.position.y = 0.5 + Math.sin(time * 2 + mesh.position.x) * 0.05;
      }
    });

    // Water animation (if we added custom shader, we'd update it here)
  };

  return <GLView style={styles.glView} onContextCreate={onContextCreate} />;
}

const styles = StyleSheet.create({
  glView: {
    flex: 1,
  },
});
