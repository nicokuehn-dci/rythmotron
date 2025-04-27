import React, { useEffect, useState } from 'react';
import LED from './ui/led';
import { Button } from './ui/button';
import sequencer, { SequencerPattern, SequencerTrack } from '../lib/services/Sequencer';

interface SequencerGridProps {
  className?: string;
  patternId?: string;
  onStepChange?: (trackId: number, stepIndex: number, active: boolean) => void;
}

const SequencerGrid: React.FC<SequencerGridProps> = ({
  className = '',
  patternId = 'default',
  onStepChange,
}) => {
  const [pattern, setPattern] = useState<SequencerPattern | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [selectedTrack, setSelectedTrack] = useState<number>(0);

  // Load pattern data on component mount or when patternId changes
  useEffect(() => {
    const loadedPattern = sequencer.getPattern(patternId);
    if (loadedPattern) {
      setPattern(loadedPattern);
    } else {
      // Create a default pattern if one with the specified ID doesn't exist
      sequencer.createPattern(patternId, 'New Pattern');
      setPattern(sequencer.getPattern(patternId));
    }
    
    // Set current pattern as active in sequencer
    sequencer.setCurrentPattern(patternId);
  }, [patternId]);

  // Set up event listeners for the sequencer
  useEffect(() => {
    // Listen for step changes
    const handleStepChange = (step: number) => {
      setCurrentStep(step);
    };
    
    sequencer.on('step', handleStepChange);

    // Clean up listeners when component unmounts
    return () => {
      sequencer.off('step', handleStepChange);
    };
  }, []);

  // Handle step toggle
  const handleStepToggle = (trackId: number, stepIndex: number) => {
    if (!pattern) return;
    
    // Find track in pattern
    const track = pattern.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Get current state
    const currentActive = track.steps[stepIndex].active;
    
    // Toggle step state
    sequencer.setStep(trackId, stepIndex, !currentActive);
    
    // Update local state to reflect change
    setPattern(sequencer.getPattern(patternId) || null);
    
    // Call external handler if provided
    if (onStepChange) {
      onStepChange(trackId, stepIndex, !currentActive);
    }
  };
  
  // Handle track mute toggle
  const handleMuteToggle = (trackId: number) => {
    sequencer.toggleMute(trackId);
    setPattern(sequencer.getPattern(patternId) || null);
  };
  
  // Handle track solo toggle
  const handleSoloToggle = (trackId: number) => {
    sequencer.toggleSolo(trackId);
    setPattern(sequencer.getPattern(patternId) || null);
  };

  // Helper function to get color for track
  const getTrackColor = (trackName: string): string => {
    const colors: Record<string, string> = {
      'Kick': '#9333ea', // purple
      'Snare': '#6366f1', // indigo
      'HiHat': '#10b981', // emerald
      'Clap': '#f97316', // orange
      'Tom1': '#f43f5e', // rose
      'Tom2': '#ec4899', // pink
      'Crash': '#0ea5e9', // blue
      'Perc': '#eab308', // yellow
    };
    
    // Return color if found, otherwise default to gray
    return colors[trackName] || '#94a3b8';
  };

  // Handle track selection
  const handleTrackSelect = (trackId: number) => {
    setSelectedTrack(trackId);
  };

  // Generate demo pattern with common drum rhythms
  const handleGenerateDemo = () => {
    if (!pattern) return;
    
    // Basic 4/4 pattern
    pattern.tracks.forEach(track => {
      // Clear existing steps
      track.steps.forEach(step => step.active = false);
      
      // Set default patterns based on track name
      switch(track.name) {
        case 'Kick':
          // Kick on beats 1 and 3
          track.steps[0].active = true;
          track.steps[8].active = true;
          break;
        case 'Snare':
          // Snare on beats 2 and 4
          track.steps[4].active = true;
          track.steps[12].active = true;
          break;
        case 'HiHat':
          // HiHat on every 8th note
          for (let i = 0; i < 16; i += 2) {
            track.steps[i].active = true;
          }
          break;
        case 'Clap':
          // Clap reinforcing snare
          track.steps[4].active = true;
          track.steps[12].active = true;
          break;
        case 'Tom1':
          // Fill at end of bar
          track.steps[13].active = true;
          track.steps[14].active = true;
          break;
        case 'Crash':
          // Crash on beat 1
          track.steps[0].active = true;
          break;
      }
    });
    
    // Update pattern in sequencer and component state
    setPattern({...pattern});
  };

  // Clear all steps
  const handleClearAll = () => {
    if (!pattern) return;
    
    // Clear all steps
    pattern.tracks.forEach(track => {
      track.steps.forEach(step => step.active = false);
    });
    
    // Update pattern in sequencer and component state
    setPattern({...pattern});
  };

  if (!pattern) {
    return <div className="text-center py-4 text-zinc-400">Loading pattern...</div>;
  }

  return (
    <div className={`bg-zinc-900 border border-zinc-800 rounded-xl ${className}`}>
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="text-lg font-medium text-zinc-300">{pattern.name}</div>
          <div className="flex gap-2">
            <Button 
              onClick={handleGenerateDemo}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Demo Pattern
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              size="sm"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              Clear All
            </Button>
          </div>
        </div>

        {/* Track headers row */}
        <div className="grid grid-cols-[200px_1fr] gap-2">
          <div className="text-sm text-zinc-500 font-medium">Track</div>
          <div className="grid grid-cols-16 gap-1">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i} className="text-xs text-center text-zinc-500">{i + 1}</div>
            ))}
          </div>
        </div>

        {/* Tracks and steps */}
        {pattern.tracks.map((track) => (
          <div 
            key={track.id}
            className={`grid grid-cols-[200px_1fr] gap-2 items-center ${
              selectedTrack === track.id ? 'bg-zinc-800/50 rounded-md' : ''
            }`}
            onClick={() => handleTrackSelect(track.id)}
          >
            {/* Track info */}
            <div className="flex items-center gap-2 p-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getTrackColor(track.name) }}
              ></div>
              <div className="text-sm text-zinc-300 font-medium flex-grow">{track.name}</div>
              <div className="flex gap-1">
                <button
                  className={`w-6 h-6 flex items-center justify-center rounded ${
                    track.mute ? 'bg-yellow-600 text-white' : 'bg-zinc-700 text-zinc-400'
                  } text-xs`}
                  onClick={(e) => { e.stopPropagation(); handleMuteToggle(track.id); }}
                >
                  M
                </button>
                <button
                  className={`w-6 h-6 flex items-center justify-center rounded ${
                    track.solo ? 'bg-green-600 text-white' : 'bg-zinc-700 text-zinc-400'
                  } text-xs`}
                  onClick={(e) => { e.stopPropagation(); handleSoloToggle(track.id); }}
                >
                  S
                </button>
              </div>
            </div>

            {/* Step pads */}
            <div className="grid grid-cols-16 gap-1">
              {track.steps.map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className={`h-8 rounded-sm cursor-pointer flex items-center justify-center ${
                    step.active 
                      ? `bg-opacity-30 bg-${getTrackColor(track.name)}-500 border border-${getTrackColor(track.name)}-500` 
                      : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                  } ${currentStep === stepIndex ? 'ring-1 ring-white ring-opacity-50' : ''}`}
                  onClick={() => handleStepToggle(track.id, stepIndex)}
                >
                  {step.active && (
                    <div className="w-2 h-2 rounded-full bg-white bg-opacity-70"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SequencerGrid;