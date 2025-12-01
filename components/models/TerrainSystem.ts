import * as THREE from 'three';

/**
 * Creates advanced terrain with rolling hills and varied grass colors
 */
export function createAdvancedTerrain(
  side: 'left' | 'right',
  width: number = 12,
  depth: number = 20
): THREE.Group {
  const group = new THREE.Group();

  // Create base terrain with height variation
  const terrainGeometry = createHeightMapGeometry(width, depth, side);

  // Multiple grass materials for variation
  const grassMaterial1 = new THREE.MeshStandardMaterial({
    color: 0x2D5A2D,
    roughness: 0.9,
    metalness: 0.0,
  });

  const grassMaterial2 = new THREE.MeshStandardMaterial({
    color: 0x3A6B3A,
    roughness: 0.85,
    metalness: 0.0,
  });

  const grassMaterial3 = new THREE.MeshStandardMaterial({
    color: 0x4F7F4F,
    roughness: 0.88,
    metalness: 0.0,
  });

  // Main terrain base
  const terrain = new THREE.Mesh(terrainGeometry, grassMaterial2);
  terrain.receiveShadow = true;
  terrain.castShadow = false;
  group.add(terrain);

  // Add grass patches with different colors for variation
  addGrassPatches(group, width, depth, [grassMaterial1, grassMaterial2, grassMaterial3]);

  return group;
}

/**
 * Creates a height-mapped geometry for realistic terrain
 */
function createHeightMapGeometry(
  width: number,
  depth: number,
  _side: 'left' | 'right'
): THREE.BufferGeometry {
  const geometry = new THREE.PlaneGeometry(width, depth, 32, 32);
  geometry.rotateX(-Math.PI / 2);

  // Get position attribute
  const positions = geometry.attributes.position;

  // Create rolling hills with perlin-like noise
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const y = positions.getY(i);

    // Create gentle rolling hills
    const wave1 = Math.sin(x * 0.5) * 0.1;
    const wave2 = Math.cos(z * 0.3) * 0.08;
    const wave3 = Math.sin((x + z) * 0.4) * 0.06;

    // Edge elevation (higher at edges)
    const edgeX = Math.abs(x) / (width / 2);
    const edgeBoost = Math.pow(edgeX, 2) * 0.15;

    const newY = y + wave1 + wave2 + wave3 + edgeBoost;
    positions.setY(i, newY);
  }

  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Adds grass patches with instancing for performance
 */
function addGrassPatches(
  group: THREE.Group,
  width: number,
  depth: number,
  materials: THREE.Material[]
): void {
  const patchGeometry = new THREE.CircleGeometry(0.8, 16);
  patchGeometry.rotateX(-Math.PI / 2);

  // Add random grass patches
  for (let i = 0; i < 20; i++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const patch = new THREE.Mesh(patchGeometry, material);

    patch.position.set(
      (Math.random() - 0.5) * width * 0.8,
      0.02,
      (Math.random() - 0.5) * depth * 0.8
    );

    patch.scale.set(
      0.8 + Math.random() * 0.4,
      1,
      0.8 + Math.random() * 0.4
    );

    patch.receiveShadow = true;
    group.add(patch);
  }
}

/**
 * Creates animated water with wave effects
 */
export function createAnimatedWater(width: number = 8, depth: number = 20): THREE.Mesh {
  const waterGeometry = new THREE.PlaneGeometry(width, depth, 64, 64);
  waterGeometry.rotateX(-Math.PI / 2);

  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x4FB3D4,
    roughness: 0.15,
    metalness: 0.7,
    transparent: true,
    opacity: 0.85,
  });

  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.receiveShadow = true;
  water.position.y = 0.05;

  // Store original positions for wave animation
  const positions = waterGeometry.attributes.position;
  const originalPositions = new Float32Array(positions.count * 3);

  for (let i = 0; i < positions.count; i++) {
    originalPositions[i * 3] = positions.getX(i);
    originalPositions[i * 3 + 1] = positions.getY(i);
    originalPositions[i * 3 + 2] = positions.getZ(i);
  }

  water.userData = {
    originalPositions,
    geometry: waterGeometry,
  };

  return water;
}

/**
 * Updates water animation
 */
export function updateWaterAnimation(water: THREE.Mesh, time: number): void {
  const { originalPositions, geometry } = water.userData;
  if (!originalPositions || !geometry) return;

  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = originalPositions[i * 3];
    const z = originalPositions[i * 3 + 2];

    // Create multiple wave patterns
    const wave1 = Math.sin(x * 2 + time * 1.5) * 0.03;
    const wave2 = Math.cos(z * 2 + time * 2) * 0.02;
    const wave3 = Math.sin((x + z) * 1.5 + time * 1.8) * 0.025;

    const y = wave1 + wave2 + wave3;
    positions.setY(i, y);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
}

/**
 * Creates a sky gradient background
 * Note: In React Native/Expo, we use a simple color instead of canvas gradient
 */
export function createSkyGradient(scene: THREE.Scene): void {
  // Use a simple sky blue color for React Native compatibility
  // Canvas/document is not available in React Native
  scene.background = new THREE.Color(0x87CEEB); // Sky blue

  // Alternatively, create a sky sphere with gradient shader
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyMaterial = new THREE.MeshBasicMaterial({
    color: 0x87CEEB,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky);
}

/**
 * Creates ground details like grass blades (instanced for performance)
 */
export function createGrassBlades(count: number, area: { x: number; z: number; width: number; depth: number }): THREE.InstancedMesh {
  const grassBladeGeometry = new THREE.ConeGeometry(0.02, 0.15, 3);
  grassBladeGeometry.translate(0, 0.075, 0);

  const grassMaterial = new THREE.MeshStandardMaterial({
    color: 0x2D5A2D,
    roughness: 0.9,
    flatShading: true,
  });

  const instancedGrass = new THREE.InstancedMesh(grassBladeGeometry, grassMaterial, count);
  instancedGrass.castShadow = true;
  instancedGrass.receiveShadow = true;

  const dummy = new THREE.Object3D();

  for (let i = 0; i < count; i++) {
    dummy.position.set(
      area.x + (Math.random() - 0.5) * area.width,
      0,
      area.z + (Math.random() - 0.5) * area.depth
    );

    dummy.rotation.y = Math.random() * Math.PI * 2;
    dummy.scale.set(
      0.8 + Math.random() * 0.4,
      0.8 + Math.random() * 0.6,
      0.8 + Math.random() * 0.4
    );

    dummy.updateMatrix();
    instancedGrass.setMatrixAt(i, dummy.matrix);
  }

  return instancedGrass;
}
