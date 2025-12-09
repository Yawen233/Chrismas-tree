import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import Foliage from './Foliage';
import Ornaments from './Ornaments';
import { CalibrationSettings } from '../types';
import * as THREE from 'three';

interface ExperienceProps {
  progress: number;
  calibration: CalibrationSettings;
}

const SceneContent: React.FC<ExperienceProps> = ({ progress, calibration }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if(groupRef.current) {
        // Subtle rotation of the whole tree structure
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 22]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 2.5} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={30}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.5} color="#002200" />
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.5} 
        penumbra={1} 
        intensity={200} 
        color="#ffeebb" 
        castShadow 
      />
      <pointLight position={[-10, 5, -10]} intensity={50} color="#046307" />
      <pointLight position={[0, -5, 10]} intensity={30} color="#D4AF37" />

      {/* Background Environment - Kept for atmosphere, but pure black bg in css helps projection */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" environmentIntensity={0.5} />

      {/* Main Tree Group with Calibration Applied */}
      <group 
        ref={groupRef} 
        position={[calibration.x, -4 + calibration.y, 0]} 
        scale={[calibration.scale, calibration.scale, calibration.scale]}
      >
        {/* Core Foliage */}
        <Foliage progress={progress} count={4000} />

        {/* Ornaments - Gold and Emerald Theme */}
        <Ornaments 
          progress={progress} 
          count={150} 
          type="bauble" 
          colorPalette={['#D4AF37', '#F3E5AB', '#B8860B', '#FFFFFF']} 
        />
        <Ornaments 
          progress={progress} 
          count={50} 
          type="box" 
          colorPalette={['#046307', '#024204', '#D4AF37']} 
        />
        
        {/* The Star Topper */}
        <StarTopper progress={progress} />
      </group>

      {/* Post Processing for Cinematic Feel */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.8} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={0.6} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </>
  );
};

const StarTopper: React.FC<{progress: number}> = ({ progress }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if(!ref.current) return;
        
        // Target Y Position
        const scatteredY = 10;
        const treeY = 6.5;
        const targetY = THREE.MathUtils.lerp(scatteredY, treeY, progress);
        
        // Target Scale - grow as it assembles
        const targetScale = progress; 
        
        // Move
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, delta * 2);
        
        // Scatter X offset when not formed
        const scatterOffset = (1.0 - progress) * 5.0; // 0 when progress is 1
        ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, scatterOffset, delta * 2);
        
        // Rotation stabilizes as it forms
        ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, 0, delta * 2);
        if (progress < 1) {
             ref.current.rotation.z += delta * (1 - progress);
        }

        // Pulse glow
        const s = (1 + Math.sin(state.clock.elapsedTime * 3) * 0.1) * THREE.MathUtils.lerp(ref.current.scale.x, targetScale, delta * 2);
        // Ensure non-negative scale
        const safeScale = Math.max(0, s);
        ref.current.scale.setScalar(safeScale);
    });

    return (
        <group ref={ref} position={[0, 10, 0]} scale={[0,0,0]}>
            <mesh>
                <octahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial 
                    color="#FFD700" 
                    emissive="#FFD700" 
                    emissiveIntensity={2} 
                    toneMapped={false} 
                />
            </mesh>
             <pointLight intensity={10} distance={5} color="#FFD700" />
        </group>
    )
}

const Experience: React.FC<ExperienceProps> = (props) => {
  return (
    <div className="w-full h-full bg-arix-black">
      <Canvas shadows dpr={[1, 2]}>
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};

export default Experience;