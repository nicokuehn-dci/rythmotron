import React from 'react';
import ReactDOM from 'react-dom/client';
// Import die Hauptanwendung wieder
import App from '../ARythm-EMU-2050-Knob-UI';
import './index.css';
import ErrorBoundary, { RuntimeErrorHandler } from './components/ui/ErrorHandler';

// Terminal error listener for development
if (process.env.NODE_ENV === 'development') {
  // Create a custom console error handler to capture terminal errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check if this is a React-related warning/error
    const isReactError = args.some(arg => 
      typeof arg === 'string' && 
      (arg.includes('React') || arg.includes('Warning:'))
    );
    
    if (isReactError) {
      // Format React errors with a distinctive style
      originalConsoleError(
        '%c React Error ',
        'background: #ff6b00; color: white; font-weight: bold; border-radius: 3px;',
        ...args
      );
    } else {
      // Format other errors
      originalConsoleError(
        '%c Console Error ',
        'background: #cc3333; color: white; font-weight: bold; border-radius: 3px;',
        ...args
      );
    }
  };
  
  // Create a custom console warning handler
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    originalConsoleWarn(
      '%c Warning ',
      'background: #ff9900; color: black; font-weight: bold; border-radius: 3px;',
      ...args
    );
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        {/* Verwende die Hauptanwendung wieder */}
        <ErrorBoundary>
          <RuntimeErrorHandler>
            <App />
          </RuntimeErrorHandler>
        </ErrorBoundary>
      </React.StrictMode>
    );
  } else {
    console.error('Root element not found. Please check your HTML structure.');
  }
});

// Report web vitals for performance monitoring
const reportWebVitals = () => {
  if ('performance' in window && 'getEntriesByType' in window.performance) {
    const metrics = window.performance.getEntriesByType('navigation');
    if (metrics.length > 0) {
      const nav = metrics[0] as PerformanceNavigationTiming;
      
      // Log performance metrics
      console.info(
        '%c Performance ',
        'background: #4caf50; color: white; font-weight: bold; border-radius: 3px;',
        `\nLoad Time: ${Math.round(nav.loadEventEnd - nav.startTime)}ms`,
        `\nFirst Paint: ${Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0)}ms`,
        `\nFirst Contentful Paint: ${Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0)}ms`
      );
    }
  }
};

// Report vitals after window loads
window.addEventListener('load', reportWebVitals);