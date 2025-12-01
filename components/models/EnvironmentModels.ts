import * as THREE from 'three';

/**
 * Creates a detailed wooden boat with wood grain texture
 */
export function createDetailedBoat(): THREE.Group {
  const group = new THREE.Group();

  // Wood material with grain appearance
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.7,
    metalness: 0.0,
  });

  const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x654321,
    roughness: 0.75,
    metalness: 0.0,
  });

  // Boat hull - curved shape
  const hullGeometry = new THREE.CylinderGeometry(0.4, 0.3, 2.2, 16, 1);
  const hull = new THREE.Mesh(hullGeometry, woodMaterial);
  hull.rotation.x = Math.PI / 2;
  hull.rotation.z = Math.PI / 2;
  hull.scale.y = 0.4;
  hull.castShadow = true;
  hull.receiveShadow = true;
  group.add(hull);

  // Hull bottom (darker)
  const hullBottomGeometry = new THREE.CylinderGeometry(0.35, 0.25, 2.1, 16, 1);
  const hullBottom = new THREE.Mesh(hullBottomGeometry, darkWoodMaterial);
  hullBottom.rotation.x = Math.PI / 2;
  hullBottom.rotation.z = Math.PI / 2;
  hullBottom.scale.y = 0.35;
  hullBottom.position.y = -0.15;
  hullBottom.castShadow = true;
  group.add(hullBottom);

  // Hull sides (planks)
  const plankGeometry = new THREE.BoxGeometry(2.0, 0.08, 0.3, 20, 1, 1);

  const leftPlank1 = new THREE.Mesh(plankGeometry, woodMaterial);
  leftPlank1.position.set(0, 0.15, -0.35);
  leftPlank1.castShadow = true;
  group.add(leftPlank1);

  const rightPlank1 = new THREE.Mesh(plankGeometry, woodMaterial);
  rightPlank1.position.set(0, 0.15, 0.35);
  rightPlank1.castShadow = true;
  group.add(rightPlank1);

  const leftPlank2 = new THREE.Mesh(plankGeometry, darkWoodMaterial);
  leftPlank2.position.set(0, 0.05, -0.38);
  leftPlank2.castShadow = true;
  group.add(leftPlank2);

  const rightPlank2 = new THREE.Mesh(plankGeometry, darkWoodMaterial);
  rightPlank2.position.set(0, 0.05, 0.38);
  rightPlank2.castShadow = true;
  group.add(rightPlank2);

  // Boat seats (benches)
  const seatGeometry = new THREE.BoxGeometry(1.6, 0.08, 0.25, 16, 1, 4);
  const seatMaterial = new THREE.MeshStandardMaterial({
    color: 0xA0522D,
    roughness: 0.7,
  });

  const frontSeat = new THREE.Mesh(seatGeometry, seatMaterial);
  frontSeat.position.set(0.5, 0.25, 0);
  frontSeat.castShadow = true;
  group.add(frontSeat);

  const backSeat = new THREE.Mesh(seatGeometry, seatMaterial);
  backSeat.position.set(-0.5, 0.25, 0);
  backSeat.castShadow = true;
  group.add(backSeat);

  // Seat supports
  const supportGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);

  for (let i = -1; i <= 1; i += 2) {
    for (let j = -1; j <= 1; j += 2) {
      const support1 = new THREE.Mesh(supportGeometry, darkWoodMaterial);
      support1.position.set(0.5 + i * 0.7, 0.125, j * 0.1);
      support1.castShadow = true;
      group.add(support1);

      const support2 = new THREE.Mesh(supportGeometry, darkWoodMaterial);
      support2.position.set(-0.5 + i * 0.7, 0.125, j * 0.1);
      support2.castShadow = true;
      group.add(support2);
    }
  }

  // Bow and stern reinforcements
  const bowGeometry = new THREE.BoxGeometry(0.1, 0.3, 0.7, 2, 4, 8);

  const bow = new THREE.Mesh(bowGeometry, darkWoodMaterial);
  bow.position.set(1.0, 0.1, 0);
  bow.castShadow = true;
  group.add(bow);

  const stern = new THREE.Mesh(bowGeometry, darkWoodMaterial);
  stern.position.set(-1.0, 0.1, 0);
  stern.castShadow = true;
  group.add(stern);

  // Add wood grain detail with thin planks
  for (let i = -0.9; i < 1.0; i += 0.2) {
    const grainGeometry = new THREE.BoxGeometry(0.05, 0.02, 0.8);
    const grain = new THREE.Mesh(grainGeometry, darkWoodMaterial);
    grain.position.set(i, -0.05, 0);
    group.add(grain);
  }

  return group;
}

