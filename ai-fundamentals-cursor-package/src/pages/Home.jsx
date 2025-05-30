import React from 'react';
import useResponsive from '../hooks/useResponsive';
// Update imports to use .jsx extension
import TransitionEffect from '../components/animations/TransitionEffect.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import HeroSection from '../components/hero/HeroSection.jsx';
import GamePlanCreator from '../components/game-plan/GamePlanCreator.jsx';
import Footer from '../components/layout/Footer.jsx';
import GalaxyOverlay from '../components/animations/GalaxyOverlay.jsx';

const Home = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen flex flex-col w-screen overflow-visible max-w-[100vw] bg-transparent">
      {/* Galaxy background overlay positioned behind all content */}
      <GalaxyOverlay />
      
      <Navbar className="z-30" />
      
      <main className="flex-grow relative w-screen overflow-visible flex flex-col items-center">
        <TransitionEffect>
          <HeroSection />
        </TransitionEffect>
        
        <div className="absolute inset-0 flex items-center justify-center pt-52 sm:pt-64 md:pt-72 lg:pt-72 xl:pt-72 z-20">
          <GamePlanCreator />
        </div>
      </main>
      
      <Footer className="z-30" />
    </div>
  );
};

export default Home;
