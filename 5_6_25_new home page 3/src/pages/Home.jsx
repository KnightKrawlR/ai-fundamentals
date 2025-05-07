import React from 'react';
import useResponsive from '../hooks/useResponsive';
// Update imports to use .jsx extension
import TransitionEffect from '../components/animations/TransitionEffect.jsx';
import Navbar from '../components/navigation/Navbar.jsx';
import HeroSection from '../components/hero/HeroSection.jsx';
import GamePlanFeature from '../components/features/GamePlanFeature.jsx';
import GamePlanCreator from '../components/game-plan/GamePlanCreator.jsx';
import Footer from '../components/layout/Footer.jsx';

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