/**
 * Creates a detailed tree with bark texture and foliage
 */
export function createDetailedTree(scale: number = 1): THREE.Group {
  const group = new THREE.Group();

  // Bark material
  const barkMaterial = new THREE.MeshStandardMaterial({
    color: 0x4A2F1A,
    roughness: 0.95,
    metalness: 0.0,
  });

  // Trunk with segments for detail
  const trunkSegments = 5;
  for (let i = 0; i < trunkSegments; i++) {
    const yPos = i * 0.6;
    const radius = 0.35 - i * 0.03;
    const segmentGeometry = new THREE.CylinderGeometry(
      radius,
      radius + 0.03,
      0.65,
      16,
      4
    );
    const segment = new THREE.Mesh(segmentGeometry, barkMaterial);
    segment.position.y = yPos;
    segment.castShadow = true;
    segment.receiveShadow = true;
    group.add(segment);
  }

  // Add bark texture detail (bumps)
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const bumpGeometry = new THREE.SphereGeometry(0.08, 8, 8);
    const bump = new THREE.Mesh(bumpGeometry, barkMaterial);
    bump.position.set(
      Math.cos(angle) * 0.3,
      Math.random() * 2.5,
      Math.sin(angle) * 0.3
    );
    bump.scale.set(1, 0.5, 0.6);
    bump.castShadow = true;
    group.add(bump);
  }

  // Main branches
  const branchMaterial = new THREE.MeshStandardMaterial({
    color: 0x3D2817,
    roughness: 0.9,
  });

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const branchGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.2, 12);
    const branch = new THREE.Mesh(branchGeometry, branchMaterial);
    branch.position.set(
      Math.cos(angle) * 0.4,
      2.5 + Math.random() * 0.5,
      Math.sin(angle) * 0.4
    );
    branch.rotation.z = Math.cos(angle) * 0.6;
    branch.rotation.x = Math.sin(angle) * 0.6;
    branch.castShadow = true;
    group.add(branch);
  }

  // Foliage - create fluffy tree crown with multiple spheres
  const foliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x2D5016,
    roughness: 0.9,
    metalness: 0.0,
  });

  const lightFoliageMaterial = new THREE.MeshStandardMaterial({
    color: 0x3A6B1F,
    roughness: 0.85,
  });

  // Main foliage clusters
  const foliagePositions = [
    [0, 4, 0, 1.8, foliageMaterial],
    [-1, 3.5, 0.5, 1.2, lightFoliageMaterial],
    [1, 3.5, -0.5, 1.2, lightFoliageMaterial],
    [0.5, 4.2, 0.8, 1.0, foliageMaterial],
    [-0.5, 4.2, -0.8, 1.0, foliageMaterial],
    [0, 4.8, 0, 1.5, lightFoliageMaterial],
  ];

  foliagePositions.forEach(([x, y, z, size, material]) => {
    const foliageGeometry = new THREE.SphereGeometry(size as number, 16, 16);
    const foliage = new THREE.Mesh(foliageGeometry, material as THREE.Material);
    foliage.position.set(x as number, y as number, z as number);
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    group.add(foliage);
  });

  // Add smaller leaf clusters
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 1.2 + Math.random() * 0.8;
    const leafCluster = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 + Math.random() * 0.3, 12, 12),
      Math.random() > 0.5 ? foliageMaterial : lightFoliageMaterial
    );
    leafCluster.position.set(
      Math.cos(angle) * radius,
      3.5 + Math.random() * 1.5,
      Math.sin(angle) * radius
    );
    leafCluster.castShadow = true;
    group.add(leafCluster);
  }

  group.scale.setScalar(scale);
  return group;
}

/**
 * Creates detailed flowers (poppies and daisies)
 */
export function createFlower(type: 'poppy' | 'daisy' | 'pink'): THREE.Group {
  const group = new THREE.Group();

  // Stem
  const stemGeometry = new THREE.CylinderGeometry(0.01, 0.015, 0.3, 8);
  const stemMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22,
    roughness: 0.8,
  });
  const stem = new THREE.Mesh(stemGeometry, stemMaterial);
  stem.position.y = 0.15;
  stem.castShadow = true;
  group.add(stem);

  // Flower head
  let petalColor: number;
  let centerColor: number;

  switch (type) {
    case 'poppy':
      petalColor = 0xFF4444;
      centerColor = 0x1C1C1C;
      break;
    case 'daisy':
      petalColor = 0xFFFFFF;
      centerColor = 0xFFD700;
      break;
    case 'pink':
      petalColor = 0xFF69B4;
      centerColor = 0xFFB6C1;
      break;
  }

  // Petals
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: petalColor,
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  const petalCount = type === 'poppy' ? 5 : 8;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const petalGeometry = new THREE.CapsuleGeometry(0.05, 0.1, 8, 12);
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);

    petal.position.set(
      Math.cos(angle) * 0.08,
      0.3,
      Math.sin(angle) * 0.08
    );
    petal.rotation.z = Math.PI / 2;
    petal.rotation.y = angle;
    petal.castShadow = true;
    group.add(petal);
  }

  // Flower center
  const centerGeometry = new THREE.SphereGeometry(0.05, 12, 12);
  const centerMaterial = new THREE.MeshStandardMaterial({
    color: centerColor,
    roughness: 0.8,
  });
  const center = new THREE.Mesh(centerGeometry, centerMaterial);
  center.position.y = 0.3;
  center.scale.set(1, 0.5, 1);
  center.castShadow = true;
  group.add(center);

  // Leaves on stem
  const leafGeometry = new THREE.CapsuleGeometry(0.02, 0.08, 8, 8);
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22,
    roughness: 0.7,
  });

  const leaf1 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf1.position.set(0.04, 0.1, 0);
  leaf1.rotation.z = Math.PI / 4;
  group.add(leaf1);

  const leaf2 = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf2.position.set(-0.04, 0.15, 0);
  leaf2.rotation.z = -Math.PI / 4;
  group.add(leaf2);

  return group;
}

/**
 * Creates a rock/stone
 */
export function createRock(size: number = 1): THREE.Group {
  const group = new THREE.Group();

  const rockMaterial = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 0.95,
    metalness: 0.0,
  });

  // Create irregular rock shape
  const rockGeometry = new THREE.SphereGeometry(0.15 * size, 8, 8);
  const rock = new THREE.Mesh(rockGeometry, rockMaterial);

  // Deform for irregular shape
  rock.scale.set(
    1 + Math.random() * 0.3,
    0.6 + Math.random() * 0.2,
    1 + Math.random() * 0.3
  );

  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  rock.castShadow = true;
  rock.receiveShadow = true;
  group.add(rock);

  return group;
}

/**
 * Creates a bush/shrub for background vegetation
 */
export function createBush(size: number = 1): THREE.Group {
  const group = new THREE.Group();

  const bushMaterial = new THREE.MeshStandardMaterial({
    color: 0x2D7A2D,
    roughness: 0.9,
  });

  const lightBushMaterial = new THREE.MeshStandardMaterial({
    color: 0x3F9D3F,
    roughness: 0.85,
  });

  // Create bush from multiple spheres
  const bushSpheres = [
    [0, 0, 0, 0.4, bushMaterial],
    [-0.2, 0.1, 0.1, 0.3, lightBushMaterial],
    [0.2, 0.1, -0.1, 0.3, lightBushMaterial],
    [0, 0.2, 0, 0.25, bushMaterial],
  ];

  bushSpheres.forEach(([x, y, z, radius, material]) => {
    const sphereGeometry = new THREE.SphereGeometry(radius as number, 12, 12);
    const sphere = new THREE.Mesh(sphereGeometry, material as THREE.Material);
    sphere.position.set(x as number, y as number, z as number);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    group.add(sphere);
  });

  group.scale.setScalar(size);
  return group;
}

