import React, { useState, useEffect } from 'react';
import { Brain, ArrowLeft, ArrowRight, Maximize2, Settings, Volume2, Timer, CheckCircle, Video } from 'lucide-react';
import LearningPaths from '../components/LearningPaths';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

interface LearningPath {
  id: number;
  title: string;
  description: string;
}

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

const pathFlashcards: Record<number, Flashcard[]> = {
  1: [ // Introduction to AI
    { term: "ChatGPT", definition: "An AI language model for text generation, coding assistance, and general problem-solving" },
    { term: "Copilot", definition: "AI-powered coding assistant that helps developers write and understand code faster" },
    { term: "Claude", definition: "An AI assistant specializing in analysis, research, and complex problem-solving" },
    { term: "Midjourney", definition: "AI tool for generating high-quality images from text descriptions" },
    { term: "AutoGPT", definition: "Autonomous AI agent that can complete complex tasks with minimal human input" },
    { term: "Machine Learning", definition: "A branch of AI that enables systems to learn from data without explicit programming" },
    { term: "Neural Networks", definition: "Computing systems inspired by biological brains, consisting of interconnected nodes" },
    { term: "Deep Learning", definition: "Advanced machine learning using multiple layers of neural networks" },
    { term: "Natural Language Processing", definition: "AI technology that helps computers understand and generate human language" },
    { term: "Computer Vision", definition: "AI field that enables computers to understand and process visual information" },
    { term: "Stable Diffusion", definition: "Open-source AI model for generating images from text descriptions" },
    { term: "Anthropic", definition: "AI research company known for developing the Claude AI assistant" },
    { term: "Fun Fact: First AI Program", definition: "The first AI program was the Logic Theorist, created in 1956 by Allen Newell and Herbert Simon" },
    { term: "Turing Test", definition: "A test of machine intelligence proposed by Alan Turing in 1950" },
    { term: "DALL-E", definition: "OpenAI's image generation model that creates images from text descriptions" },
    { term: "Reinforcement Learning", definition: "AI technique where agents learn optimal actions through trial and error" },
    { term: "GPT (Generative Pre-trained Transformer)", definition: "Architecture behind many modern AI language models" },
    { term: "Fun Fact: AI Chess Victory", definition: "In 1997, IBM's Deep Blue became the first computer to defeat a world chess champion" },
    { term: "Perplexity AI", definition: "AI-powered search engine that provides detailed, sourced answers" },
    { term: "AI Ethics", definition: "Guidelines and principles for responsible AI development and deployment" }
  ],
  2: [ // Office Productivity
    { term: "Notion AI", definition: "AI-powered workspace that helps write, edit, and summarize documents" },
    { term: "Microsoft Copilot", definition: "AI assistant integrated into Office apps for enhanced productivity" },
    { term: "Otter.ai", definition: "AI transcription service for converting meetings into searchable notes" },
    { term: "Grammarly", definition: "AI writing assistant for grammar, style, and tone improvement" },
    { term: "Beautiful.ai", definition: "AI-powered presentation software that automates design" },
    { term: "Fireflies.ai", definition: "AI meeting assistant that records, transcribes, and analyzes conversations" },
    { term: "Todoist AI", definition: "Task management tool with AI-powered task organization and prioritization" },
    { term: "Mem.ai", definition: "AI note-taking app that connects and organizes your thoughts" },
    { term: "Fun Fact: Email Management", definition: "AI can save up to 6 hours per week in email management tasks" },
    { term: "Zapier AI", definition: "Automation tool with AI capabilities for workflow optimization" },
    { term: "Taskade", definition: "AI-powered project management and collaboration platform" },
    { term: "Tome", definition: "AI-powered storytelling tool for creating dynamic presentations" },
    { term: "Productivity Principle", definition: "The 2-minute rule: If a task takes less than 2 minutes, do it immediately" },
    { term: "Coda AI", definition: "Document editor with AI capabilities for automated workflows" },
    { term: "Fun Fact: Meeting Efficiency", definition: "AI meeting assistants can reduce meeting time by up to 30%" },
    { term: "Superhuman", definition: "AI-powered email client for faster email processing" },
    { term: "Pomodoro Technique", definition: "25-minute focused work intervals followed by short breaks" },
    { term: "Raycast AI", definition: "AI-powered productivity tool for quick actions and workflows" },
    { term: "Time Blocking", definition: "Productivity method of scheduling specific time blocks for tasks" },
    { term: "Clockwise", definition: "AI calendar assistant that optimizes meeting schedules" }
  ],
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
  ],
  4: [ // Social Media Marketing
    { term: "Hootsuite Insights", definition: "AI-powered social media analytics and content recommendation tool" },
    { term: "Buffer AI", definition: "Social media scheduler with AI-optimized posting times" },
    { term: "Lately.ai", definition: "AI content repurposing tool for social media marketing" },
    { term: "Sprout Social", definition: "Social media management platform with AI-driven insights" },
    { term: "Canva Magic Write", definition: "AI copywriting tool for social media captions and content" },
    { term: "Brandwatch", definition: "AI-powered social media monitoring and analytics platform" },
    { term: "Fun Fact: Best Posting Time", definition: "AI analysis shows engagement peaks between 10 AM and 1 PM" },
    { term: "Khoros", definition: "AI-driven social media management and community engagement platform" },
    { term: "Engagement Rate", definition: "Percentage of followers who interact with your content" },
    { term: "SocialBee", definition: "AI content curation and scheduling tool for social media" },
    { term: "Viral Coefficient", definition: "Average number of new users each existing user generates" },
    { term: "Agorapulse", definition: "AI social media management tool with automated reporting" },
    { term: "Fun Fact: Video Content", definition: "Videos get 48% more engagement than static posts" },
    { term: "Social Listening", definition: "Monitoring social media for mentions and sentiment" },
    { term: "Influencer Marketing", definition: "Partnering with content creators to promote products/services" },
    { term: "Mention", definition: "AI-powered social media monitoring and reputation management tool" },
    { term: "Content Calendar", definition: "Strategic planning of social media content publication" },
    { term: "Iconosquare", definition: "AI analytics tool for Instagram and social media optimization" },
    { term: "Social ROI", definition: "Measuring return on investment for social media marketing" },
    { term: "Hashtag Strategy", definition: "Strategic use of relevant hashtags to increase content visibility" }
  ],
  5: [ // Videography
    { term: "Descript", definition: "AI video editor that allows editing video by editing text" },
    { term: "RunwayML", definition: "AI-powered video editing with special effects and generation" },
    { term: "Synthesia", definition: "AI video generation platform for creating professional videos" },
    { term: "Kapwing", definition: "Online video editor with AI-powered features for content creation" },
    { term: "InVideo", definition: "AI video creation platform with templates and automation" },
    { term: "D-ID", definition: "AI platform for creating talking head videos from photos" },
    { term: "Fun Fact: Video Processing", definition: "AI can reduce video rendering time by up to 80%" },
    { term: "Rotoscoping", definition: "AI-powered technique for separating subjects from backgrounds" },
    { term: "Frame Interpolation", definition: "AI technique to create smooth slow-motion footage" },
    { term: "Wonder Studio", definition: "AI tool for creating CGI characters and animations" },
    { term: "Color Grading", definition: "Process of altering video colors for aesthetic effect" },
    { term: "Storyboard AI", definition: "AI tool for converting scripts into visual storyboards" },
    { term: "Fun Fact: Virtual Actors", definition: "AI can now create photorealistic virtual actors" },
    { term: "Motion Tracking", definition: "AI-powered tracking of objects in video footage" },
    { term: "Neural Filters", definition: "AI-powered effects for video enhancement and manipulation" },
    { term: "Lumen5", definition: "AI video creation platform for social media content" },
    { term: "Video Resolution", definition: "Number of pixels in each frame of video" },
    { term: "Bitrate", definition: "Amount of data processed per second in video playback" },
    { term: "Mocha Pro", definition: "AI-powered planar tracking and rotoscoping tool" },
    { term: "Video Compression", definition: "Reducing video file size while maintaining quality" }
  ],
  6: [ // eCommerce
    { term: "Jasper AI", definition: "AI content generator for product descriptions and marketing copy" },
    { term: "Klaviyo", definition: "AI-powered email marketing platform for eCommerce" },
    { term: "Algolia", definition: "AI search and discovery platform for online stores" },
    { term: "Gorgias", definition: "AI customer service platform for eCommerce support" },
    { term: "Hotjar", definition: "AI analytics tool for understanding user behavior on eCommerce sites" },
    { term: "Nosto", definition: "AI-powered personalization platform for eCommerce" },
    { term: "Fun Fact: Cart Abandonment", definition: "AI can reduce cart abandonment by up to 40%" },
    { term: "Dynamic Pricing", definition: "AI-driven price optimization based on market conditions" },
    { term: "Inventory Management", definition: "AI-powered prediction of stock levels and demand" },
    { term: "Personalization", definition: "Tailoring shopping experiences to individual customers" },
    { term: "Yotpo", definition: "AI-powered reviews and loyalty program platform" },
    { term: "Fun Fact: Conversion Rate", definition: "AI personalization can increase conversion rates by 30%" },
    { term: "Omnisend", definition: "AI-powered omnichannel marketing automation platform" },
    { term: "Customer Lifetime Value", definition: "Total value a customer generates over their relationship" },
    { term: "Privy", definition: "AI-powered conversion optimization platform" },
    { term: "A/B Testing", definition: "Testing different versions to optimize performance" },
    { term: "Shopify Flow", definition: "AI automation tool for Shopify stores" },
    { term: "Retention Rate", definition: "Percentage of customers who make repeat purchases" },
    { term: "Oberlo", definition: "AI-powered product sourcing and dropshipping platform" },
    { term: "Abandoned Cart", definition: "When shoppers add items but don't complete purchase" }
  ]
};

