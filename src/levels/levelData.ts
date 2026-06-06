// Level Definitions

import type { LevelData, LevelCategory, ThemeId, SkillCounts } from '../types/game';
import { TerrainType } from '../terrain/terrainUtils';

// Helper function to generate terrain
function generateTerrain(
  width: number,
  height: number,
  features: Array<{
    type: 'ground' | 'platform' | 'steel' | 'water' | 'wall' | 'lava';
    x: number;
    y: number;
    w: number;
    h: number;
  }>
): number[] {
  const terrain = new Array(width * height).fill(TerrainType.AIR);

  for (const feature of features) {
    const terrainType =
      feature.type === 'ground' || feature.type === 'platform'
        ? TerrainType.SOLID
        : feature.type === 'steel'
        ? TerrainType.STEEL
        : feature.type === 'water'
        ? TerrainType.WATER
        : feature.type === 'lava'
        ? TerrainType.LAVA
        : TerrainType.SOLID;

    for (let dy = 0; dy < feature.h; dy++) {
      for (let dx = 0; dx < feature.w; dx++) {
        const x = feature.x + dx;
        const y = feature.y + dy;
        if (x >= 0 && x < width && y >= 0 && y < height) {
          terrain[y * width + x] = terrainType;
        }
      }
    }
  }

  return terrain;
}

// ============================================
// FUN LEVELS (1-30)
// ============================================
const FUN_LEVELS: LevelData[] = [
  {
    id: 'fun-1',
    name: 'Just Dig!',
    category: 'FUN',
    themeId: 'dirt',
    width: 160,
    height: 80,
    terrain: generateTerrain(160, 80, [
      { type: 'platform', x: 60, y: 20, w: 40, h: 5 },
      { type: 'ground', x: 0, y: 70, w: 160, h: 10 },
    ]),
    spawnPosition: { x: 80, y: 15 },
    exitPosition: { x: 80, y: 65 },
    totalLemmings: 10,
    requiredSaved: 1,
    releaseRate: 50,
    timeLimit: 300,
    skills: { CLIMBER: 0, FLOATER: 0, BOMBER: 0, BLOCKER: 0, BUILDER: 0, BASHER: 0, MINER: 0, DIGGER: 10 },
  },
  {
    id: 'fun-2',
    name: 'Only Floaters Can Survive This',
    category: 'FUN',
    themeId: 'marble',
    width: 160,
    height: 100,
    terrain: generateTerrain(160, 100, [
      { type: 'platform', x: 30, y: 10, w: 30, h: 5 },
      { type: 'ground', x: 0, y: 90, w: 160, h: 10 },
    ]),
    spawnPosition: { x: 45, y: 5 },
    exitPosition: { x: 120, y: 85 },
    totalLemmings: 10,
    requiredSaved: 10,
    releaseRate: 50,
    timeLimit: 240,
    skills: { CLIMBER: 0, FLOATER: 10, BOMBER: 0, BLOCKER: 0, BUILDER: 0, BASHER: 0, MINER: 0, DIGGER: 0 },
  },
  {
    id: 'fun-3',
    name: 'Tailor-made for Blockers',
    category: 'FUN',
    themeId: 'dirt',
    width: 160,
    height: 80,
    terrain: generateTerrain(160, 80, [
      { type: 'platform', x: 20, y: 30, w: 120, h: 5 },
      { type: 'ground', x: 0, y: 70, w: 160, h: 10 },
      { type: 'water', x: 0, y: 70, w: 30, h: 10 },
      { type: 'water', x: 130, y: 70, w: 30, h: 10 },
    ]),
    spawnPosition: { x: 40, y: 25 },
    exitPosition: { x: 80, y: 65 },
    totalLemmings: 50,
    requiredSaved: 48,
    releaseRate: 50,
    timeLimit: 300,
    skills: { CLIMBER: 0, FLOATER: 0, BOMBER: 0, BLOCKER: 10, BUILDER: 0, BASHER: 0, MINER: 0, DIGGER: 0 },
  },
  {
    id: 'fun-4',
    name: "Now Use Miners and Climbers",
    category: 'FUN',
    themeId: 'crystal',
    width: 160,
    height: 80,
    terrain: generateTerrain(160, 80, [
      { type: 'platform', x: 20, y: 20, w: 40, h: 30 },
      { type: 'ground', x: 0, y: 70, w: 160, h: 10 },
      { type: 'wall', x: 100, y: 30, w: 5, h: 40 },
    ]),
    spawnPosition: { x: 40, y: 15 },
    exitPosition: { x: 130, y: 65 },
    totalLemmings: 20,
    requiredSaved: 18,
    releaseRate: 50,
    timeLimit: 300,
    skills: { CLIMBER: 10, FLOATER: 0, BOMBER: 0, BLOCKER: 0, BUILDER: 0, BASHER: 0, MINER: 10, DIGGER: 0 },
  },
  {
    id: 'fun-5',
    name: 'You Need Bashers This Time',
    category: 'FUN',
    themeId: 'brick',
    width: 160,
    height: 80,
    terrain: generateTerrain(160, 80, [
      { type: 'ground', x: 0, y: 60, w: 160, h: 20 },
      { type: 'wall', x: 70, y: 30, w: 10, h: 30 },
      { type: 'wall', x: 100, y: 30, w: 10, h: 30 },
    ]),
    spawnPosition: { x: 30, y: 55 },
    exitPosition: { x: 140, y: 55 },
    totalLemmings: 20,
    requiredSaved: 20,
    releaseRate: 50,
    timeLimit: 300,
    skills: { CLIMBER: 0, FLOATER: 0, BOMBER: 0, BLOCKER: 0, BUILDER: 0, BASHER: 10, MINER: 0, DIGGER: 0 },
  },
];

