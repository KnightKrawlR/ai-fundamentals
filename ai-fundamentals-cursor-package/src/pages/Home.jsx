import React from 'react';
import useResponsive from '../hooks/useResponsive';
// Update imports to use .jsx extension
import TransitionEffect from '../components/animations/TransitionEffect.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import HeroSection from '../components/hero/HeroSection.jsx';
import GamePlanCreator from '../components/game-plan/GamePlanCreator.jsx';
import Footer from '../components/layout/Footer.jsx';

const Home = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <Navbar />
      
      <main className="flex-grow relative w-full">
        <TransitionEffect>
          <HeroSection />
        </TransitionEffect>
        
        <div className="absolute inset-0 flex items-center justify-center 
                      pt-[40vh] sm:pt-[45vh] md:pt-[50vh] lg:pt-[50vh] xl:pt-[55vh] 
                      px-4">
          <GamePlanCreator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
