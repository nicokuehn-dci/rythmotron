import React from 'react';
import Knob from '@/components/KnobWrapper';

interface EnvelopeControlsProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  title?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EnvelopeControls: React.FC<EnvelopeControlsProps> = ({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  title = 'Track Parameters',
  color = '#4ade80',
  size = 'sm',
  className = '',
}) => {
  return (
    <div className={className}>
      <h3 className="text-sm text-zinc-400 mb-4">{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Knob
            value={attack}
            onChange={onAttackChange}
            label="Attack"
            size={size}
            color={color}
          />
        </div>
        <div>
          <Knob
            value={decay}
            onChange={onDecayChange}
            label="Decay"
            size={size}
            color={color}
          />
        </div>
        <div>
          <Knob
            value={sustain}
            onChange={onSustainChange}
            label="Sustain"
            size={size}
            color={color}
          />
        </div>
        <div>
          <Knob
            value={release}
            onChange={onReleaseChange}
            label="Release"
            size={size}
            color={color}
          />
        </div>
      </div>
    </div>
  );
};

export default EnvelopeControls;