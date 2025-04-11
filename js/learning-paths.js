// Learning path games integration
document.addEventListener('DOMContentLoaded', function() {
    // Get all resource links
    const resourceLinks = document.querySelectorAll('.resource-link');
    
    // Add click event listeners to each resource link
    resourceLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pathStep = this.closest('.path-step');
            const pathTitle = pathStep.querySelector('h3').textContent;
            const resourceType = this.textContent.trim();
            
            // Store the selected path and resource type
            localStorage.setItem('selectedPath', pathTitle);
            localStorage.setItem('selectedResourceType', resourceType);
            
            // Redirect to the appropriate learning module
            if (resourceType.includes('Flashcards')) {
                window.location.href = 'index.html#flashcards-module';
            } else if (resourceType.includes('Learn')) {
                window.location.href = 'index.html#learn-module';
            } else if (resourceType.includes('Match Game')) {
                window.location.href = 'index.html#match-module';
            } else if (resourceType.includes('Test')) {
                window.location.href = 'index.html#test-module';
            }
        });
    });
    
    // Check if we're coming from a learning path
    const selectedPath = localStorage.getItem('selectedPath');
    const selectedResourceType = localStorage.getItem('selectedResourceType');
    
    if (selectedPath && selectedResourceType) {
        // Update the module title to show the selected path
        const moduleTitle = document.querySelector('.quizlet-title');
        if (moduleTitle) {
            moduleTitle.textContent = `${selectedPath} - ${selectedResourceType.replace(/[^\w\s]/gi, '')}`;
        }
        
        // Load the appropriate content based on the selected path
        loadPathContent(selectedPath, selectedResourceType);
    }
});

// Function to load content based on selected path
function loadPathContent(pathTitle, resourceType) {
    // Define content for each path
    const pathContent = {
        'Introduction to AI': [
            { term: 'Artificial Intelligence', definition: 'Computer systems able to perform tasks that normally require human intelligence.' },
            { term: 'Machine Learning', definition: 'The study of computer algorithms that improve automatically through experience.' },
            { term: 'Deep Learning', definition: 'A subset of machine learning using neural networks with multiple layers.' },
            { term: 'Natural Language Processing', definition: 'The ability of a computer program to understand human language.' },
            { term: 'Computer Vision', definition: 'A field of AI that trains computers to interpret and understand visual information.' }
        ],
        'Office Productivity': [
            { term: 'AI Writing Assistant', definition: 'Tools that help generate, edit, and improve written content.' },
            { term: 'Smart Email Filtering', definition: 'AI systems that categorize and prioritize emails automatically.' },
            { term: 'Data Analysis Automation', definition: 'AI tools that automatically analyze spreadsheet data and generate insights.' },
            { term: 'Meeting Transcription', definition: 'AI services that convert spoken words in meetings to written text.' },
            { term: 'Document Processing', definition: 'AI tools that extract information from documents and automate workflows.' }
        ],
        'Personal Finance': [
            { term: 'Automated Budgeting', definition: 'AI tools that categorize expenses and suggest budget improvements.' },
            { term: 'Robo-Advisors', definition: 'AI-powered investment services that provide automated financial planning.' },
            { term: 'Fraud Detection', definition: 'AI systems that identify unusual patterns in financial transactions.' },
            { term: 'Expense Forecasting', definition: 'AI tools that predict future expenses based on historical spending.' },
            { term: 'Credit Optimization', definition: 'AI services that suggest ways to improve credit scores.' }
        ],
        'Marketing': [
            { term: 'Content Generation', definition: 'AI tools that create marketing copy, blog posts, and social media content.' },
            { term: 'Customer Segmentation', definition: 'AI techniques that group customers based on behavior and preferences.' },
            { term: 'Predictive Analytics', definition: 'AI systems that forecast marketing campaign performance.' },
            { term: 'Personalization Engines', definition: 'AI tools that customize marketing messages for individual customers.' },
            { term: 'Social Media Optimization', definition: 'AI services that suggest optimal posting times and content types.' }
        ],
        'Videography': [
            { term: 'AI Video Editing', definition: 'Tools that automate video cutting, transitions, and effects.' },
            { term: 'Automated Captioning', definition: 'AI systems that generate accurate captions for video content.' },
            { term: 'Video Enhancement', definition: 'AI tools that improve video quality, resolution, and stability.' },
            { term: 'Scene Detection', definition: 'AI technology that identifies and categorizes different scenes in videos.' },
            { term: 'AI-Generated B-Roll', definition: 'Tools that create supplementary footage based on video content.' }
        ],
        'eCommerce': [
            { term: 'Product Description Generation', definition: 'AI tools that create compelling product descriptions.' },
            { term: 'Dynamic Pricing', definition: 'AI systems that adjust prices based on demand, competition, and other factors.' },
            { term: 'Inventory Forecasting', definition: 'AI tools that predict inventory needs based on sales patterns.' },
            { term: 'Customer Service Chatbots', definition: 'AI assistants that handle customer inquiries and support requests.' },
            { term: 'Recommendation Engines', definition: 'AI systems that suggest products based on customer behavior.' }
        ]
    };
    
    // Get content for the selected path
    const content = pathContent[pathTitle] || pathContent['Introduction to AI'];
    
    // Update the flashcards, learn module, match game, and test with the selected content
    updateFlashcards(content);
    updateLearnModule(content);
    updateMatchGame(content);
    updateTestModule(content);
}

