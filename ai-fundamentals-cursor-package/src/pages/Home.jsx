import React from 'react';
import useResponsive from '../hooks/useResponsive';
// Update imports to use .jsx extension
import TransitionEffect from '../components/animations/TransitionEffect.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import HeroSection from '../components/hero/HeroSection.jsx';
import GamePlanCreator from '../components/game-plan/GamePlanCreator.jsx';
import CubeFeatureDisplay from '../components/features/CubeFeatureDisplay.jsx';
import Footer from '../components/layout/Footer.jsx';

const Home = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#2D1B54] w-screen overflow-hidden max-w-[100vw]">
      <Navbar />
      
      <main className="flex-grow relative w-screen overflow-visible flex flex-col items-center">
        <div className="w-full">
          <TransitionEffect>
            <HeroSection />
          </TransitionEffect>
          
          <div className="absolute inset-0 flex items-center justify-center pt-52 sm:pt-64 md:pt-72 lg:pt-72 xl:pt-72">
            <GamePlanCreator />
          </div>
        </div>

        <div className="mt-[600px] w-full">
          <CubeFeatureDisplay />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
