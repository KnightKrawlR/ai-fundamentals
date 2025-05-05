import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-br from-purple-700 to-purple-900 text-white">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-20 right-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          {/* Hero content */}
          <div className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Master AI Fundamentals
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 mb-8 max-w-lg md:mx-0 mx-auto">
              Your personalized journey to AI proficiency with interactive learning paths and AI-powered game plans.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <a
                href="/learning-paths.html"
                className="bg-white text-purple-700 hover:bg-purple-50 font-semibold py-3 px-8 rounded-md shadow-md hover:shadow-lg transition-all duration-300"
              >
                Start Learning
              </a>
              <a
                href="/my-game-plan.html"
                className="border-2 border-white text-white hover:bg-white hover:text-purple-700 font-semibold py-3 px-8 rounded-md transition-all duration-300"
              >
                Create Game Plan
              </a>
            </div>
          </div>

          {/* Hero image */}
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="relative z-10 rounded-lg shadow-xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
                  alt="AI Learning Dashboard"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500 rounded-lg opacity-30 z-0"></div>
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500 rounded-lg opacity-20 z-0"></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">100+</div>
            <div className="text-purple-200">Learning Modules</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
            <div className="text-purple-200">AI Projects</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">24/7</div>
            <div className="text-purple-200">AI Support</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
            <div className="text-3xl md:text-4xl font-bold text-white mb-1">1000+</div>
            <div className="text-purple-200">Active Learners</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 