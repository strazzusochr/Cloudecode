// Lemming State Machine - Full Implementation

import type { LemmingEntity, LemmingState } from '../components';
import { world } from '../index';
import { checkTerrainAt, modifyTerrain, TerrainType } from '../../src/terrain/terrainUtils';

// Constants
const WALK_SPEED = 2.0;
const CLIMB_SPEED = 1.5;
const FALL_SPEED = 8.0;
const DIG_SPEED = 0.5;
const SAFE_FALL_HEIGHT = 3.0; // ~63 pixels in original
const BUILDER_BRICKS = 12;
const BOMBER_COUNTDOWN = 5.0;

export interface StateHandler {
  enter: (entity: LemmingEntity) => void;
  update: (entity: LemmingEntity, delta: number, exitPosition: { x: number; y: number }) => LemmingState | null;
  exit: (entity: LemmingEntity) => void;
}

// ============================================
// STATE: WALKING
// ============================================
const walkingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'walk';
    entity.animationSpeed = 1.0;
  },

  update: (entity, delta, exitPosition) => {
    const moveX = entity.direction * WALK_SPEED * delta;
    entity.position.x += moveX;

    // Ground check
    const groundCheck = checkTerrainAt(
      entity.position.x,
      entity.position.y - 0.1
    );

    if (groundCheck === TerrainType.AIR) {
      entity.fallStartY = entity.position.y;
      return 'FALLING';
    }

    // Wall check
    const wallCheck = checkTerrainAt(
      entity.position.x + entity.direction * 0.5,
      entity.position.y + 0.5
    );

    if (wallCheck === TerrainType.SOLID || wallCheck === TerrainType.STEEL) {
      if (entity.isClimber) {
        return 'CLIMBING';
      } else {
        return 'TURNING';
      }
    }

    // Blocker check
    const blockers = world.entities.filter(
      (e) => e.isBlocking && e.id !== entity.id
    );

    for (const blocker of blockers) {
      const dx = entity.position.x - blocker.position.x;
      const dy = Math.abs(entity.position.y - blocker.position.y);

      if (dy < 1 && Math.abs(dx) < 0.5) {
        // Hit blocker - turn around
        if ((dx > 0 && entity.direction < 0) || (dx < 0 && entity.direction > 0)) {
          return 'TURNING';
        }
      }
    }

    // Exit check
    const distToExit = Math.sqrt(
      Math.pow(entity.position.x - exitPosition.x, 2) +
      Math.pow(entity.position.y - exitPosition.y, 2)
    );

    if (distToExit < 1.0) {
      return 'EXITING';
    }

    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: FALLING
// ============================================
const fallingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'fall';
    if (entity.fallStartY === 0) {
      entity.fallStartY = entity.position.y;
    }
  },

  update: (entity, delta) => {
    entity.position.y -= FALL_SPEED * delta;

    // Ground check
    const groundCheck = checkTerrainAt(
      entity.position.x,
      entity.position.y - 0.1
    );

    if (groundCheck !== TerrainType.AIR) {
      const fallDistance = entity.fallStartY - entity.position.y;

      // Floater activates during fall
      if (entity.isFloater && fallDistance > 0.5) {
        return 'FLOATING';
      }

      // Fatal fall
      if (fallDistance > SAFE_FALL_HEIGHT) {
        return 'SPLATTING';
      }

      return 'LANDING';
    }

    // Water/Lava check
    const hazardCheck = checkTerrainAt(entity.position.x, entity.position.y);
    if (hazardCheck === TerrainType.WATER || hazardCheck === TerrainType.LAVA) {
      return 'DROWNING';
    }

    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: FLOATING
// ============================================
const floatingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'float';
    entity.showUmbrella = true;
  },

  update: (entity, delta) => {
    // Slow fall with umbrella
    entity.position.y -= FALL_SPEED * 0.2 * delta;

    const groundCheck = checkTerrainAt(
      entity.position.x,
      entity.position.y - 0.1
    );

    if (groundCheck !== TerrainType.AIR) {
      return 'LANDING';
    }

    return null;
  },

  exit: (entity) => {
    entity.showUmbrella = false;
  },
};

// ============================================
// STATE: CLIMBING
// ============================================
const climbingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'climb';
    entity.showClimbingGear = true;
  },

  update: (entity, delta) => {
    entity.position.y += CLIMB_SPEED * delta;

    // Ceiling check (overhang)
    const ceilingCheck = checkTerrainAt(
      entity.position.x,
      entity.position.y + 1.0
    );

    if (ceilingCheck !== TerrainType.AIR) {
      // Can't go higher - fall back
      entity.direction *= -1;
      return 'FALLING';
    }

    // Top reached?
    const topCheck = checkTerrainAt(
      entity.position.x + entity.direction * 0.5,
      entity.position.y + 0.5
    );

    if (topCheck === TerrainType.AIR) {
      // Climb over edge
      entity.position.x += entity.direction * 0.5;
      entity.position.y += 0.5;
      return 'WALKING';
    }

    return null;
  },

  exit: (entity) => {
    entity.showClimbingGear = false;
  },
};

