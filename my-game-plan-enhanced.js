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
    
    // Simple Game Plan Component with three dropdowns
    function GamePlanApp() {
      // State hooks for form inputs
      const [selectedTopic, setSelectedTopic] = React.useState('');
      const [selectedChallenge, setSelectedChallenge] = React.useState('');
      const [selectedProjectType, setSelectedProjectType] = React.useState('');
      const [description, setDescription] = React.useState('');
      
      // Sample topics
      const topics = [
        'Introduction to AI',
        'Office Productivity',
        'Personal Finance',
        'Social Media Marketing',
        'Videography',
        'eCommerce'
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
      const handleSubmit = (e) => {
        e.preventDefault();
        alert(`Selected: ${selectedTopic} - ${selectedChallenge} - ${selectedProjectType}\nDescription: ${description}`);
      };
      
      // Render the form
      return React.createElement('div', {
        style: {
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }
      }, [
        React.createElement('h2', {
          style: {
            fontSize: '24px',
            marginBottom: '20px',
            color: '#333'
          }
        }, 'Create New Game Plan'),
        
        // Form element
        React.createElement('form', {
          onSubmit: handleSubmit,
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }
        }, [
          // Topic dropdown
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'topic',
              style: {
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }
            }, 'Topic'),
            React.createElement('select', {
              id: 'topic',
              value: selectedTopic,
              onChange: (e) => setSelectedTopic(e.target.value),
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }
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
              style: {
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }
            }, 'Challenge'),
            React.createElement('select', {
              id: 'challenge',
              value: selectedChallenge,
              onChange: (e) => setSelectedChallenge(e.target.value),
              disabled: !selectedTopic,
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }
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
              style: {
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }
            }, 'Project Type'),
            React.createElement('select', {
              id: 'projectType',
              value: selectedProjectType,
              onChange: (e) => setSelectedProjectType(e.target.value),
              disabled: !selectedChallenge,
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }
            }, [
              React.createElement('option', { value: '' }, 'Select a project type'),
              ...getProjectTypes(selectedTopic, selectedChallenge).map(type => 
                React.createElement('option', { key: type, value: type }, type)
              )
            ])
          ]),
          
          // Description textarea
          React.createElement('div', {}, [
            React.createElement('label', {
              htmlFor: 'description',
              style: {
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500'
              }
            }, 'Project Description (Optional)'),
            React.createElement('textarea', {
              id: 'description',
              value: description,
              onChange: (e) => setDescription(e.target.value),
              placeholder: 'Provide any additional details about your project...',
              style: {
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                minHeight: '100px',
                resize: 'vertical'
              }
            })
          ]),
          
          // Submit button
          React.createElement('button', {
            type: 'submit',
            disabled: !selectedTopic || !selectedChallenge || !selectedProjectType,
            style: {
              padding: '12px',
              backgroundColor: (!selectedTopic || !selectedChallenge || !selectedProjectType) ? '#ccc' : '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '500',
              cursor: (!selectedTopic || !selectedChallenge || !selectedProjectType) ? 'not-allowed' : 'pointer'
            }
          }, 'Generate Game Plan')
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