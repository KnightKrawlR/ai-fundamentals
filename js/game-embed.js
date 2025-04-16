// Game component definition
const Game = () => {
    const [selectedPath, setSelectedPath] = React.useState({
        id: 3, // Personal Finance by default
        title: 'Personal Finance',
        description: 'Master financial concepts and tools'
    });
    
    const [currentMode, setCurrentMode] = React.useState('flashcards');
    const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [matchCards, setMatchCards] = React.useState([]);
    const [matchedPairs, setMatchedPairs] = React.useState(0);
    const [selectedMatchCard, setSelectedMatchCard] = React.useState(null);
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

    const nextCard = () => {
        setIsFlipped(false);
        setCurrentCardIndex((prev) => (prev + 1) % totalCards);
    };

    const prevCard = () => {
        setIsFlipped(false);
        setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Path selector dropdown
    const PathSelector = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        
        return React.createElement('div', { 
            className: 'path-selector',
            style: { position: 'relative' }
        },
            React.createElement('button', {
                onClick: () => setIsOpen(!isOpen),
                className: 'btn',
                style: { 
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }
            }, 
                selectedPath.title,
                React.createElement('span', null, '▼')
            ),
            isOpen && React.createElement('div', {
                style: {
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    zIndex: 1000
                }
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
                        className: 'btn',
                        style: {
                            width: '100%',
                            textAlign: 'left',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            backgroundColor: path.id === selectedPath.id ? '#f0f0f0' : 'transparent'
                        }
                    }, path.title)
                )
            )
        );
    };

    // Study mode tabs
    const StudyModeTabs = () => {
        return React.createElement('div', {
            style: {
                display: 'flex',
                gap: '1rem',
                marginBottom: '1rem'
            }
        },
            React.createElement('button', {
                className: `btn ${currentMode === 'flashcards' ? 'active' : ''}`,
                onClick: () => setCurrentMode('flashcards')
            }, 'Flashcards'),
            React.createElement('button', {
                className: `btn ${currentMode === 'match' ? 'active' : ''}`,
                onClick: () => setCurrentMode('match')
            }, 'Match Game'),
            React.createElement('button', {
                className: `btn ${currentMode === 'test' ? 'active' : ''}`,
                onClick: () => setCurrentMode('test')
            }, 'Test'),
            React.createElement('button', {
                className: 'btn',
                disabled: true,
                style: { opacity: 0.5 }
            }, 'Video Lesson (Coming Soon)')
        );
    };

    // Flashcard component
    const Flashcard = () => {
        const currentCard = currentFlashcards[currentCardIndex];
        
        return React.createElement('div', { className: 'flashcard-container' },
            // Controls bar
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }
            },
                // Left controls
                React.createElement('div', null,
                    React.createElement('button', { className: 'btn' }, '⚙️'),
                    React.createElement('button', { className: 'btn' }, '🔊')
                ),
                // Card counter
                React.createElement('div', null,
                    `Card ${currentCardIndex + 1} of ${totalCards}`
                ),
                // Right controls
                React.createElement('button', {
                    className: 'btn',
                    onClick: toggleFullscreen
                }, '⛶')
            ),
            // Card
            React.createElement('div', {
                className: `flashcard ${isFlipped ? 'flipped' : ''}`,
                onClick: () => setIsFlipped(!isFlipped),
                style: {
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    minHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s'
                }
            },
                React.createElement('div', {
                    style: {
                        fontSize: '1.5rem',
                        backfaceVisibility: 'hidden'
                    }
                }, isFlipped ? currentCard.definition : currentCard.term)
            ),
            // Navigation
            React.createElement('div', {
                style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '1rem'
                }
            },
                React.createElement('button', {
                    className: 'btn',
                    onClick: prevCard
                }, '←'),
                React.createElement('button', {
                    className: 'btn',
                    onClick: nextCard
                }, '→')
            )
        );
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

    // Match Game Implementation
    const initializeMatchGame = () => {
        const currentCards = currentFlashcards.slice(0, 8); // Take 8 cards for 16 total matches
        const matchGameCards = [];
        
        currentCards.forEach((card, index) => {
            // Add term card
            matchGameCards.push({
                id: `term_${index}`,
                content: card.term,
                type: 'term',
                isMatched: false,
                isFlipped: false
            });
            
            // Add definition card
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

    // Render functions
    const renderMatchGame = () => {
        if (matchCards.length === 0) {
            return React.createElement('div', { className: 'match-game-start' },
                React.createElement('h2', null, 'Memory Match Game'),
                React.createElement('p', null, 'Match terms with their correct definitions'),
                React.createElement('button', {
                    className: 'btn',
                    onClick: initializeMatchGame
                }, 'Start Game')
            );
        }

        return React.createElement('div', { className: 'match-game-container' },
            React.createElement('div', { className: 'match-game-header' },
                React.createElement('h2', null, 'Memory Match Game'),
                React.createElement('p', null, `Pairs Matched: ${matchedPairs} / 8`)
            ),
            React.createElement('div', { className: 'match-game-grid' },
                matchCards.map(card =>
                    React.createElement('div', {
                        key: card.id,
                        className: `match-card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`,
                        onClick: () => handleMatchCardClick(card)
                    },
                        React.createElement('div', { className: 'match-card-inner' },
                            React.createElement('div', { className: 'match-card-front' }),
                            React.createElement('div', { className: 'match-card-back' },
                                card.content
                            )
                        )
                    )
                )
            ),
            matchedPairs === 8 && React.createElement('div', { className: 'match-game-complete' },
                React.createElement('h3', null, 'Congratulations!'),
                React.createElement('p', null, 'You\'ve matched all pairs!'),
                React.createElement('button', {
                    className: 'btn',
                    onClick: initializeMatchGame
                }, 'Play Again')
            )
        );
    };

    const renderTest = () => {
        const questions = currentFlashcards.slice(0, 10); // Take 10 questions for the test

        if (showTestResults) {
            return React.createElement('div', { className: 'test-results' },
                React.createElement('h2', null, 'Test Results'),
                React.createElement('p', null, `Score: ${testScore} / 10`),
                React.createElement('div', { className: 'test-review' },
                    questions.map((question, index) =>
                        React.createElement('div', {
                            key: index,
                            className: `test-review-item ${testAnswers[index] === question.term ? 'correct' : 'incorrect'}`
                        },
                            React.createElement('p', null, `Question ${index + 1}: ${question.definition}`),
                            React.createElement('p', null, `Your answer: ${testAnswers[index] || 'Not answered'}`),
                            React.createElement('p', null, `Correct answer: ${question.term}`)
                        )
                    )
                ),
                React.createElement('button', {
                    className: 'btn',
                    onClick: initializeTest
                }, 'Try Again')
            );
        }

        return React.createElement('div', { className: 'test-container' },
            React.createElement('h2', null, 'Knowledge Test'),
            React.createElement('p', null, 'Match each definition with its correct term'),
            questions.map((question, index) =>
                React.createElement('div', {
                    key: index,
                    className: 'test-question'
                },
                    React.createElement('p', null, `${index + 1}. ${question.definition}`),
                    React.createElement('div', { className: 'test-options' },
                        questions.map(option =>
                            React.createElement('button', {
                                key: option.term,
                                className: `test-option ${testAnswers[index] === option.term ? 'selected' : ''}`,
                                onClick: () => handleTestAnswer(index, option.term)
                            }, option.term)
                        )
                    )
                )
            ),
            React.createElement('button', {
                className: 'btn submit-test',
                onClick: submitTest,
                disabled: Object.keys(testAnswers).length < questions.length
            }, 'Submit Test')
        );
    };

    // Progress display
    const renderProgress = () => {
        return React.createElement('div', { className: 'learning-progress' },
            React.createElement('div', { className: 'progress-bar' },
                React.createElement('div', {
                    className: 'progress-fill',
                    style: { width: `${progress.overallProgress}%` }
                }),
                React.createElement('span', { className: 'progress-text' },
                    `${progress.overallProgress}% Complete`
                )
            ),
            React.createElement('div', { className: 'progress-stats' },
                React.createElement('div', { className: 'stat' },
                    React.createElement('span', null, 'Flashcards'),
                    React.createElement('span', null, `${progress.flashcardsCompleted}/${totalCards}`)
                ),
                React.createElement('div', { className: 'stat' },
                    React.createElement('span', null, 'Match Games'),
                    React.createElement('span', null, `${progress.matchGamesWon}/5`)
                ),
                React.createElement('div', { className: 'stat' },
                    React.createElement('span', null, 'Tests'),
                    React.createElement('span', null, `${progress.testsCompleted}/3`)
                )
            )
        );
    };

    return React.createElement('div', { className: 'game-container' },
        React.createElement(PathSelector),
        renderProgress(),
        React.createElement(StudyModeTabs),
        currentMode === 'flashcards' && React.createElement(Flashcard),
        currentMode === 'match' && renderMatchGame(),
        currentMode === 'test' && renderTest()
    );
};

// Mount the React component
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-root');
    if (container) {
        ReactDOM.render(React.createElement(Game), container);
    }
}); 