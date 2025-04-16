import React, { useState, useEffect } from 'react';
import { Settings, Volume2, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';

interface Flashcard {
  term: string;
  definition: string;
}

interface MatchCard {
  id: string;
  content: string;
  type: 'term' | 'definition';
  isMatched: boolean;
  isSelected: boolean;
}

type StudyMode = 'flashcards' | 'match' | 'test';

interface LearningPath {
  id: number;
  title: string;
  description: string;
}

const Game = () => {
  const [selectedPath, setSelectedPath] = useState<LearningPath>({
    id: 3,
    title: 'Personal Finance',
    description: 'Master financial concepts and tools'
  });
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const currentFlashcards = pathFlashcards[selectedPath.id];
  const totalCards = currentFlashcards.length;

  const renderFlashcards = () => (
    <div 
      className="relative min-h-[500px] bg-white rounded-xl shadow-lg overflow-hidden"
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') setCurrentCardIndex(prev => prev === 0 ? totalCards - 1 : prev - 1);
        if (e.key === 'ArrowRight') setCurrentCardIndex(prev => prev === totalCards - 1 ? 0 : prev + 1);
        if (e.key === ' ') setIsFlipped(!isFlipped);
      }}
      tabIndex={0}
    >
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded-full">
            <Volume2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="text-gray-600">
          Card {currentCardIndex + 1} of {totalCards}
        </div>
        <button 
          className="p-2 hover:bg-gray-200 rounded-full"
          onClick={() => setFullscreen(!fullscreen)}
        >
          <Maximize2 className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div 
        className={`w-full h-full pt-16 pb-16 cursor-pointer transition-transform duration-700 ${
          isFlipped ? 'scale-95' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className="flex items-center justify-center h-full p-4">
          <div className={`text-center w-full max-w-2xl mx-auto ${
            !isFlipped 
              ? 'bg-purple-600 rounded-xl shadow-lg transform hover:scale-[1.02] transition-transform' 
              : 'border-2 border-gray-200 rounded-xl shadow-sm hover:border-purple-200 transition-colors'
          }`}>
            <div className={`text-sm mb-2 pt-6 ${!isFlipped ? 'text-purple-200' : 'text-purple-600'}`}>
              {isFlipped ? 'Definition' : 'Term'}
            </div>
            <div className={`text-3xl font-medium px-8 pb-6 ${!isFlipped ? 'text-white' : 'text-gray-900'}`}>
              {isFlipped 
                ? currentFlashcards[currentCardIndex].definition
                : currentFlashcards[currentCardIndex].term
              }
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-gray-50 border-t">
        <button
          onClick={() => {
            setCurrentCardIndex(prev => prev === 0 ? totalCards - 1 : prev - 1);
            setIsFlipped(false);
          }}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div className="text-sm text-gray-500">
          Click card to flip
        </div>
        <button
          onClick={() => {
            setCurrentCardIndex(prev => prev === totalCards - 1 ? 0 : prev + 1);
            setIsFlipped(false);
          }}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="course-header">
            <div className="course-dropdown">
              Personal Finance▼
            </div>
          </div>
          <div className="progress-indicators">
            <span className="progress-item">Flashcards0/20</span>
            <span className="progress-item">Match Games0/5</span>
            <span className="progress-item">Tests0/3</span>
          </div>
          <div className="mode-tabs">
            <button className="mode-tab active">Flashcards</button>
            <button className="mode-tab">Match Game</button>
            <button className="mode-tab">Test</button>
            <button className="mode-tab disabled">Video Lesson<span className="coming-soon">Coming Soon</span></button>
          </div>
        </div>
        {renderFlashcards()}
      </div>
    </div>
  );
};

const pathFlashcards: Record<number, Flashcard[]> = {
  3: [ // Personal Finance
    { term: "Mint AI", definition: "AI-powered budgeting tool that categorizes expenses and provides insights" },
    { term: "Plaid AI", definition: "Financial data platform with AI for transaction categorization" },
    { term: "Tally AI", definition: "Debt management app using AI to optimize payment strategies" },
    { term: "Truebill", definition: "AI subscription tracker that finds and cancels unwanted subscriptions" },
    { term: "Wealthfront", definition: "Automated investment platform using AI for portfolio management" },
    { term: "Personal Capital", definition: "AI-powered wealth management and financial planning platform" },
    { term: "Betterment", definition: "Robo-advisor using AI for automated investing and tax optimization" },
    { term: "Fun Fact: AI Trading", definition: "Over 70% of trading volume is now executed by AI algorithms" },
    { term: "Digit", definition: "AI savings app that automatically saves optimal amounts" },
    { term: "50/30/20 Rule", definition: "Budgeting principle: 50% needs, 30% wants, 20% savings" },
    { term: "Marcus Insights", definition: "AI-powered financial insights and management tool by Goldman Sachs" },
    { term: "Fun Fact: Fraud Detection", definition: "AI can detect fraudulent transactions with 99.9% accuracy" },
    { term: "Albert", definition: "AI financial advisor that provides personalized guidance" },
    { term: "Dollar-Cost Averaging", definition: "Investment strategy of regular, fixed-amount investments" },
    { term: "Acorns", definition: "AI-powered micro-investing app that rounds up purchases" },
    { term: "Risk Tolerance", definition: "Your comfort level with investment volatility and potential losses" },
    { term: "Compound Interest", definition: "Interest earned on both principal and accumulated interest" },
    { term: "M1 Finance", definition: "AI-driven investment platform for automated portfolio management" },
    { term: "Credit Karma", definition: "AI-powered credit monitoring and financial recommendation tool" },
    { term: "Emergency Fund", definition: "Savings covering 3-6 months of living expenses" }
  ]
};

export default Game; 