// ============================================
// STATE: BOMBING
// ============================================
const bombingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'countdown';
    entity.bomberTimer = BOMBER_COUNTDOWN;
    entity.showCountdown = true;
    entity.countdownValue = 5;
  },

  update: (entity, delta) => {
    entity.bomberTimer -= delta;
    entity.countdownValue = Math.ceil(entity.bomberTimer);

    // Continue walking during countdown
    if (entity.previousState === 'WALKING') {
      entity.position.x += entity.direction * WALK_SPEED * delta;

      // Check for falling
      const groundCheck = checkTerrainAt(
        entity.position.x,
        entity.position.y - 0.1
      );

      if (groundCheck === TerrainType.AIR) {
        entity.fallStartY = entity.position.y;
        // Still bombing while falling
      }
    }

    if (entity.bomberTimer <= 0) {
      return 'EXPLODING';
    }

    return null;
  },

  exit: (entity) => {
    entity.showCountdown = false;
  },
};

// ============================================
// STATE: EXPLODING
// ============================================
const explodingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'explode';

    // Play "Oh no!" sound
    world.playSound('oh_no');

    // Destroy terrain (circular crater)
    const CRATER_RADIUS = 2.0;
    modifyTerrain(
      entity.position.x,
      entity.position.y,
      CRATER_RADIUS,
      TerrainType.AIR
    );

    // Spawn explosion particles
    world.spawnParticles('explosion', entity.position);
  },

  update: (entity, delta) => {
    entity.animationProgress += delta;
    if (entity.animationProgress > 0.5) {
      return 'DEAD';
    }
    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: BLOCKING
// ============================================
const blockingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'block';
    entity.isBlocking = true;
  },

  update: (entity) => {
    // Blocker doesn't move
    // Can only be ended by bomber or terrain removal

    const groundCheck = checkTerrainAt(
      entity.position.x,
      entity.position.y - 0.1
    );

    if (groundCheck === TerrainType.AIR) {
      entity.isBlocking = false;
      return 'FALLING';
    }

    return null;
  },

  exit: (entity) => {
    entity.isBlocking = false;
  },
};

// ============================================
// STATE: BUILDING
// ============================================
const buildingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'build';
    entity.builderBricks = BUILDER_BRICKS;
    entity.buildTimer = 0;
  },

  update: (entity, delta) => {
    entity.buildTimer += delta;

    if (entity.buildTimer >= 0.3) {
      entity.buildTimer = 0;

      // Place brick
      const brickX = entity.position.x + entity.direction * 0.5;
      const brickY = entity.position.y + 0.2;

      modifyTerrain(brickX, brickY, 0.3, TerrainType.SOLID);
      world.playSound('build');

      // Move lemming onto brick
      entity.position.x += entity.direction * 0.4;
      entity.position.y += 0.3;

      entity.builderBricks--;

      // Warning on last 3 bricks
      if (entity.builderBricks <= 3 && entity.builderBricks > 0) {
        entity.animation = 'build_warning';
      }

      // Finished or hit ceiling
      if (entity.builderBricks <= 0) {
        return 'WALKING';
      }

      const ceilingCheck = checkTerrainAt(
        entity.position.x,
        entity.position.y + 1.0
      );

      if (ceilingCheck !== TerrainType.AIR) {
        entity.direction *= -1;
        return 'WALKING';
      }
    }

    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: BASHING
// ============================================
const bashingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'bash';
  },

  update: (entity, delta) => {
    // Dig horizontally
    const digX = entity.position.x + entity.direction * DIG_SPEED * delta;
    const digY = entity.position.y;

    const terrain = checkTerrainAt(digX + entity.direction * 0.5, digY);

    if (terrain === TerrainType.STEEL) {
      // Steel - stop and turn
      world.playSound('steel_clink');
      entity.direction *= -1;
      return 'WALKING';
    }

    if (terrain === TerrainType.AIR) {
      // Broke through
      return 'WALKING';
    }

    // Remove terrain
    modifyTerrain(digX, digY, 0.5, TerrainType.AIR);
    entity.position.x = digX;
    world.spawnParticles('dig', entity.position);

    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: MINING
// ============================================
const miningState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'mine';
    entity.showMiningHelmet = true;
  },

  update: (entity, delta) => {
    // Dig diagonally down
    const digX = entity.position.x + entity.direction * DIG_SPEED * delta;
    const digY = entity.position.y - DIG_SPEED * delta;

    const terrain = checkTerrainAt(digX, digY);

    if (terrain === TerrainType.STEEL) {
      world.playSound('steel_clink');
      return 'WALKING';
    }

    if (terrain === TerrainType.AIR) {
      // Broke through - fall
      return 'FALLING';
    }

    modifyTerrain(digX, digY, 0.5, TerrainType.AIR);
    entity.position.x = digX;
    entity.position.y = digY;
    world.spawnParticles('dig', entity.position);

    return null;
  },

  exit: (entity) => {
    entity.showMiningHelmet = false;
  },
};

