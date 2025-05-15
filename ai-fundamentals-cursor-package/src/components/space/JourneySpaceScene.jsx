import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useTexture, Stars, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { motion } from 'framer-motion';

// Individual orb component that represents a step in the user journey
const JourneyOrb = ({ position, color, name, description, hoveredOrb, setHoveredOrb, clickedOrb, setClickedOrb }) => {
  const meshRef = useRef();
  const htmlRef = useRef();
  const isHovered = hoveredOrb === name;
  const isClicked = clickedOrb === name;
  
  // Animation for floating/bobbing
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(clock.getElapsedTime() * 0.5 + position[0]) * 0.0015;
      meshRef.current.rotation.y += 0.002;
      
      // Pulsing glow effect
      const pulseIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 1.5) * 0.15;
      meshRef.current.material.emissiveIntensity = pulseIntensity;
    }
  });

  return (
    <group position={position}>
      {/* The main orb/sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHoveredOrb(name)}
        onPointerOut={() => setHoveredOrb(null)}
        onClick={() => setClickedOrb(isClicked ? null : name)}
        scale={isHovered || isClicked ? 1.3 : 1}
      >
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
      
      {/* Glow effect sphere */}
      <mesh scale={1.2}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial 
          color={color} 
          transparent={true}
          opacity={0.15}
        />
      </mesh>
      
      {/* Label that appears when hovered */}
      {isHovered && !isClicked && (
        <Html
          ref={htmlRef}
          position={[0, 1, 0]}
          center
          distanceFactor={10}
        >
          <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-xl border border-purple-500/30 whitespace-nowrap">
            {name}
          </div>
        </Html>
      )}
      
      {/* Expanded info when clicked */}
      {isClicked && (
        <Html
          position={[0, 0, 0]}
          center
          distanceFactor={7}
          className="z-50"
        >
          <div className="bg-black/80 backdrop-blur-md text-white p-5 rounded-2xl border border-purple-500/50 shadow-xl w-64">
            <h3 className="text-xl font-bold mb-2 text-purple-300">{name}</h3>
            <p className="text-sm text-gray-300 mb-3">{description}</p>
            <button 
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors duration-200"
              onClick={() => setClickedOrb(null)}
            >
              Close
            </button>
          </div>
        </Html>
      )}
    </group>
  );
};

// The main 3D scene setup
const SpaceScene = () => {
  const [hoveredOrb, setHoveredOrb] = useState(null);
  const [clickedOrb, setClickedOrb] = useState(null);
  
  // Define your orbs/journey steps
  const journeySteps = [
    {
      name: "Build your AI GamePlan",
      position: [3, 0, 1],
      color: "#8A2BE2", // Vivid purple
      description: "Describe your vision, and we'll generate a comprehensive blueprint for your AI implementation with all the technical details you need."
    },
    {
      name: "Learn with Courses",
      position: [-2, 0.5, -1],
      color: "#4682B4", // Steel blue
      description: "Access our structured learning paths to master AI fundamentals, specific technologies, and implementation strategies."
    },
    {
      name: "Track Results & Progress",
      position: [0, -1, -3],
      color: "#20B2AA", // Light sea green
      description: "Monitor your journey, track completed milestones, and visualize your progress as you develop AI expertise."
    }
  ];
  
  // Controls component for managing camera
  const CameraController = () => {
    const { camera } = useThree();
    const controls = useRef();
    
    useEffect(() => {
      if (clickedOrb) {
        // Find clicked orb data
        const orb = journeySteps.find(step => step.name === clickedOrb);
        if (orb) {
          // Animate camera position when an orb is clicked
          const targetPosition = new Vector3(...orb.position).add(new Vector3(0, 0, 2));
          camera.position.lerp(targetPosition, 0.1);
        }
      }
    }, [camera, clickedOrb]);
    
    return (
      <OrbitControls 
        ref={controls}
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={20}
        autoRotate={!hoveredOrb && !clickedOrb}
        autoRotateSpeed={0.4}
        dampingFactor={0.1}
      />
    );
  };
  
  return (
    <>
      <Stars 
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={0.5}
      />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <ambientLight intensity={0.2} />
      
      {/* Render all journey orbs */}
      {journeySteps.map((step) => (
        <JourneyOrb
          key={step.name}
          position={step.position}
          color={step.color}
          name={step.name}
          description={step.description}
          hoveredOrb={hoveredOrb}
          setHoveredOrb={setHoveredOrb}
          clickedOrb={clickedOrb}
          setClickedOrb={setClickedOrb}
        />
      ))}
      
      {/* Connections between orbs (constellation lines) */}
      {journeySteps.map((step, i) => {
        return journeySteps.slice(i + 1).map((nextStep, j) => (
          <mesh key={`connection-${i}-${i+j+1}`}>
            <cylinderGeometry 
              args={[
                0.02, 0.02, 
                Math.sqrt(
                  Math.pow(step.position[0] - nextStep.position[0], 2) +
                  Math.pow(step.position[1] - nextStep.position[1], 2) +
                  Math.pow(step.position[2] - nextStep.position[2], 2)
                )
              ]} 
              rotation={[Math.PI / 2, 0, 0]}
            />
            <meshBasicMaterial 
              color="#4B0082" 
              transparent
              opacity={0.3}
            />
            {/* Position the cylinder to connect between the two points */}
            <group
              position={[
                (step.position[0] + nextStep.position[0]) / 2,
                (step.position[1] + nextStep.position[1]) / 2,
                (step.position[2] + nextStep.position[2]) / 2
              ]}
              lookAt={new Vector3(...nextStep.position)}
            />
          </mesh>
        ));
      })}
      
      <CameraController />
    </>
  );
};

// Main component that wraps the Canvas
const JourneySpaceScene = () => {
  return (
    <section className="w-full h-screen relative bg-gradient-to-b from-[#2D1B54] to-[#150d29] overflow-hidden mt-32">
      <div className="absolute inset-0 z-0 opacity-50">
        {/* Background particle effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-purple-900/10 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Your AI Journey
          </h2>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Explore the steps to mastering AI implementation. Click and drag to navigate the space, hover over orbs to see details.
          </p>
        </motion.div>
      </div>
      
      <div className="w-full h-[calc(100vh-12rem)]">
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
          <SpaceScene />
        </Canvas>
      </div>
    </section>
  );
};

export default JourneySpaceScene; 