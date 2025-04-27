import React from 'react';
import ErrorBoundary from './components/ui/ErrorHandler';
import { SafeChangesProvider } from './components/ui/SafeChangesErrorHandler';
import AudioMIDITestPage from './components/AudioMIDITestPage';

const TestApp: React.FC = () => {
  return (
    <ErrorBoundary>
      <SafeChangesProvider>
        <AudioMIDITestPage />
      </SafeChangesProvider>
    </ErrorBoundary>
  );
};

export default TestApp;