// Dig Particles - For dig/bash/mine effects

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DigParticlesProps {
  position: [number, number, number];
  direction: 'down' | 'left' | 'right' | 'diagonal';
  onComplete?: () => void;
  color?: string;
  particleCount?: number;
  duration?: number;
}

export default function DigParticles({
  position,
  direction,
  onComplete,
  color = '#8B4513',
  particleCount = 20,
  duration = 0.5,
}: DigParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());
  const velocitiesRef = useRef<Float32Array>();

  // Calculate direction vector
  const directionVector = useMemo(() => {
    switch (direction) {
      case 'down':
        return new THREE.Vector3(0, -1, 0);
      case 'left':
        return new THREE.Vector3(-1, 0, 0);
      case 'right':
        return new THREE.Vector3(1, 0, 0);
      case 'diagonal':
        return new THREE.Vector3(0.7, -0.7, 0).normalize();
      default:
        return new THREE.Vector3(0, -1, 0);
    }
  }, [direction]);

  // Initialize particle positions and velocities
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Start at dig position
      positions[i3] = position[0];
      positions[i3 + 1] = position[1];
      positions[i3 + 2] = position[2];

      // Velocity in dig direction with spread
      const spread = 0.5;
      const speed = 1 + Math.random() * 2;

      velocities[i3] = directionVector.x * speed + (Math.random() - 0.5) * spread;
      velocities[i3 + 1] = directionVector.y * speed + Math.random() * 0.5;
      velocities[i3 + 2] = directionVector.z * speed + (Math.random() - 0.5) * spread;

      // Vary color slightly
      const variance = 0.2;
      colors[i3] = baseColor.r * (1 + (Math.random() - 0.5) * variance);
      colors[i3 + 1] = baseColor.g * (1 + (Math.random() - 0.5) * variance);
      colors[i3 + 2] = baseColor.b * (1 + (Math.random() - 0.5) * variance);

      // Random sizes for dirt chunks
      sizes[i] = 0.05 + Math.random() * 0.1;
    }

    velocitiesRef.current = velocities;
    return { positions, colors, sizes };
  }, [particleCount, position, color, directionVector]);

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
    const positions = positionAttr.array as Float32Array;
    const velocities = velocitiesRef.current;

    const gravity = -15;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      // Apply gravity
      velocities[i3 + 1] += gravity * delta;
    }

    positionAttr.needsUpdate = true;

    // Fade out
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - progress;
  });

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
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
