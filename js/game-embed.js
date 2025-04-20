// Interactive Study Portal for AI Fundamentals
// This component provides a React-based learning experience with Flashcards, Match Game, and Tests

const Game = () => {
    // State variables
    const [selectedPath, setSelectedPath] = React.useState({
        id: 1,
        title: 'Introduction to AI'
    });
    const [currentMode, setCurrentMode] = React.useState('flashcards');
    const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
    const [isFlipped, setIsFlipped] = React.useState(false);
    const [matchCards, setMatchCards] = React.useState([]);
    const [selectedCards, setSelectedCards] = React.useState([]);
    const [matchedPairs, setMatchedPairs] = React.useState(0);
    const [progress, setProgress] = React.useState({
        flashcardsCompleted: 0,
        matchGamesWon: 0,
        testsCompleted: 0
    });

    // Learning paths
    const learningPaths = [
        { id: 1, title: 'Introduction to AI', description: 'Learn the basics of artificial intelligence' },
        { id: 2, title: 'Office Productivity', description: 'Use AI for work and productivity' },
        { id: 3, title: 'Personal Finance', description: 'Master financial concepts and tools' },
        { id: 4, title: 'Social Media Marketing', description: 'Leverage AI for social media success' },
        { id: 5, title: 'Videography', description: 'Create amazing videos with AI tools' },
        { id: 6, title: 'eCommerce', description: 'Optimize your online store with AI' }
    ];

    // Flashcard content for each path
    const pathFlashcards = {
        1: [ // Intro to AI
            { term: "Artificial Intelligence (AI)", definition: "Computer systems able to perform tasks that normally require human intelligence, such as visual perception, speech recognition, decision-making, and language translation." },
            { term: "Machine Learning (ML)", definition: "The study of computer algorithms that improve automatically through experience and by the use of data." },
            { term: "Deep Learning", definition: "A subset of machine learning using neural networks with multiple layers to analyze various factors of data." },
            { term: "Natural Language Processing (NLP)", definition: "The ability of a computer program to recognize and manipulate human language." },
            { term: "Neural Networks", definition: "Computing systems with interconnected nodes inspired by human brain neurons." },
            { term: "Supervised Learning", definition: "Training a model using labeled data where the desired output is known." },
            { term: "Unsupervised Learning", definition: "Finding patterns in data without pre-existing labels or categorization." },
            { term: "Reinforcement Learning", definition: "Training models to make sequences of decisions by rewarding desired behaviors." },
            { term: "Computer Vision", definition: "AI systems designed to derive meaningful information from digital images and videos." },
            { term: "GPT (Generative Pre-trained Transformer)", definition: "A class of language models designed to generate human-like text based on context." }
        ],
        2: [ // Office Productivity
            { term: "Microsoft Copilot", definition: "AI assistant integrated into Microsoft 365 for tasks like writing, analyzing, and summarizing" },
            { term: "Smart Compose", definition: "Google's AI feature that predicts and suggests text as you type" },
            { term: "Otter.ai", definition: "AI-powered meeting assistant that transcribes conversations in real-time" },
            { term: "Notion AI", definition: "AI writing assistant integrated with Notion for drafting, editing, and summarizing content" },
            { term: "Zapier", definition: "Automation platform using AI to connect apps and automate workflows" },
            { term: "Grammarly", definition: "AI writing assistant that checks grammar, clarity, and style" },
            { term: "Todoist AI", definition: "Task management app with AI to prioritize and organize tasks" },
            { term: "Calendly AI", definition: "Scheduling tool with AI capabilities for optimizing meeting times" },
            { term: "Krisp", definition: "AI-powered noise cancellation tool for clearer virtual meetings" },
            { term: "Loom", definition: "Video messaging platform with AI features for transcription and highlights" }
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
            { term: "50/30/20 Rule", definition: "Budgeting principle: 50% needs, 30% wants, 20% savings" }
        ],
        4: [ // Social Media
            { term: "Hootsuite Insights", definition: "AI-powered social listening and analytics tool" },
            { term: "Buffer AI", definition: "Social media scheduling platform with AI-recommended posting times" },
            { term: "Canva Magic Write", definition: "AI copywriting tool for social media content creation" },
            { term: "Sprout Social", definition: "Social media management with AI analytics and recommendations" },
            { term: "Later", definition: "Instagram-focused scheduling tool with AI-powered analytics" },
            { term: "BuzzSumo", definition: "Content research tool using AI to identify trending topics" },
            { term: "Awario", definition: "AI-powered social listening tool for brand monitoring" },
            { term: "HubSpot Social", definition: "AI-enhanced social media marketing platform integrated with CRM" },
            { term: "Lately", definition: "AI content generator that creates multiple social posts from long-form content" },
            { term: "Brandwatch", definition: "AI-powered consumer intelligence platform for social media analysis" }
        ],
        5: [ // Videography
            { term: "Runway ML", definition: "AI video editing platform with tools for synthesis, editing, and effects" },
            { term: "Descript", definition: "AI video editor that allows editing video by editing text" },
            { term: "Synthesia", definition: "AI avatar platform for creating videos with virtual presenters" },
            { term: "Kapwing", definition: "Online video editor with AI-powered tools for subtitles and effects" },
            { term: "InVideo", definition: "AI-powered video creation platform with templates and automation" },
            { term: "Premiere Pro AI", definition: "Adobe's video editing software with AI features like auto-reframe" },
            { term: "DaVinci Resolve", definition: "Video editor with AI-powered color grading and effects" },
            { term: "Luma AI", definition: "Neural rendering technology for advanced video effects" },
            { term: "Colourlab.ai", definition: "AI color grading tool for video editors" },
            { term: "Topaz Video AI", definition: "AI-powered video enhancement and upscaling software" }
        ],
        6: [ // eCommerce
            { term: "Shopify Magic", definition: "AI assistant for Shopify stores that generates product descriptions" },
            { term: "Jasper", definition: "AI content generator specialized in eCommerce copy" },
            { term: "Algolia", definition: "AI-powered search engine for eCommerce sites" },
            { term: "Dynamic Yield", definition: "AI personalization platform for eCommerce experiences" },
            { term: "Nosto", definition: "AI-powered personalization for online shopping experiences" },
            { term: "Klevu", definition: "Smart search and product discovery using AI" },
            { term: "Lily AI", definition: "Product attribute technology using emotional intelligence" },
            { term: "Yotpo", definition: "eCommerce marketing platform with AI review analysis" },
            { term: "Recolize", definition: "AI-powered product recommendation engine" },
            { term: "Vue.ai", definition: "Retail automation platform using computer vision and AI" }
        ]
    };

    // Get current flashcards based on selected path
    const currentFlashcards = pathFlashcards[selectedPath.id] || [];
    const totalCards = currentFlashcards.length;

    // Initialize match game
    const initializeMatchGame = () => {
        // Create pairs of terms and definitions
        const pairs = [];
        const shuffledCards = [...currentFlashcards].sort(() => Math.random() - 0.5).slice(0, 8);
        
        shuffledCards.forEach((card, index) => {
            pairs.push(
                { id: `term-${index}`, content: card.term, type: 'term', isMatched: false, isFlipped: false },
                { id: `def-${index}`, content: card.definition, type: 'definition', isMatched: false, isFlipped: false }
            );
        });
        
        // Shuffle the cards
        const shuffledPairs = pairs.sort(() => Math.random() - 0.5);
        setMatchCards(shuffledPairs);
        setMatchedPairs(0);
    };

    // Handle match card click
    const handleMatchCardClick = (clickedCard) => {
        // Ignore clicks on matched cards or if two cards are already flipped
        if (clickedCard.isMatched || selectedCards.length === 2) return;
        if (selectedCards.length === 1 && selectedCards[0].id === clickedCard.id) return;
        
        // Update cards with the new flipped card
        const updatedCards = matchCards.map(card =>
            card.id === clickedCard.id ? { ...card, isFlipped: true } : card
        );
        
        // Update selected cards
        const newSelectedCards = [...selectedCards, clickedCard];
        
        if (newSelectedCards.length === 2) {
            // Check if the cards match (one term and one definition that belong together)
            const [card1, card2] = newSelectedCards;
            const isMatch = card1.type !== card2.type && 
                ((card1.type === 'term' && card2.type === 'definition') || 
                 (card1.type === 'definition' && card2.type === 'term'));
            
            if (isMatch) {
                // Extract the indices from the IDs
                const index1 = parseInt(card1.id.split('-')[1]);
                const index2 = parseInt(card2.id.split('-')[1]);
                
                // Check if they refer to the same flashcard
                if (index1 === index2) {
                    // Mark the cards as matched
                    const matchedCards = updatedCards.map(card =>
                        (card.id === card1.id || card.id === card2.id)
                            ? { ...card, isMatched: true, isFlipped: true }
                            : card
                    );
                    
                    setMatchCards(matchedCards);
                    setMatchedPairs(prev => prev + 1);
                    setSelectedCards([]);
                    
                    // Check if all pairs are matched
                    if (matchedPairs + 1 === 8) {
                        // Game is won!
                        updateProgress('match', progress.matchGamesWon + 1);
                        
                        // Show a success message after a short delay
                        setTimeout(() => {
                            alert('Congratulations! You matched all pairs!');
                            initializeMatchGame();
                        }, 1000);
                    }
                } else {
                    // Not a match, flip them back after a delay
                    setMatchCards(updatedCards);
                    setSelectedCards(newSelectedCards);
                    
                    setTimeout(() => {
                        setMatchCards(matchCards.map(card =>
                            (card.id === card1.id || card.id === card2.id)
                                ? { ...card, isFlipped: false }
                                : card
                        ));
                        setSelectedCards([]);
                    }, 1000);
                }
            } else {
                // Not a match, flip them back after a delay
                setMatchCards(updatedCards);
                setSelectedCards(newSelectedCards);
                
                setTimeout(() => {
                    setMatchCards(matchCards.map(card =>
                        (card.id === card1.id || card.id === card2.id)
                            ? { ...card, isFlipped: false }
                            : card
                    ));
                    setSelectedCards([]);
                }, 1000);
            }
        } else {
            // First card selection
            setMatchCards(updatedCards);
            setSelectedCards(newSelectedCards);
        }
    };

    // Update progress
    const updateProgress = (type, value) => {
        setProgress(prev => ({
            ...prev,
            [type === 'flashcards' ? 'flashcardsCompleted' : 
             type === 'match' ? 'matchGamesWon' : 
             'testsCompleted']: value
        }));
    };

    // Path selector component
    const PathSelector = () => {
        return React.createElement('div', { className: 'mb-6' },
            React.createElement('div', { 
                className: 'relative',
                style: { fontFamily: 'Inter, system-ui, sans-serif' }
            },
                React.createElement('button', {
                    className: 'flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none',
                    onClick: (e) => {
                        const dropdown = e.currentTarget.nextElementSibling;
                        dropdown.classList.toggle('hidden');
                    }
                },
                    React.createElement('span', {}, selectedPath.title),
                    React.createElement('span', {}, '▼')
                ),
                React.createElement('div', {
                    className: 'absolute z-10 hidden w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg',
                    style: { maxHeight: '300px', overflowY: 'auto' }
                },
                    learningPaths.map(path =>
                        React.createElement('button', {
                            key: path.id,
                            onClick: () => {
                                setSelectedPath(path);
                                setCurrentCardIndex(0);
                                setIsFlipped(false);
                                setMatchCards([]);
                                setSelectedCards([]);
                                setMatchedPairs(0);
                                e.currentTarget.parentElement.classList.add('hidden');
                            },
                            className: `w-full px-4 py-2 text-left hover:bg-gray-50 ${path.id === selectedPath.id ? 'bg-purple-50 text-purple-700' : 'text-gray-900'}`,
                            style: { fontFamily: 'Inter, system-ui, sans-serif' }
                        }, path.title)
                    )
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
                    onClick: () => {
                        setCurrentMode(mode.id);
                        if (mode.id === 'match' && matchCards.length === 0) {
                            initializeMatchGame();
                        }
                    },
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
                React.createElement('span', null, `Flashcards: ${progress.flashcardsCompleted}/${totalCards}`),
                React.createElement('span', null, '•'),
                React.createElement('span', null, `Match Games: ${progress.matchGamesWon}/5`),
                React.createElement('span', null, '•'),
                React.createElement('span', null, `Tests: ${progress.testsCompleted}/3`)
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
                    onClick: (e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setCurrentCardIndex((prev) => (prev - 1 + totalCards) % totalCards);
                    }
                }, '←'),
                React.createElement('div', {
                    className: 'text-sm text-gray-500 flex items-center',
                    style: { fontFamily: 'Inter, system-ui, sans-serif' }
                }, 'Click card to flip'),
                React.createElement('button', {
                    className: 'p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors',
                    onClick: (e) => {
                        e.stopPropagation();
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
        React.createElement('h1', { className: 'text-2xl font-bold mb-6', style: { fontFamily: 'Inter, system-ui, sans-serif' } }, 'My Learning Dashboard'),
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

// Add necessary styles
document.head.insertAdjacentHTML('beforeend', `
<style>
.perspective-1000 { perspective: 1000px; }
.backface-hidden { backface-visibility: hidden; }
.transform-style-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }
</style>
`);

// Mount the React component
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('game-root');
    if (container) {
        ReactDOM.render(React.createElement(Game), container);
    }
}); 