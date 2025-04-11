// Learning games functionality fix for AI Fundamentals
// Implements interactive functionality for Flip Cards, Quiz Mode, and Matching Game

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the flashcard system
  initFlashcardSystem();
});

// Initialize the flashcard system with all study modes
function initFlashcardSystem() {
  // Get all necessary elements
  const flashcardContainer = document.querySelector('.flashcard-container') || document.querySelector('.card-container');
  const prevButton = document.querySelector('button.previous') || document.querySelector('button[aria-label="Previous"]');
  const nextButton = document.querySelector('button.next') || document.querySelector('button[aria-label="Next"]');
  const flipCardsButton = document.querySelector('button.flip-cards') || document.querySelector('button[aria-label="Flip Cards"]');
  const quizModeButton = document.querySelector('button.quiz-mode') || document.querySelector('button[aria-label="Quiz Mode"]');
  const matchingGameButton = document.querySelector('button.matching-game') || document.querySelector('button[aria-label="Matching Game"]');
  
  // If flashcard elements don't exist, exit early
  if (!flashcardContainer) return;
  
  // Sample flashcard data (this would normally come from a database)
  const flashcards = [
    {
      term: "Artificial Intelligence (AI)",
      definition: "The simulation of human intelligence processes by machines, especially computer systems."
    },
    {
      term: "Machine Learning",
      definition: "A subset of AI that enables systems to learn and improve from experience without being explicitly programmed."
    },
    {
      term: "Deep Learning",
      definition: "A subset of machine learning that uses neural networks with many layers to analyze various factors of data."
    },
    {
      term: "Natural Language Processing (NLP)",
      definition: "A field of AI that gives computers the ability to understand and generate human language."
    },
    {
      term: "Computer Vision",
      definition: "A field of AI that enables computers to derive meaningful information from digital images and videos."
    },
    {
      term: "Neural Network",
      definition: "A computing system inspired by the biological neural networks that constitute animal brains."
    },
    {
      term: "Supervised Learning",
      definition: "A type of machine learning where the algorithm is trained on labeled data."
    },
    {
      term: "Unsupervised Learning",
      definition: "A type of machine learning where the algorithm is trained on unlabeled data."
    },
    {
      term: "Reinforcement Learning",
      definition: "A type of machine learning where an agent learns to behave in an environment by performing actions and receiving rewards."
    },
    {
      term: "Generative AI",
      definition: "AI systems that can generate new content, such as text, images, or music, based on patterns learned from existing data."
    },
    {
      term: "Large Language Model (LLM)",
      definition: "A type of AI model trained on vast amounts of text data to understand and generate human-like text."
    },
    {
      term: "Prompt Engineering",
      definition: "The process of designing effective inputs to get desired outputs from AI systems, especially large language models."
    },
    {
      term: "Transfer Learning",
      definition: "A machine learning technique where a model developed for one task is reused as the starting point for a model on a second task."
    },
    {
      term: "Fine-tuning",
      definition: "The process of taking a pre-trained model and further training it on a specific dataset for a particular task."
    },
    {
      term: "Transformer",
      definition: "A deep learning architecture that uses self-attention mechanisms to process sequential data, widely used in modern NLP models."
    }
  ];
  
  let currentCardIndex = 0;
  let currentMode = 'flip'; // Default mode: flip cards
  
  // Initialize the card display
  updateCardDisplay();
  
  // Add event listeners to navigation buttons
  if (prevButton) {
    prevButton.addEventListener('click', function() {
      if (currentMode === 'matching') return; // Disable in matching game mode
      currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
      updateCardDisplay();
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', function() {
      if (currentMode === 'matching') return; // Disable in matching game mode
      currentCardIndex = (currentCardIndex + 1) % flashcards.length;
      updateCardDisplay();
    });
  }
  
  // Add event listeners to mode buttons
  if (flipCardsButton) {
    flipCardsButton.addEventListener('click', function() {
      currentMode = 'flip';
      resetAndUpdateDisplay();
    });
  }
  
  if (quizModeButton) {
    quizModeButton.addEventListener('click', function() {
      currentMode = 'quiz';
      resetAndUpdateDisplay();
    });
  }
  
  if (matchingGameButton) {
    matchingGameButton.addEventListener('click', function() {
      currentMode = 'matching';
      resetAndUpdateDisplay();
    });
  }
  
  // Make the flashcard clickable for flipping
  if (flashcardContainer) {
    flashcardContainer.addEventListener('click', function(e) {
      if (currentMode === 'flip') {
        // Only flip if we're in flip mode and clicking on the card (not navigation buttons)
        if (e.target.closest('.card-front') || e.target.closest('.card-back') || 
            e.target.classList.contains('flashcard') || e.target.classList.contains('card-container')) {
          flipCard();
        }
      }
    });
  }
  
  // Reset the display and update based on current mode
  function resetAndUpdateDisplay() {
    // Reset any existing content
    while (flashcardContainer.firstChild) {
      flashcardContainer.removeChild(flashcardContainer.firstChild);
    }
    
    // Update display based on mode
    if (currentMode === 'flip') {
      // Show navigation buttons if they exist
      if (prevButton) prevButton.style.display = 'block';
      if (nextButton) nextButton.style.display = 'block';
      
      // Update the card display for flip mode
      updateCardDisplay();
    } 
    else if (currentMode === 'quiz') {
      // Show navigation buttons if they exist
      if (prevButton) prevButton.style.display = 'block';
      if (nextButton) nextButton.style.display = 'block';
      
      // Create quiz mode display
      createQuizDisplay();
    } 
    else if (currentMode === 'matching') {
      // Hide navigation buttons in matching game
      if (prevButton) prevButton.style.display = 'none';
      if (nextButton) nextButton.style.display = 'none';
      
      // Create matching game display
      createMatchingGameDisplay();
    }
  }
  
  // Update the card display for flip mode
  function updateCardDisplay() {
    // Only update if we're in flip mode
    if (currentMode !== 'flip' && currentMode !== 'quiz') return;
    
    // Clear existing content
    while (flashcardContainer.firstChild) {
      flashcardContainer.removeChild(flashcardContainer.firstChild);
    }
    
    if (currentMode === 'flip') {
      // Create flip card
      const card = document.createElement('div');
      card.className = 'flashcard';
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <h3>${flashcards[currentCardIndex].term}</h3>
            <p>Click to reveal definition</p>
          </div>
          <div class="card-back">
            <p>${flashcards[currentCardIndex].definition}</p>
            <p class="click-instruction">Click to see term</p>
          </div>
        </div>
      `;
      flashcardContainer.appendChild(card);
      
      // Update card counter
      const counter = document.querySelector('.card-counter') || document.createElement('div');
      counter.className = 'card-counter';
      counter.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
      
      // If counter doesn't exist in the DOM yet, append it
      if (!document.querySelector('.card-counter')) {
        const counterContainer = document.querySelector('.counter-container') || flashcardContainer.parentNode;
        if (counterContainer) {
          counterContainer.appendChild(counter);
        }
      }
    } 
    else if (currentMode === 'quiz') {
      createQuizDisplay();
    }
  }
  
  // Flip the card in flip mode
  function flipCard() {
    if (currentMode !== 'flip') return;
    
    const card = flashcardContainer.querySelector('.flashcard');
    if (card) {
      card.classList.toggle('flipped');
    }
  }
  
  // Create quiz mode display
  function createQuizDisplay() {
    // Get current card
    const currentCard = flashcards[currentCardIndex];
    
    // Create quiz container
    const quizContainer = document.createElement('div');
    quizContainer.className = 'quiz-container';
    
    // Create question
    const question = document.createElement('div');
    question.className = 'quiz-question';
    question.innerHTML = `<h3>What is the definition of:</h3><p>${currentCard.term}</p>`;
    quizContainer.appendChild(question);
    
    // Create options (including the correct answer and some incorrect ones)
    const options = document.createElement('div');
    options.className = 'quiz-options';
    
    // Get 3 random incorrect definitions
    let incorrectDefinitions = [];
    let availableCards = flashcards.filter((_, index) => index !== currentCardIndex);
    
    // Shuffle available cards
    availableCards.sort(() => Math.random() - 0.5);
    
    // Take first 3
    incorrectDefinitions = availableCards.slice(0, 3).map(card => card.definition);
    
    // All options (correct + incorrect)
    let allOptions = [currentCard.definition, ...incorrectDefinitions];
    
    // Shuffle options
    allOptions.sort(() => Math.random() - 0.5);
    
    // Create option elements
    allOptions.forEach(option => {
      const optionElement = document.createElement('div');
      optionElement.className = 'quiz-option';
      optionElement.textContent = option;
      
      // Add click event
      optionElement.addEventListener('click', function() {
        // Remove any existing selection
        options.querySelectorAll('.quiz-option').forEach(opt => {
          opt.classList.remove('correct', 'incorrect');
        });
        
        // Check if correct
        if (option === currentCard.definition) {
          optionElement.classList.add('correct');
        } else {
          optionElement.classList.add('incorrect');
          
          // Show correct answer
          options.querySelectorAll('.quiz-option').forEach(opt => {
            if (opt.textContent === currentCard.definition) {
              opt.classList.add('correct');
            }
          });
        }
      });
      
      options.appendChild(optionElement);
    });
    
    quizContainer.appendChild(options);
    flashcardContainer.appendChild(quizContainer);
    
    // Update card counter
    const counter = document.querySelector('.card-counter') || document.createElement('div');
    counter.className = 'card-counter';
    counter.textContent = `Question ${currentCardIndex + 1} of ${flashcards.length}`;
    
    // If counter doesn't exist in the DOM yet, append it
    if (!document.querySelector('.card-counter')) {
      const counterContainer = document.querySelector('.counter-container') || flashcardContainer.parentNode;
      if (counterContainer) {
        counterContainer.appendChild(counter);
      }
    }
  }
  
  // Create matching game display
  function createMatchingGameDisplay() {
    // Create matching game container
    const gameContainer = document.createElement('div');
    gameContainer.className = 'matching-game-container';
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.className = 'matching-instructions';
    instructions.textContent = 'Match each term with its correct definition';
    gameContainer.appendChild(instructions);
    
    // Get 5 random cards for the game
    let gameCards = [...flashcards];
    gameCards.sort(() => Math.random() - 0.5);
    gameCards = gameCards.slice(0, 5);
    
    // Create terms column
    const termsColumn = document.createElement('div');
    termsColumn.className = 'matching-column terms-column';
    
    // Create definitions column
    const defsColumn = document.createElement('div');
    defsColumn.className = 'matching-column defs-column';
    
    // Shuffle definitions for random order
    const shuffledDefs = [...gameCards].sort(() => Math.random() - 0.5);
    
    // Create term and definition elements
    gameCards.forEach((card, index) => {
      // Term element
      const termElement = document.createElement('div');
      termElement.className = 'matching-item term-item';
      termElement.dataset.index = index;
      termElement.textContent = card.term;
      termElement.addEventListener('click', function() {
        selectItem(this, 'term');
      });
      termsColumn.appendChild(termElement);
      
      // Definition element
      const defElement = document.createElement('div');
      defElement.className = 'matching-item def-item';
      defElement.dataset.index = shuffledDefs.indexOf(card);
      defElement.textContent = shuffledDefs[shuffledDefs.indexOf(card)].definition;
      defElement.addEventListener('click', function() {
        selectItem(this, 'def');
      });
      defsColumn.appendChild(defElement);
    });
    
    gameContainer.appendChild(termsColumn);
    gameContainer.appendChild(defsColumn);
    
    // Add to flashcard container
    flashcardContainer.appendChild(gameContainer);
    
    // Variables to track selected items
    let selectedTerm = null;
    let selectedDef = null;
    
    // Function to handle item selection
    function selectItem(element, type) {
      // If already matched, do nothing
      if (element.classList.contains('matched')) return;
      
      // Deselect previous item of same type
      if (type === 'term' && selectedTerm) {
        selectedTerm.classList.remove('selected');
      } else if (type === 'def' && selectedDef) {
        selectedDef.classList.remove('selected');
      }
      
      // Select this item
      element.classList.add('selected');
      
      // Update selected variables
      if (type === 'term') {
        selectedTerm = element;
      } else {
        selectedDef = element;
      }
      
      // Check for match if both selected
      if (selectedTerm && selectedDef) {
        checkForMatch();
      }
    }
    
    // Function to check for a match
    function checkForMatch() {
      const termIndex = selectedTerm.dataset.index;
      const defIndex = selectedDef.dataset.index;
      
      // Check if indices match
      if (termIndex === defIndex) {
        // It's a match!
        selectedTerm.classList.remove('selected');
        selectedDef.classList.remove('selected');
        
        selectedTerm.classList.add('matched');
        selectedDef.classList.add('matched');
        
        // Reset selected variables
        selectedTerm = null;
        selectedDef = null;
        
        // Check if all matched
        const allMatched = document.querySelectorAll('.matching-item:not(.matched)').length === 0;
        if (allMatched) {
          // Show completion message
          const completionMsg = document.createElement('div');
          completionMsg.className = 'matching-complete';
          completionMsg.textContent = 'Congratulations! You matched all items correctly!';
          gameContainer.appendChild(completionMsg);
        }
      } else {
        // Not a match, deselect after a short delay
        setTimeout(() => {
          if (selectedTerm) selectedTerm.classList.remove('selected');
          if (selectedDef) selectedDef.classList.remove('selected');
          selectedTerm = null;
          selectedDef = null;
        }, 1000);
      }
    }
  }
}

// Add CSS for the flashcard system
function addFlashcardStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Flashcard styles */
    .flashcard {
      width: 100%;
      height: 300px;
      perspective: 1000px;
      cursor: pointer;
    }
    
    .card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.6s;
      transform-style: preserve-3d;
    }
    
    .flashcard.flipped .card-inner {
      transform: rotateY(180deg);
    }
    
    .card-front, .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .card-front {
      background-color: #f8f9fa;
    }
    
    .card-back {
      background-color: #f0f0ff;
      transform: rotateY(180deg);
    }
    
    /* Quiz mode styles */
    .quiz-container {
      width: 100%;
      padding: 20px;
    }
    
    .quiz-question {
      margin-bottom: 20px;
      text-align: center;
    }
    
    .quiz-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .quiz-option {
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    
    .quiz-option:hover {
      background-color: #f0f0f0;
    }
    
    .quiz-option.correct {
      background-color: #d4edda;
      border-color: #c3e6cb;
    }
    
    .quiz-option.incorrect {
      background-color: #f8d7da;
      border-color: #f5c6cb;
    }
    
    /* Matching game styles */
    .matching-game-container {
      width: 100%;
      padding: 20px;
    }
    
    .matching-instructions {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .matching-column {
      display: inline-block;
      width: 48%;
      vertical-align: top;
    }
    
    .terms-column {
      margin-right: 4%;
    }
    
    .matching-item {
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .matching-item.selected {
      background-color: #e0e0ff;
      border-color: #6c63ff;
    }
    
    .matching-item.matched {
      background-color: #d4edda;
      border-color: #c3e6cb;
      cursor: default;
    }
    
    .matching-complete {
      margin-top: 20px;
      padding: 15px;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 5px;
      text-align: center;
      font-weight: bold;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Add the styles when the script loads
addFlashcardStyles();
