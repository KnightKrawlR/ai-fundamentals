// Minimal game plan component
(function() {
  // Verify React and ReactDOM are available
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('React or ReactDOM is not available!');
    return;
  }

  // Simple component
  function MinimalGamePlan(props) {
    const [steps, setSteps] = React.useState([
      "Define project requirements",
      "Set up development environment",
      "Create basic UI components",
      "Implement core functionality",
      "Test and deploy"
    ]);

    const [technologies, setTechnologies] = React.useState([
      { name: "React", description: "Frontend UI library" },
      { name: "Firebase", description: "Backend and authentication" },
      { name: "Tailwind CSS", description: "Utility-first CSS framework" }
    ]);

    return React.createElement('div', { 
      className: 'minimal-game-plan',
      style: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'sans-serif'
      }
    }, [
      React.createElement('h2', { 
        style: { 
          fontSize: '24px', 
          marginBottom: '20px',
          color: '#4a5568'
        } 
      }, 'My Game Plan (Minimal Version)'),
      
      React.createElement('div', { 
        style: { 
          padding: '15px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px',
          marginBottom: '20px'
        } 
      }, [
        React.createElement('h3', { 
          style: { 
            fontSize: '18px', 
            marginBottom: '10px',
            color: '#4a5568'
          } 
        }, 'Implementation Steps'),
        
        React.createElement('ul', { 
          style: { 
            paddingLeft: '20px'
          } 
        }, steps.map((step, index) => 
          React.createElement('li', { 
            key: index,
            style: { 
              marginBottom: '8px'
            } 
          }, step)
        ))
      ]),
      
      React.createElement('div', { 
        style: { 
          padding: '15px',
          backgroundColor: '#f7fafc',
          borderRadius: '8px'
        } 
      }, [
        React.createElement('h3', { 
          style: { 
            fontSize: '18px', 
            marginBottom: '10px',
            color: '#4a5568'
          } 
        }, 'Recommended Technologies'),
        
        React.createElement('div', { 
          style: { 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '10px'
          } 
        }, technologies.map((tech, index) => 
          React.createElement('div', { 
            key: index,
            style: { 
              padding: '10px',
              backgroundColor: '#edf2f7',
              borderRadius: '4px'
            } 
          }, [
            React.createElement('div', { 
              style: { 
                fontWeight: 'bold',
                marginBottom: '5px'
              } 
            }, tech.name),
            React.createElement('div', { 
              style: { 
                fontSize: '14px'
              } 
            }, tech.description)
          ])
        ))
      ])
    ]);
  }

  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    const rootElement = document.getElementById('my-game-plan-root');
    
    if (rootElement) {
      console.log('Rendering minimal game plan component to:', rootElement);
      
      // Hide the loading indicator
      const loadingEl = document.getElementById('loading-fallback');
      if (loadingEl) loadingEl.style.display = 'none';
      
      // Render our minimal component
      ReactDOM.render(
        React.createElement(MinimalGamePlan, null),
        rootElement
      );
      
      console.log('Minimal game plan component rendered successfully!');
    } else {
      console.error('Root element not found!');
    }
  });
})(); 