// Generate remaining FUN levels
for (let i = 6; i <= 30; i++) {
  FUN_LEVELS.push({
    id: `fun-${i}`,
    name: `Fun Level ${i}`,
    category: 'FUN',
    themeId: ['dirt', 'marble', 'crystal', 'brick', 'fire'][i % 5] as ThemeId,
    width: 160,
    height: 80,
    terrain: generateTerrain(160, 80, [
      { type: 'platform', x: 20 + (i % 4) * 10, y: 20 + (i % 3) * 5, w: 40, h: 5 },
      { type: 'ground', x: 0, y: 70, w: 160, h: 10 },
    ]),
    spawnPosition: { x: 40, y: 15 },
    exitPosition: { x: 120, y: 65 },
    totalLemmings: 20 + i,
    requiredSaved: 10 + Math.floor(i / 2),
    releaseRate: 50,
    timeLimit: 300,
    skills: {
      CLIMBER: Math.floor(i / 5),
      FLOATER: Math.floor(i / 5),
      BOMBER: Math.floor(i / 6),
      BLOCKER: Math.floor(i / 6),
      BUILDER: Math.floor(i / 4),
      BASHER: Math.floor(i / 5),
      MINER: Math.floor(i / 5),
      DIGGER: Math.floor(i / 4),
    },
  });
}

// ============================================
// TRICKY LEVELS (31-60)
// ============================================
const TRICKY_LEVELS: LevelData[] = [];
for (let i = 1; i <= 30; i++) {
  TRICKY_LEVELS.push({
    id: `tricky-${i}`,
    name: `Tricky Level ${i}`,
    category: 'TRICKY',
    themeId: ['crystal', 'fire', 'marble', 'brick', 'dirt'][i % 5] as ThemeId,
    width: 200,
    height: 100,
    terrain: generateTerrain(200, 100, [
      { type: 'platform', x: 30, y: 25, w: 50, h: 5 },
      { type: 'platform', x: 120, y: 45, w: 50, h: 5 },
      { type: 'ground', x: 0, y: 90, w: 200, h: 10 },
      { type: 'steel', x: 80, y: 70, w: 40, h: 5 },
    ]),
    spawnPosition: { x: 55, y: 20 },
    exitPosition: { x: 145, y: 85 },
    totalLemmings: 50 + i,
    requiredSaved: 25 + Math.floor(i / 2),
    releaseRate: 30 + i,
    timeLimit: 300 - i * 2,
    skills: {
      CLIMBER: 5 + Math.floor(i / 10),
      FLOATER: 5 + Math.floor(i / 10),
      BOMBER: 3 + Math.floor(i / 10),
      BLOCKER: 3 + Math.floor(i / 10),
      BUILDER: 8 + Math.floor(i / 5),
      BASHER: 5 + Math.floor(i / 10),
      MINER: 5 + Math.floor(i / 10),
      DIGGER: 5 + Math.floor(i / 10),
    },
  });
}

