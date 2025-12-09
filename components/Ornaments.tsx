import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrnamentData } from '../types';
import { randomInCone, randomInSphere, randomRange } from '../utils/geometry';

interface OrnamentsProps {
  count?: number;
  progress: number;
  type: 'box' | 'bauble';
  colorPalette: string[];
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const Ornaments: React.FC<OrnamentsProps> = ({ count = 100, progress, type, colorPalette }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Current lerp factor (0 to 1)
  const lerpFactor = useRef(0);

  // Generate data once
  const data = useMemo(() => {
    const items: OrnamentData[] = [];
    for (let i = 0; i < count; i++) {
      const treePos = randomInCone(11, 4.2);
      // Push slightly outward for ornaments so they sit on surface
      const r = Math.sqrt(treePos[0]**2 + treePos[2]**2);
      if (r > 0.1) {
          const pushFactor = 1.1; // push out by 10%
          treePos[0] *= pushFactor;
          treePos[2] *= pushFactor;
      }
      
      const scatterPos = randomInSphere(12);
      
      const scale = randomRange(0.2, 0.45);
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      items.push({
        id: i,
        type: type,
        color,
        positions: {
          tree: [treePos[0], treePos[1], treePos[2]],
          scatter: [scatterPos[0], scatterPos[1], scatterPos[2]],
          scale,
          rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
        }
      });
    }
    return items;
  }, [count, type, colorPalette]);

  useLayoutEffect(() => {
    if (meshRef.current) {
      data.forEach((item, i) => {
        tempColor.set(item.color);
        meshRef.current!.setColorAt(i, tempColor);
      });
      meshRef.current.instanceColor!.needsUpdate = true;
    }
  }, [data]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Lerp the factor towards target progress
    const speed = 1.5;
    lerpFactor.current = THREE.MathUtils.lerp(lerpFactor.current, progress, speed * delta);
    const t = lerpFactor.current;
    
    // Easing for movement
    const ease = t * t * (3.0 - 2.0 * t);

    // Update instances
    data.forEach((item, i) => {
      const { tree, scatter, scale, rotation } = item.positions;
      
      // Interpolate position
      const x = THREE.MathUtils.lerp(scatter[0], tree[0], ease);
      const y = THREE.MathUtils.lerp(scatter[1], tree[1], ease);
      const z = THREE.MathUtils.lerp(scatter[2], tree[2], ease);
      
      // Floating effect when scattered
      const floatTime = state.clock.elapsedTime;
      const floatAmp = (1 - ease) * 0.5; // Only float when scattered (decreases as it gathers)
      const fy = Math.sin(floatTime + item.id) * floatAmp;
      const rx = rotation[0] + floatTime * 0.2 * (1-ease);
      const ry = rotation[1] + floatTime * 0.1 * (1-ease);

      tempObject.position.set(x, y + fy, z);
      tempObject.rotation.set(rx, ry, rotation[2]);
      tempObject.scale.setScalar(scale);
      
      tempObject.updateMatrix();
      meshRef.current!.setMatrixAt(i, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geometry = type === 'box' ? new THREE.BoxGeometry(1, 1, 1) : new THREE.SphereGeometry(1, 32, 32);

  // Material settings based on type
  // Boxes = Velvet/Matte, Baubles = Metallic
  const material = type === 'box' 
    ? new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.1 })
    : new THREE.MeshStandardMaterial({ roughness: 0.1, metalness: 0.9, emissive: new THREE.Color("#221100"), emissiveIntensity: 0.1 });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
};

export default Ornaments;