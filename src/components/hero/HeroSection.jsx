import React from 'react';

const Button = ({ variant = "primary", size = "medium", className = "", children, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors";
  
  const variants = {
    primary: "bg-purple-700 text-white hover:bg-purple-800",
    secondary: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    tertiary: "bg-transparent border-2 border-white hover:bg-purple-800"
  };
  
  const sizes = {
    small: "text-sm py-1.5 px-3",
    medium: "text-base py-2 px-4",
    large: "text-lg py-2.5 px-6"
  };
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple card component with animation
const FloatingCard = ({ className, children, delay = 0 }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-card p-5 ${className}`}
      style={{
        animation: `float 6s ease-in-out ${delay}s infinite`
      }}
    >
      {children}
    </div>
  );
};

// Simple background particles
const ParticleBackground = () => {
  // Create an array of particles with random positions
  const particles = Array.from({ length: 60 }).map((_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 10 + 5,
    animationDuration: `${Math.random() * 10 + 10}s`,
    animationDelay: `${Math.random() * 5}s`
  }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-purple-500 opacity-10"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.animationDuration} ease-in-out ${particle.animationDelay} infinite`
          }}
        />
      ))}
    </div>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 text-white overflow-hidden">
      {/* Animated background */}
      <ParticleBackground />
      
      {/* Content container */}
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 0.8s, transform 0.8s'
            }}
          >
            Master AI Fundamentals
          </h1>
          
          {/* Subheading */}
          <p 
            className="text-xl md:text-2xl mb-10 text-purple-100"
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 0.8s 0.2s, transform 0.8s 0.2s'
            }}
          >
            Create your personalized AI implementation game plan and transform how you apply artificial intelligence concepts
          </p>
          
          {/* CTA buttons */}
          <div 
            className="flex flex-col sm:flex-row gap-4 mb-16"
            style={{
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 0.8s 0.4s, transform 0.8s 0.4s'
            }}
          >
            <Button 
              variant="primary" 
              size="large"
              onClick={() => window.location.href = '/my-game-plan.html'}
            >
              Create Your Game Plan
            </Button>
            <Button 
              variant="tertiary" 
              size="large"
              onClick={() => document.getElementById('gameplan-feature').scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Floating cards */}
        <div className="relative mt-10 h-80 md:h-96">
          {/* Game Plan Card */}
          <FloatingCard 
            className="absolute left-0 md:left-10 top-0 max-w-xs"
            delay={0.2}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">AI Game Plan</h3>
              <p className="text-gray-600 text-sm mb-4">Personalized implementation strategy based on your specific needs</p>
              <div className="bg-purple-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Define your AI challenge</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Select project type</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-600"></div>
                  <span className="text-sm text-gray-700">Get implementation steps</span>
                </div>
              </div>
            </div>
          </FloatingCard>
          
          {/* Topic Card */}
          <FloatingCard 
            className="absolute right-0 md:right-10 top-10 max-w-xs"
            delay={0.5}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">AI Topics</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Machine Learning</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">NLP</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Computer Vision</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Generative AI</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Prompt Engineering</span>
              </div>
            </div>
          </FloatingCard>
          
          {/* Results Card */}
          <FloatingCard 
            className="absolute left-1/4 bottom-0 max-w-xs"
            delay={0.8}
          >
            <div className="flex flex-col">
              <h3 className="text-purple-800 font-bold text-lg mb-2">Implementation Results</h3>
              <p className="text-gray-600 text-sm">Step-by-step guidance tailored to your specific AI implementation needs</p>
              <div className="mt-3 bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
                Ready to implement in minutes
              </div>
            </div>
          </FloatingCard>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        style={{
          animation: 'float 1.5s infinite'
        }}
      >
        <div className="flex flex-col items-center">
          <span className="text-purple-200 text-sm mb-2">Scroll to explore</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 