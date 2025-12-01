import * as THREE from 'three';

/**
 * PBR Material System with procedural textures
 * Since we can't load external textures easily in React Native,
 * we create procedural normal maps and detail textures
 */

/**
 * Creates a procedural normal map texture
 */
function createProceduralNormalMap(width: number = 256, height: number = 256, scale: number = 1): THREE.DataTexture {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;

    // Create noise-based normal variation
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;

    // Simple noise function
    const noise = Math.sin(x * 50 * scale) * Math.cos(y * 50 * scale) * 0.5 + 0.5;

    // Normal map: R=X, G=Y, B=Z (pointing up)
    data[stride] = Math.floor((0.5 + noise * 0.1) * 255);     // R (X)
    data[stride + 1] = Math.floor((0.5 + noise * 0.1) * 255); // G (Y)
    data[stride + 2] = Math.floor((0.5 + noise * 0.5) * 255); // B (Z)
    data[stride + 3] = 255; // A
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a procedural roughness map
 */
function createRoughnessMap(width: number = 256, height: number = 256, variation: number = 0.2): THREE.DataTexture {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let i = 0; i < size; i++) {
    const stride = i * 4;

    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;

    // Variation pattern
    const pattern = Math.sin(x * 30) * Math.cos(y * 30) * 0.5 + 0.5;
    const roughness = 0.5 + pattern * variation;

    const value = Math.floor(roughness * 255);
    data[stride] = value;
    data[stride + 1] = value;
    data[stride + 2] = value;
    data[stride + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates PBR material for wood (boat, tree trunk)
 */
export function createWoodPBRMaterial(baseColor: number, roughness: number = 0.8): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(256, 256, 2);
  const roughnessMap = createRoughnessMap(256, 256, 0.3);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: roughness,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.3, 0.3),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for fabric (farmer clothes)
 */
export function createFabricPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(128, 128, 4);
  const roughnessMap = createRoughnessMap(128, 128, 0.15);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.9,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for fur (wolf, sheep)
 */
export function createFurPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(256, 256, 8);
  const roughnessMap = createRoughnessMap(256, 256, 0.2);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 1.0,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for grass terrain
 */
export function createGrassPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(512, 512, 6);
  const roughnessMap = createRoughnessMap(512, 512, 0.1);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.95,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.2, 0.2),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for bark (tree trunk)
 */
export function createBarkPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(512, 512, 3);
  const roughnessMap = createRoughnessMap(512, 512, 0.25);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.95,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for organic vegetation (cabbage, flowers)
 */
export function createVegetationPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(256, 256, 5);
  const roughnessMap = createRoughnessMap(256, 256, 0.15);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.85,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.4, 0.4),
    roughnessMap: roughnessMap,
  });
}

/**
 * Creates PBR material for skin
 */
export function createSkinPBRMaterial(baseColor: number): THREE.MeshStandardMaterial {
  const normalMap = createProceduralNormalMap(128, 128, 10);
  const roughnessMap = createRoughnessMap(128, 128, 0.1);

  return new THREE.MeshStandardMaterial({
    color: baseColor,
    roughness: 0.6,
    metalness: 0.0,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(0.15, 0.15),
    roughnessMap: roughnessMap,
  });
}
