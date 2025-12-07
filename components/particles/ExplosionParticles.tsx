// Explosion Particles - For bomber explosions

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExplosionParticlesProps {
  position: [number, number, number];
  onComplete?: () => void;
  color?: string;
  particleCount?: number;
  radius?: number;
  duration?: number;
}

export default function ExplosionParticles({
  position,
  onComplete,
  color = '#ff6600',
  particleCount = 50,
  radius = 1.5,
  duration = 1.0,
}: ExplosionParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());
  const velocitiesRef = useRef<Float32Array>();

  // Initialize particle positions and velocities
  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(color);
    const smokeColor = new THREE.Color('#333333');

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Start at explosion center
      positions[i3] = position[0];
      positions[i3 + 1] = position[1];
      positions[i3 + 2] = position[2];

      // Random spherical velocity
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 2 + Math.random() * 4;

      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i3 + 1] = Math.cos(phi) * speed + 2; // Bias upward
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;

      // Mix fire and smoke colors
      const t = Math.random();
      const particleColor = baseColor.clone().lerp(smokeColor, t * 0.5);

      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }

    velocitiesRef.current = velocities;
    return { positions, colors, velocities };
  }, [particleCount, position, color]);

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
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
    const positions = positionAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;
    const velocities = velocitiesRef.current;

    const gravity = -9.8;
    const drag = 0.98;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Update positions with velocity
      positions[i3] += velocities[i3] * delta;
      positions[i3 + 1] += velocities[i3 + 1] * delta;
      positions[i3 + 2] += velocities[i3 + 2] * delta;

      // Apply gravity and drag
      velocities[i3] *= drag;
      velocities[i3 + 1] += gravity * delta;
      velocities[i3 + 1] *= drag;
      velocities[i3 + 2] *= drag;

      // Fade to smoke color over time
      const fadeProgress = Math.pow(progress, 0.5);
      colors[i3] = colors[i3] * (1 - fadeProgress * 0.5);
      colors[i3 + 1] = colors[i3 + 1] * (1 - fadeProgress * 0.7);
      colors[i3 + 2] = colors[i3 + 2] * (1 - fadeProgress * 0.3);
    }

    positionAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;

    // Fade out material
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = 1 - Math.pow(progress, 2);
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
        size={0.15}
        vertexColors
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
