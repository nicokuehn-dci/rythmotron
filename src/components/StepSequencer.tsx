import React from 'react';
import LED from './ui/led';

interface StepSequencerProps {
  steps: boolean[];
  onToggleStep: (index: number) => void;
  currentStep?: number;
  className?: string;
}

export const StepSequencer: React.FC<StepSequencerProps> = ({
  steps,
  onToggleStep,
  currentStep = -1,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-16 gap-1 ${className}`}>
      {steps.map((active, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="text-xs text-zinc-500 text-center mb-1">{index + 1}</div>
          <div
            className={`h-8 ${index % 4 === 0 ? 'border-zinc-600' : 'border-zinc-700'} ${active ? 'bg-purple-900/20 border-purple-500' : 'bg-zinc-800'} border rounded cursor-pointer hover:bg-zinc-700 transition-colors`}
            onClick={() => onToggleStep(index)}
          >
            <div className="h-full flex flex-col justify-between p-1">
              <div className="flex justify-between">
                <LED active={active} color="purple" size="xs" />
                <LED active={currentStep === index} color="green" size="xs" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepSequencer;