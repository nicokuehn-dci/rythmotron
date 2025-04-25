import React from 'react';
import LED from './led';

interface DrumSoundProps {
  name: string;
  category?: string;
  color: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
}

export const DrumPad: React.FC<DrumSoundProps> = ({
  name,
  category,
  color,
  icon = 'fa-drum',
  active = false,
  onClick,
}) => {
  return (
    <div
      className={`aspect-square bg-zinc-800 rounded-lg border border-${color}-500/50 p-2 cursor-pointer hover:bg-${color}-900/20 transition-colors`}
      onClick={onClick}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-xs text-zinc-400">{name}</span>
          <LED active={active} color={color} />
        </div>
        <div className="text-center">
          <i className={`fa-solid ${icon} text-${color}-400 text-xl`}></i>
        </div>
        {category && (
          <div className="text-center">
            <span className="text-[10px] text-zinc-500">{category}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrumPad;