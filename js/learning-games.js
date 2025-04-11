// Learning games functionality for AI Fundamentals
document.addEventListener('DOMContentLoaded', function() {
    // Flashcard functionality
    initializeFlashcards();
    
    // Quiz mode functionality
    initializeQuizMode();
    
    // Matching game functionality
    initializeMatchingGame();
});

// Flashcard system
function initializeFlashcards() {
    const flashcardContainer = document.querySelector('.flashcard-container');
    const flashcard = document.querySelector('.flashcard');
    const prevButton = document.getElementById('prev-card');
    const nextButton = document.getElementById('next-card');
    const flipCardsButton = document.querySelector('.flip-cards-btn');
    const quizModeButton = document.querySelector('.quiz-mode-btn');
    const matchingGameButton = document.querySelector('.matching-game-btn');
    
    if (!flashcardContainer || !flashcard) return;
    
    // Flashcard data
    const flashcards = [
        {
            term: "Artificial Intelligence (AI)",
            definition: "The simulation of human intelligence processes by machines, especially computer systems."
        },
        {
            term: "Machine Learning",
            definition: "A subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed."
        },
        {
            term: "Deep Learning",
            definition: "A subset of machine learning that uses neural networks with many layers (deep neural networks) to analyze various factors of data."
        },
        {
            term: "Neural Network",
            definition: "A computing system inspired by the biological neural networks that constitute animal brains."
        },
        {
            term: "Natural Language Processing (NLP)",
            definition: "A field of AI that gives computers the ability to understand text and spoken words in the same way humans can."
        },
        {
            term: "Computer Vision",
            definition: "A field of AI that enables computers to derive meaningful information from digital images, videos and other visual inputs."
        },
        {
            term: "Reinforcement Learning",
            definition: "A type of machine learning where an agent learns to behave in an environment by performing actions and seeing the results."
        },
        {
            term: "Supervised Learning",
            definition: "A type of machine learning where the model is trained on labeled data, learning to map inputs to known outputs."
        },
        {
            term: "Unsupervised Learning",
            definition: "A type of machine learning where the model works on its own to discover patterns and information in the input data without labeled outputs."
        },
        {
            term: "Generative AI",
            definition: "AI systems that can generate new content, such as text, images, audio, or video, based on patterns learned from existing data."
        },
        {
            term: "Large Language Model (LLM)",
            definition: "A type of AI model trained on vast amounts of text data to understand and generate human-like text."
        },
        {
            term: "Transformer",
            definition: "A deep learning architecture that uses self-attention mechanisms to process sequential data, revolutionizing NLP tasks."
        },
        {
            term: "Prompt Engineering",
            definition: "The process of designing effective inputs (prompts) for AI systems to generate desired outputs."
        },
        {
            term: "Fine-tuning",
            definition: "The process of taking a pre-trained model and further training it on a specific dataset for a particular task."
        },
        {
            term: "Ethical AI",
            definition: "The practice of designing, developing, and deploying AI systems in ways that are fair, transparent, and beneficial to humanity."
        }
    ];
    
    let currentCardIndex = 0;
    let isFlipped = false;
    
    // Initialize first card
    updateCardContent();
    updateCardCounter();
    
    // Add click event to flip card
    flashcard.addEventListener('click', function() {
        flipCard();
    });
    
    // Previous button
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                isFlipped = false;
                updateCardContent();
                updateCardCounter();
                flashcard.classList.remove('flipped');
            }
        });
    }
    
    // Next button
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            if (currentCardIndex < flashcards.length - 1) {
                currentCardIndex++;
                isFlipped = false;
                updateCardContent();
                updateCardCounter();
                flashcard.classList.remove('flipped');
            }
        });
    }
    
    // Flip Cards button
    if (flipCardsButton) {
        flipCardsButton.addEventListener('click', function() {
            activateStudyMode('flashcards');
        });
    }
    
    // Quiz Mode button
    if (quizModeButton) {
        quizModeButton.addEventListener('click', function() {
            activateStudyMode('quiz');
        });
    }
    
    // Matching Game button
    if (matchingGameButton) {
        matchingGameButton.addEventListener('click', function() {
            activateStudyMode('matching');
        });
    }
    
    // Update card content
    function updateCardContent() {
        const card = flashcards[currentCardIndex];
        const frontContent = flashcard.querySelector('.card-front .card-content');
        const backContent = flashcard.querySelector('.card-back .card-content');
        
        if (frontContent && backContent) {
            frontContent.textContent = card.term;
            backContent.textContent = card.definition;
        }
    }
    
    // Update card counter
    function updateCardCounter() {
        const counter = document.querySelector('.card-counter');
        if (counter) {
            counter.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
        }
    }
    
    // Flip card
    function flipCard() {
        flashcard.classList.toggle('flipped');
        isFlipped = !isFlipped;
    }
    
    // Activate study mode
    function activateStudyMode(mode) {
        const flashcardSection = document.querySelector('.flashcard-section');
        const quizSection = document.querySelector('.quiz-section');
        const matchingSection = document.querySelector('.matching-section');
        
        // Reset active state on all buttons
        flipCardsButton.classList.remove('active');
        quizModeButton.classList.remove('active');
        matchingGameButton.classList.remove('active');
        
        // Hide all sections
        if (flashcardSection) flashcardSection.style.display = 'none';
        if (quizSection) quizSection.style.display = 'none';
        if (matchingSection) matchingSection.style.display = 'none';
        
        // Show selected section and activate button
        if (mode === 'flashcards') {
            if (flashcardSection) flashcardSection.style.display = 'block';
            flipCardsButton.classList.add('active');
        } else if (mode === 'quiz') {
            if (quizSection) quizSection.style.display = 'block';
            quizModeButton.classList.add('active');
            startQuiz();
        } else if (mode === 'matching') {
            if (matchingSection) matchingSection.style.display = 'block';
            matchingGameButton.classList.add('active');
            startMatchingGame();
        }
    }
}

