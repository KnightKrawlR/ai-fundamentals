import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can also log the error to an error reporting service like Sentry
    // Example: logErrorToMyService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '20px',
          padding: '20px',
          border: '1px solid #f56565',
          borderRadius: '5px',
          backgroundColor: '#fff5f5'
        }}>
          <h2 style={{ 
            color: '#c53030', 
            marginBottom: '10px' 
          }}>
            Something went wrong
          </h2>
          <p style={{ marginBottom: '15px' }}>
            We're sorry, but there was an error loading the My Games experience.
          </p>
          
          <details style={{ 
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}>
            <summary style={{ 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Error Details (for technical support)
            </summary>
            <pre style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: '#edf2f7',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            {this.state.errorInfo && (
              <pre style={{ 
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#edf2f7',
                overflow: 'auto',
                maxHeight: '200px',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            )}
          </details>
          
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
