// Spawn Effect - For lemming spawning animation

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SpawnEffectProps {
  position: [number, number, number];
  onComplete?: () => void;
  color?: string;
  duration?: number;
}

export default function SpawnEffect({
  position,
  onComplete,
  color = '#00ff00',
  duration = 0.6,
}: SpawnEffectProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now());

  const particleCount = 24;

  // Initialize ring particles
  const { positions, colors: particleColors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor = new THREE.Color(color);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.3;

      positions[i3] = position[0] + Math.cos(angle) * radius;
      positions[i3 + 1] = position[1];
      positions[i3 + 2] = position[2] + Math.sin(angle) * radius;

      colors[i3] = baseColor.r;
      colors[i3 + 1] = baseColor.g;
      colors[i3 + 2] = baseColor.b;
    }

    return { positions, colors };
  }, [particleCount, position, color]);

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
      const scale = 0.5 + progress * 1.5;
      ringRef.current.scale.set(scale, scale, scale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 1 - progress;
    }

    // Animate particles - spiral upward
    if (particlesRef.current) {
      const geometry = particlesRef.current.geometry as THREE.BufferGeometry;
      const positionAttr = geometry.attributes.position as THREE.BufferAttribute;
      const positionsArray = positionAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const angle = (i / particleCount) * Math.PI * 2 + progress * Math.PI * 4;
        const radius = 0.3 * (1 - progress * 0.5);
        const height = progress * 1.5;

        positionsArray[i3] = position[0] + Math.cos(angle) * radius;
        positionsArray[i3 + 1] = position[1] + height;
        positionsArray[i3 + 2] = position[2] + Math.sin(angle) * radius;
      }

      positionAttr.needsUpdate = true;

      const material = particlesRef.current.material as THREE.PointsMaterial;
      material.opacity = 1 - Math.pow(progress, 2);
    }
  });

  return (
    <group>
      {/* Expanding ring */}
      <mesh ref={ringRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={1}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Spiral particles */}
      <points ref={particlesRef}>
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
          size={0.08}
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
