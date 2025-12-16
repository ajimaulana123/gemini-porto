import * as THREE from 'three';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import React, { useRef, useMemo } from 'react';

// --- Dither Material (Existing) ---
const DitherMaterial = shaderMaterial(
  {
    uTime: 0,
    uResolution: new THREE.Vector2(0, 0),
    uMouse: new THREE.Vector2(0, 0),
    uColor1: new THREE.Color('#050505'),
    uColor2: new THREE.Color('#e5e5e5'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    varying vec2 vUv;

    // Pseudo-random function
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    // Gradient Noise
    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }

    void main() {
        vec2 st = gl_FragCoord.xy / uResolution.xy;
        st.x *= uResolution.x / uResolution.y;

        // Fluid motion
        vec2 q = vec2(0.);
        q.x = fbm(st + 0.05 * uTime);
        q.y = fbm(st + vec2(1.0));

        vec2 r = vec2(0.);
        r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * uTime);
        r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * uTime);

        float f = fbm(st + r);

        // Interaction with mouse
        float mouseDist = length(st - (uMouse * vec2(uResolution.x/uResolution.y, 1.0)));
        f += 0.1 / (mouseDist + 0.1);

        // Dithering Logic
        float ditherThreshold = random(gl_FragCoord.xy);
        
        // Quantize f
        float stepped = step(0.5 + (sin(uTime * 0.5) * 0.1), f + (ditherThreshold * 0.2 - 0.1));

        // Mix colors based on stepped value
        vec3 finalColor = mix(uColor1, uColor2, stepped);
        
        // Scanline effect
        float scanline = sin(gl_FragCoord.y * 0.5 + uTime * 5.0) * 0.02;
        finalColor += scanline;

        gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

// --- Dust/Particle Material (New) ---
const DustMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector3(0, 0, 0),
    uColor: new THREE.Color('#ffffff'),
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform vec3 uMouse;
    varying float vAlpha;
    
    // Pseudo-random function for vertex
    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec3 pos = position;
      
      // Unique offset based on position
      float offset = random(pos.xy);

      // Gentle floating motion
      // We use the initial position to create varied movement patterns
      pos.x += sin(uTime * 0.2 + pos.y * 0.5) * 0.2;
      pos.y += cos(uTime * 0.15 + pos.x * 0.5) * 0.2;
      pos.z += sin(uTime * 0.1 + offset * 10.0) * 0.1;
      
      // Mouse repulsion logic
      // Calculate distance in XY plane (assuming simplified view)
      float d = distance(pos.xy, uMouse.xy);
      float radius = 3.0;
      
      if (d < radius) {
        float force = (radius - d) / radius;
        // Ease out
        force = force * force; 
        vec3 dir = normalize(pos - vec3(uMouse.xy, pos.z));
        pos += dir * force * 1.5;
        
        // Highlight particles near mouse
        vAlpha = 0.8;
      } else {
        vAlpha = 0.3 + (sin(uTime * 2.0 + offset * 20.0) * 0.1); // Twinkle
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      // Particles further away are smaller
      gl_PointSize = (3.0 + offset * 2.0) * (10.0 / -mvPosition.z);
    }
  `,
  // Fragment Shader
  `
    uniform vec3 uColor;
    varying float vAlpha;
    
    void main() {
      // Create a soft circle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft glow edge
      float strength = 1.0 - (r * 2.0);
      strength = pow(strength, 2.0);
      
      gl_FragColor = vec4(uColor, vAlpha * strength);
    }
  `
);

extend({ DitherMaterial, DustMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    ditherMaterial: any;
    dustMaterial: any;
  }
}

const ParticleField: React.FC = () => {
  const count = 300; // Minimalist count
  const mesh = useRef<any>(null);
  
  // Generate random positions
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Spread particles across a reasonable volume
      const x = (Math.random() - 0.5) * 20; 
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10; 
      temp[i * 3] = x;
      temp[i * 3 + 1] = y;
      temp[i * 3 + 2] = z;
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Map pointer to world coordinates approx at z=0
      // Viewport width/height gives us world units at z=0 plane for default camera
      const x = (state.pointer.x * state.viewport.width) / 2;
      const y = (state.pointer.y * state.viewport.height) / 2;
      
      // Lerp for smoother interaction? Direct is fine for "reactive" feel
      mesh.current.material.uniforms.uMouse.value.set(x, y, 0);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      {/* Additive blending for that holographic light feel */}
      <dustMaterial 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </points>
  );
};

export const DitherBackground: React.FC = () => {
  const materialRef = useRef<any>(null);

  useFrame(({ clock, size, pointer }) => {
    if (materialRef.current) {
      materialRef.current.uTime = clock.getElapsedTime();
      materialRef.current.uResolution = new THREE.Vector2(size.width, size.height);
      // Map pointer (-1 to 1) to (0 to 1) for shader UVs
      materialRef.current.uMouse = new THREE.Vector2((pointer.x + 1) / 2, (pointer.y + 1) / 2);
    }
  });

  return (
    <>
      <mesh position={[0, 0, -5]}> {/* Push background back slightly */}
        <planeGeometry args={[100, 100]} />
        <ditherMaterial ref={materialRef} />
      </mesh>
      <ParticleField />
    </>
  );
};
