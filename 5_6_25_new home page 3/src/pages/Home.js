import React from 'react';
import useResponsive from '../../hooks/useResponsive';
import TransitionEffect from '../animations/TransitionEffect';
import Navbar from '../navigation/Navbar';
import HeroSection from '../hero/HeroSection';
import GamePlanFeature from '../features/GamePlanFeature';
import GamePlanCreator from '../game-plan/GamePlanCreator';
import Footer from '../layout/Footer';

const Home = () => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <TransitionEffect>
          <HeroSection />
        </TransitionEffect>
        
        <TransitionEffect delay={0.2}>
          <GamePlanFeature />
        </TransitionEffect>
        
        <TransitionEffect delay={0.3}>
          <GamePlanCreator />
        </TransitionEffect>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