// Quiz mode functionality
function initializeQuizMode() {
    const quizContainer = document.querySelector('.quiz-container');
    if (!quizContainer) return;
    
    // Quiz questions
    const quizQuestions = [
        {
            question: "What is Artificial Intelligence?",
            options: [
                "The simulation of human intelligence processes by machines",
                "A type of computer hardware",
                "A programming language",
                "A database management system"
            ],
            correctAnswer: 0
        },
        {
            question: "Which of the following is a subset of AI?",
            options: [
                "HTML",
                "Machine Learning",
                "SQL",
                "JavaScript"
            ],
            correctAnswer: 1
        },
        {
            question: "What is a neural network inspired by?",
            options: [
                "Computer circuits",
                "Electrical grids",
                "Biological neural networks in animal brains",
                "Network protocols"
            ],
            correctAnswer: 2
        },
        {
            question: "What does NLP stand for in AI?",
            options: [
                "New Learning Protocol",
                "Natural Language Processing",
                "Neural Logic Programming",
                "Network Learning Platform"
            ],
            correctAnswer: 1
        },
        {
            question: "Which type of learning involves an agent learning from its environment?",
            options: [
                "Supervised Learning",
                "Unsupervised Learning",
                "Reinforcement Learning",
                "Transfer Learning"
            ],
            correctAnswer: 2
        }
    ];
    
    let currentQuestionIndex = 0;
    let score = 0;
    
    // Start quiz
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        showQuestion();
    }
    
    // Show current question
    function showQuestion() {
        const questionData = quizQuestions[currentQuestionIndex];
        const questionElement = document.querySelector('.quiz-question');
        const optionsContainer = document.querySelector('.quiz-options');
        const progressElement = document.querySelector('.quiz-progress');
        
        if (questionElement && optionsContainer && progressElement) {
            // Update question
            questionElement.textContent = questionData.question;
            
            // Clear previous options
            optionsContainer.innerHTML = '';
            
            // Add options
            questionData.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.classList.add('quiz-option');
                optionElement.textContent = option;
                optionElement.setAttribute('data-index', index);
                
                optionElement.addEventListener('click', function() {
                    checkAnswer(parseInt(this.getAttribute('data-index')));
                });
                
                optionsContainer.appendChild(optionElement);
            });
            
            // Update progress
            progressElement.textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
        }
    }
    
    // Check answer
    function checkAnswer(selectedIndex) {
        const correctIndex = quizQuestions[currentQuestionIndex].correctAnswer;
        const optionElements = document.querySelectorAll('.quiz-option');
        
        // Disable all options
        optionElements.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        // Highlight correct and incorrect answers
        optionElements.forEach((option, index) => {
            if (index === correctIndex) {
                option.classList.add('correct');
            } else if (index === selectedIndex) {
                option.classList.add('incorrect');
            }
        });
        
        // Update score
        if (selectedIndex === correctIndex) {
            score++;
        }
        
        // Move to next question after delay
        setTimeout(() => {
            currentQuestionIndex++;
            
            if (currentQuestionIndex < quizQuestions.length) {
                showQuestion();
            } else {
                showResults();
            }
        }, 1500);
    }
    
    // Show quiz results
    function showResults() {
        const quizContainer = document.querySelector('.quiz-container');
        
        if (quizContainer) {
            quizContainer.innerHTML = `
                <div class="quiz-results">
                    <h3>Quiz Results</h3>
                    <p>You scored ${score} out of ${quizQuestions.length}</p>
                    <button class="btn retry-quiz">Try Again</button>
                </div>
            `;
            
            // Add event listener to retry button
            const retryButton = document.querySelector('.retry-quiz');
            if (retryButton) {
                retryButton.addEventListener('click', function() {
                    // Reset quiz container
                    quizContainer.innerHTML = `
                        <h3 class="quiz-question"></h3>
                        <div class="quiz-options"></div>
                        <div class="quiz-progress"></div>
                    `;
                    
                    // Restart quiz
                    startQuiz();
                });
            }
        }
    }
    
    // Initialize quiz when quiz mode is activated
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quiz-mode-btn')) {
            startQuiz();
        }
    });
}

