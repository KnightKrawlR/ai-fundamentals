// Debug version of game plan component
(function() {
  console.log("[DEBUG] Game Plan Debug Script Loaded! Version 1");
  
  // Log environment info
  console.log("[DEBUG] React available:", typeof React !== 'undefined');
  console.log("[DEBUG] ReactDOM available:", typeof ReactDOM !== 'undefined');
  console.log("[DEBUG] Mermaid available:", typeof mermaid !== 'undefined');
  console.log("[DEBUG] Firebase available:", typeof firebase !== 'undefined');
  console.log("[DEBUG] Document ready state:", document.readyState);
  
  // Create a global renderGamePlanComponent function that can be called directly
  window.renderGamePlanComponent = function() {
    console.log("[DEBUG] External renderGamePlanComponent called");
    window.setTimeout(function() {
      initGamePlanComponent();
    }, 0);
    return true; // Indicate function was found and called
  };
  
  // Function to initialize the game plan component
  function initGamePlanComponent() {
    console.log("[DEBUG] Initializing game plan component");
    
    try {
      // Wait for React and ReactDOM to be available if they aren't already
      if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
        console.error('[DEBUG] React or ReactDOM is not available yet, will retry in 200ms');
        setTimeout(initGamePlanComponent, 200);
        return;
      }
      
      // Get the root element
      const rootElement = document.getElementById('my-game-plan-root');
      if (!rootElement) {
        console.error('[DEBUG] Root element not found!');
        document.body.innerHTML += '<div style="color:red;padding:20px;">Root element (my-game-plan-root) not found!</div>';
        return;
      }
      
      console.log('[DEBUG] Root element found:', rootElement);
      
      // Hide the loading indicator
      const loadingEl = document.getElementById('loading-fallback');
      if (loadingEl) {
        loadingEl.style.display = 'none';
        console.log('[DEBUG] Hiding loading indicator');
      } else {
        console.log('[DEBUG] Loading indicator not found');
      }
      
      // Check if the component is already rendered
      if (rootElement.hasChildNodes() && rootElement.getAttribute('data-rendered') === 'true') {
        console.log('[DEBUG] Game Plan component already rendered, skipping');
        return;
      }
      
      console.log('[DEBUG] Creating simple test component to verify React works');
      
      // Create a simple test component first
      const TestComponent = function() {
        return React.createElement('div', {
          style: {
            padding: '20px',
            margin: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f8f9fa'
          }
        }, [
          React.createElement('h2', {
            style: { color: '#0a84ff', marginBottom: '10px' }
          }, 'Game Plan Debug Component'),
          React.createElement('p', {}, 'If you can see this message, React is working correctly!')
        ]);
      };
      
      try {
        // Clear any existing content
        rootElement.innerHTML = '';
        console.log('[DEBUG] Cleared root element');
        
        // Render the test component first for debugging
        ReactDOM.render(
          React.createElement(TestComponent, null),
          rootElement
        );
        console.log('[DEBUG] Test component rendered successfully!');
        
        // Wait a moment and then render the actual component
        setTimeout(function() {
          try {
            console.log('[DEBUG] Now rendering the actual GamePlanApp component');
            ReactDOM.render(
              React.createElement(GamePlanApp, null),
              rootElement
            );
            
            // Mark as rendered
            rootElement.setAttribute('data-rendered', 'true');
            console.log('[DEBUG] Game Plan component rendered successfully!');
          } catch (innerErr) {
            console.error('[DEBUG] Error rendering GamePlanApp:', innerErr);
            // Keep the test component visible as fallback
          }
        }, 1000);
      } catch (renderErr) {
        console.error('[DEBUG] Error rendering test component:', renderErr);
        rootElement.innerHTML = '<div style="color:red;padding:20px;">Error rendering React component: ' + renderErr.message + '</div>';
      }
    } catch (err) {
      console.error('[DEBUG] Critical error initializing game plan component:', err);
      document.body.innerHTML += '<div style="color:red;padding:20px;">Critical error: ' + err.message + '</div>';
    }
  }
  
  // Wait for the DOM to be fully loaded
  if (document.readyState === 'loading') {
    console.log('[DEBUG] Document still loading, adding DOMContentLoaded listener');
    document.addEventListener('DOMContentLoaded', function() {
      console.log('[DEBUG] DOMContentLoaded fired');
      initGamePlanComponent();
    });
  } else {
    // DOM already loaded, initialize immediately
    console.log('[DEBUG] Document already loaded, initializing immediately');
    initGamePlanComponent();
  }
  
  // Minimal implementation of GamePlanApp for debugging
  function GamePlanApp() {
    // Use React hooks for state
    const [counter, setCounter] = React.useState(0);
    
    // Return the component structure
    return React.createElement('div', {
      className: 'max-w-4xl mx-auto p-5 font-sans bg-white shadow-lg rounded-lg'
    }, [
      // Header
      React.createElement('h1', {
        className: 'text-2xl font-bold text-center mb-6 text-blue-600'
      }, 'Game Plan Debug Version'),
      
      // Instructions
      React.createElement('p', {
        className: 'mb-4 text-gray-600'
      }, 'This is a simplified debug version of the Game Plan component. If you can see this, the JavaScript is working correctly.'),
      
      // Counter
      React.createElement('div', {
        className: 'flex flex-col items-center p-4 bg-blue-50 rounded-lg mb-6'
      }, [
        React.createElement('p', {
          className: 'mb-2'
        }, 'Counter: ' + counter),
        React.createElement('button', {
          onClick: () => setCounter(counter + 1),
          className: 'py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600'
        }, 'Increment')
      ]),
      
      // Environment info
      React.createElement('div', {
        className: 'p-4 bg-gray-50 rounded-lg'
      }, [
        React.createElement('h3', {
          className: 'font-bold mb-2'
        }, 'Environment Information:'),
        React.createElement('ul', {
          className: 'list-disc pl-5'
        }, [
          React.createElement('li', {}, 'React: ' + (typeof React !== 'undefined' ? '✅' : '❌')),
          React.createElement('li', {}, 'ReactDOM: ' + (typeof ReactDOM !== 'undefined' ? '✅' : '❌')),
          React.createElement('li', {}, 'Mermaid: ' + (typeof mermaid !== 'undefined' ? '✅' : '❌')),
          React.createElement('li', {}, 'Firebase: ' + (typeof firebase !== 'undefined' ? '✅' : '❌')),
          React.createElement('li', {}, 'User authenticated: ' + (firebase && firebase.auth && firebase.auth().currentUser ? '✅' : '❌'))
        ])
      ]),
      
      // Refresh button
      React.createElement('div', {
        className: 'mt-6 text-center'
      }, [
        React.createElement('button', {
          onClick: () => window.location.reload(),
          className: 'py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600'
        }, 'Refresh Page')
      ])
    ]);
  }
})(); 