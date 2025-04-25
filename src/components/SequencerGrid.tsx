import React from 'react';
import LED from '@/components/ui/led';

export interface Track {
  name: string;
  color: string;
  icon: string;
  pattern: boolean[];
}

interface SequencerGridProps {
  tracks: Track[];
  steps: number;
  currentStep?: number;
  onToggleStep?: (trackIndex: number, stepIndex: number) => void;
  className?: string;
}

export const SequencerGrid: React.FC<SequencerGridProps> = ({
  tracks,
  steps = 16,
  currentStep = -1,
  onToggleStep,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-${steps} gap-1 mb-4 ${className}`}>
      {Array.from({ length: steps }).map((_, stepIndex) => (
        <div key={stepIndex} className="flex flex-col space-y-1">
          <div className="text-xs text-center text-zinc-500">{stepIndex + 1}</div>
          {tracks.map((track, trackIndex) => (
            <div
              key={`${trackIndex}-${stepIndex}`}
              className={`h-8 ${
                track.pattern[stepIndex]
                  ? `bg-${track.color}-900/30 border-${track.color}-500`
                  : 'bg-zinc-800 border-zinc-700'
              } border rounded cursor-pointer hover:bg-zinc-700 transition-colors`}
              onClick={() => onToggleStep && onToggleStep(trackIndex, stepIndex)}
            >
              <div className="h-full flex flex-col justify-between p-1">
                <div className="flex justify-between">
                  <LED active={track.pattern[stepIndex]} color={track.color} size="xs" />
                  <LED active={stepIndex === currentStep} color="green" size="xs" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SequencerGrid;