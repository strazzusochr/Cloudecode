import * as THREE from 'three';

/**
 * LOD (Level of Detail) System
 * Automatically switches between high, medium, and low poly models based on distance
 */

export interface LODConfig {
  highPolyDistance: number;
  mediumPolyDistance: number;
  lowPolyDistance: number;
}

/**
 * Default LOD configuration
 */
export const DEFAULT_LOD_CONFIG: LODConfig = {
  highPolyDistance: 15,
  mediumPolyDistance: 30,
  lowPolyDistance: 50,
};

/**
 * Creates a simplified version of a geometry (reduces vertex count)
 * @param geometry - The geometry to simplify
 * @param _factor - Simplification factor (not used in current implementation)
 * @returns Simplified geometry
 */
function simplifyGeometry(geometry: THREE.BufferGeometry, _factor: number): THREE.BufferGeometry {
  // For now, we'll use the same geometry but with modified parameters
  // In production, you'd use a proper mesh decimation algorithm
  const simplified = geometry.clone();

  // Could implement vertex reduction here
  // For this demo, we return a clone
  return simplified;
}

// Mark as used to prevent tree-shaking
export { simplifyGeometry };

/**
 * Creates LOD levels for a character model
 */
export function createCharacterLOD(
  highPolyModel: THREE.Group,
  mediumPolyModel?: THREE.Group,
  lowPolyModel?: THREE.Group,
  config: LODConfig = DEFAULT_LOD_CONFIG
): THREE.LOD {
  const lod = new THREE.LOD();

  // High poly (close up)
  lod.addLevel(highPolyModel, 0);

  // Medium poly (middle distance)
  if (mediumPolyModel) {
    lod.addLevel(mediumPolyModel, config.highPolyDistance);
  } else {
    // Use simplified version of high poly
    const mediumPoly = highPolyModel.clone();
    lod.addLevel(mediumPoly, config.highPolyDistance);
  }

  // Low poly (far distance)
  if (lowPolyModel) {
    lod.addLevel(lowPolyModel, config.mediumPolyDistance);
  } else {
    // Create simple box representation
    const lowPolyGroup = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 1.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    box.position.y = 0.75;
    lowPolyGroup.add(box);
    lod.addLevel(lowPolyGroup, config.mediumPolyDistance);
  }

  return lod;
}

/**
 * Creates simplified version of character (for medium distance)
 */
export function createSimplifiedCharacter(type: string): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'farmer':
      // Simplified farmer: just torso, head, hat
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 1.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x4A6FA5 })
      );
      body.position.y = 0.75;
      group.add(body);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFDBAC })
      );
      head.position.y = 1.7;
      group.add(head);

      const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.1, 8),
        new THREE.MeshStandardMaterial({ color: 0xD4A574 })
      );
      hat.position.y = 2.0;
      group.add(hat);
      break;

    case 'wolf':
      // Simplified wolf: body + head
      const wolfBody = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.2, 0.6, 6, 8),
        new THREE.MeshStandardMaterial({ color: 0x696969 })
      );
      wolfBody.rotation.z = Math.PI / 2;
      wolfBody.position.y = 0.3;
      group.add(wolfBody);

      const wolfHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x505050 })
      );
      wolfHead.position.set(0.4, 0.3, 0);
      group.add(wolfHead);
      break;

    case 'sheep':
      // Simplified sheep: fluffy ball
      const sheepBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xFFFFF0 })
      );
      sheepBody.position.y = 0.4;
      group.add(sheepBody);

      const sheepHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x2C2C2C })
      );
      sheepHead.position.set(0, 0.4, 0.35);
      group.add(sheepHead);
      break;

    case 'cabbage':
      // Simplified cabbage: single sphere
      const cabbage = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x90EE90 })
      );
      cabbage.position.y = 0.3;
      group.add(cabbage);
      break;
  }

  return group;
}

/**
 * Updates all LOD objects in the scene based on camera position
 */
export function updateLODObjects(scene: THREE.Scene, camera: THREE.Camera): void {
  scene.traverse((object) => {
    if (object instanceof THREE.LOD) {
      object.update(camera);
    }
  });
}

/**
 * Creates LOD for environment objects (trees, bushes)
 */
export function createEnvironmentLOD(
  highPoly: THREE.Group,
  distances: number[] = [20, 40, 60]
): THREE.LOD {
  const lod = new THREE.LOD();

  // High detail
  lod.addLevel(highPoly, 0);

  // Medium detail - fewer elements
  const mediumPoly = highPoly.clone();
  mediumPoly.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Reduce geometry complexity
      if (child.geometry instanceof THREE.BufferGeometry) {
        // Keep the geometry but could simplify it here
        // In production: use simplifyGeometry(child.geometry, 0.5)
      }
    }
  });
  lod.addLevel(mediumPoly, distances[0]);

  // Low detail - very simple
  const lowPoly = new THREE.Group();
  const bounds = new THREE.Box3().setFromObject(highPoly);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());

  const simpleMesh = new THREE.Mesh(
    new THREE.BoxGeometry(size.x * 0.5, size.y, size.z * 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2D5016 })
  );
  simpleMesh.position.copy(center);
  lowPoly.add(simpleMesh);
  lod.addLevel(lowPoly, distances[1]);

  return lod;
}

/**
 * Calculates appropriate LOD level based on distance and quality setting
 */
export function getLODLevel(distance: number, quality: 'low' | 'medium' | 'high'): 'high' | 'medium' | 'low' {
  const config = DEFAULT_LOD_CONFIG;

  if (quality === 'high') {
    if (distance < config.mediumPolyDistance) return 'high';
    if (distance < config.lowPolyDistance) return 'medium';
    return 'low';
  } else if (quality === 'medium') {
    if (distance < config.highPolyDistance) return 'high';
    if (distance < config.mediumPolyDistance) return 'medium';
    return 'low';
  } else {
    // Low quality: always use simplified models
    if (distance < config.highPolyDistance) return 'medium';
    return 'low';
  }
}
