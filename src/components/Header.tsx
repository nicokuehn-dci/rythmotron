import React from 'react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
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
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Documentation
          </a>
          <a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">
            Support
          </a>
        </nav>
        <div className="flex items-center space-x-4">
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
    </header>
  );
};

export default Header;