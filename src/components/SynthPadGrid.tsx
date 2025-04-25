import React from 'react';
import LED from '@/components/ui/led';

interface PadData {
  id: number;
  active: boolean;
  type: string;
  velocity: number;
  tuning: number;
}

interface SynthPadGridProps {
  pads: PadData[];
  onTogglePad: (id: number) => void;
  currentStep?: number;
  className?: string;
}

export const SynthPadGrid: React.FC<SynthPadGridProps> = ({
  pads,
  onTogglePad,
  currentStep = -1,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-4 gap-4 ${className}`}>
      {pads.map((pad) => (
        <div
          key={pad.id}
          className={`aspect-square bg-zinc-800 rounded-lg border-2 ${
            pad.active ? 'border-purple-500 bg-purple-900/20' : 'border-zinc-700'
          } p-2 cursor-pointer transition-all duration-200 hover:border-purple-400 relative group`}
          onClick={() => onTogglePad(pad.id)}
        >
          <div className="flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-xs text-zinc-500">PAD {pad.id + 1}</span>
                <span className="text-[10px] text-zinc-600">{pad.type}</span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <LED active={pad.active} color="purple" />
                <LED active={pad.id === currentStep} color="green" size="xs" />
              </div>
            </div>
            <div className="text-center text-2xl text-zinc-400 relative">
              <i className="fa-solid fa-drum"></i>
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
            <div className="flex justify-between items-end">
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-zinc-600">VEL</span>
                <span className="text-xs text-zinc-400">{pad.velocity}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-zinc-600">TUNE</span>
                <span className="text-xs text-zinc-400">{pad.tuning}</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>
      ))}
    </div>
  );
};

export default SynthPadGrid;