// Function to update flashcards with selected content
function updateFlashcards(content) {
    const flashcardContainer = document.querySelector('.flashcard');
    if (!flashcardContainer) return;
    
    const termElement = flashcardContainer.querySelector('.term');
    const definitionElement = flashcardContainer.querySelector('.definition');
    
    if (termElement && definitionElement && content.length > 0) {
        termElement.textContent = content[0].term;
        definitionElement.textContent = content[0].definition;
    }
    
    // Update the card counter
    const cardCounter = document.querySelector('.card-counter');
    if (cardCounter) {
        cardCounter.textContent = `Card 1 of ${content.length}`;
    }
    
    // Store the content for navigation
    window.flashcardContent = content;
    window.currentCardIndex = 0;
    
    // Set up navigation buttons
    const prevButton = document.querySelector('.nav-btn[data-action="prev"]');
    const nextButton = document.querySelector('.nav-btn[data-action="next"]');
    
    if (prevButton) {
        prevButton.disabled = true;
        prevButton.onclick = function() {
            if (window.currentCardIndex > 0) {
                window.currentCardIndex--;
                updateFlashcardContent();
            }
        };
    }
    
    if (nextButton) {
        nextButton.disabled = content.length <= 1;
        nextButton.onclick = function() {
            if (window.currentCardIndex < window.flashcardContent.length - 1) {
                window.currentCardIndex++;
                updateFlashcardContent();
            }
        };
    }
}

// Function to update flashcard content based on current index
function updateFlashcardContent() {
    const flashcardContainer = document.querySelector('.flashcard');
    if (!flashcardContainer) return;
    
    const termElement = flashcardContainer.querySelector('.term');
    const definitionElement = flashcardContainer.querySelector('.definition');
    
    if (termElement && definitionElement && window.flashcardContent) {
        termElement.textContent = window.flashcardContent[window.currentCardIndex].term;
        definitionElement.textContent = window.flashcardContent[window.currentCardIndex].definition;
        
        // Update the card counter
        const cardCounter = document.querySelector('.card-counter');
        if (cardCounter) {
            cardCounter.textContent = `Card ${window.currentCardIndex + 1} of ${window.flashcardContent.length}`;
        }
        
        // Update button states
        const prevButton = document.querySelector('.nav-btn[data-action="prev"]');
        const nextButton = document.querySelector('.nav-btn[data-action="next"]');
        
        if (prevButton) {
            prevButton.disabled = window.currentCardIndex === 0;
        }
        
        if (nextButton) {
            nextButton.disabled = window.currentCardIndex === window.flashcardContent.length - 1;
        }
        
        // Reset the flip state
        flashcardContainer.classList.remove('flipped');
    }
}

// Function to update learn module with selected content
function updateLearnModule(content) {
    const learnQuestion = document.querySelector('.learn-question h3');
    const learnOptions = document.querySelector('.learn-options');
    
    if (!learnQuestion || !learnOptions) return;
    
    // Store the content for the learn module
    window.learnContent = content;
    window.currentLearnIndex = 0;
    
    // Set up the first question
    if (content.length > 0) {
        learnQuestion.textContent = `What is ${content[0].term}?`;
        
        // Clear existing options
        learnOptions.innerHTML = '';
        
        // Create options (correct answer + 3 random incorrect answers)
        const correctAnswer = content[0].definition;
        const incorrectAnswers = getRandomIncorrectAnswers(content, 0, 3);
        
        // Combine and shuffle all answers
        const allAnswers = [correctAnswer, ...incorrectAnswers];
        shuffleArray(allAnswers);
        
        // Create option elements
        allAnswers.forEach(answer => {
            const optionElement = document.createElement('div');
            optionElement.className = 'learn-option';
            optionElement.textContent = answer;
            optionElement.dataset.correct = answer === correctAnswer;
            
            optionElement.addEventListener('click', function() {
                // Handle option selection
                const options = document.querySelectorAll('.learn-option');
                options.forEach(opt => {
                    opt.classList.remove('selected', 'correct', 'incorrect');
                });
                
                this.classList.add('selected');
                
                if (this.dataset.correct === 'true') {
                    this.classList.add('correct');
                    
                    // Move to next question after a delay
                    setTimeout(() => {
                        window.currentLearnIndex = (window.currentLearnIndex + 1) % window.learnContent.length;
                        updateLearnQuestion();
                    }, 1000);
                } else {
                    this.classList.add('incorrect');
                    
                    // Show correct answer
                    options.forEach(opt => {
                        if (opt.dataset.correct === 'true') {
                            opt.classList.add('correct');
                        }
                    });
                    
                    // Move to next question after a delay
                    setTimeout(() => {
                        window.currentLearnIndex = (window.currentLearnIndex + 1) % window.learnContent.length;
                        updateLearnQuestion();
                    }, 2000);
                }
            });
            
            learnOptions.appendChild(optionElement);
        });
        
        // Update progress bar
        updateLearnProgress();
    }
}

// Function to update learn question based on current index
function updateLearnQuestion() {
    const learnQuestion = document.querySelector('.learn-question h3');
    const learnOptions = document.querySelector('.learn-options');
    
    if (!learnQuestion || !learnOptions || !window.learnContent) return;
    
    // Set up the question
    learnQuestion.textContent = `What is ${window.learnContent[window.currentLearnIndex].term}?`;
    
    // Clear existing options
    learnOptions.innerHTML = '';
    
    // Create options (correct answer + 3 random incorrect answers)
    const correctAnswer = window.learnContent[window.currentLearnIndex].definition;
    const incorrectAnswers = getRandomIncorrectAnswers(window.learnContent, window.currentLearnIndex, 3);
    
    // Combine and shuffle all answers
    const allAnswers = [correctAnswer, ...incorrectAnswers];
    shuffleArray(allAnswers);
    
    // Create option elements
    allAnswers.forEach(answer => {
        const optionElement = document.createElement('div');
        optionElement.className = 'learn-option';
        optionElement.textContent = answer;
        optionElement.dataset.correct = answer === correctAnswer;
        
        optionElement.addEventListener('click', function() {
            // Handle option selection
            const options = document.querySelectorAll('.learn-option');
            options.forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            this.classList.add('selected');
            
            if (this.dataset.correct === 'true') {
                this.classList.add('correct');
                
                // Move to next question after a delay
                setTimeout(() => {
                    window.currentLearnIndex = (window.currentLearnIndex + 1) % window.learnContent.length;
                    updateLearnQuestion();
                }, 1000);
            } else {
                this.classList.add('incorrect');
                
                // Show correct answer
                options.forEach(opt => {
                    if (opt.dataset.correct === 'true') {
                        opt.classList.add('correct');
                    }
                });
                
                // Move to next question after a delay
                setTimeout(() => {
                    window.currentLearnIndex = (window.currentLearnIndex + 1) % window.learnContent.length;
                    updateLearnQuestion();
                }, 2000);
            }
        });
        
        learnOptions.appendChild(optionElement);
    });
    
    // Update progress bar
    updateLearnProgress();
}

