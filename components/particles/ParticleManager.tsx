// Particle Manager - Manages all active particle effects in the scene

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import ExplosionParticles from './ExplosionParticles';
import DigParticles from './DigParticles';
import SplashParticles from './SplashParticles';
import SpawnEffect from './SpawnEffect';
import SkillAssignedEffect from './SkillAssignedEffect';
import { SkillType } from '../../src/types/game';

export type ParticleType = 'explosion' | 'dig' | 'splash' | 'spawn' | 'skillAssigned';

interface ParticleEffect {
  id: string;
  type: ParticleType;
  position: [number, number, number];
  options?: {
    color?: string;
    direction?: 'down' | 'left' | 'right' | 'diagonal';
    splashType?: 'water' | 'lava';
    skill?: SkillType;
    duration?: number;
  };
}

export interface ParticleManagerRef {
  spawnParticle: (
    type: ParticleType,
    position: [number, number, number],
    options?: ParticleEffect['options']
  ) => void;
  spawnExplosion: (position: [number, number, number], color?: string) => void;
  spawnDig: (
    position: [number, number, number],
    direction: 'down' | 'left' | 'right' | 'diagonal',
    color?: string
  ) => void;
  spawnSplash: (position: [number, number, number], type: 'water' | 'lava') => void;
  spawnSpawn: (position: [number, number, number]) => void;
  spawnSkillAssigned: (position: [number, number, number], skill: SkillType) => void;
  clearAll: () => void;
}

let particleIdCounter = 0;

const ParticleManager = forwardRef<ParticleManagerRef, {}>((_props, ref) => {
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  const generateId = useCallback(() => {
    particleIdCounter += 1;
    return `particle-${particleIdCounter}-${Date.now()}`;
  }, []);

  const spawnParticle = useCallback(
    (
      type: ParticleType,
      position: [number, number, number],
      options?: ParticleEffect['options']
    ) => {
      const newParticle: ParticleEffect = {
        id: generateId(),
        type,
        position,
        options,
      };
      setParticles((prev) => [...prev, newParticle]);
    },
    [generateId]
  );

  const removeParticle = useCallback((id: string) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const spawnExplosion = useCallback(
    (position: [number, number, number], color?: string) => {
      spawnParticle('explosion', position, { color });
    },
    [spawnParticle]
  );

  const spawnDig = useCallback(
    (
      position: [number, number, number],
      direction: 'down' | 'left' | 'right' | 'diagonal',
      color?: string
    ) => {
      spawnParticle('dig', position, { direction, color });
    },
    [spawnParticle]
  );

  const spawnSplash = useCallback(
    (position: [number, number, number], type: 'water' | 'lava') => {
      spawnParticle('splash', position, { splashType: type });
    },
    [spawnParticle]
  );

  const spawnSpawn = useCallback(
    (position: [number, number, number]) => {
      spawnParticle('spawn', position);
    },
    [spawnParticle]
  );

  const spawnSkillAssigned = useCallback(
    (position: [number, number, number], skill: SkillType) => {
      spawnParticle('skillAssigned', position, { skill });
    },
    [spawnParticle]
  );

  const clearAll = useCallback(() => {
    setParticles([]);
  }, []);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      spawnParticle,
      spawnExplosion,
      spawnDig,
      spawnSplash,
      spawnSpawn,
      spawnSkillAssigned,
      clearAll,
    }),
    [spawnParticle, spawnExplosion, spawnDig, spawnSplash, spawnSpawn, spawnSkillAssigned, clearAll]
  );

  return (
    <group name="particle-manager">
      {particles.map((particle) => {
        const onComplete = () => removeParticle(particle.id);

        switch (particle.type) {
          case 'explosion':
            return (
              <ExplosionParticles
                key={particle.id}
                position={particle.position}
                color={particle.options?.color}
                onComplete={onComplete}
              />
            );

          case 'dig':
            return (
              <DigParticles
                key={particle.id}
                position={particle.position}
                direction={particle.options?.direction || 'down'}
                color={particle.options?.color}
                onComplete={onComplete}
              />
            );

          case 'splash':
            return (
              <SplashParticles
                key={particle.id}
                position={particle.position}
                type={particle.options?.splashType || 'water'}
                onComplete={onComplete}
              />
            );

          case 'spawn':
            return (
              <SpawnEffect
                key={particle.id}
                position={particle.position}
                onComplete={onComplete}
              />
            );

          case 'skillAssigned':
            return (
              <SkillAssignedEffect
                key={particle.id}
                position={particle.position}
                skill={particle.options?.skill || 'DIGGER'}
                onComplete={onComplete}
              />
            );

          default:
            return null;
        }
      })}
    </group>
  );
});

ParticleManager.displayName = 'ParticleManager';

export default ParticleManager;