// ============================================
// STATE: DIGGING
// ============================================
const diggingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'dig_down';
  },

  update: (entity, delta) => {
    // Dig vertically down
    const digY = entity.position.y - DIG_SPEED * delta;

    const terrain = checkTerrainAt(entity.position.x, digY - 0.5);

    if (terrain === TerrainType.STEEL) {
      world.playSound('steel_clink');
      return 'WALKING';
    }

    if (terrain === TerrainType.AIR) {
      return 'FALLING';
    }

    modifyTerrain(entity.position.x, digY, 0.4, TerrainType.AIR);
    entity.position.y = digY;
    world.spawnParticles('dig', entity.position);

    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: TURNING
// ============================================
const turningState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'turn';
    entity.direction *= -1;
    entity.rotation.y = entity.direction === 1 ? 0 : Math.PI;
  },

  update: (entity, delta) => {
    entity.animationProgress += delta;
    if (entity.animationProgress > 0.2) {
      return 'WALKING';
    }
    return null;
  },

  exit: (entity) => {
    entity.animationProgress = 0;
  },
};

// ============================================
// STATE: LANDING
// ============================================
const landingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'land';
  },

  update: (entity, delta) => {
    entity.animationProgress += delta;
    if (entity.animationProgress > 0.15) {
      return 'WALKING';
    }
    return null;
  },

  exit: (entity) => {
    entity.animationProgress = 0;
    entity.fallStartY = entity.position.y;
  },
};

// ============================================
// STATE: SPLATTING (Fatal fall)
// ============================================
const splattingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'splat';
    world.playSound('splat');
    world.spawnParticles('splat', entity.position);
  },

  update: (entity, delta) => {
    entity.animationProgress += delta;
    if (entity.animationProgress > 0.5) {
      return 'DEAD';
    }
    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: DROWNING
// ============================================
const drowningState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'drown';
    world.playSound('splash');
    world.spawnParticles('splash', entity.position);
  },

  update: (entity, delta) => {
    entity.position.y -= delta * 2;
    entity.animationProgress += delta;
    if (entity.animationProgress > 0.8) {
      return 'DEAD';
    }
    return null;
  },

  exit: () => {},
};

// ============================================
// STATE: EXITING (Goal reached!)
// ============================================
const exitingState: StateHandler = {
  enter: (entity) => {
    entity.animation = 'exit_celebrate';
    world.playSound('yippee');
    world.incrementSaved();
  },

  update: (entity, delta) => {
    entity.animationProgress += delta;
    if (entity.animationProgress > 1.0) {
      return 'SAVED';
    }
    return null;
  },

  exit: () => {},
};

// Terminal states (no handlers needed)
const deadState: StateHandler = {
  enter: (entity) => {
    entity.isDead = true;
  },
  update: () => null,
  exit: () => {},
};

const savedState: StateHandler = {
  enter: () => {},
  update: () => null,
  exit: () => {},
};

// State Registry
export const stateHandlers: Record<LemmingState, StateHandler> = {
  WALKING: walkingState,
  FALLING: fallingState,
  FLOATING: floatingState,
  CLIMBING: climbingState,
  BOMBING: bombingState,
  EXPLODING: explodingState,
  BLOCKING: blockingState,
  BUILDING: buildingState,
  BASHING: bashingState,
  MINING: miningState,
  DIGGING: diggingState,
  TURNING: turningState,
  LANDING: landingState,
  SPLATTING: splattingState,
  DROWNING: drowningState,
  EXITING: exitingState,
  DEAD: deadState,
  SAVED: savedState,
};

// Main update function
export function updateStateMachine(
  entity: LemmingEntity,
  delta: number,
  exitPosition: { x: number; y: number }
): void {
  const handler = stateHandlers[entity.state];
  if (!handler) return;

  const nextState = handler.update(entity, delta, exitPosition);

  if (nextState && nextState !== entity.state) {
    handler.exit(entity);
    entity.previousState = entity.state;
    entity.state = nextState;
    entity.animationProgress = 0;
    stateHandlers[nextState].enter(entity);
  }
}

// Update all lemmings
export function updateAllLemmings(
  delta: number,
  exitPosition: { x: number; y: number }
): void {
  for (const entity of world.entities) {
    if (entity.state !== 'DEAD' && entity.state !== 'SAVED') {
      updateStateMachine(entity, delta, exitPosition);
    }
  }
}