// Matching game functionality
function initializeMatchingGame() {
    const matchingContainer = document.querySelector('.matching-container');
    if (!matchingContainer) return;
    
    // Matching pairs
    const matchingPairs = [
        { term: "Artificial Intelligence", definition: "Simulation of human intelligence by machines" },
        { term: "Machine Learning", definition: "Systems that learn from experience" },
        { term: "Deep Learning", definition: "Neural networks with many layers" },
        { term: "Neural Network", definition: "Computing system inspired by brain structure" },
        { term: "NLP", definition: "AI field for understanding human language" },
        { term: "Computer Vision", definition: "AI that interprets visual information" }
    ];
    
    let selectedCards = [];
    let matchedPairs = 0;
    
    // Start matching game
    function startMatchingGame() {
        matchedPairs = 0;
        selectedCards = [];
        
        // Create shuffled array of all cards
        const allCards = [];
        matchingPairs.forEach(pair => {
            allCards.push({ type: 'term', content: pair.term, pairId: matchingPairs.indexOf(pair) });
            allCards.push({ type: 'definition', content: pair.definition, pairId: matchingPairs.indexOf(pair) });
        });
        
        // Shuffle cards
        shuffleArray(allCards);
        
        // Create game board
        const gameBoard = document.createElement('div');
        gameBoard.classList.add('matching-board');
        
        allCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('matching-card');
            cardElement.setAttribute('data-pair-id', card.pairId);
            cardElement.setAttribute('data-type', card.type);
            
            const cardInner = document.createElement('div');
            cardInner.classList.add('matching-card-inner');
            
            const cardFront = document.createElement('div');
            cardFront.classList.add('matching-card-front');
            
            const cardBack = document.createElement('div');
            cardBack.classList.add('matching-card-back');
            cardBack.textContent = card.content;
            
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            cardElement.appendChild(cardInner);
            
            cardElement.addEventListener('click', function() {
                if (!this.classList.contains('flipped') && !this.classList.contains('matched') && selectedCards.length < 2) {
                    // Flip card
                    this.classList.add('flipped');
                    
                    // Add to selected cards
                    selectedCards.push(this);
                    
                    // Check for match if two cards are selected
                    if (selectedCards.length === 2) {
                        checkForMatch();
                    }
                }
            });
            
            gameBoard.appendChild(cardElement);
        });
        
        // Clear container and add game board
        matchingContainer.innerHTML = '';
        matchingContainer.appendChild(gameBoard);
        
        // Add game info
        const gameInfo = document.createElement('div');
        gameInfo.classList.add('matching-info');
        gameInfo.innerHTML = `
            <p>Match the terms with their definitions</p>
            <p class="matching-progress">Pairs matched: <span>0</span>/${matchingPairs.length}</p>
        `;
        matchingContainer.appendChild(gameInfo);
    }
    
    // Check for match
    function checkForMatch() {
        const card1 = selectedCards[0];
        const card2 = selectedCards[1];
        
        const pairId1 = card1.getAttribute('data-pair-id');
        const pairId2 = card2.getAttribute('data-pair-id');
        
        const type1 = card1.getAttribute('data-type');
        const type2 = card2.getAttribute('data-type');
        
        // Check if cards match (same pair ID and different types)
        if (pairId1 === pairId2 && type1 !== type2) {
            // Cards match
            card1.classList.add('matched');
            card2.classList.add('matched');
            
            matchedPairs++;
            
            // Update progress
            const progressElement = document.querySelector('.matching-progress span');
            if (progressElement) {
                progressElement.textContent = matchedPairs;
            }
            
            // Check if game is complete
            if (matchedPairs === matchingPairs.length) {
                setTimeout(() => {
                    showMatchingGameResults();
                }, 1000);
            }
        } else {
            // Cards don't match, flip back after delay
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }
        
        // Reset selected cards after delay
        setTimeout(() => {
            selectedCards = [];
        }, 1000);
    }
    
    // Show matching game results
    function showMatchingGameResults() {
        const matchingContainer = document.querySelector('.matching-container');
        
        if (matchingContainer) {
            matchingContainer.innerHTML = `
                <div class="matching-results">
                    <h3>Congratulations!</h3>
                    <p>You've matched all the pairs!</p>
                    <button class="btn play-again">Play Again</button>
                </div>
            `;
            
            // Add event listener to play again button
            const playAgainButton = document.querySelector('.play-again');
            if (playAgainButton) {
                playAgainButton.addEventListener('click', function() {
                    startMatchingGame();
                });
            }
        }
    }
    
    // Shuffle array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Initialize matching game when matching mode is activated
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('matching-game-btn')) {
            startMatchingGame();
        }
    });
}
