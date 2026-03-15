import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import * as THREE from 'three';

interface ViewerProps {
  telemetry: {
    altitude_mm: number;
    vibration_hz: number;
  };
  isCritical: boolean;
}

const PayloadCylinder = ({ telemetry, isCritical }: { telemetry: ViewerProps['telemetry'], isCritical: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Simulate some erratic rotation based on vibration_hz
    const vibrationFactor = telemetry.vibration_hz * 0.001;
    
    // Smooth altitude
    const targetY = telemetry.altitude_mm / 100;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
    
    meshRef.current.rotation.x += (Math.random() - 0.5) * vibrationFactor;
    meshRef.current.rotation.z += (Math.random() - 0.5) * vibrationFactor;

    // Slow spin
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[1, 1, 3, 32]} />
      <meshStandardMaterial 
        color={isCritical ? "#ef4444" : "#0284c7"} 
        metalness={0.8} 
        roughness={0.2}
        emissive={isCritical ? "#ef4444" : "#0ea5e9"}
        emissiveIntensity={isCritical ? 0.8 : 0.2}
      />
      
      {/* Visual ring markers on the cylinder */}
      <mesh position={[0, -1.5, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshBasicMaterial color={isCritical ? "#f87171" : "#38bdf8"} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshBasicMaterial color={isCritical ? "#f87171" : "#38bdf8"} side={THREE.DoubleSide} />
      </mesh>
    </mesh>
  );
};

export default function ThreeJSViewer({ telemetry, isCritical }: ViewerProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [5, 4, 5], fov: 50 }} shadows>
        <color attach="background" args={['#020617']} />
        
        {/* Anti-gravity platform base */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
            <cylinderGeometry args={[3, 3, 0.2, 64]} />
            <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        </mesh>
        
        {/* Neon ring on platform */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[2.8, 2.9, 64]} />
            <meshBasicMaterial color={isCritical ? "#ef4444" : "#0ea5e9"} />
        </mesh>

        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={1} color={isCritical ? "#ef4444" : "#0ea5e9"} />

        <PayloadCylinder telemetry={telemetry} isCritical={isCritical} />

        <Grid infiniteGrid fadeDistance={20} sectionColor="#1e293b" cellColor="#0f172a" position={[0,-0.1,0]}/>
        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />
      </Canvas>
      <div className="absolute top-4 left-4 pointer-events-none">
          <div className="text-xs font-mono text-slate-400">CAMERA // TARGET_TRACK_01</div>
      </div>
    </div>
  );
}
