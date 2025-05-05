import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-card hover:shadow-card-hover transition-shadow">
    <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-purple-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const GamePlanFeature = () => {
  return (
    <section id="gameplan-feature" className="py-20 bg-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-purple-800 mb-4">
            Riding the AI Wave
          </h2>
          <p className="text-lg text-gray-600">
            The AI revolution is transforming every industry. Our personalized
            AI Game Plan gives you a clear roadmap to implement AI in your specific
            domain - whether for work, business, or personal projects.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>}
            title="Personalized AI Strategy"
            description="Get a customized implementation plan tailored to your specific challenge, technical expertise, and project requirements."
          />
          
          <FeatureCard 
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>}
            title="Implementation Roadmap"
            description="Follow clear, actionable steps with the right technologies, resources, and best practices for your AI project."
          />
          
          <FeatureCard 
            icon={<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>}
            title="AI Project Templates"
            description="Leverage proven frameworks and templates that reduce development time and increase your chances of success."
          />
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="/my-game-plan.html" 
            className="inline-flex items-center gap-2 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors font-medium"
          >
            Get Started with Your Game Plan
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default GamePlanFeature; 