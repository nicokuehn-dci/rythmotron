import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import Slider from './ui/slider';
import LED from './ui/led';
import sequencer from '../lib/services/Sequencer';
import audioEngine from '../lib/services/AudioEngine';
import midiService from '../lib/services/MIDIService';

interface TransportControlsProps {
  className?: string;
  isPlaying?: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
  showRecord?: boolean;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  showResetButton?: boolean;
  showSaveButton?: boolean;
  showMIDISync?: boolean;
}

const TransportControls: React.FC<TransportControlsProps> = ({
  className = '',
  isPlaying: externalIsPlaying,
  onPlayPause,
  showRecord = false,
  tempo: externalTempo = 120,
  onTempoChange,
  volume: externalVolume = 75,
  onVolumeChange,
  showResetButton = false,
  showSaveButton = false,
  showMIDISync = true,
}) => {
  // Use local state that syncs with external props
  // Korrigierte Zeile: Entfernung des Aufrufs von sequencer.getIsPlaying()
  const [isPlaying, setIsPlaying] = useState<boolean>(externalIsPlaying || false);
  const [tempo, setTempo] = useState<number>(externalTempo);
  const [volume, setVolume] = useState<number>(externalVolume);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isMIDIClockEnabled, setIsMIDIClockEnabled] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  // Keep local state in sync with external props
  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (externalTempo !== undefined) {
      setTempo(externalTempo);
      // Wir überprüfen, ob sequencer definiert ist, bevor wir darauf zugreifen
      if (sequencer && typeof sequencer.setBpm === 'function') {
        sequencer.setBpm(externalTempo);
      }
    }
  }, [externalTempo]);

  useEffect(() => {
    if (externalVolume !== undefined) {
      setVolume(externalVolume);
      // Wir überprüfen, ob audioEngine definiert ist, bevor wir darauf zugreifen
      if (audioEngine && typeof audioEngine.setMasterVolume === 'function') {
        audioEngine.setMasterVolume(externalVolume);
      }
    }
  }, [externalVolume]);

  // Set up event listeners for the sequencer
  useEffect(() => {
    // Wir überprüfen, ob sequencer definiert ist
    if (!sequencer) return;

    // Listen for step changes
    if (typeof sequencer.on === 'function') {
      sequencer.on('step', (step) => {
        setCurrentStep(step);
      });

      // Listen for play state changes
      sequencer.on('playStateChange', (playing) => {
        setIsPlaying(playing);
        if (onPlayPause) onPlayPause(playing);
      });

      // Clean up listeners when component unmounts
      return () => {
        if (sequencer && typeof sequencer.clearListeners === 'function') {
          sequencer.clearListeners();
        }
      };
    }
  }, [onPlayPause]);

  // Set up MIDI clock handling
  useEffect(() => {
    if (!isMIDIClockEnabled || !midiService) return;

    let clockCount = 0;
    const ticksPerStep = 6; // 24 PPQN for MIDI clock, 16th notes = 6 ticks
    const handleMidiMessage = (event: any) => {
      if (event.type === 'clock') {
        clockCount++;
        if (clockCount >= ticksPerStep) {
          clockCount = 0;
          // Advance sequencer manually
          setCurrentStep(prev => (prev + 1) % 16);
        }
      } else if (event.type === 'start') {
        // Reset on MIDI start
        clockCount = 0;
        setCurrentStep(-1);
        setIsPlaying(true);
      } else if (event.type === 'stop') {
        setIsPlaying(false);
      }
    };

    if (typeof midiService.addEventListener === 'function') {
      midiService.addEventListener(handleMidiMessage);

      return () => {
        if (midiService && typeof midiService.removeEventListener === 'function') {
          midiService.removeEventListener(handleMidiMessage);
        }
      };
    }
  }, [isMIDIClockEnabled]);

  // Handle play/pause button click
  const handlePlayPause = () => {
    const newIsPlaying = !isPlaying;
    
    if (!isMIDIClockEnabled && sequencer && typeof sequencer.togglePlay === 'function') {
      // Only control internal sequencer if not slaved to MIDI clock
      sequencer.togglePlay();
    }
    
    setIsPlaying(newIsPlaying);
    if (onPlayPause) onPlayPause(newIsPlaying);
  };

  // Handle record button click
  const handleRecord = () => {
    setIsRecording(!isRecording);
    // Additional record functionality would go here
  };

  // Handle tempo change
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    if (sequencer && typeof sequencer.setBpm === 'function') {
      sequencer.setBpm(newTempo);
    }
    if (onTempoChange) onTempoChange(newTempo);
  };

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioEngine && typeof audioEngine.setMasterVolume === 'function') {
      audioEngine.setMasterVolume(newVolume);
    }
    if (onVolumeChange) onVolumeChange(newVolume);
  };

  // Handle reset button click
  const handleReset = () => {
    if (sequencer && typeof sequencer.reset === 'function') {
      sequencer.reset();
    }
  };

  // Handle MIDI clock toggle
  const handleMIDIClockToggle = () => {
    const newMIDIClockEnabled = !isMIDIClockEnabled;
    setIsMIDIClockEnabled(newMIDIClockEnabled);
    
    if (newMIDIClockEnabled && sequencer && typeof sequencer.stop === 'function') {
      // Stop internal sequencer when using external clock
      sequencer.stop();
    }
  };

  return (
    <div className={`bg-zinc-800/50 rounded-lg px-4 py-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Transport controls */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePlayPause}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isPlaying
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </Button>
          
          {showRecord && (
            <Button
              onClick={handleRecord}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-zinc-700 hover:bg-red-600/70 text-zinc-300 hover:text-white'
              }`}
            >
              <i className="fa-solid fa-circle"></i>
            </Button>
          )}
          
          {showResetButton && (
            <Button
              onClick={handleReset}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white"
            >
              <i className="fa-solid fa-rotate-left"></i>
            </Button>
          )}
          
          {showSaveButton && (
            <Button
              onClick={() => console.log('Save pattern')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white"
            >
              <i className="fa-solid fa-save"></i>
            </Button>
          )}
        </div>
        
        {/* Step indicators */}
        <div className="flex items-center space-x-1">
          {Array.from({ length: 16 }).map((_, index) => (
            <LED
              key={index}
              active={currentStep === index}
              color="#8b5cf6"
              size="xs"
              pulse={currentStep === index}
            />
          ))}
        </div>
        
        {/* Tempo and volume controls */}
        <div className="flex items-center space-x-4">
          {/* Tempo control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">BPM</span>
            <Slider
              value={tempo}
              onChange={handleTempoChange}
              min={60}
              max={200}
              step={1}
              color="#8b5cf6"
              size="sm"
              showValue={false}
              className="w-24"
            />
            <span className="text-xs text-zinc-400 w-8">{tempo}</span>
          </div>
          
          {/* Volume control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">
              <i className="fa-solid fa-volume-high"></i>
            </span>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={100}
              color="#8b5cf6"
              size="sm"
              showValue={false}
              className="w-24"
            />
            <span className="text-xs text-zinc-400 w-6">{volume}</span>
          </div>
          
          {/* MIDI clock sync toggle */}
          {showMIDISync && (
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={handleMIDIClockToggle}
            >
              <span className="text-sm text-zinc-400">MIDI Sync</span>
              <div 
                className={`w-10 h-5 rounded-full flex items-center ${
                  isMIDIClockEnabled ? 'bg-purple-600' : 'bg-zinc-700'
                } transition-colors cursor-pointer`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    isMIDIClockEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportControls;