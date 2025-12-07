// ECS Component Definitions

import type { LemmingState, SkillType, Vector3 } from '../src/types/game';

export type { LemmingState, SkillType };

export interface TransformComponent {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface LemmingComponent {
  id: string;
  state: LemmingState;
  previousState: LemmingState;
  direction: 1 | -1;

  // Permanent skills
  isClimber: boolean;
  isFloater: boolean;

  // State data
  fallStartY: number;
  bomberTimer: number;
  builderBricks: number;
  buildTimer: number;
  countdownValue: number;
  animationProgress: number;

  // Visual flags
  showUmbrella: boolean;
  showClimbingGear: boolean;
  showMiningHelmet: boolean;
  showCountdown: boolean;
  isBlocking: boolean;
  isDead: boolean;

  // Animation
  animation: string;
  animationSpeed: number;

  // Rendering
  instanceIndex: number;
}

export interface LemmingEntity extends TransformComponent, LemmingComponent {}

// Default lemming factory
export function createDefaultLemming(
  id: string,
  position: Vector3,
  direction: 1 | -1 = 1,
  instanceIndex: number = 0
): LemmingEntity {
  return {
    // Transform
    position: { ...position },
    rotation: { x: 0, y: direction === 1 ? 0 : Math.PI, z: 0 },
    scale: { x: 1, y: 1, z: 1 },

    // Lemming
    id,
    state: 'FALLING',
    previousState: 'FALLING',
    direction,

    // Skills
    isClimber: false,
    isFloater: false,

    // State data
    fallStartY: position.y,
    bomberTimer: 0,
    builderBricks: 0,
    buildTimer: 0,
    countdownValue: 0,
    animationProgress: 0,

    // Visual flags
    showUmbrella: false,
    showClimbingGear: false,
    showMiningHelmet: false,
    showCountdown: false,
    isBlocking: false,
    isDead: false,

    // Animation
    animation: 'fall',
    animationSpeed: 1.0,

    // Rendering
    instanceIndex,
  };
}
