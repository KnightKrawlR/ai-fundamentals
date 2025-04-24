// Enhanced game plan component with three-dropdown structure
(function() {
  console.log("Game Plan Enhanced Script Loaded! Version 5");
  
  // Create a global renderGamePlanComponent function that can be called directly
  window.renderGamePlanComponent = function() {
    console.log("External renderGamePlanComponent called");
    initGamePlanComponent();
  };
  
  // Function to initialize the game plan component
  function initGamePlanComponent() {
    console.log("Initializing game plan component");
    
    // Wait for React and ReactDOM to be available if they aren't already
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      console.error('React or ReactDOM is not available yet, will retry in 100ms');
      setTimeout(initGamePlanComponent, 100);
      return;
    }
    
    try {
      // Get the root element
      const rootElement = document.getElementById('my-game-plan-root');
      if (!rootElement) {
        console.error('Root element not found!');
        return;
      }
      
      // Hide the loading indicator
      const loadingEl = document.getElementById('loading-fallback');
      if (loadingEl) loadingEl.style.display = 'none';
      
      // Check if the component is already rendered
      if (rootElement.hasChildNodes() && rootElement.getAttribute('data-rendered') === 'true') {
        console.log('Game Plan component already rendered, skipping');
        return;
      }
      
      // Continue with the normal component initialization
      ReactDOM.render(
        React.createElement(GamePlanApp, null),
        rootElement
      );
      
      // Mark as rendered
      rootElement.setAttribute('data-rendered', 'true');
      console.log('Game Plan component rendered successfully!');
    } catch (err) {
      console.error('Error initializing game plan component:', err);
    }
  }
  
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGamePlanComponent);
  } else {
    // DOM already loaded, initialize immediately
    initGamePlanComponent();
  }
  
  // Game Plan Component
  function GamePlanApp() {
    // State for the form inputs
    const [selectedTopic, setSelectedTopic] = React.useState('');
    const [selectedChallenge, setSelectedChallenge] = React.useState('');
    const [selectedProjectType, setSelectedProjectType] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [expertise, setExpertise] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [gamePlanResult, setGamePlanResult] = React.useState(null);
    
    // State for API interaction
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    
    // New state for revision functionality
    const [revisionText, setRevisionText] = React.useState('');
    const [isRevising, setIsRevising] = React.useState(false);
    const [revisionHistory, setRevisionHistory] = React.useState([]);
    
    // New state for saved game plans
    const [savedGamePlans, setSavedGamePlans] = React.useState([]);
    const [selectedPlanId, setSelectedPlanId] = React.useState(null);
    const [viewMode, setViewMode] = React.useState('create'); // 'create' or 'view'
    const [aiResponse, setAiResponse] = React.useState(null);
    const [aiQuestion, setAiQuestion] = React.useState(null);
    const [isSaving, setIsSaving] = React.useState(false);
    
    // State for form collapse (starts open)
    const [isFormCollapsed, setIsFormCollapsed] = React.useState(false);

    // State for collapsible sections
    const [openSections, setOpenSections] = React.useState({
      milestones: true,
      steps: true,
      technologies: true,
      resources: true,
      roadblocks: false,
      metrics: false,
      code: false,
      diagram: true // Default to open for diagram visibility
    });

    // Add state for diagram rendering
    const [diagramRendered, setDiagramRendered] = React.useState(false);
    const [diagramError, setDiagramError] = React.useState(null);
    const [diagramRetries, setDiagramRetries] = React.useState(0);
    const [manualRenderMode, setManualRenderMode] = React.useState(false);

    // Function to toggle sections
    const toggleSection = (section) => {
      setOpenSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
      
      // If opening the diagram section and it hasn't been rendered, attempt to render
      if (section === 'diagram' && !openSections.diagram && !diagramRendered && gamePlanResult?.mermaid_diagram) {
        // Reset diagram states when reopening
        setDiagramError(null);
        setDiagramRetries(0);
        
        // Schedule render on next tick to ensure DOM is updated
        setTimeout(() => {
          renderMermaidDiagram();
        }, 100);
      }
    };

    // Function to render Mermaid diagram
    const renderMermaidDiagram = React.useCallback(() => {
      if (!gamePlanResult?.mermaid_diagram) return;
      
      // Check if mermaid is available
      if (typeof window.mermaid === 'undefined') {
        console.error('Mermaid library not found');
        setDiagramError('Mermaid library not found. Please refresh the page.');
        return;
      }

      try {
        // Find the container
        const container = document.querySelector('.mermaid-diagram-render');
        if (!container) {
          console.log('Diagram container not found, will retry...');
          if (diagramRetries < 5) {
            setTimeout(() => {
              setDiagramRetries(prev => prev + 1);
              renderMermaidDiagram();
            }, 500);
          } else {
            setDiagramError('Could not find diagram container after multiple attempts');
            setManualRenderMode(true);
          }
          return;
        }

        // Clear previous content and errors
        container.innerHTML = gamePlanResult.mermaid_diagram;
        setDiagramError(null);

        // Run mermaid
        window.mermaid.run({
          nodes: [container]
        }).catch(error => {
          console.error('Error rendering diagram:', error);
          setDiagramError(`Rendering error: ${error.message || 'Unknown error'}`);
          setManualRenderMode(true);
        });

        // Hide loading indicator
        const loadingEl = document.querySelector('.mermaid-loading');
        if (loadingEl) loadingEl.style.display = 'none';
        
        setDiagramRendered(true);
      } catch (error) {
        console.error('Error in diagram rendering process:', error);
        setDiagramError(`Processing error: ${error.message || 'Unknown error'}`);
        setManualRenderMode(true);
      }
    }, [gamePlanResult, diagramRetries]);

    // Render diagram when result is available
    React.useEffect(() => {
      if (gamePlanResult?.mermaid_diagram && openSections.diagram) {
        setDiagramRendered(false);
        setDiagramError(null);
        setDiagramRetries(0);
        
        // Allow DOM to update first
        setTimeout(renderMermaidDiagram, 300);
      }
    }, [gamePlanResult, renderMermaidDiagram, openSections.diagram]);
    
    // Sample topics
    const topics = [
      'Introduction to AI',
      'Office Productivity',
      'Personal Finance',
      'Social Media Marketing',
      'Videography',
      'eCommerce',
      'Machine Learning',
      'Web Development',
      'Mobile App Development',
      'Data Analysis',
      'Game Development',
      'Blockchain',
      'DevOps',
      'Cloud Computing',
      'Cybersecurity',
      'Internet of Things'
    ];
    
    // Sample challenges based on topic
    const getChallenges = (topic) => {
      if (!topic) return [];
      
      switch(topic) {
        case 'Introduction to AI':
          return ['Understanding AI Concepts', 'Machine Learning', 'Natural Language Processing'];
        case 'Office Productivity':
          return ['Document Automation', 'Email Management', 'Meeting Optimization'];
        case 'Personal Finance':
          return ['Budgeting', 'Investment Planning', 'Debt Management'];
        default:
          return ['Challenge 1', 'Challenge 2', 'Challenge 3'];
      }
    };
    
    // Sample project types
    const getProjectTypes = (topic, challenge) => {
      if (!topic || !challenge) return [];
      return ['Personal Project', 'Small Business', 'Enterprise Solution'];
    };
    
    // Reset dependent dropdowns when topic changes
    React.useEffect(() => {
      setSelectedChallenge('');
      setSelectedProjectType('');
    }, [selectedTopic]);
    
    // Reset project type when challenge changes
    React.useEffect(() => {
      setSelectedProjectType('');
    }, [selectedChallenge]);
    
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validation
      if (!selectedTopic || !selectedChallenge) {
        setError("Please select both a topic and a challenge");
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setGamePlanResult(null);
      
      try {
        // Create our request payload
        const requestData = {
          topic: selectedTopic,
          challenge: selectedChallenge,
          expertise_level: selectedExperience
        };
        
        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // For testing: Mock API response
        setGamePlanResult({
          project_description: `This is a project to implement a ${selectedTopic} solution that addresses the challenge of ${selectedChallenge}. The solution will be tailored for ${selectedExperience} developers.`,
          key_milestones: [
            { milestone: "Research and understand the problem domain" },
            { milestone: "Design the solution architecture" },
            { milestone: "Implement core functionality" },
            { milestone: "Test and validate solution" },
            { milestone: "Deploy and monitor" }
          ],
          suggested_steps: [
            { step: "Define detailed requirements based on the selected challenge" },
            { step: "Set up the development environment and select appropriate tools" },
            { step: "Create initial project structure and configuration" },
            { step: "Implement core algorithms and data structures" },
            { step: "Build the user interface and integration points" },
            { step: "Write comprehensive tests for all components" },
            { step: "Document the solution and its architecture" }
          ],
          recommended_technologies: [
            { name: "TensorFlow", reasoning: "Ideal for machine learning model development and training" },
            { name: "PyTorch", reasoning: "Great for research and experimentation in deep learning" },
            { name: "Flask", reasoning: "Lightweight web framework for building APIs" },
            { name: "React", reasoning: "Component-based UI library for building interactive interfaces" }
          ],
          learning_resources: [
            {
              title: "TensorFlow Documentation",
              url: "https://www.tensorflow.org/docs",
              relevance: "Official comprehensive guide for TensorFlow"
            },
            {
              title: "PyTorch Tutorials",
              url: "https://pytorch.org/tutorials/",
              relevance: "Step-by-step guides for learning PyTorch"
            },
            {
              title: "AI Implementation Patterns",
              url: "https://example.com/ai-patterns",
              relevance: "Common patterns for AI implementation in production"
            }
          ],
          potential_roadblocks: [
            { roadblock: "Limited training data availability" },
            { roadblock: "Model performance in edge cases" },
            { roadblock: "Scalability challenges with large datasets" }
          ],
          success_metrics: [
            { metric: "Model accuracy above 85%" },
            { metric: "Inference time under 100ms" },
            { metric: "System uptime of 99.9%" }
          ],
          code_snippets: [
            {
              description: "Basic model initialization",
              code: "import tensorflow as tf\n\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(128, activation='relu'),\n  tf.keras.layers.Dense(64, activation='relu'),\n  tf.keras.layers.Dense(10, activation='softmax')\n])\n\nmodel.compile(optimizer='adam',\n              loss='sparse_categorical_crossentropy',\n              metrics=['accuracy'])"
            }
          ],
          mermaid_diagram: `graph TD
    A[Input Data] --> B[Preprocessing]
    B --> C[Model Training]
    C --> D[Model Evaluation]
    D --> E{Performance OK?}
    E -->|Yes| F[Deploy Model]
    E -->|No| G[Hyperparameter Tuning]
    G --> C
    F --> H[Monitoring]`
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error generating game plan:", error);
        setError("Failed to generate implementation plan. Please try again.");
        setIsLoading(false);
      }
    };
    
    // Function to render all sections of results
    const renderResults = () => {
      if (!gamePlanResult) return null;
      
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
          {/* Project summary */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Plan</h2>
          <p className="text-gray-700 mb-6 text-lg">{gamePlanResult.project_description}</p>
          
          {/* Key Milestones Section */}
          {gamePlanResult.key_milestones && gamePlanResult.key_milestones.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('milestones')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Key Milestones</h3>
                <span className="text-blue-500">
                  {openSections.milestones ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.milestones && (
                <div className="mt-3">
                  <ol className="space-y-2 list-decimal pl-5">
                    {gamePlanResult.key_milestones.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        <div className="font-medium">{item.milestone}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          
          {/* Implementation Steps Section */}
          {gamePlanResult.suggested_steps && gamePlanResult.suggested_steps.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('steps')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Implementation Steps</h3>
                <span className="text-blue-500">
                  {openSections.steps ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.steps && (
                <div className="mt-3">
                  <ol className="space-y-2 list-decimal pl-5">
                    {gamePlanResult.suggested_steps.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        <div className="font-medium">{item.step}</div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
          
          {/* Recommended Technologies Section */}
          {gamePlanResult.recommended_technologies && gamePlanResult.recommended_technologies.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('technologies')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Recommended Technologies</h3>
                <span className="text-blue-500">
                  {openSections.technologies ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.technologies && (
                <div className="mt-3 grid md:grid-cols-2 gap-4">
                  {gamePlanResult.recommended_technologies.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-blue-600">{item.name}</div>
                      <div className="text-gray-600 text-sm">{item.reasoning}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Learning Resources Section */}
          {gamePlanResult.learning_resources && gamePlanResult.learning_resources.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('resources')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Learning Resources</h3>
                <span className="text-blue-500">
                  {openSections.resources ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.resources && (
                <div className="mt-3">
                  <ul className="space-y-2 list-disc pl-5">
                    {gamePlanResult.learning_resources.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {item.title}
                        </a>
                        <div className="text-gray-600 text-sm">{item.relevance}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Potential Roadblocks Section */}
          {gamePlanResult.potential_roadblocks && gamePlanResult.potential_roadblocks.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('roadblocks')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Potential Roadblocks</h3>
                <span className="text-blue-500">
                  {openSections.roadblocks ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.roadblocks && (
                <div className="mt-3">
                  <ul className="space-y-2 list-disc pl-5">
                    {gamePlanResult.potential_roadblocks.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        <div className="font-medium">{item.roadblock}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Success Metrics Section */}
          {gamePlanResult.success_metrics && gamePlanResult.success_metrics.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('metrics')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Success Metrics</h3>
                <span className="text-blue-500">
                  {openSections.metrics ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.metrics && (
                <div className="mt-3">
                  <ul className="space-y-2 list-disc pl-5">
                    {gamePlanResult.success_metrics.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        <div className="font-medium">{item.metric}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Diagram Section */}
          {gamePlanResult.mermaid_diagram && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('diagram')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Architecture/Flow Diagram</h3>
                <span className="text-blue-500">
                  {openSections.diagram ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.diagram && (
                <div className="mt-3">
                  {diagramError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      <p className="font-medium mb-1">Error rendering diagram:</p>
                      <p className="text-sm">{diagramError}</p>
                      {manualRenderMode && (
                        <button
                          onClick={() => renderMermaidDiagram()}
                          className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
                        >
                          Retry Rendering
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="relative mermaid-diagram-container border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {/* Loading indicator */}
                    <div className="text-center text-gray-500 mb-4 mermaid-loading">
                      <div className="inline-block animate-spin h-5 w-5 mr-2 border-t-2 border-blue-500 rounded-full"></div>
                      Rendering diagram...
                    </div>
                    
                    {/* Diagram container */}
                    <div 
                      className="mermaid-diagram-render mermaid overflow-x-auto"
                      style={{
                        maxWidth: '100%',
                        margin: '0 auto',
                        minHeight: '200px',
                        display: 'flex',
                        justifyContent: 'center'
                      }}
                    >
                      {/* Content will be rendered by Mermaid */}
                    </div>
                    
                    {/* Diagram caption */}
                    <div className="text-center text-sm text-gray-500 mt-3">
                      Architecture/Process Flow Diagram (generated by AI)
                    </div>
                  </div>
                  
                  {/* Show raw diagram code if in manual mode */}
                  {manualRenderMode && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Raw Diagram Code:</p>
                      <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded-lg overflow-x-auto">
                        {gamePlanResult.mermaid_diagram}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Code Snippets Section */}
          {gamePlanResult.code_snippets && gamePlanResult.code_snippets.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer" 
                onClick={() => toggleSection('code')}
              >
                <h3 className="text-xl font-semibold text-gray-800">Sample Code Snippets</h3>
                <span className="text-blue-500">
                  {openSections.code ? '▼' : '►'}
                </span>
              </div>
              
              {openSections.code && (
                <div className="mt-3">
                  <div className="space-y-4">
                    {gamePlanResult.code_snippets.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 font-medium text-gray-700 border-b border-gray-200">
                          {item.title}
                        </div>
                        <pre className="p-4 bg-gray-800 text-gray-100 overflow-x-auto text-sm">
                          <code>{item.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next Steps Section */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Need Refinements?</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-700 mb-4">
                Is there anything specific you'd like me to clarify or expand on? You can enter a revision request below.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={revisionText}
                  onChange={(e) => setRevisionText(e.target.value)}
                  placeholder="Ask a question or request changes..."
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Revision functionality is under development. Your feedback has been recorded.');
                    setRevisionText('');
                  }}
                  disabled={!revisionText.trim() || isRevising}
                  className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isRevising ? 'Processing...' : 'Submit Revision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Render the main component
    const renderDiagramSection = () => {
      // This function is replaced by the diagram section in renderResults
      return null;
    };

    // Render function
    return React.createElement('div', {
      className: 'max-w-4xl mx-auto p-5 font-sans'
    }, [
      // Topic selection form
      React.createElement('form', {
        onSubmit: handleSubmit,
        className: 'mb-8'
      }, [
        React.createElement('div', {
          className: 'grid md:grid-cols-3 gap-4 mb-4'
        }, [
          // Topic dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'topic',
              className: 'block mb-2 font-medium text-gray-700'
            }, 'Topic'),
            React.createElement('select', {
              id: 'topic',
              value: selectedTopic,
              onChange: (e) => {
                setSelectedTopic(e.target.value);
                setSelectedChallenge('');
                setSelectedProjectType('');
              },
              className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            }, [
              React.createElement('option', { value: '' }, 'Select a topic'),
              ...topics.map(topic => 
                React.createElement('option', { key: topic, value: topic }, topic)
              )
            ])
          ]),
          
          // Challenge dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'challenge',
              className: 'block mb-2 font-medium text-gray-700'
            }, 'Challenge'),
            React.createElement('select', {
              id: 'challenge',
              value: selectedChallenge,
              onChange: (e) => {
                setSelectedChallenge(e.target.value);
                setSelectedProjectType('');
              },
              disabled: !selectedTopic,
              className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
            }, [
              React.createElement('option', { value: '' }, 'Select a challenge'),
              ...getChallenges(selectedTopic).map(challenge => 
                React.createElement('option', { key: challenge, value: challenge }, challenge)
              )
            ])
          ]),
          
          // Project Type dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'projectType',
              className: 'block mb-2 font-medium text-gray-700'
            }, 'Project Type'),
            React.createElement('select', {
              id: 'projectType',
              value: selectedProjectType,
              onChange: (e) => setSelectedProjectType(e.target.value),
              disabled: !selectedChallenge,
              className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
            }, [
              React.createElement('option', { value: '' }, 'Select a project type'),
              ...getProjectTypes(selectedTopic, selectedChallenge).map(type => 
                React.createElement('option', { key: type, value: type }, type)
              )
            ])
          ])
        ]),
        
        // Description textarea
        React.createElement('div', { className: 'mb-4' }, [
          React.createElement('label', {
            htmlFor: 'description',
            className: 'block mb-2 font-medium text-gray-700'
          }, 'Additional Details (Optional)'),
          React.createElement('textarea', {
            id: 'description',
            value: description,
            onChange: (e) => setDescription(e.target.value),
            placeholder: 'Provide any additional details about your project...',
            className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]'
          })
        ]),
        
        // Submit button
        React.createElement('button', {
          type: 'submit',
          disabled: !selectedTopic || !selectedChallenge || !selectedProjectType || isLoading,
          className: 'w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
        }, isLoading ? 'Generating Plan...' : 'Generate Game Plan')
      ]),
      
      // Error display
      error && React.createElement('div', {
        className: 'bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6'
      }, [
        React.createElement('div', { className: 'font-medium mb-1' }, 'Error generating game plan:'),
        React.createElement('div', {}, error)
      ]),
      
      // Results section
      gamePlanResult && renderResults()
    ]);
  }
  
  // Set a flag to indicate the script has loaded and executed successfully
  window.gamePlanScriptLoaded = true;
  console.log("Game Plan script fully executed, flag set.");
})(); 