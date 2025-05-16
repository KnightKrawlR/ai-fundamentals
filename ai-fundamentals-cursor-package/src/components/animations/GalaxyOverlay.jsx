import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import FeatureModal from './FeatureModal';

// Spinning Galaxy Component
const Galaxy = () => {
  const galaxyRef = useRef();
  
  useFrame(({ clock }) => {
    if (galaxyRef.current) {
      // Slow rotation around the y-axis
      galaxyRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group ref={galaxyRef}>
      {/* Center spiral galaxy */}
      <mesh>
        <torusGeometry args={[12, 2.5, 3, 100, Math.PI * 2]} />
        <meshStandardMaterial color="#c48af7" emissive="#c48af7" emissiveIntensity={0.4} transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[10, 2, 3, 100, Math.PI * 2]} />
        <meshStandardMaterial color="#8a7cb4" emissive="#8a7cb4" emissiveIntensity={0.3} transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[8, 1.5, 3, 100, Math.PI * 2]} />
        <meshStandardMaterial color="#4B2E83" emissive="#4B2E83" emissiveIntensity={0.5} transparent opacity={0.4} />
      </mesh>
      
      {/* Galaxy center glow */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#fff" emissive="#c48af7" emissiveIntensity={2} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// Floating Satellite with Question Mark
const Satellite = ({ setModalOpen }) => {
  const meshRef = useRef();
  const [position, setPosition] = useState(new Vector3(15, 8, 0));
  const [velocity] = useState(new Vector3(0.02, 0.01, 0));
  const [isHovered, setIsHovered] = useState(false);
  const { viewport } = useThree();
  
  // Screen bounds adjusted for object size
  const bounds = {
    xMin: -viewport.width / 2 + 1,
    xMax: viewport.width / 2 - 1,
    yMin: -viewport.height / 2 + 1, 
    yMax: viewport.height / 2 - 1
  };
  
  useFrame(() => {
    if (meshRef.current && !isHovered) {
      // Update position
      const newPos = meshRef.current.position.clone().add(velocity);
      
      // Check for boundary collisions and reverse direction if needed
      if (newPos.x <= bounds.xMin || newPos.x >= bounds.xMax) {
        velocity.x = -velocity.x;
      }
      if (newPos.y <= bounds.yMin || newPos.y >= bounds.yMax) {
        velocity.y = -velocity.y;
      }
      
      // Apply movement
      meshRef.current.position.add(velocity);
      
      // Slow rotation for visual interest
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.003;
    }
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group
        ref={meshRef}
        position={position}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onClick={() => setModalOpen(true)}
      >
        {/* Satellite body */}
        <mesh>
          <boxGeometry args={[0.7, 0.2, 1.5]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Solar panels */}
        <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 2, 1.2]} />
          <meshStandardMaterial color="#4a6fa5" metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 2, 1.2]} />
          <meshStandardMaterial color="#4a6fa5" metalness={0.5} roughness={0.3} />
        </mesh>
        
        {/* Question mark */}
        <Html position={[0, 0.6, 0]} center transform occlude>
          <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full shadow-lg cursor-pointer">
            <span className="text-purple-600 font-bold text-xl">?</span>
          </div>
        </Html>
      </group>
    </Float>
  );
};

// Main overlay component
const GalaxyOverlay = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-auto">
      <div className="w-full h-full">
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 0]} intensity={2} color="#c48af7" />
          
          {/* Stars background */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />
          
          {/* Spinning galaxy */}
          <Galaxy />
          
          {/* Interactive floating satellite */}
          <Satellite setModalOpen={setIsModalOpen} />
        </Canvas>
      </div>
      
      {/* Modal (conditionally rendered) */}
      {isModalOpen && <FeatureModal setIsOpen={setIsModalOpen} />}
    </div>
  );
};

export default GalaxyOverlay; 