// ============================================
// TAXING LEVELS (61-90)
// ============================================
const TAXING_LEVELS: LevelData[] = [];
for (let i = 1; i <= 30; i++) {
  TAXING_LEVELS.push({
    id: `taxing-${i}`,
    name: `Taxing Level ${i}`,
    category: 'TAXING',
    themeId: ['fire', 'crystal', 'brick', 'marble', 'dirt'][i % 5] as ThemeId,
    width: 200,
    height: 100,
    terrain: generateTerrain(200, 100, [
      { type: 'platform', x: 20, y: 20, w: 30, h: 5 },
      { type: 'platform', x: 80, y: 40, w: 40, h: 5 },
      { type: 'platform', x: 140, y: 60, w: 40, h: 5 },
      { type: 'ground', x: 0, y: 90, w: 200, h: 10 },
      { type: 'steel', x: 60, y: 70, w: 80, h: 5 },
      { type: 'water', x: 0, y: 90, w: 40, h: 10 },
    ]),
    spawnPosition: { x: 35, y: 15 },
    exitPosition: { x: 160, y: 55 },
    totalLemmings: 80 + i,
    requiredSaved: 60 + i,
    releaseRate: 50 + Math.floor(i / 2),
    timeLimit: 240 - i * 2,
    skills: {
      CLIMBER: 3 + Math.floor(i / 15),
      FLOATER: 3 + Math.floor(i / 15),
      BOMBER: 2 + Math.floor(i / 15),
      BLOCKER: 2 + Math.floor(i / 15),
      BUILDER: 5 + Math.floor(i / 10),
      BASHER: 3 + Math.floor(i / 15),
      MINER: 3 + Math.floor(i / 15),
      DIGGER: 3 + Math.floor(i / 15),
    },
  });
}

// ============================================
// MAYHEM LEVELS (91-120)
// ============================================
const MAYHEM_LEVELS: LevelData[] = [];
for (let i = 1; i <= 30; i++) {
  MAYHEM_LEVELS.push({
    id: `mayhem-${i}`,
    name: `Mayhem Level ${i}`,
    category: 'MAYHEM',
    themeId: ['fire', 'brick', 'crystal', 'marble', 'dirt'][i % 5] as ThemeId,
    width: 240,
    height: 120,
    terrain: generateTerrain(240, 120, [
      { type: 'platform', x: 20, y: 15, w: 25, h: 5 },
      { type: 'platform', x: 60, y: 35, w: 30, h: 5 },
      { type: 'platform', x: 110, y: 55, w: 30, h: 5 },
      { type: 'platform', x: 160, y: 75, w: 30, h: 5 },
      { type: 'ground', x: 0, y: 110, w: 240, h: 10 },
      { type: 'steel', x: 50, y: 90, w: 140, h: 5 },
      { type: 'water', x: 0, y: 110, w: 50, h: 10 },
      { type: 'lava', x: 190, y: 110, w: 50, h: 10 },
    ]),
    spawnPosition: { x: 32, y: 10 },
    exitPosition: { x: 175, y: 70 },
    totalLemmings: 100,
    requiredSaved: 95 + Math.floor(i / 10),
    releaseRate: 99,
    timeLimit: 180 - i * 2,
    skills: {
      CLIMBER: 1,
      FLOATER: 1,
      BOMBER: 1,
      BLOCKER: 1,
      BUILDER: 2,
      BASHER: 1,
      MINER: 1,
      DIGGER: 1,
    },
  });
}

// All levels combined
export const ALL_LEVELS: LevelData[] = [
  ...FUN_LEVELS,
  ...TRICKY_LEVELS,
  ...TAXING_LEVELS,
  ...MAYHEM_LEVELS,
];

// Helper functions
export function getLevelById(id: string): LevelData | undefined {
  return ALL_LEVELS.find((level) => level.id === id);
}

export function getLevelsByCategory(category: LevelCategory): LevelData[] {
  return ALL_LEVELS.filter((level) => level.category === category);
}

export function getNextLevel(currentId: string): LevelData | undefined {
  const index = ALL_LEVELS.findIndex((level) => level.id === currentId);
  if (index !== -1 && index < ALL_LEVELS.length - 1) {
    return ALL_LEVELS[index + 1];
  }
  return undefined;
}

export function getTotalLevels(): number {
  return ALL_LEVELS.length;
}

export function getLevelsPerCategory(): number {
  return 30;
}
