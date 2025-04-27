import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import RythmotronComponentsGuide from './RythmotronComponentsGuide';
import withErrorBoundary from './ui/withErrorBoundary';
import AudioMIDITestButton from './AudioMIDITestButton';

interface HeaderProps {
  className?: string;
}

export const HeaderBase: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <header className={`border-b border-zinc-800 bg-zinc-900 ${className}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-waveform-path text-white text-sm"></i>
          </div>
          <div className="font-bold text-xl tracking-tight text-3d">ARythm-EMU 2050</div>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Home
          </a>
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Features
          </a>
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Presets
          </a>
          <a 
            href="#" 
            className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setIsGuideOpen(true);
            }}
          >
            Rythmotron Guide
            <i className="fa-solid fa-book ml-2 text-orange-400"></i>
          </a>
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Support
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          {/* Audio/MIDI Test Button */}
          <AudioMIDITestButton
            buttonVariant="outline"
            buttonSize="sm"
            buttonText="Audio & MIDI"
            className="border-purple-600 text-purple-300 hover:bg-purple-900/30"
          />
          
          {/* Guide-Button für mobile Ansicht - in Orange mit schwarzer Schrift und 3D-Effekt */}
          <Button
            variant="3d"
            className="md:hidden !rounded-button whitespace-nowrap transform-gpu bg-gradient-to-br from-orange-400 to-orange-500 text-black font-medium shadow-lg shadow-orange-500/30 border-b-2 border-orange-700"
            onClick={() => setIsGuideOpen(true)}
          >
            <i className="fa-solid fa-book mr-2"></i>
            Guide
          </Button>

          <Button
            variant="3d"
            className="!rounded-button whitespace-nowrap transform-gpu"
          >
            <i className="fa-solid fa-download mr-2"></i>
            Download
          </Button>
          <Button 
            variant="premium"
            glowColor="#9d4dfa"
            className="whitespace-nowrap transform-gpu"
          >
            Try Online
          </Button>
        </div>
      </div>

      {/* Modal für den Rythmotron-Komponenten-Guide */}
      <Modal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        title="Rythmotron - Analog Rytm MKII Komponenten Guide"
        size="full"
      >
        <RythmotronComponentsGuide />
      </Modal>
    </header>
  );
};

// Mit ErrorBoundary umwickeln
const Header = withErrorBoundary(HeaderBase, 'Header');
export default Header;