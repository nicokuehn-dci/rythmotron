import React, { useState, useEffect } from 'react';

interface ErrorNotificationProps {
  error: Error;
  errorInfo?: React.ErrorInfo | null;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({ error, errorInfo, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`fixed ${isMinimized ? 'bottom-4 right-4 w-auto' : 'bottom-8 right-8 max-w-lg w-full'} z-50 transition-all duration-300`}
      style={{
        transform: isMinimized ? 'scale(0.9)' : 'scale(1)'
      }}
    >
      <div 
        className="rounded-lg overflow-hidden shadow-xl"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a, #222222)',
          boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.5), -2px -2px 6px rgba(60, 60, 60, 0.1), 0 0 15px rgba(255, 0, 0, 0.3)',
          border: '1px solid rgba(255, 50, 50, 0.4)'
        }}
      >
        {/* Header with 3D styling */}
        <div 
          className="px-4 py-3 flex items-center justify-between"
          style={{
            background: 'linear-gradient(145deg, #2d1a1a, #1e1212)',
            borderBottom: '1px solid rgba(255, 50, 50, 0.2)'
          }}
        >
          <div className="flex items-center">
            {/* Error icon with 3D effect */}
            <div 
              className="w-6 h-6 flex items-center justify-center rounded-full mr-3"
              style={{
                background: 'linear-gradient(135deg, #ff4040, #cc2020)',
                boxShadow: 'inset -1px -1px 3px rgba(0, 0, 0, 0.3), inset 1px 1px 2px rgba(255, 255, 255, 0.1), 0 0 5px rgba(255, 0, 0, 0.5)'
              }}
            >
              <span className="text-white text-sm font-bold">!</span>
            </div>
            
            <h3 
              className="font-bold" 
              style={{
                color: '#ff6b6b',
                textShadow: '0 0 5px rgba(255, 107, 107, 0.3)'
              }}
            >
              {isMinimized ? 'Error' : 'Application Error'}
            </h3>
          </div>
          
          {/* Control buttons with 3D styling */}
          <div className="flex space-x-1">
            {!isMinimized && (
              <button
                onClick={() => setIsMinimized(true)}
                className="w-5 h-5 flex items-center justify-center rounded-sm"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #222222)',
                  border: '1px solid rgba(80, 80, 80, 0.5)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span className="text-zinc-400 text-sm">_</span>
              </button>
            )}
            
            {isMinimized && (
              <button
                onClick={() => setIsMinimized(false)}
                className="w-5 h-5 flex items-center justify-center rounded-sm"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #222222)',
                  border: '1px solid rgba(80, 80, 80, 0.5)',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                }}
              >
                <span className="text-zinc-400 text-xs">□</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center rounded-sm"
              style={{
                background: 'linear-gradient(145deg, #3a1a1a, #301010)',
                border: '1px solid rgba(255, 80, 80, 0.5)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
            >
              <span className="text-zinc-300 text-xs">✕</span>
            </button>
          </div>
        </div>
        
        {!isMinimized && (
          <>
            {/* Error message with 3D inset panel */}
            <div 
              className="p-4"
              style={{
                background: 'linear-gradient(to bottom, rgba(50, 0, 0, 0.1), transparent)'
              }}
            >
              <div 
                className="p-3 rounded mb-3"
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)'
                }}
              >
                <p 
                  className="font-mono text-sm break-words"
                  style={{
                    color: '#ff8080',
                    textShadow: '0 0 2px rgba(255, 128, 128, 0.2)'
                  }}
                >
                  {error.message || 'An unknown error occurred'}
                </p>
              </div>
              
              {/* Error details toggleable section */}
              <div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center space-x-2 mb-2 px-2 py-1 rounded"
                  style={{
                    background: isExpanded ? 'rgba(255, 50, 50, 0.1)' : 'transparent',
                    border: '1px solid rgba(255, 50, 50, 0.2)'
                  }}
                >
                  <span 
                    className="transform transition-transform"
                    style={{
                      transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}
                  >
                    ▶
                  </span>
                  <span className="text-sm text-zinc-300">
                    {isExpanded ? 'Hide' : 'Show'} technical details
                  </span>
                </button>
                
                {isExpanded && errorInfo && (
                  <div 
                    className="mt-3 p-3 rounded max-h-60 overflow-y-auto"
                    style={{
                      background: 'linear-gradient(145deg, #1a1a1a, #151515)',
                      boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)',
                      border: '1px solid rgba(60, 60, 60, 0.5)'
                    }}
                  >
                    <pre 
                      className="font-mono text-xs break-words whitespace-pre-wrap"
                      style={{ color: '#a1a1aa' }}
                    >
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
                
                {isExpanded && !errorInfo && (
                  <div 
                    className="mt-3 p-3 rounded max-h-60 overflow-y-auto"
                    style={{
                      background: 'linear-gradient(145deg, #1a1a1a, #151515)',
                      boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)',
                      border: '1px solid rgba(60, 60, 60, 0.5)'
                    }}
                  >
                    <pre 
                      className="font-mono text-xs break-words whitespace-pre-wrap"
                      style={{ color: '#a1a1aa' }}
                    >
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer with 3D buttons */}
            <div 
              className="px-4 py-3 flex justify-end space-x-3"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent)',
                borderTop: '1px solid rgba(60, 60, 60, 0.2)'
              }}
            >
              <button
                onClick={onClose}
                className="px-4 py-1 rounded text-sm font-medium"
                style={{
                  background: 'linear-gradient(145deg, #2a2a2a, #222222)',
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(60, 60, 60, 0.1)',
                  border: '1px solid rgba(70, 70, 70, 0.4)',
                  color: '#a1a1aa'
                }}
              >
                Dismiss
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-1 rounded text-sm font-medium"
                style={{
                  background: 'linear-gradient(145deg, #3a1a1a, #301010)',
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 3px rgba(60, 60, 60, 0.1)',
                  border: '1px solid rgba(255, 80, 80, 0.3)',
                  color: '#ff8080'
                }}
              >
                Reload App
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface ErrorHandlerState {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorHandlerState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
      hasError: true
    });
    
    // Log error to console in a formatted way
    console.error(
      '%c Application Error ',
      'background: #ff3333; color: white; font-weight: bold; border-radius: 3px;',
      '\n',
      error,
      '\nComponent Stack:',
      errorInfo.componentStack
    );
    
    // You could also log to an external error tracking service here
    // Example: errorTrackingService.logError(error, errorInfo);
  }

  handleCloseError = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <>
          {this.props.children}
          <ErrorNotification 
            error={this.state.error} 
            errorInfo={this.state.errorInfo} 
            onClose={this.handleCloseError} 
          />
        </>
      );
    }
    
    return this.props.children;
  }
}

