// script.js - Main functionality for AI Fundamentals site
document.addEventListener('DOMContentLoaded', function() {
    // Study Mode Selector
    const modeBtns = document.querySelectorAll('.mode-btn');
    const studyModes = document.querySelectorAll('.study-mode');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // Update active button
            modeBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected study mode
            studyModes.forEach(mode => mode.classList.remove('active'));
            document.getElementById(mode).classList.add('active');
        });
    });
    
    // Flashcard Functionality
    const flashcard = document.querySelector('.flashcard');
    if (flashcard) {
        flashcard.addEventListener('click', function() {
            this.classList.toggle('flipped');
        });
    }
    
    // Flashcard Navigation
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const cardCounter = document.querySelector('.card-counter');
    
    let currentCard = 0;
    const totalCards = 15;
    const flashcardTerms = [
        { term: "Artificial Intelligence (AI)", definition: "Computer systems able to perform tasks that normally require human intelligence, such as visual perception, speech recognition, decision-making, and language translation." },
        { term: "Machine Learning (ML)", definition: "The study of computer algorithms that improve automatically through experience and by the use of data." },
        { term: "Deep Learning", definition: "A subset of machine learning using neural networks with multiple layers to analyze various factors of data." },
        { term: "Natural Language Processing (NLP)", definition: "The ability of a computer program to recognize and manipulate human language." },
        { term: "Computer Vision", definition: "A field of AI that trains computers to interpret and understand the visual world, enabling machines to identify and process objects in images and videos." },
        { term: "Neural Network", definition: "Computing systems inspired by the biological neural networks that constitute animal brains, designed to recognize patterns." },
        { term: "Supervised Learning", definition: "A type of machine learning where the algorithm is trained on labeled data, learning to map inputs to known outputs." },
        { term: "Unsupervised Learning", definition: "A type of machine learning where the algorithm identifies patterns in data without labeled responses." },
        { term: "Reinforcement Learning", definition: "A type of machine learning where an agent learns to behave in an environment by performing actions and receiving rewards or penalties." },
        { term: "Generative AI", definition: "AI systems that can generate new content, such as text, images, audio, or video, based on patterns learned from training data." },
        { term: "Large Language Model (LLM)", definition: "A type of AI model trained on vast amounts of text data to understand and generate human-like text." },
        { term: "Transfer Learning", definition: "A machine learning technique where a model developed for one task is reused as the starting point for a model on a second task." },
        { term: "Prompt Engineering", definition: "The process of designing effective input prompts for AI systems to generate desired outputs." },
        { term: "Fine-tuning", definition: "The process of taking a pre-trained model and further training it on a specific dataset to adapt it to a particular task." },
        { term: "Transformer Architecture", definition: "A neural network architecture that uses self-attention mechanisms to process sequential data, revolutionizing NLP and other AI fields." }
    ];
    
    function updateFlashcard() {
        const flashcardFront = document.querySelector('.flashcard-front .term');
        const flashcardBack = document.querySelector('.flashcard-back .definition');
        
        if (flashcardFront && flashcardBack) {
            flashcardFront.textContent = flashcardTerms[currentCard].term;
            flashcardBack.textContent = flashcardTerms[currentCard].definition;
            cardCounter.textContent = `Card ${currentCard + 1} of ${totalCards}`;
            
            // Reset flip state
            flashcard.classList.remove('flipped');
            
            // Update button states
            prevBtn.disabled = currentCard === 0;
            nextBtn.disabled = currentCard === totalCards - 1;
        }
    }
    
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentCard > 0) {
                currentCard--;
                updateFlashcard();
            }
        });
        
        nextBtn.addEventListener('click', function() {
            if (currentCard < totalCards - 1) {
                currentCard++;
                updateFlashcard();
            }
        });
        
        // Initialize flashcard
        updateFlashcard();
    }
    
    // Learn Mode Functionality
    const learnOptions = document.querySelectorAll('.learn-option');
    
    learnOptions.forEach(option => {
        option.addEventListener('click', function() {
            // First, remove any previous selection
            learnOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.classList.remove('correct');
                opt.classList.remove('incorrect');
            });
            
            // Mark this option as selected
            this.classList.add('selected');
            
            // Check if correct (first option is always correct in this demo)
            if (learnOptions[0] === this) {
                this.classList.add('correct');
                
                // After a delay, move to next question
                setTimeout(() => {
                    updateLearnQuestion();
                }, 1000);
            } else {
                this.classList.add('incorrect');
                learnOptions[0].classList.add('correct');
                
                // After a delay, move to next question
                setTimeout(() => {
                    updateLearnQuestion();
                }, 1500);
            }
        });
    });
    
    function updateLearnQuestion() {
        const learnQuestion = document.querySelector('.learn-question h3');
        const learnOptions = document.querySelectorAll('.learn-option');
        
        if (learnQuestion && learnOptions.length > 0) {
            // Get a random term from our flashcard terms
            const randomIndex = Math.floor(Math.random() * flashcardTerms.length);
            const currentTerm = flashcardTerms[randomIndex];
            
            // Update the question
            learnQuestion.textContent = `What is ${currentTerm.term}?`;
            
            // Get 3 random wrong definitions
            const wrongDefinitions = getRandomWrongDefinitions(currentTerm.definition, 3);
            
            // Create an array with the correct definition and wrong ones
            const allDefinitions = [currentTerm.definition, ...wrongDefinitions];
            
            // Shuffle the definitions
            const shuffledDefinitions = shuffleArray(allDefinitions);
            
            // Update the options
            learnOptions.forEach((option, index) => {
                option.textContent = shuffledDefinitions[index];
                option.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // Update progress
            const progressFill = document.querySelector('.progress-fill');
            const progressText = document.querySelector('.progress-text');
            const currentProgress = Math.floor(Math.random() * 15) + 1;
            
            if (progressFill && progressText) {
                progressFill.style.width = `${(currentProgress / 15) * 100}%`;
                progressText.textContent = `${currentProgress} of 15 terms`;
            }
        }
    }
    
    function getRandomWrongDefinitions(correctDef, count) {
        const wrongDefs = [];
        const allDefs = flashcardTerms.map(item => item.definition);
        
        while (wrongDefs.length < count) {
            const randomIndex = Math.floor(Math.random() * allDefs.length);
            const randomDef = allDefs[randomIndex];
            
            if (randomDef !== correctDef && !wrongDefs.includes(randomDef)) {
                wrongDefs.push(randomDef);
            }
        }
        
        return wrongDefs;
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Match Game Functionality
    const matchGameContainer = document.querySelector('.match-game-container');
    
    if (matchGameContainer) {
        initMatchGame();
    }
    
    function initMatchGame() {
        // Clear any existing content
        matchGameContainer.innerHTML = '';
        
        // Select 6 random terms for the game
        const gameTerms = [];
        const usedIndices = new Set();
        
        while (gameTerms.length < 6) {
            const randomIndex = Math.floor(Math.random() * flashcardTerms.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                gameTerms.push(flashcardTerms[randomIndex]);
            }
        }
        
        // Create arrays for terms and definitions
        const terms = gameTerms.map(item => ({ type: 'term', text: item.term, id: gameTerms.indexOf(item) }));
        const definitions = gameTerms.map(item => ({ type: 'definition', text: item.definition, id: gameTerms.indexOf(item) }));
        
        // Combine and shuffle
        const allCards = [...terms, ...definitions];
        const shuffledCards = shuffleArray(allCards);
        
        // Create the cards
        shuffledCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = `match-card ${card.type}`;
            cardElement.textContent = card.text;
            cardElement.dataset.id = card.id;
            cardElement.dataset.type = card.type;
            
            matchGameContainer.appendChild(cardElement);
        });
        
        // Initialize game state
        let selectedCard = null;
        let matchedPairs = 0;
        let gameStarted = false;
        let startTime = 0;
        let timerInterval = null;
        
        // Add click event listeners to cards
        const cards = document.querySelectorAll('.match-card');
        cards.forEach(card => {
            card.addEventListener('click', function() {
                // Ignore if card is already matched
                if (this.classList.contains('matched')) {
                    return;
                }
                
                // Start timer on first click
                if (!gameStarted) {
                    gameStarted = true;
                    startTime = Date.now();
                    timerInterval = setInterval(updateTimer, 1000);
                }
                
                // If no card is selected or this is the same card, select it
                if (!selectedCard || selectedCard === this) {
                    if (selectedCard) {
                        selectedCard.classList.remove('selected');
                        selectedCard = null;
                    } else {
                        this.classList.add('selected');
                        selectedCard = this;
                    }
                    return;
                }
                
                // Check if this card matches the selected card
                const selectedId = selectedCard.dataset.id;
                const selectedType = selectedCard.dataset.type;
                const thisId = this.dataset.id;
                const thisType = this.dataset.type;
                
                if (selectedId === thisId && selectedType !== thisType) {
                    // Match found!
                    selectedCard.classList.remove('selected');
                    selectedCard.classList.add('matched');
                    this.classList.add('matched');
                    selectedCard = null;
                    
                    matchedPairs++;
                    
                    // Check if game is complete
                    if (matchedPairs === 6) {
                        clearInterval(timerInterval);
                        const totalTime = Math.floor((Date.now() - startTime) / 1000);
                        showGameComplete(totalTime);
                    }
                } else {
                    // No match
                    this.classList.add('selected');
                    
                    // After a short delay, deselect both cards
                    setTimeout(() => {
                        selectedCard.classList.remove('selected');
                        this.classList.remove('selected');
                        selectedCard = null;
                    }, 1000);
                }
            });
        });
        
        function updateTimer() {
            const timerElement = document.querySelector('.match-timer');
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            
            timerElement.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        function showGameComplete(time) {
            // Create completion message
            const completeElement = document.createElement('div');
            completeElement.className = 'match-complete';
            
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            completeElement.innerHTML = `
                <h3>Congratulations!</h3>
                <p>You matched all pairs in ${timeString}!</p>
                <button class="btn play-again-btn">Play Again</button>
            `;
            
            // Add to container
            matchGameContainer.innerHTML = '';
            matchGameContainer.appendChild(completeElement);
            
            // Add event listener to play again button
            const playAgainBtn = document.querySelector('.play-again-btn');
            playAgainBtn.addEventListener('click', initMatchGame);
        }
    }
    
    // Test Mode Functionality
    const testNavBtns = document.querySelectorAll('.test-nav-btn');
    let currentQuestion = 0;
    
    if (testNavBtns.length > 0) {
        testNavBtns[1].addEventListener('click', function() {
            if (currentQuestion < 14) {
                currentQuestion++;
                updateTestQuestion();
            }
        });
        
        if (testNavBtns[0]) {
            testNavBtns[0].addEventListener('click', function() {
                if (currentQuestion > 0) {
                    currentQuestion--;
                    updateTestQuestion();
                }
            });
        }
    }
    
    function updateTestQuestion() {
        const questionElement = document.querySelector('.test-question h3');
        const optionsContainer = document.querySelector('.test-options');
        const progressElement = document.querySelector('.test-progress');
        
        if (questionElement && optionsContainer && progressElement) {
            // Get a random term
            const randomIndex = Math.floor(Math.random() * flashcardTerms.length);
            const currentTerm = flashcardTerms[randomIndex];
            
            // Update question
            questionElement.textContent = `${currentQuestion + 1}. What is ${currentTerm.term}?`;
            
            // Get wrong definitions
            const wrongDefinitions = getRandomWrongDefinitions(currentTerm.definition, 3);
            
            // Create options array and shuffle
            const allOptions = [currentTerm.definition, ...wrongDefinitions];
            const shuffledOptions = shuffleArray(allOptions);
            
            // Create HTML for options
            let optionsHTML = '';
            shuffledOptions.forEach((option, index) => {
                const letter = String.fromCharCode(97 + index); // a, b, c, d
                optionsHTML += `
                    <label class="test-option">
                        <input type="radio" name="q${currentQuestion + 1}" value="${letter}">
                        <span>${option}</span>
                    </label>
                `;
            });
            
            optionsContainer.innerHTML = optionsHTML;
            
            // Update progress
            progressElement.textContent = `Question ${currentQuestion + 1} of 15`;
            
            // Update button states
            testNavBtns[0].disabled = currentQuestion === 0;
            testNavBtns[1].textContent = currentQuestion === 14 ? 'Submit' : 'Next';
        }
    }
    
    // AI Tools Directory Filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    const toolCards = document.querySelectorAll('.tool-card');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            categoryBtns.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter tools
            toolCards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category') === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Handle navigation active states
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('section');

    function setActiveNavLink() {
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150; // Adjust offset to match scroll-padding
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Update active state on scroll
    window.addEventListener('scroll', setActiveNavLink);

    // Handle smooth scrolling with offset
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const offset = 120; // Match scroll-padding-top value
                const targetPosition = targetSection.offsetTop - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Set initial active state
    setActiveNavLink();
});
