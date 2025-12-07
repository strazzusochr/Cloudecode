// Visual Theme Definitions

import type { ThemeId } from './types/game';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  solidColor: string;
  steelColor: string;
  backgroundColor: string;
  ambientLight: number;
  fogColor: string;
  fogDensity: number;
  groundColor: string;
  skyColor: string;
  waterColor: string;
  lavaColor: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  dirt: {
    id: 'dirt',
    name: 'Dirt/Earth',
    solidColor: '#8B5A2B',
    steelColor: '#708090',
    backgroundColor: '#87CEEB',
    ambientLight: 0.6,
    fogColor: '#87CEEB',
    fogDensity: 0.02,
    groundColor: '#228B22',
    skyColor: '#87CEEB',
    waterColor: '#4169E1',
    lavaColor: '#FF4500',
  },
  fire: {
    id: 'fire',
    name: 'Fire/Hell',
    solidColor: '#8B0000',
    steelColor: '#2F4F4F',
    backgroundColor: '#1a0a0a',
    ambientLight: 0.4,
    fogColor: '#ff4500',
    fogDensity: 0.04,
    groundColor: '#4a0000',
    skyColor: '#1a0a0a',
    waterColor: '#FF4500',
    lavaColor: '#FF6600',
  },
  marble: {
    id: 'marble',
    name: 'Marble/Pillar',
    solidColor: '#E8E8E8',
    steelColor: '#C0C0C0',
    backgroundColor: '#E0F0FF',
    ambientLight: 0.7,
    fogColor: '#E0F0FF',
    fogDensity: 0.01,
    groundColor: '#F5F5DC',
    skyColor: '#E0F0FF',
    waterColor: '#00CED1',
    lavaColor: '#FF4500',
  },
  crystal: {
    id: 'crystal',
    name: 'Crystal/Tech',
    solidColor: '#9370DB',
    steelColor: '#4169E1',
    backgroundColor: '#1a1a3e',
    ambientLight: 0.5,
    fogColor: '#9370DB',
    fogDensity: 0.03,
    groundColor: '#4B0082',
    skyColor: '#1a1a3e',
    waterColor: '#00BFFF',
    lavaColor: '#FF1493',
  },
  brick: {
    id: 'brick',
    name: 'Brick/Construction',
    solidColor: '#8B4513',
    steelColor: '#696969',
    backgroundColor: '#D2691E',
    ambientLight: 0.55,
    fogColor: '#D2691E',
    fogDensity: 0.025,
    groundColor: '#A0522D',
    skyColor: '#CD853F',
    waterColor: '#4682B4',
    lavaColor: '#FF4500',
  },
};

// Get theme configuration by ID
export function getThemeConfig(themeId: ThemeId): ThemeConfig {
  return THEMES[themeId] || THEMES.dirt;
}

// Get all theme IDs
export function getAllThemeIds(): ThemeId[] {
  return Object.keys(THEMES) as ThemeId[];
}

// Get theme name
export function getThemeName(themeId: ThemeId): string {
  return THEMES[themeId]?.name || 'Unknown';
}
