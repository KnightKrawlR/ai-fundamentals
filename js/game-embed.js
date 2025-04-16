// Game component definition
const Game = () => {
    const [selectedPath, setSelectedPath] = React.useState({
        id: 3,
        title: 'Personal Finance',
        description: 'Master financial concepts and tools'
    });
    
    const [currentMode, setCurrentMode] = React.useState('flashcards');
    const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [fullscreen, setFullscreen] = React.useState(false);
    const [matchCards, setMatchCards] = React.useState([]);
    const [selectedMatchCard, setSelectedMatchCard] = React.useState(null);
    const [matchedPairs, setMatchedPairs] = React.useState(0);
    const [testAnswers, setTestAnswers] = React.useState({});
    const [testScore, setTestScore] = React.useState(0);
    const [showTestResults, setShowTestResults] = React.useState(false);
    const [progress, setProgress] = React.useState({
        flashcardsCompleted: 0,
        matchGamesWon: 0,
        testsCompleted: 0,
        overallProgress: 0
    });
    
    // Flashcard content for each path
    const pathFlashcards = {
        1: [ // Introduction to AI
            { term: "ChatGPT", definition: "An AI language model for text generation, coding assistance, and general problem-solving" },
            { term: "Copilot", definition: "AI-powered coding assistant that helps developers write and understand code faster" },
            // ... more cards ...
        ],
        2: [ // Office Productivity
            { term: "Notion AI", definition: "AI-powered workspace that helps write, edit, and summarize documents" },
            { term: "Microsoft Copilot", definition: "AI assistant integrated into Office apps for enhanced productivity" },
            // ... more cards ...
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
            // ... more cards ...
        ],
        5: [ // Videography
            { term: "Descript", definition: "AI video editor that allows editing video by editing text" },
            { term: "RunwayML", definition: "AI-powered video editing with special effects and generation" },
            // ... more cards ...
        ],
        6: [ // eCommerce
            { term: "Jasper AI", definition: "AI content generator for product descriptions and marketing copy" },
            { term: "Klaviyo", definition: "AI-powered email marketing platform for eCommerce" },
            // ... more cards ...
        ]
    };

    const paths = [
        { id: 1, title: 'Introduction to AI', description: 'Learn the basic concepts and terminology of artificial intelligence' },
        { id: 2, title: 'Office Productivity', description: 'Master AI-powered tools for workplace efficiency' },
        { id: 3, title: 'Personal Finance', description: 'Master financial concepts and tools' },
        { id: 4, title: 'Social Media Marketing', description: 'Learn AI-driven social media strategies' },
        { id: 5, title: 'Videography', description: 'Master AI video creation and editing' },
        { id: 6, title: 'eCommerce', description: 'Learn AI tools for online business' }
    ];

    const currentFlashcards = pathFlashcards[selectedPath.id];
    const totalCards = currentFlashcards.length;

    React.useEffect(() => {
        setCurrentCardIndex(0);
        setIsFlipped(false);
        if (currentMode === 'match') {
            initializeMatchGame();
        }
    }, [selectedPath.id]);

    React.useEffect(() => {
        if (currentMode === 'match') {
            initializeMatchGame();
        }
    }, [currentMode]);

    const initializeMatchGame = () => {
        const currentCards = currentFlashcards.slice(0, 8);
        const matchGameCards = [];
        
        currentCards.forEach((card, index) => {
            matchGameCards.push({
                id: `term_${index}`,
                content: card.term,
                type: 'term',
                isMatched: false,
                isFlipped: false
            });
            
            matchGameCards.push({
                id: `def_${index}`,
                content: card.definition,
                type: 'definition',
                isMatched: false,
                isFlipped: false
            });
        });

        // Shuffle cards
        for (let i = matchGameCards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [matchGameCards[i], matchGameCards[j]] = [matchGameCards[j], matchGameCards[i]];
        }

        setMatchCards(matchGameCards);
        setMatchedPairs(0);
        setSelectedMatchCard(null);
    };

    const handleMatchCardClick = (clickedCard) => {
        if (clickedCard.isMatched || clickedCard.isFlipped) return;

        const updatedCards = matchCards.map(card =>
            card.id === clickedCard.id ? { ...card, isFlipped: true } : card
        );

        if (!selectedMatchCard) {
            setMatchCards(updatedCards);
            setSelectedMatchCard(clickedCard);
            return;
        }

        // Check for match
        const isMatch = (
            (selectedMatchCard.type === 'term' && clickedCard.type === 'definition') ||
            (selectedMatchCard.type === 'definition' && clickedCard.type === 'term')
        ) && (
            currentFlashcards.some(card => 
                (card.term === selectedMatchCard.content && card.definition === clickedCard.content) ||
                (card.term === clickedCard.content && card.definition === selectedMatchCard.content)
            )
        );

        if (isMatch) {
            const finalCards = updatedCards.map(card =>
                (card.id === clickedCard.id || card.id === selectedMatchCard.id)
                    ? { ...card, isMatched: true, isFlipped: true }
                    : card
            );
            setMatchCards(finalCards);
            setMatchedPairs(prev => {
                const newPairs = prev + 1;
                if (newPairs === 8) { // All pairs matched
                    updateProgress('matchGamesWon', progress.matchGamesWon + 1);
                }
                return newPairs;
            });
        } else {
            setMatchCards(updatedCards);
            setTimeout(() => {
                setMatchCards(cards =>
                    cards.map(card =>
                        (card.id === clickedCard.id || card.id === selectedMatchCard.id)
                            ? { ...card, isFlipped: false }
                            : card
                    )
                );
            }, 1000);
        }
        setSelectedMatchCard(null);
    };

    // Test Implementation
    const initializeTest = () => {
        setTestAnswers({});
        setTestScore(0);
        setShowTestResults(false);
    };

    const handleTestAnswer = (questionIndex, selectedAnswer) => {
        setTestAnswers(prev => ({
            ...prev,
            [questionIndex]: selectedAnswer
        }));
    };

    const submitTest = () => {
        let score = 0;
        const questions = currentFlashcards.slice(0, 10); // Take 10 questions for the test
        
        questions.forEach((question, index) => {
            if (testAnswers[index] === question.term) {
                score++;
            }
        });

        setTestScore(score);
        setShowTestResults(true);
        updateProgress('testsCompleted', progress.testsCompleted + 1);
    };

    // Progress tracking
    const updateProgress = (type, value) => {
        setProgress(prev => {
            const newProgress = {
                ...prev,
                [type]: value,
                overallProgress: Math.round(
                    ((prev.flashcardsCompleted / totalCards) * 0.4 +
                    (prev.matchGamesWon / 5) * 0.3 +
                    (prev.testsCompleted / 3) * 0.3) * 100
                )
            };
            
            // Save to localStorage
            localStorage.setItem(`progress_${selectedPath.id}`, JSON.stringify(newProgress));
            return newProgress;
        });
    };

    // Load progress on path change
    React.useEffect(() => {
        const savedProgress = localStorage.getItem(`progress_${selectedPath.id}`);
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        } else {
            setProgress({
                flashcardsCompleted: 0,
                matchGamesWon: 0,
                testsCompleted: 0,
                overallProgress: 0
            });
        }
    }, [selectedPath.id]);

    // Path selector dropdown
    const PathSelector = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        
        return React.createElement('div', { 
            className: 'relative w-full'
        },
            React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                className: 'w-full px-4 py-2 text-left bg-white border rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500',
                style: { 
                    fontFamily: 'Inter, system-ui, sans-serif'
                }
            }, 
                React.createElement('span', { className: 'text-gray-900 font-medium' }, selectedPath.title),
                React.createElement('span', { className: 'text-gray-500' }, '▼')
            ),
            isOpen && React.createElement('div', {
                className: 'absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-auto'
            },
                paths.map(path => 
                    React.createElement('button', {
                        key: path.id,
                        onClick: () => {
                            setSelectedPath(path);
                            setIsOpen(false);
                            setCurrentCardIndex(0);
                            setIsFlipped(false);
                        },
                        className: `w-full px-4 py-2 text-left hover:bg-gray-50 ${path.id === selectedPath.id ? 'bg-purple-50 text-purple-700' : 'text-gray-900'}`,
                        style: { fontFamily: 'Inter, system-ui, sans-serif' }
                    }, path.title)
                )
            )
        );
    };

    // Study mode tabs
    const StudyModeTabs = () => {
        return React.createElement('div', {
            className: 'flex gap-2 mb-6'
        },
            [
                { id: 'flashcards', label: 'Flashcards' },
                { id: 'match', label: 'Match Game' },
                { id: 'test', label: 'Test' }
            ].map(mode => 
                React.createElement('button', {
                    key: mode.id,
                    onClick: () => setCurrentMode(mode.id),
                    className: `px-4 py-2 rounded-full font-medium transition-colors ${
                        currentMode === mode.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`,
                    style: { fontFamily: 'Inter, system-ui, sans-serif' }
                }, mode.label)
            ),
            React.createElement('button', {
                className: 'px-4 py-2 rounded-full font-medium transition-colors bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2',
                disabled: true,
                style: { fontFamily: 'Inter, system-ui, sans-serif' }
            },
                'Video Lesson',
                React.createElement('span', {
                    className: 'text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full'
                }, 'Coming Soon')
            )
        );
    };

    // Progress display
    const renderProgress = () => {
        return React.createElement('div', {
            className: 'mb-6 text-sm text-gray-500',
            style: { fontFamily: 'Inter, system-ui, sans-serif' }
        },
            React.createElement('div', { className: 'flex gap-2' },
                React.createElement('span', null, `Flashcards${progress.flashcardsCompleted}/${totalCards}`),
                React.createElement('span', null, '•'),
                React.createElement('span', null, `Match Games${progress.matchGamesWon}/5`),
                React.createElement('span', null, '•'),
                React.createElement('span', null, `Tests${progress.testsCompleted}/3`)
            )
        );
    };

    // Flashcard component
    const Flashcard = () => {
        const currentCard = currentFlashcards[currentCardIndex];
        
        return React.createElement('div', { className: 'relative' },
            // Controls bar
            React.createElement('div', {
                className: 'flex items-center justify-between mb-4'
            },
                // Left controls
                React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', { 
                        className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
                    }, '⚙️'),
                    React.createElement('button', { 
                        className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors'
                    }, '🔊')
                ),
                // Card counter
                React.createElement('div', { 
                    className: 'text-sm text-gray-500',
                    style: { fontFamily: 'Inter, system-ui, sans-serif' }
                }, `Card ${currentCardIndex + 1} of ${totalCards}`),
                // Fullscreen button
                React.createElement('button', {
                    className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors',
                    onClick: () => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }
                }, '⛶')
            ),
            // Card
            React.createElement('div', {
                className: `relative w-full aspect-[4/3] cursor-pointer perspective-1000`,
                onClick: () => setIsFlipped(!isFlipped)
            },
                React.createElement('div', {
                    className: `absolute inset-0 transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`,
                    style: {
                        transformStyle: 'preserve-3d'
                    }
                },
                    // Front
                    React.createElement('div', {
                        className: 'absolute inset-0 flex items-center justify-center bg-purple-600 text-white rounded-xl p-8 backface-hidden',
                        style: { backfaceVisibility: 'hidden' }
                    },
                        React.createElement('div', {
                            className: 'text-center'
                        },
                            React.createElement('div', {
                                className: 'text-sm uppercase tracking-wider mb-2'
                            }, 'Term'),
                            React.createElement('div', {
                                className: 'text-2xl font-medium',
                                style: { fontFamily: 'Inter, system-ui, sans-serif' }
                            }, currentCard.term)
                        )
                    ),
                    // Back
                    React.createElement('div', {
                        className: 'absolute inset-0 flex items-center justify-center bg-white border-2 border-purple-600 rounded-xl p-8 rotate-y-180 backface-hidden',
                        style: { backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }
                    },
                        React.createElement('div', {
                            className: 'text-center'
                        },
                            React.createElement('div', {
                                className: 'text-sm uppercase tracking-wider text-purple-600 mb-2'
                            }, 'Definition'),
                            React.createElement('div', {
                                className: 'text-xl text-gray-900',
                                style: { fontFamily: 'Inter, system-ui, sans-serif' }
                            }, currentCard.definition)
                        )
                    )
                )
            ),
            // Navigation
            React.createElement('div', {
                className: 'flex justify-between mt-4'
            },
                React.createElement('button', {
                    className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors',
                    onClick: () => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
                    }
                }, '←'),
                React.createElement('button', {
                    className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors',
                    onClick: () => {
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev + 1) % totalCards);
                    }
                }, '→')
            )
        );
    };

    // Match Game Implementation
    const renderMatchGame = () => {
        if (matchCards.length === 0) {
            return React.createElement('div', { 
                className: 'text-center py-12',
                style: { fontFamily: 'Inter, system-ui, sans-serif' }
            },
                React.createElement('h2', { 
                    className: 'text-2xl font-bold text-gray-900 mb-4'
                }, 'Memory Match Game'),
                React.createElement('p', { 
                    className: 'text-gray-600 mb-8'
                }, 'Match terms with their correct definitions'),
                React.createElement('button', {
                    className: 'px-6 py-3 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors',
                    onClick: initializeMatchGame
                }, 'Start Game')
            );
        }

        return React.createElement('div', { className: 'space-y-6' },
            React.createElement('div', { className: 'text-center' },
                React.createElement('h2', { 
                    className: 'text-2xl font-bold text-gray-900 mb-2',
                    style: { fontFamily: 'Inter, system-ui, sans-serif' }
                }, 'Memory Match Game'),
                React.createElement('p', { 
                    className: 'text-gray-600',
                    style: { fontFamily: 'Inter, system-ui, sans-serif' }
                }, `Pairs Matched: ${matchedPairs} / 8`)
            ),
            React.createElement('div', {
                className: 'grid grid-cols-4 gap-4'
            },
                matchCards.map(card =>
                    React.createElement('div', {
                        key: card.id,
                        className: `aspect-[3/4] cursor-pointer perspective-1000 ${card.isMatched ? 'opacity-50' : ''}`,
                        onClick: () => handleMatchCardClick(card)
                    },
                        React.createElement('div', {
                            className: `relative w-full h-full transition-transform duration-500 transform-style-3d ${card.isFlipped ? 'rotate-y-180' : ''}`,
                            style: { transformStyle: 'preserve-3d' }
                        },
                            React.createElement('div', {
                                className: 'absolute inset-0 flex items-center justify-center bg-purple-600 text-white rounded-lg backface-hidden',
                                style: { backfaceVisibility: 'hidden' }
                            }),
                            React.createElement('div', {
                                className: 'absolute inset-0 flex items-center justify-center p-4 bg-white border-2 border-purple-600 rounded-lg rotate-y-180 backface-hidden',
                                style: { 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    fontFamily: 'Inter, system-ui, sans-serif'
                                }
                            }, card.content)
                        )
                    )
                )
            )
        );
    };

    return React.createElement('div', { className: 'max-w-4xl mx-auto px-4 py-8' },
        React.createElement(PathSelector),
        renderProgress(),
        React.createElement(StudyModeTabs),
        currentMode === 'flashcards' && React.createElement(Flashcard),
        currentMode === 'match' && renderMatchGame(),
        currentMode === 'test' && React.createElement('div', { 
            className: 'text-center py-12 text-gray-500',
            style: { fontFamily: 'Inter, system-ui, sans-serif' }
        }, 'Test mode coming soon')
    );
};

// Mount the React component
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-root');
    if (container) {
        ReactDOM.render(React.createElement(Game), container);
    }
}); 