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
    xMin: -viewport.width / 2 + 1.5,
    xMax: viewport.width / 2 - 1.5,
    yMin: -viewport.height / 2 + 1.5, 
    yMax: viewport.height / 2 - 1.5
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
        renderOrder={100}
        scale={1.5}
      >
        {/* Satellite body */}
        <mesh>
          <boxGeometry args={[0.7, 0.2, 1.5]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} emissive={isHovered ? "#fff" : "#555"} />
        </mesh>
        
        {/* Solar panels */}
        <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 2, 1.2]} />
          <meshStandardMaterial color="#4a6fa5" metalness={0.5} roughness={0.3} emissive={isHovered ? "#6a8fc5" : "#4a6fa5"} />
        </mesh>
        <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.1, 2, 1.2]} />
          <meshStandardMaterial color="#4a6fa5" metalness={0.5} roughness={0.3} emissive={isHovered ? "#6a8fc5" : "#4a6fa5"} />
        </mesh>
        
        {/* Question mark with glow effect */}
        <pointLight position={[0, 0.6, 0]} intensity={isHovered ? 2 : 0.5} color="#ffffff" distance={3} />
        <Html position={[0, 0.6, 0]} center transform occlude={false} zIndexRange={[100, 101]} distanceFactor={10}>
          <div 
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-lg cursor-pointer transition-all duration-300 ${isHovered ? 'bg-white scale-110 shadow-purple-500/70 shadow-lg' : 'bg-white'}`}
            style={{
              boxShadow: isHovered ? '0 0 15px 5px rgba(196, 138, 247, 0.7)' : '0 0 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span className={`font-bold text-3xl transition-all duration-300 ${isHovered ? 'text-purple-600' : 'text-purple-500'}`}>?</span>
          </div>
        </Html>
        
        {/* Text label that appears when hovered */}
        {isHovered && (
          <Html position={[0, -1, 0]} center>
            <div className="bg-white/90 px-2 py-1 rounded text-purple-700 font-medium text-sm whitespace-nowrap">
              Click to learn more
            </div>
          </Html>
        )}
      </group>
    </Float>
  );
};

// Main overlay component
const GalaxyOverlay = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <div className="fixed inset-0 z-5 pointer-events-auto">
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