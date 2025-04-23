// Enhanced game plan component with three-dropdown structure
(function() {
  console.log("Game Plan Enhanced Script Loaded!");
  
  // Wait for the DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM Loaded, initializing game plan component");
    
    // Verify React and ReactDOM are available
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      console.error('React or ReactDOM is not available!');
      return;
    }
    
    // Game Plan Component
    function GamePlanApp() {
      // State hooks for form inputs
      const [selectedTopic, setSelectedTopic] = React.useState('');
      const [selectedChallenge, setSelectedChallenge] = React.useState('');
      const [selectedProjectType, setSelectedProjectType] = React.useState('');
      const [description, setDescription] = React.useState('');
      
      // State for API interaction
      const [isLoading, setIsLoading] = React.useState(false);
      const [error, setError] = React.useState(null);
      const [gamePlanResult, setGamePlanResult] = React.useState(null);
      
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

      // State for collapsible sections (true = open)
      const [sectionsOpen, setSectionsOpen] = React.useState({
        'milestones': true,
        'steps': true,
        'technologies': true,
        'resources': true,
        'roadblocks': true,
        'metrics': true,
        'diagram': true, // Set this to true to start with diagram open
        'code': true
      });

      // Toggle section visibility
      const toggleSection = (section) => {
        setSectionsOpen(prev => ({
          ...prev,
          [section]: !prev[section]
        }));
      };

      // Run Mermaid render when diagram is available
      React.useEffect(() => {
        if (gamePlanResult && gamePlanResult.mermaid_diagram && typeof mermaid !== 'undefined') {
          // Wait a moment for React to render the element
          setTimeout(() => {
            try {
              console.log("Running Mermaid diagram render with diagram:", gamePlanResult.mermaid_diagram);
              // Make sure we're using the latest mermaid version
              mermaid.initialize({
                startOnLoad: false,
                securityLevel: 'loose',
                theme: 'default'
              });
              // Run mermaid to render diagrams
              mermaid.run();
              console.log("Mermaid diagram rendering complete");
            } catch (err) {
              console.error("Error rendering Mermaid diagram:", err);
            }
          }, 300); // Increased timeout to ensure DOM is ready
        }
      }, [gamePlanResult, sectionsOpen.diagram]);
      
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
        if (e) e.preventDefault();
        console.log("Submitting form with values:", { 
          topic: selectedTopic, 
          challenge: selectedChallenge, 
          projectType: selectedProjectType 
        });
        
        setIsLoading(true);
        setError(null);
        
        try {
          if (!firebase.auth().currentUser) {
            throw new Error("User is not authenticated");
          }
          
          // Call the Firebase function
          const generateGamePlan = firebase.functions().httpsCallable('generateGamePlan');
          const result = await generateGamePlan({
            topic: selectedTopic,
            challenge: selectedChallenge,
            projectType: selectedProjectType,
            projectDescription: description || ''
          });
          
          console.log("Firebase function result:", result);
          
          if (result.data) {
            setGamePlanResult(result.data);
          }
        } catch (err) {
          console.error("Error generating game plan:", err);
          setError(err.message || "Failed to generate game plan");
        } finally {
          setIsLoading(false);
        }
      };
      
      // Render a collapsible section
      const renderCollapsibleSection = (key, title, content) => {
        return React.createElement('div', {
          className: 'mb-6 border-b border-gray-200 pb-6'
        }, [
          // Section header with toggle
          React.createElement('button', {
            className: 'w-full text-left font-semibold text-lg mb-3 flex justify-between items-center',
            onClick: () => toggleSection(key)
          }, [
            title,
            React.createElement('i', {
              className: `fas fa-chevron-${sectionsOpen[key] ? 'up' : 'down'} text-gray-500`
            })
          ]),
          
          // Collapsible content
          sectionsOpen[key] && content
        ]);
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
        gamePlanResult && React.createElement('div', {
          className: 'bg-white border border-gray-200 rounded-lg p-6 shadow-lg'
        }, [
          // Project summary
          React.createElement('h2', {
            className: 'text-2xl font-bold text-gray-900 mb-4'
          }, 'Project Plan'),
          
          React.createElement('p', {
            className: 'text-gray-700 mb-6 text-lg'
          }, gamePlanResult.project_summary),
          
          // Collapsible milestones section
          renderCollapsibleSection('milestones', 'Key Milestones', 
            React.createElement('ol', {
              className: 'space-y-3 list-decimal pl-5'
            }, gamePlanResult.key_milestones.map((item, index) => 
              React.createElement('li', { key: `milestone-${index}`, className: 'text-gray-700' }, [
                React.createElement('div', { className: 'font-medium' }, item.milestone),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, item.description)
              ])
            ))
          ),
          
          // Collapsible steps section
          renderCollapsibleSection('steps', 'Implementation Steps', 
            React.createElement('ol', {
              className: 'space-y-4 list-decimal pl-5'
            }, gamePlanResult.suggested_steps.map((item, index) => 
              React.createElement('li', { key: `step-${index}`, className: 'text-gray-700' }, [
                React.createElement('div', { className: 'font-medium' }, item.step),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, item.details)
              ])
            ))
          ),
          
          // Collapsible technologies section
          renderCollapsibleSection('technologies', 'Recommended Technologies', 
            React.createElement('div', {
              className: 'grid md:grid-cols-2 gap-4'
            }, gamePlanResult.recommended_technologies.map((item, index) => 
              React.createElement('div', { 
                key: `tech-${index}`, 
                className: 'border border-gray-200 rounded-lg p-4'
              }, [
                React.createElement('div', { className: 'font-medium text-blue-600' }, item.name),
                React.createElement('div', { 
                  className: 'text-xs inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded mb-2' 
                }, item.type),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, item.reasoning)
              ])
            ))
          ),
          
          // Collapsible resources section
          renderCollapsibleSection('resources', 'Learning Resources', 
            React.createElement('ul', {
              className: 'space-y-3 list-disc pl-5'
            }, gamePlanResult.learning_resources.map((item, index) => 
              React.createElement('li', { key: `resource-${index}`, className: 'text-gray-700' }, [
                React.createElement('a', { 
                  href: item.url,
                  target: '_blank',
                  className: 'text-blue-600 hover:underline font-medium'
                }, item.title),
                React.createElement('div', { className: 'text-xs text-gray-500' }, `Type: ${item.type}`),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, item.relevance)
              ])
            ))
          ),
          
          // Collapsible roadblocks section
          renderCollapsibleSection('roadblocks', 'Potential Roadblocks', 
            React.createElement('ul', {
              className: 'space-y-3 list-disc pl-5'
            }, gamePlanResult.potential_roadblocks.map((item, index) => 
              React.createElement('li', { key: `roadblock-${index}`, className: 'text-gray-700' }, [
                React.createElement('div', { className: 'font-medium' }, item.roadblock),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, `Mitigation: ${item.mitigation}`)
              ])
            ))
          ),
          
          // Collapsible metrics section
          renderCollapsibleSection('metrics', 'Success Metrics', 
            React.createElement('ul', {
              className: 'space-y-3 list-disc pl-5'
            }, gamePlanResult.success_metrics.map((item, index) => 
              React.createElement('li', { key: `metric-${index}`, className: 'text-gray-700' }, [
                React.createElement('div', { className: 'font-medium' }, item.metric),
                React.createElement('div', { className: 'text-gray-600 text-sm' }, `Measurement: ${item.measurement}`)
              ])
            ))
          ),
          
          // NEW: Collapsible diagram section
          gamePlanResult.mermaid_diagram && renderCollapsibleSection('diagram', 'Architecture/Flow Diagram', 
            React.createElement('div', {
              className: 'mermaid-diagram-container border border-gray-200 rounded-lg p-4 bg-gray-50'
            }, [
              React.createElement('div', {
                className: 'mermaid-diagram-render mermaid',
                key: `diagram-${Date.now()}`, // Key to force re-render
                style: { maxWidth: '100%', margin: '0 auto' }
              }, gamePlanResult.mermaid_diagram),
              // Add a caption below the diagram
              React.createElement('div', {
                className: 'text-center text-sm text-gray-500 mt-3'
              }, 'Architecture/Process Flow Diagram (generated by AI)')
            ])
          ),
          
          // Code snippets section
          gamePlanResult.code_snippets && gamePlanResult.code_snippets.length > 0 && renderCollapsibleSection('code', 'Sample Code Snippets', 
            React.createElement('div', {
              className: 'code-snippets-container border border-gray-200 rounded-lg p-4 bg-gray-50'
            }, gamePlanResult.code_snippets.map((snippet, index) => 
              React.createElement('div', { key: `snippet-${index}`, className: 'mb-4' }, [
                React.createElement('h3', { className: 'text-lg font-semibold mb-2' }, snippet.title),
                React.createElement('pre', { className: 'text-sm bg-gray-100 p-2 rounded-lg' }, snippet.code)
              ])
            ))
          ),
          
          // Next steps prompt
          React.createElement('div', {
            className: 'mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg'
          }, [
            React.createElement('h3', {
              className: 'font-medium text-blue-800 mb-2'
            }, 'Next Steps'),
            React.createElement('p', {
              className: 'text-blue-700'
            }, gamePlanResult.next_steps_prompt)
          ]),
          
          // Revision input
          React.createElement('div', {
            className: 'mt-8 pt-6 border-t border-gray-200'
          }, [
            React.createElement('h3', {
              className: 'font-medium text-gray-900 mb-3'
            }, 'Refine Your Plan'),
            React.createElement('textarea', {
              value: revisionText,
              onChange: (e) => setRevisionText(e.target.value),
              placeholder: 'Add details, ask for clarifications, or request changes to your plan...',
              className: 'w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]'
            }),
            React.createElement('button', {
              onClick: (e) => {
                e.preventDefault();
                alert('Revision functionality is under development. Your feedback has been recorded.');
                setRevisionText('');
              },
              disabled: !revisionText.trim() || isRevising,
              className: 'mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium'
            }, isRevising ? 'Processing...' : 'Submit Revision')
          ])
        ])
      ]);
    }
    
    // Render the app to the DOM
    const rootElement = document.getElementById('my-game-plan-root');
    if (rootElement) {
      // Hide the loading indicator
      const loadingEl = document.getElementById('loading-fallback');
      if (loadingEl) loadingEl.style.display = 'none';
      
      // Render our component
      ReactDOM.render(
        React.createElement(GamePlanApp, null),
        rootElement
      );
      
      console.log('Game Plan component rendered successfully!');
    } else {
      console.error('Root element not found!');
    }
  });
})(); 