// This is a hook to track and report runtime errors that aren't caught by React's error boundary
export const useGlobalErrorHandler = () => {
  const [runtimeError, setRuntimeError] = useState<Error | null>(null);

  useEffect(() => {
    // Handler for uncaught errors
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      const error = new Error(`${event.message} (${event.filename}:${event.lineno}:${event.colno})`);
      error.stack = event.error?.stack;
      setRuntimeError(error);
      
      // Log error in a formatted way
      console.error(
        '%c Runtime Error ',
        'background: #ff3333; color: white; font-weight: bold; border-radius: 3px;',
        '\n',
        error
      );
      
      return false;
    };
    
    // Handler for unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error('Unhandled Promise rejection: ' + String(event.reason));
      setRuntimeError(error);
      
      // Log error in a formatted way
      console.error(
        '%c Unhandled Promise Rejection ',
        'background: #ff3333; color: white; font-weight: bold; border-radius: 3px;',
        '\n',
        error
      );
      
      return false;
    };
    
    // Add event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
    };
  }, []);
  
  const handleCloseError = () => {
    setRuntimeError(null);
  };
  
  return {
    runtimeError,
    clearError: handleCloseError
  };
};

// For use in the main App wrapper
export const RuntimeErrorHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { runtimeError, clearError } = useGlobalErrorHandler();
  
  return (
    <>
      {children}
      {runtimeError && (
        <ErrorNotification 
          error={runtimeError} 
          onClose={clearError} 
        />
      )}
    </>
  );
};

// For component level error boundaries
export default ErrorBoundary;