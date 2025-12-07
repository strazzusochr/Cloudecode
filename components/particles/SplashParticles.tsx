// Splash Particles - For water/lava death effects

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type SplashType = 'water' | 'lava';

interface SplashParticlesProps {
  position: [number, number, number];
  type: SplashType;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
}

const SPLASH_COLORS: Record<SplashType, { primary: string; secondary: string }> = {
  water: { primary: '#4488ff', secondary: '#88ccff' },
  lava: { primary: '#ff4400', secondary: '#ffaa00' },
};

export default function SplashParticles({
  position,
  type,
  onComplete,
  particleCount = 30,
  duration = 0.8,
}: SplashParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());
  const velocitiesRef = useRef<Float32Array>();

  const colors = SPLASH_COLORS[type];

  // Initialize particles
  const { positions, particleColors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const primaryColor = new THREE.Color(colors.primary);
    const secondaryColor = new THREE.Color(colors.secondary);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Start at splash position
      positions[i3] = position[0] + (Math.random() - 0.5) * 0.2;
      positions[i3 + 1] = position[1];
      positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 0.2;

      // Splash upward with spread
      const angle = Math.random() * Math.PI * 2;
      const spreadSpeed = Math.random() * 2;
      const upSpeed = 2 + Math.random() * 3;

      velocities[i3] = Math.cos(angle) * spreadSpeed;
      velocities[i3 + 1] = upSpeed;
      velocities[i3 + 2] = Math.sin(angle) * spreadSpeed;

      // Mix colors
      const t = Math.random();
      const mixedColor = primaryColor.clone().lerp(secondaryColor, t);

      particleColors[i3] = mixedColor.r;
      particleColors[i3 + 1] = mixedColor.g;
      particleColors[i3 + 2] = mixedColor.b;
    }

    velocitiesRef.current = velocities;
    return { positions, particleColors };
  }, [particleCount, position, colors]);

  // Animation loop
  useFrame((_, delta) => {
    if (!pointsRef.current || !velocitiesRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      onComplete?.();
      return;
    }

    const geometry = pointsRef.current.geometry as THREE.BufferGeometry;
    const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
    const positionsArray = positionAttr.array as Float32Array;
    const velocities = velocitiesRef.current;

    const gravity = -12;
    const drag = 0.95;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions
      positionsArray[i3] += velocities[i3] * delta;
      positionsArray[i3 + 1] += velocities[i3 + 1] * delta;
      positionsArray[i3 + 2] += velocities[i3 + 2] * delta;

      // Apply gravity and drag
      velocities[i3] *= drag;
      velocities[i3 + 1] += gravity * delta;
      velocities[i3 + 2] *= drag;

      // Stop at surface level
      if (positionsArray[i3 + 1] < position[1]) {
        positionsArray[i3 + 1] = position[1];
        velocities[i3 + 1] = 0;
        velocities[i3] *= 0.5;
        velocities[i3 + 2] *= 0.5;
      }
    }

    positionAttr.needsUpdate = true;

    // Fade out
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - Math.pow(progress, 1.5);
  });

  const blending = type === 'lava' ? THREE.AdditiveBlending : THREE.NormalBlending;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particleColors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={blending}
      />
    </points>
  );
}
