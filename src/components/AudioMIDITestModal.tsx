import React from 'react';
import AudioMIDITestPage from './AudioMIDITestPage';

interface AudioMIDITestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AudioMIDITestModal: React.FC<AudioMIDITestModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 overflow-y-auto">
      <div className="relative w-full max-w-7xl max-h-[90vh] overflow-y-auto bg-zinc-900 rounded-xl border border-zinc-700 shadow-xl">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white"
          onClick={onClose}
        >
          <i className="fa-solid fa-times"></i>
        </button>

        <div className="p-2">
          <AudioMIDITestPage />
        </div>
      </div>
    </div>
  );
};

export default AudioMIDITestModal;