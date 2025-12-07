// Terrain Manipulation System

export enum TerrainType {
  AIR = 0,
  SOLID = 1,      // Destructible
  STEEL = 2,      // Indestructible
  WATER = 3,      // Deadly (drowning)
  LAVA = 4,       // Deadly (burning)
  SPAWN = 5,      // Spawn point
  EXIT = 6,       // Goal door
}

// Terrain dimensions
let TERRAIN_WIDTH = 160;
let TERRAIN_HEIGHT = 80;
let terrainData: Uint8Array = new Uint8Array(TERRAIN_WIDTH * TERRAIN_HEIGHT);

// Flag for mesh regeneration
let terrainNeedsUpdate = false;

// Initialize terrain
export function initTerrain(width: number = 160, height: number = 80): void {
  TERRAIN_WIDTH = width;
  TERRAIN_HEIGHT = height;
  terrainData = new Uint8Array(width * height);
  terrainNeedsUpdate = true;
}

// Load terrain from level data
export function loadTerrainFromLevel(levelTerrain: number[], width: number, height: number): void {
  TERRAIN_WIDTH = width;
  TERRAIN_HEIGHT = height;
  terrainData = new Uint8Array(width * height);

  for (let i = 0; i < levelTerrain.length && i < terrainData.length; i++) {
    terrainData[i] = levelTerrain[i];
  }

  terrainNeedsUpdate = true;
}

// Get terrain dimensions
export function getTerrainDimensions(): { width: number; height: number } {
  return { width: TERRAIN_WIDTH, height: TERRAIN_HEIGHT };
}

// Get terrain data
export function getTerrainData(): Uint8Array {
  return terrainData;
}

// Check terrain at position
export function checkTerrainAt(x: number, y: number): TerrainType {
  const ix = Math.floor(x);
  const iy = Math.floor(y);

  if (ix < 0 || ix >= TERRAIN_WIDTH || iy < 0 || iy >= TERRAIN_HEIGHT) {
    return TerrainType.AIR;
  }

  return terrainData[iy * TERRAIN_WIDTH + ix];
}

// Check if position is solid (for collision)
export function isSolidAt(x: number, y: number): boolean {
  const type = checkTerrainAt(x, y);
  return type === TerrainType.SOLID || type === TerrainType.STEEL;
}

// Modify terrain (circle)
export function modifyTerrain(
  centerX: number,
  centerY: number,
  radius: number,
  newType: TerrainType
): void {
  const r2 = radius * radius;

  for (let dy = -Math.ceil(radius); dy <= Math.ceil(radius); dy++) {
    for (let dx = -Math.ceil(radius); dx <= Math.ceil(radius); dx++) {
      if (dx * dx + dy * dy <= r2) {
        const x = Math.floor(centerX + dx);
        const y = Math.floor(centerY + dy);

        if (x >= 0 && x < TERRAIN_WIDTH && y >= 0 && y < TERRAIN_HEIGHT) {
          const index = y * TERRAIN_WIDTH + x;

          // Steel is not modifiable
          if (terrainData[index] !== TerrainType.STEEL) {
            terrainData[index] = newType;
          }
        }
      }
    }
  }

  terrainNeedsUpdate = true;
}

// Modify terrain (line - for basher/miner)
export function modifyTerrainLine(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  thickness: number,
  newType: TerrainType
): boolean {
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const steps = Math.max(dx, dy);

  let hitSteel = false;

  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;

    // Check for steel
    if (checkTerrainAt(x, y) === TerrainType.STEEL) {
      hitSteel = true;
      break;
    }

    // Circle around each point
    modifyTerrain(x, y, thickness, newType);
  }

  return hitSteel;
}

// Check if terrain needs update
export function doesTerrainNeedUpdate(): boolean {
  const needed = terrainNeedsUpdate;
  terrainNeedsUpdate = false;
  return needed;
}

// Force terrain update flag
export function markTerrainForUpdate(): void {
  terrainNeedsUpdate = true;
}

// Find spawn position in terrain
export function findSpawnPosition(): { x: number; y: number } | null {
  for (let y = 0; y < TERRAIN_HEIGHT; y++) {
    for (let x = 0; x < TERRAIN_WIDTH; x++) {
      if (terrainData[y * TERRAIN_WIDTH + x] === TerrainType.SPAWN) {
        return { x, y };
      }
    }
  }
  return null;
}

// Find exit position in terrain
export function findExitPosition(): { x: number; y: number } | null {
  for (let y = 0; y < TERRAIN_HEIGHT; y++) {
    for (let x = 0; x < TERRAIN_WIDTH; x++) {
      if (terrainData[y * TERRAIN_WIDTH + x] === TerrainType.EXIT) {
        return { x, y };
      }
    }
  }
  return null;
}

// Generate simple terrain for testing
export function generateTestTerrain(width: number, height: number): number[] {
  const terrain = new Array(width * height).fill(TerrainType.AIR);

  // Ground platform
  for (let x = 0; x < width; x++) {
    for (let y = height - 10; y < height; y++) {
      terrain[y * width + x] = TerrainType.SOLID;
    }
  }

  // Middle platform
  for (let x = 40; x < 120; x++) {
    for (let y = 30; y < 35; y++) {
      terrain[y * width + x] = TerrainType.SOLID;
    }
  }

  // Steel section
  for (let x = 70; x < 90; x++) {
    for (let y = height - 5; y < height; y++) {
      terrain[y * width + x] = TerrainType.STEEL;
    }
  }

  return terrain;
}