const MyLearning: React.FC = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const isPremium = true;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const handleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpen((open) => !open);
  };
  useEffect(() => {
    const close = () => setDropdownOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const [selectedPath, setSelectedPath] = useState<LearningPath>({
    id: 1,
    title: 'Introduction to AI',
    description: 'Learn the basic concepts and terminology of artificial intelligence'
  });
  const [currentMode, setCurrentMode] = useState<StudyMode>('flashcards');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [matchCards, setMatchCards] = useState<MatchCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MatchCard | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentFlashcards = pathFlashcards[selectedPath.id];
  const totalCards = currentFlashcards.length;

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    if (currentMode === 'match') {
      setMatchCards(initializeMatchGame());
    }
  }, [selectedPath.id]);

  useEffect(() => {
    if (currentMode === 'match') {
      setMatchCards(initializeMatchGame());
    }
  }, [currentMode]);

  const initializeMatchGame = () => {
    const cards: MatchCard[] = [];
    currentFlashcards.slice(0, 10).forEach((card, index) => {
      cards.push(
        {
          id: `term-${index}`,
          content: card.term,
          type: 'term',
          isMatched: false,
          isSelected: false,
        },
        {
          id: `def-${index}`,
          content: card.definition,
          type: 'definition',
          isMatched: false,
          isSelected: false,
        }
      );
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const handleCardClick = (card: MatchCard) => {
    if (card.isMatched) return;

    const updatedCards = matchCards.map((c) =>
      c.id === card.id ? { ...c, isSelected: true } : c
    );

    if (!selectedCard) {
      setSelectedCard(card);
      setMatchCards(updatedCards);
    } else {
      if (selectedCard.type === card.type) {
        setMatchCards(
          matchCards.map((c) =>
            c.id === card.id ? { ...c, isSelected: false } : c
          )
        );
        return;
      }

      const selectedCardId = selectedCard.id.split('-')[1];
      const currentCardId = card.id.split('-')[1];

      const isMatch = selectedCardId === currentCardId;

      if (isMatch) {
        const matchedCards = updatedCards.map((c) =>
          c.id === card.id || c.id === selectedCard.id
            ? { ...c, isMatched: true, isSelected: false }
            : c
        );
        setMatchCards(matchedCards);
      } else {
        setMatchCards(updatedCards);
        setTimeout(() => {
          setMatchCards(
            matchCards.map((c) =>
              c.id === card.id || c.id === selectedCard.id
                ? { ...c, isSelected: false }
                : c
            )
          );
        }, 1000);
      }
      setSelectedCard(null);
    }
  };

  const handleModeChange = (mode: StudyMode) => {
    setCurrentMode(mode);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsFlipped(false);
    if (mode === 'match') {
      setMatchCards(initializeMatchGame());
    }
  };

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

  const renderMatchGame = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-800">AI Fundamentals - Match Game</h2>
        <div className="flex items-center text-gray-600">
          <Timer className="w-5 h-5 mr-2" />
          <span>Match the terms with their definitions</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {matchCards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            className={`p-4 rounded-lg text-left min-h-[100px] transition-all ${
              card.isMatched
                ? 'bg-green-100 border-2 border-green-500'
                : card.isSelected
                ? 'bg-purple-100 border-2 border-purple-500'
                : 'bg-gray-50 border border-gray-200 hover:border-purple-300'
            }`}
            disabled={card.isMatched}
          >
            <p className="text-sm">{card.content}</p>
          </button>
        ))}
      </div>
    </div>
  );

  const renderTest = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-800">AI Fundamentals - Test</h2>
        <div className="text-gray-600">
          Multiple Choice • {currentQuestion + 1} of {currentFlashcards.length} Questions
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {currentQuestion + 1}. What is {currentFlashcards[currentQuestion].term}?
        </h3>
        {isCorrect !== null && (
          <div className={`mb-4 p-3 rounded-lg ${
            isCorrect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isCorrect ? (
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Correct!
              </div>
            ) : (
              'Incorrect. Try again!'
            )}
          </div>
        )}
        <div className="space-y-3">
          {[
            currentFlashcards[currentQuestion].definition,
            ...currentFlashcards
              .filter((_, i) => i !== currentQuestion)
              .slice(0, 3)
              .map(card => card.definition)
          ]
            .sort(() => Math.random() - 0.5)
            .map((answer, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedAnswer(answer);
                  setIsCorrect(answer === currentFlashcards[currentQuestion].definition);
                }}
                className={`w-full p-4 text-left rounded-lg border ${
                  selectedAnswer === answer
                    ? answer === currentFlashcards[currentQuestion].definition
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {answer}
              </button>
            ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
          disabled={currentQuestion === 0}
          onClick={() => {
            setCurrentQuestion((prev) => prev - 1);
            setSelectedAnswer(null);
            setIsCorrect(null);
          }}
        >
          Previous
        </button>
        <button
          className={`px-6 py-2 rounded-lg ${
            selectedAnswer
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!selectedAnswer}
          onClick={() => {
            if (currentQuestion < currentFlashcards.length - 1) {
              setCurrentQuestion((prev) => prev + 1);
              setSelectedAnswer(null);
              setIsCorrect(null);
            }
          }}
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="header">
        <div className="container header-flex">
          <a href="/" className="logo">
            <i className="fas fa-brain"></i>
            <span>AI Fundamentals</span>
          </a>
          <nav>
            <ul>
              <li><a href="/#free-resources">Learning</a></li>
              <li><a href="/#ai-tools">AI Tools</a></li>
              <li><a href="/#premium">Premium</a></li>
            </ul>
          </nav>
          <div id="auth-container">
            {!user ? (
              <a href="/login.html" className="sign-in-btn">
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </a>
            ) : (
              <div className={`user-menu${dropdownOpen ? ' open' : ''}`} onClick={handleDropdown}>
                <button className="user-profile-btn">
                  <div className="user-avatar">{user.email?.[0].toUpperCase()}</div>
                  <span className="user-email">{user.email}</span>
                </button>
                <div className="user-menu-content" style={{ display: dropdownOpen ? 'block' : undefined }}>
                  <a href="/account.html" className="user-menu-item">
                    <i className="fas fa-user"></i> My Account
                  </a>
                  <a href="/my-learning" className="user-menu-item">
                    <i className="fas fa-graduation-cap"></i> My Learning
                  </a>
                  <a href="/settings.html" className="user-menu-item">
                    <i className="fas fa-cog"></i> Settings
                  </a>
                  <div className="user-menu-divider"></div>
                  <a href="#" className="user-menu-item" onClick={() => { firebase.auth().signOut(); }}>
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Brain className="h-16 w-16 text-white mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">AI Fundamentals - Key Concepts</h1>
          <p className="text-xl text-purple-100">
            Master AI concepts through interactive learning
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <LearningPaths onPathSelect={setSelectedPath} selectedPath={selectedPath} />

        <div className="flex justify-center gap-4 mb-8">
          {[
            { id: 'flashcards', label: 'Flashcards' },
            { id: 'match', label: 'Match Game' },
            { id: 'test', label: 'Test' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode.id as StudyMode)}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                currentMode === mode.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
          <a
            href="/coming-soon"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-full font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Video className="w-5 h-5" />
            Video Lesson
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">Coming Soon</span>
          </a>
        </div>

        {currentMode === 'flashcards' && renderFlashcards()}
        {currentMode === 'match' && renderMatchGame()}
        {currentMode === 'test' && renderTest()}

        {currentMode === 'flashcards' && (
          <div className="mt-6 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-2 transition-all"
              style={{ width: `${((currentCardIndex + 1) / totalCards) * 100}%` }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MyLearning;