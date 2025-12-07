// ECS World Initialization using simple array-based approach
// Note: Using simplified ECS for React Native compatibility

import { LemmingEntity, createDefaultLemming } from './components';
import type { SkillType, Vector3 } from '../src/types/game';

// World state
let entities: LemmingEntity[] = [];
let nextId = 0;
let nextInstanceIndex = 0;

// Callbacks for external systems
let onEntityAdded: ((entity: LemmingEntity) => void) | null = null;
let onEntityRemoved: ((entity: LemmingEntity) => void) | null = null;
let onSoundPlay: ((sound: string) => void) | null = null;
let onParticleSpawn: ((type: string, position: Vector3) => void) | null = null;
let onLemmingSaved: (() => void) | null = null;

// World management
export const world = {
  get entities() {
    return entities;
  },

  get count() {
    return entities.length;
  },

  // Add a new lemming
  add(position: Vector3, direction: 1 | -1 = 1): LemmingEntity {
    const id = `lemming-${nextId++}`;
    const entity = createDefaultLemming(id, position, direction, nextInstanceIndex++);
    entities.push(entity);
    onEntityAdded?.(entity);
    return entity;
  },

  // Remove a lemming
  remove(entity: LemmingEntity): void {
    const index = entities.indexOf(entity);
    if (index !== -1) {
      entities.splice(index, 1);
      onEntityRemoved?.(entity);
    }
  },

  // Remove by id
  removeById(id: string): void {
    const entity = entities.find((e) => e.id === id);
    if (entity) {
      this.remove(entity);
    }
  },

  // Get entity by id
  getById(id: string): LemmingEntity | undefined {
    return entities.find((e) => e.id === id);
  },

  // Clear all entities
  clear(): void {
    entities = [];
    nextInstanceIndex = 0;
  },

  // Reset world (keep nextId for unique ids)
  reset(): void {
    entities = [];
    nextInstanceIndex = 0;
  },

  // Set callbacks
  setCallbacks(callbacks: {
    onEntityAdded?: (entity: LemmingEntity) => void;
    onEntityRemoved?: (entity: LemmingEntity) => void;
    onSoundPlay?: (sound: string) => void;
    onParticleSpawn?: (type: string, position: Vector3) => void;
    onLemmingSaved?: () => void;
  }): void {
    if (callbacks.onEntityAdded) onEntityAdded = callbacks.onEntityAdded;
    if (callbacks.onEntityRemoved) onEntityRemoved = callbacks.onEntityRemoved;
    if (callbacks.onSoundPlay) onSoundPlay = callbacks.onSoundPlay;
    if (callbacks.onParticleSpawn) onParticleSpawn = callbacks.onParticleSpawn;
    if (callbacks.onLemmingSaved) onLemmingSaved = callbacks.onLemmingSaved;
  },

  // Trigger sound
  playSound(sound: string): void {
    onSoundPlay?.(sound);
  },

  // Spawn particles
  spawnParticles(type: string, position: Vector3): void {
    onParticleSpawn?.(type, position);
  },

  // Increment saved counter
  incrementSaved(): void {
    onLemmingSaved?.();
  },
};

// Query helpers
export const queries = {
  // All active lemmings (not dead, not saved)
  getActiveLemmings(): LemmingEntity[] {
    return entities.filter(
      (e) => e.state !== 'DEAD' && e.state !== 'SAVED'
    );
  },

  // Lemmings currently falling
  getFallingLemmings(): LemmingEntity[] {
    return entities.filter((e) => e.state === 'FALLING');
  },

  // Active blockers
  getBlockers(): LemmingEntity[] {
    return entities.filter((e) => e.isBlocking && e.state === 'BLOCKING');
  },

  // Bombers with active countdown
  getBombers(): LemmingEntity[] {
    return entities.filter((e) => e.bomberTimer > 0);
  },

  // Saved lemmings
  getSavedLemmings(): LemmingEntity[] {
    return entities.filter((e) => e.state === 'SAVED');
  },

  // Dead lemmings
  getDeadLemmings(): LemmingEntity[] {
    return entities.filter((e) => e.state === 'DEAD');
  },

  // Walking lemmings (for skill assignment)
  getWalkingLemmings(): LemmingEntity[] {
    return entities.filter((e) => e.state === 'WALKING');
  },
};

// Skill assignment
export function assignSkill(entity: LemmingEntity, skill: SkillType): boolean {
  // Can't assign skills to dead or saved lemmings
  if (entity.state === 'DEAD' || entity.state === 'SAVED') return false;

  // Can't assign skills to exploding lemmings
  if (entity.state === 'EXPLODING') return false;

  // Blockers can only receive bomber skill
  if (entity.state === 'BLOCKING' && skill !== 'BOMBER') return false;

  switch (skill) {
    case 'CLIMBER':
      if (entity.isClimber) return false;
      entity.isClimber = true;
      return true;

    case 'FLOATER':
      if (entity.isFloater) return false;
      entity.isFloater = true;
      return true;

    case 'BOMBER':
      if (entity.bomberTimer > 0) return false;
      entity.previousState = entity.state;
      entity.state = 'BOMBING';
      entity.bomberTimer = 5.0;
      entity.countdownValue = 5;
      entity.showCountdown = true;
      return true;

    case 'BLOCKER':
      if (entity.state !== 'WALKING') return false;
      entity.state = 'BLOCKING';
      entity.isBlocking = true;
      return true;

    case 'BUILDER':
      if (entity.state !== 'WALKING') return false;
      entity.state = 'BUILDING';
      entity.builderBricks = 12;
      entity.buildTimer = 0;
      return true;

    case 'BASHER':
      if (entity.state !== 'WALKING') return false;
      entity.state = 'BASHING';
      return true;

    case 'MINER':
      if (entity.state !== 'WALKING') return false;
      entity.state = 'MINING';
      entity.showMiningHelmet = true;
      return true;

    case 'DIGGER':
      if (entity.state !== 'WALKING') return false;
      entity.state = 'DIGGING';
      return true;

    default:
      return false;
  }
}

// Export for external use
export { createDefaultLemming };
export type { LemmingEntity };
