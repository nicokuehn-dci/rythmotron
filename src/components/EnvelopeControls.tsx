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
  title = "Envelope",
  color = "#4ade80",
  className = '',
}) => {
  return (
    <div className={`bg-zinc-900 rounded-xl p-6 border border-zinc-800 ${className}`}>
      <h3 className="text-sm text-zinc-400 mb-4">{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <Knob
            value={attack}
            onChange={onAttackChange}
            label="Attack"
            size="sm"
            color={color}
          />
        </div>
        <div>
          <Knob
            value={decay}
            onChange={onDecayChange}
            label="Decay"
            size="sm"
            color={color}
          />
        </div>
        <div>
          <Knob
            value={sustain}
            onChange={onSustainChange}
            label="Sustain"
            size="sm"
            color={color}
          />
        </div>
        <div>
          <Knob
            value={release}
            onChange={onReleaseChange}
            label="Release"
            size="sm"
            color={color}
          />
        </div>
      </div>
      
      {/* ADSR Visualization */}
      <div className="mt-6 h-24 w-full bg-zinc-800/50 rounded-lg overflow-hidden p-2 border border-zinc-700">
        <svg 
          viewBox="0 0 100 50" 
          className="w-full h-full" 
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line x1="0" y1="50" x2="100" y2="50" stroke="#3f3f46" strokeWidth="0.5" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="#3f3f46" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="0" x2="100" y2="0" stroke="#3f3f46" strokeWidth="0.5" />
          
          {/* ADSR Path */}
          <path
            d={`
              M 0,50 
              L ${attack * 25},0 
              L ${attack * 25 + decay * 15},${50 - sustain * 45} 
              L ${100 - release * 25},${50 - sustain * 45} 
              L 100,50
            `}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Control points */}
          <circle cx={attack * 25} cy={0} r="2" fill={color} />
          <circle cx={attack * 25 + decay * 15} cy={50 - sustain * 45} r="2" fill={color} />
          <circle cx={100 - release * 25} cy={50 - sustain * 45} r="2" fill={color} />
          
          {/* Text labels */}
          <text x="2" y="48" fontSize="6" fill="#a1a1aa">0</text>
          <text x="96" y="48" fontSize="6" fill="#a1a1aa">t</text>
        </svg>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-4 text-xs text-center text-zinc-500">
        <div>A: {Math.round(attack * 1000)}ms</div>
        <div>D: {Math.round(decay * 1000)}ms</div>
        <div>S: {Math.round(sustain * 100)}%</div>
        <div>R: {Math.round(release * 1000)}ms</div>
      </div>
    </div>
  );
};

export default EnvelopeControls;