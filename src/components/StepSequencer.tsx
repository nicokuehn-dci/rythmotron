import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import LED from '@/components/ui/led';

interface StepSequencerProps {
  steps: boolean[];
  onToggleStep: (index: number) => void;
  currentStep?: number;
  velocity?: number[];
  onChangeVelocity?: (index: number, value: number) => void;
  showVelocityControls?: boolean;
  isPlaying?: boolean;
  bpm?: number;
  className?: string;
}

export const StepSequencer: React.FC<StepSequencerProps> = ({
  steps,
  onToggleStep,
  currentStep = -1,
  velocity = Array(16).fill(100),
  onChangeVelocity,
  showVelocityControls = false,
  isPlaying = false,
  bpm = 120,
  className = '',
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [playInterval, setPlayInterval] = useState<NodeJS.Timeout | null>(null);

  // Sequencer playback logic
  useEffect(() => {
    if (isPlaying && !playInterval) {
      const intervalTime = (60 / bpm / 4) * 1000; // 16th notes
      const interval = setInterval(() => {
        setActiveStep(current => {
          const next = current >= steps.length - 1 ? 0 : current + 1;
          return next;
        });
      }, intervalTime);
      setPlayInterval(interval);
    } else if (!isPlaying && playInterval) {
      clearInterval(playInterval);
      setPlayInterval(null);
      setActiveStep(-1); // Reset current step when stopped
    }

    return () => {
      if (playInterval) {
        clearInterval(playInterval);
      }
    };
  }, [isPlaying, bpm, steps.length]);

  // Update activeStep when currentStep prop changes
  useEffect(() => {
    if (currentStep !== undefined) {
      setActiveStep(currentStep);
    }
  }, [currentStep]);

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-16 gap-1">
        {steps.map((active, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-xs text-zinc-500 mb-1">{index + 1}</div>
            <button
              className={`w-full aspect-square rounded transition-all ${
                active 
                  ? 'bg-purple-900/30 border-2 border-purple-500' 
                  : 'bg-zinc-800 border-2 border-zinc-700 hover:bg-zinc-700'
              }`}
              onClick={() => onToggleStep(index)}
            >
              <div className="flex justify-center items-center w-full h-full">
                <LED active={active} color="purple" size="sm" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                {activeStep === index && (
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
            </button>
            
            {showVelocityControls && (
              <div className="mt-2 w-full">
                <Slider
                  orientation="vertical"
                  className="h-20"
                  value={[velocity[index]]}
                  min={0}
                  max={127}
                  step={1}
                  onValueChange={(values) => {
                    if (onChangeVelocity) {
                      onChangeVelocity(index, values[0]);
                    }
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepSequencer;