// Particle Effects System - Index

export { default as ExplosionParticles } from './ExplosionParticles';
export { default as DigParticles } from './DigParticles';
export { default as SplashParticles } from './SplashParticles';
export { default as SpawnEffect } from './SpawnEffect';
export { default as SkillAssignedEffect } from './SkillAssignedEffect';
export { default as ParticleManager } from './ParticleManager';

// Types for particle system
export type ParticleType = 'explosion' | 'dig' | 'splash' | 'spawn' | 'skillAssigned';

export interface ParticleEffect {
  id: string;
  type: ParticleType;
  position: [number, number, number];
  options?: {
    color?: string;
    direction?: 'down' | 'left' | 'right' | 'diagonal';
    splashType?: 'water' | 'lava';
    skill?: string;
  };
}
