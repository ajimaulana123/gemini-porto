import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const FloatingObject: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.5;
      meshRef.current.rotation.y = Math.cos(t * 0.3) * 0.5;
      meshRef.current.position.y = Math.sin(t * 0.5) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 2]} scale={[1.5, 1.5, 1.5]}>
      <icosahedronGeometry args={[1, 4]} />
      {/* Using a physical material with wireframe to look technical */}
      <meshStandardMaterial
        color="#ffffff"
        wireframe
        transparent
        opacity={0.15}
        roughness={0}
        metalness={1}
      />
    </mesh>
  );
};
