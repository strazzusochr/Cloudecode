// Skill Assigned Effect - Visual feedback when skill is assigned to lemming

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkillType } from '../../src/types/game';

interface SkillAssignedEffectProps {
  position: [number, number, number];
  skill: SkillType;
  onComplete?: () => void;
  duration?: number;
}

const SKILL_COLORS: Record<SkillType, string> = {
  CLIMBER: '#00ff88',
  FLOATER: '#88ccff',
  BOMBER: '#ff4400',
  BLOCKER: '#ff00ff',
  BUILDER: '#ffcc00',
  BASHER: '#ff8800',
  MINER: '#888888',
  DIGGER: '#8B4513',
};

const SKILL_ICONS: Record<SkillType, string> = {
  CLIMBER: '^',
  FLOATER: '~',
  BOMBER: '*',
  BLOCKER: '#',
  BUILDER: '+',
  BASHER: '>',
  MINER: '/',
  DIGGER: 'v',
};

export default function SkillAssignedEffect({
  position,
  skill,
  onComplete,
  duration = 0.8,
}: SkillAssignedEffectProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const starsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());

  const color = SKILL_COLORS[skill];
  const starCount = 12;

  // Initialize star particles
  const { positions, colors: starColors } = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < starCount; i++) {
      const i3 = i * 3;
      const angle = (i / starCount) * Math.PI * 2;

      positions[i3] = position[0] + Math.cos(angle) * 0.2;
      positions[i3 + 1] = position[1] + 0.3;
      positions[i3 + 2] = position[2] + Math.sin(angle) * 0.2;

      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
    }

    return { positions, colors };
  }, [starCount, position, color]);

  // Animation loop
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      onComplete?.();
      return;
    }

    // Animate ring
    if (ringRef.current) {
      const scale = 0.3 + progress * 0.7;
      ringRef.current.scale.set(scale, scale, 1);
      ringRef.current.rotation.z = progress * Math.PI * 2;
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - Math.pow(progress, 2);
    }

    // Animate star particles - burst outward and upward
    if (starsRef.current) {
      const geometry = starsRef.current.geometry as THREE.BufferGeometry;
      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const positionsArray = positionAttr.array as Float32Array;

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        const angle = (i / starCount) * Math.PI * 2;
        const radius = 0.2 + progress * 0.8;
        const height = 0.3 + progress * 0.5;

        positionsArray[i3] = position[0] + Math.cos(angle) * radius;
        positionsArray[i3 + 1] = position[1] + height;
        positionsArray[i3 + 2] = position[2] + Math.sin(angle) * radius;
      }

      positionAttr.needsUpdate = true;

      const material = starsRef.current.material as THREE.PointsMaterial;
      material.opacity = 1 - progress;
      material.size = 0.15 * (1 - progress * 0.5);
    }

    // Float entire group upward
    if (groupRef.current) {
      groupRef.current.position.y = progress * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Glowing ring */}
      <mesh
        ref={ringRef}
        position={[position[0], position[1] + 0.5, position[2]]}
      >
        <ringGeometry args={[0.15, 0.2, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Burst particles */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starCount}
            array={starColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={1}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
