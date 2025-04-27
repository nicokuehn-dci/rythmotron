import React from 'react';

interface SynthPadProps {
  id: number;
  active: boolean;
  type: string;
  velocity: number;
  tuning: number;
}

interface SynthPadGridProps {
  pads: SynthPadProps[];
  onTogglePad: (id: number) => void;
  currentStep?: number;
}

const SynthPadGrid: React.FC<SynthPadGridProps> = ({ pads, onTogglePad, currentStep = -1 }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {pads.map((pad) => (
        <div
          key={pad.id}
          className={`
            h-16 rounded border cursor-pointer transition-all
            ${pad.active ? 'bg-indigo-900/30 border-indigo-500' : 'bg-zinc-800 border-zinc-700'}
            ${pad.id === currentStep ? 'ring-2 ring-green-500' : ''}
            hover:bg-zinc-700
          `}
          onClick={() => onTogglePad(pad.id)}
        >
          <div className="h-full p-2 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className={`w-2 h-2 rounded-full ${pad.active ? 'bg-indigo-500' : 'bg-zinc-600'}`}></div>
              <span className="text-xs text-zinc-400">{pad.type}</span>
            </div>
            <div className="text-sm font-medium text-zinc-300 text-center">
              {pad.id + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SynthPadGrid;