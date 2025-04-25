import React from 'react';
import ErrorBoundary from './ErrorBoundary';

/**
 * Higher Order Component (HOC) that wraps a component with an ErrorBoundary
 * @param Component The component to wrap
 * @param componentName Optional name to display in error messages
 */
function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  componentName?: string
): React.FC<T> {
  const displayName = componentName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<T> = (props: T) => {
    return (
      <ErrorBoundary componentName={displayName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
}

export default withErrorBoundary;