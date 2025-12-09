import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { randomInCone, randomInSphere } from '../utils/geometry';

const vertexShader = `
  uniform float uTime;
  uniform float uMorph; // 0.0 = Scattered, 1.0 = Tree
  
  attribute vec3 aTreePos;
  attribute vec3 aScatterPos;
  attribute float aRandom;
  
  varying float vAlpha;
  varying vec3 vColor;
  
  // Gold and Emerald colors
  const vec3 colorGreen = vec3(0.02, 0.39, 0.03); // Deep Emerald
  const vec3 colorGold = vec3(1.0, 0.84, 0.0); // Gold
  
  void main() {
    // Cubic bezier ease for smoother transition
    float t = uMorph;
    float ease = t * t * (3.0 - 2.0 * t);
    
    vec3 targetPos = mix(aScatterPos, aTreePos, ease);
    
    // Add some "breathing" or "floating" motion based on randomness
    float floatSpeed = 1.0 + aRandom;
    float floatAmp = 0.2 * (1.0 - ease * 0.8); // Float less when in tree form
    
    targetPos.x += sin(uTime * floatSpeed + aRandom * 10.0) * floatAmp;
    targetPos.y += cos(uTime * floatSpeed * 0.8 + aRandom * 10.0) * floatAmp;
    targetPos.z += sin(uTime * floatSpeed * 1.2 + aRandom * 10.0) * floatAmp;
    
    vec4 mvPosition = modelViewMatrix * vec4(targetPos, 1.0);
    
    // Size attenuation
    gl_PointSize = (6.0 * aRandom + 4.0) * (20.0 / -mvPosition.z);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Mix color based on height in tree form, or random in scatter
    float heightMix = clamp((aTreePos.y + 5.0) / 10.0, 0.0, 1.0);
    
    // Tips of the tree (high Y) get more gold
    float goldMix = smoothstep(0.6, 1.0, heightMix + sin(uTime + aRandom) * 0.1);
    
    vColor = mix(colorGreen, colorGold, goldMix * ease);
    vAlpha = 0.8 + 0.2 * sin(uTime * 2.0 + aRandom * 10.0);
  }
`;

const fragmentShader = `
  varying float vAlpha;
  varying vec3 vColor;
  
  void main() {
    // Circular particle
    vec2 center = gl_PointCoord - 0.5;
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Soft glow edge
    float glow = 1.0 - smoothstep(0.3, 0.5, dist);
    
    gl_FragColor = vec4(vColor, vAlpha * glow);
  }
`;

interface FoliageProps {
  count?: number;
  progress: number;
}

const Foliage: React.FC<FoliageProps> = ({ count = 6000, progress }) => {
  const meshRef = useRef<THREE.Points>(null);
  const uniforms = useRef({
    uTime: { value: 0 },
    uMorph: { value: 0 },
  });

  const { positions, treePositions, scatterPositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const treePos = new Float32Array(count * 3);
    const scatterPos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const [tx, ty, tz] = randomInCone(12, 4.5); // Tree shape
      const [sx, sy, sz] = randomInSphere(15);   // Scatter shape

      treePos[i * 3] = tx;
      treePos[i * 3 + 1] = ty;
      treePos[i * 3 + 2] = tz;

      scatterPos[i * 3] = sx;
      scatterPos[i * 3 + 1] = sy;
      scatterPos[i * 3 + 2] = sz;

      rnd[i] = Math.random();
      
      // Initial position doesn't matter much as shader handles it, 
      // but good for bounding box calculation if needed.
      pos[i * 3] = sx;
      pos[i * 3 + 1] = sy;
      pos[i * 3 + 2] = sz;
    }
    
    return { 
      positions: pos, 
      treePositions: treePos, 
      scatterPositions: scatterPos, 
      randoms: rnd 
    };
  }, [count]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      uniforms.current.uTime.value += delta;
      
      // Smooth interpolation for uMorph towards target progress
      const current = uniforms.current.uMorph.value;
      const diff = progress - current;
      uniforms.current.uMorph.value += diff * 2.0 * delta; 
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position" // Required by three.js, though we override in shader
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Foliage;