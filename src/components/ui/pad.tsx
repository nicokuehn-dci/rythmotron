import React from 'react';

interface PadProps {
  active: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Pad: React.FC<PadProps> = ({
  active,
  onClick,
  size = 'md',
  className = '',
}) => {
  const padSize = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size];

  return (
    <div
      className={`${padSize} ${className} rounded-md relative cursor-pointer transition-all duration-200 ${active ? 'bg-purple-900/50' : 'bg-zinc-800'}`}
      onClick={onClick}
    >
      <div className={`absolute inset-0 rounded-md ${active ? 'bg-purple-500/20' : 'bg-transparent'} shadow-lg border border-zinc-700`}>
        <div className={`absolute inset-0 flex items-center justify-center ${active ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
          <div className={`w-3 h-3 rounded-full ${active ? 'bg-purple-400' : 'bg-transparent'} shadow-lg shadow-purple-500/50`} />
        </div>
      </div>
    </div>
  );
};

export default Pad;