/**
 * Creates an animated butterfly
 */
export function createButterfly(color: number): THREE.Group {
  const group = new THREE.Group();

  const wingMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  // Body
  const bodyGeometry = new THREE.CapsuleGeometry(0.015, 0.08, 8, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 0.8,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.rotation.z = Math.PI / 2;
  group.add(body);

  // Wings (4 wings)
  const wingGeometry = new THREE.CircleGeometry(0.08, 16);

  // Left upper wing
  const leftWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing1.position.set(-0.06, 0, 0.02);
  leftWing1.rotation.y = -Math.PI / 6;
  group.add(leftWing1);

  // Left lower wing
  const leftWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
  leftWing2.position.set(-0.05, 0, -0.02);
  leftWing2.rotation.y = -Math.PI / 6;
  leftWing2.scale.set(0.7, 0.7, 0.7);
  group.add(leftWing2);

  // Right upper wing
  const rightWing1 = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing1.position.set(0.06, 0, 0.02);
  rightWing1.rotation.y = Math.PI / 6;
  group.add(rightWing1);

  // Right lower wing
  const rightWing2 = new THREE.Mesh(wingGeometry, wingMaterial);
  rightWing2.position.set(0.05, 0, -0.02);
  rightWing2.rotation.y = Math.PI / 6;
  rightWing2.scale.set(0.7, 0.7, 0.7);
  group.add(rightWing2);

  // Antennae
  const antennaGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.06, 4);
  const antenna1 = new THREE.Mesh(antennaGeometry, bodyMaterial);
  antenna1.position.set(0.04, 0.03, 0.01);
  antenna1.rotation.z = -Math.PI / 4;
  group.add(antenna1);

  const antenna2 = new THREE.Mesh(antennaGeometry, bodyMaterial);
  antenna2.position.set(0.04, 0.03, -0.01);
  antenna2.rotation.z = -Math.PI / 4;
  group.add(antenna2);

  // Store wings for animation
  group.userData = {
    wings: [leftWing1, leftWing2, rightWing1, rightWing2],
  };

  return group;
}

/**
 * Creates a 3D cloud
 */
export function createCloud(size: number = 1): THREE.Group {
  const group = new THREE.Group();

  const cloudMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.85,
    roughness: 1.0,
  });

  // Create cloud from multiple spheres
  const cloudParts = [
    [0, 0, 0, 1.0],
    [-0.8, 0, 0, 0.8],
    [0.8, 0, 0, 0.8],
    [-0.4, 0.3, 0, 0.7],
    [0.4, 0.3, 0, 0.7],
    [0, 0.4, 0, 0.6],
  ];

  cloudParts.forEach(([x, y, z, radius]) => {
    const sphereGeometry = new THREE.SphereGeometry(radius as number, 12, 12);
    const sphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
    sphere.position.set(x as number, y as number, z as number);
    group.add(sphere);
  });

  group.scale.setScalar(size);
  return group;
}

/**
 * Creates a sun with glow effect
 */
export function createSun(): THREE.Group {
  const group = new THREE.Group();

  // Sun sphere
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFF00,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  group.add(sun);

  // Glow layers
  const glow1Geometry = new THREE.SphereGeometry(2.3, 32, 32);
  const glow1Material = new THREE.MeshBasicMaterial({
    color: 0xFFFF66,
    transparent: true,
    opacity: 0.3,
  });
  const glow1 = new THREE.Mesh(glow1Geometry, glow1Material);
  group.add(glow1);

  const glow2Geometry = new THREE.SphereGeometry(2.6, 32, 32);
  const glow2Material = new THREE.MeshBasicMaterial({
    color: 0xFFFFAA,
    transparent: true,
    opacity: 0.15,
  });
  const glow2 = new THREE.Mesh(glow2Geometry, glow2Material);
  group.add(glow2);

  return group;
}
