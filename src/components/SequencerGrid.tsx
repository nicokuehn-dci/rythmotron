import React from 'react';
import LED from '@/components/ui/led';

export interface Track {
  id: string | number;
  name: string;
  steps: boolean[];
  color?: string;
}

interface SequencerGridProps {
  tracks: Track[];
  currentStep?: number;
  onToggleStep: (trackId: string | number, stepIndex: number) => void;
  showTrackLabels?: boolean;
  isPlaying?: boolean;
  className?: string;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  tracks,
  currentStep = -1,
  onToggleStep,
  showTrackLabels = true,
  isPlaying = false,
  className = '',
}) => {
  // Calculate number of steps from the first track
  const numSteps = tracks.length > 0 ? tracks[0].steps.length : 16;
  
  // Create step header (1-16 numbers)
  const renderStepNumbers = () => {
    return (
      <div className="grid grid-cols-16 gap-1 mb-2">
        {Array.from({ length: numSteps }).map((_, index) => (
          <div key={`step-${index}`} className="text-center">
            <span className="text-xs text-zinc-500">{index + 1}</span>
          </div>
        ))}
      </div>
    );
  };

  // Create track row with steps
  const renderTrackRow = (track: Track, trackIndex: number) => {
    const trackColor = track.color || getDefaultTrackColor(trackIndex);
    
    return (
      <div key={track.id} className="flex items-center mb-2">
        {showTrackLabels && (
          <div className="w-24 mr-2 truncate">
            <span className="text-xs text-zinc-300 font-medium">{track.name}</span>
          </div>
        )}
        
        <div className={`grid grid-cols-${numSteps} gap-1 flex-grow`}>
          {track.steps.map((active, stepIndex) => (
            <div 
              key={`track-${track.id}-step-${stepIndex}`}
              className={`
                aspect-square relative overflow-hidden
                ${currentStep === stepIndex ? 'bg-zinc-700' : 'bg-zinc-800'}
                border ${active ? `border-${trackColor}-500/70` : 'border-zinc-700'}
                rounded-sm transition-colors cursor-pointer hover:bg-zinc-700
              `}
              onClick={() => onToggleStep(track.id, stepIndex)}
            >
              <div className="flex justify-center items-center w-full h-full">
                {active && (
                  <LED 
                    active={active} 
                    color={getColorName(trackColor)} 
                    size="sm" 
                    pulse={isPlaying && currentStep === stepIndex && active} 
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Helper function to get color name for LED component from hex/tailwind color
  const getColorName = (color: string): "red" | "green" | "blue" | "yellow" | "purple" | "pink" => {
    const colorMap: Record<string, "red" | "green" | "blue" | "yellow" | "purple" | "pink"> = {
      'red': 'red',
      'green': 'green',
      'blue': 'blue', 
      'yellow': 'yellow',
      'purple': 'purple',
      'pink': 'pink',
    };
    
    // Try to extract color name from tailwind class
    for (const [name, value] of Object.entries(colorMap)) {
      if (color.includes(name)) {
        return value;
      }
    }
    
    // Default color
    return 'purple';
  };

  // Helper to generate default track colors based on index
  const getDefaultTrackColor = (index: number): string => {
    const colors = ['purple', 'pink', 'blue', 'green', 'yellow', 'red'];
    return colors[index % colors.length];
  };

  return (
    <div className={`${className}`}>
      {renderStepNumbers()}
      {tracks.map((track, index) => renderTrackRow(track, index))}
      
      {/* Current step indicator */}
      {isPlaying && currentStep >= 0 && (
        <div className="grid grid-cols-16 gap-1 mt-1">
          {Array.from({ length: numSteps }).map((_, stepIndex) => (
            <div key={`indicator-${stepIndex}`} className="h-1">
              {stepIndex === currentStep && (
                <div className="h-full w-full bg-green-500 rounded-full animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SequencerGrid;