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
    <div className="min-h-screen flex flex-col bg-black w-full overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow relative flex flex-col items-center">
        <TransitionEffect>
          <HeroSection />
        </TransitionEffect>
        
        <div className="w-full max-w-4xl mx-auto flex justify-center px-4">
          <div className="relative z-10 w-full" style={{ marginTop: '-1vh'}}>
            <GamePlanCreator />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