// Function to update learn progress bar
function updateLearnProgress() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText && window.learnContent) {
        const progress = ((window.currentLearnIndex + 1) / window.learnContent.length) * 100;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${window.currentLearnIndex + 1} of ${window.learnContent.length} terms`;
    }
}

// Function to update match game with selected content
function updateMatchGame(content) {
    const matchGameContainer = document.querySelector('.match-game-container');
    if (!matchGameContainer) return;
    
    // Clear existing cards
    matchGameContainer.innerHTML = '';
    
    // Use up to 5 term-definition pairs for the game
    const gameContent = content.slice(0, 5);
    
    // Create term cards
    gameContent.forEach(item => {
        const termCard = document.createElement('div');
        termCard.className = 'match-card term-card';
        termCard.textContent = item.term;
        termCard.dataset.term = item.term;
        matchGameContainer.appendChild(termCard);
    });
    
    // Create definition cards (shuffled)
    const definitions = gameContent.map(item => item.definition);
    shuffleArray(definitions);
    
    definitions.forEach(definition => {
        const defCard = document.createElement('div');
        defCard.className = 'match-card def-card';
        defCard.textContent = definition;
        defCard.dataset.definition = definition;
        matchGameContainer.appendChild(defCard);
    });
    
    // Set up the match game logic
    setupMatchGame(gameContent);
}

// Function to set up match game logic
function setupMatchGame(content) {
    let selectedTerm = null;
    let selectedDef = null;
    let matchedPairs = 0;
    const totalPairs = content.length;
    
    // Create a map of terms to definitions
    const termToDefMap = {};
    content.forEach(item => {
        termToDefMap[item.term] = item.definition;
    });
    
    // Add click handlers to all cards
    const cards = document.querySelectorAll('.match-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // Skip if card is already matched
            if (this.classList.contains('matched')) return;
            
            // Handle term card selection
            if (this.classList.contains('term-card') && !selectedTerm) {
                selectedTerm = this;
                this.classList.add('selected');
            }
            // Handle definition card selection
            else if (this.classList.contains('def-card') && !selectedDef) {
                selectedDef = this;
                this.classList.add('selected');
                
                // Check for match if both cards are selected
                if (selectedTerm && selectedDef) {
                    const term = selectedTerm.dataset.term;
                    const def = selectedDef.dataset.definition;
                    
                    if (termToDefMap[term] === def) {
                        // Match found
                        selectedTerm.classList.add('matched');
                        selectedDef.classList.add('matched');
                        selectedTerm.classList.remove('selected');
                        selectedDef.classList.remove('selected');
                        selectedTerm = null;
                        selectedDef = null;
                        
                        matchedPairs++;
                        
                        // Check if game is complete
                        if (matchedPairs === totalPairs) {
                            setTimeout(() => {
                                alert('Congratulations! You matched all pairs!');
                            }, 500);
                        }
                    } else {
                        // No match
                        setTimeout(() => {
                            selectedTerm.classList.remove('selected');
                            selectedDef.classList.remove('selected');
                            selectedTerm = null;
                            selectedDef = null;
                        }, 1000);
                    }
                }
            }
        });
    });
}

// Function to update test module with selected content
function updateTestModule(content) {
    const testQuestion = document.querySelector('.test-question h3');
    const testOptions = document.querySelector('.test-options');
    
    if (!testQuestion || !testOptions) return;
    
    // Store the content for the test module
    window.testContent = content;
    window.currentTestIndex = 0;
    window.testScore = 0;
    window.testAnswers = [];
    
    // Set up the first question
    if (content.length > 0) {
        testQuestion.textContent = `What is ${content[0].term}?`;
        
        // Clear existing options
        testOptions.innerHTML = '';
        
        // Create options (correct answer + 3 random incorrect answers)
        const correctAnswer = content[0].definition;
        const incorrectAnswers = getRandomIncorrectAnswers(content, 0, 3);
        
        // Combine and shuffle all answers
        const allAnswers = [correctAnswer, ...incorrectAnswers];
        shuffleArray(allAnswers);
        
        // Create option elements
        allAnswers.forEach((answer, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'test-option';
            optionElement.innerHTML = `
                <input type="radio" name="test-answer" id="option-${index}" value="${answer}">
                <label for="option-${index}">${answer}</label>
            `;
            testOptions.appendChild(optionElement);
        });
        
        // Update test progress
        updateTestProgress();
    }
}

// Function to update test progress
function updateTestProgress() {
    const testProgress = document.querySelector('.test-progress');
    
    if (testProgress && window.testContent) {
        testProgress.textContent = `Question ${window.currentTestIndex + 1} of ${window.testContent.length}`;
    }
}

// Helper function to get random incorrect answers
function getRandomIncorrectAnswers(content, currentIndex, count) {
    const incorrectAnswers = [];
    const indices = [];
    
    // Create array of all indices except current
    for (let i = 0; i < content.length; i++) {
        if (i !== currentIndex) {
            indices.push(i);
        }
    }
    
    // Shuffle indices
    shuffleArray(indices);
    
    // Get up to 'count' incorrect answers
    for (let i = 0; i < Math.min(count, indices.length); i++) {
        incorrectAnswers.push(content[indices[i]].definition);
    }
    
    return incorrectAnswers;
}

// Helper function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
