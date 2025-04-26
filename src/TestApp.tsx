import React from 'react';
import ErrorBoundary from './components/ui/ErrorHandler';

const TestComponent: React.FC = () => {
  return (
    <div className="p-8 bg-zinc-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Rythmotron Test App</h1>
      <p className="mb-4">Wenn Sie diese Nachricht sehen können, funktioniert das grundlegende Rendering.</p>
      <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
        Test Button
      </button>
    </div>
  );
};

const TestApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <TestComponent />
    </ErrorBoundary>
  );
};

export default TestApp;