import React, { useState } from 'react';
import AudioMIDITestModal from './AudioMIDITestModal';
import { Button } from './ui/button';

interface AudioMIDITestButtonProps {
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
}

const AudioMIDITestButton: React.FC<AudioMIDITestButtonProps> = ({
  className = '',
  buttonText = 'Audio & MIDI Test',
  buttonVariant = 'outline',
  buttonSize = 'sm',
  showIcon = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize} 
        className={className}
        onClick={openModal}
      >
        {showIcon && <i className="fa-solid fa-music mr-2"></i>}
        {buttonText}
      </Button>

      <AudioMIDITestModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export default AudioMIDITestButton;