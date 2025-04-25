import React from 'react';

interface XYPadProps {
  value: { x: number; y: number };
  onChange: (value: { x: number; y: number }) => void;
  className?: string;
}

export const XYPad: React.FC<XYPadProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(((e.clientX - rect.left) / rect.width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.clientY - rect.top) / rect.height) * 100, 0), 100);
    onChange({ x, y });
  };

  return (
    <div
      className={`aspect-square bg-zinc-900 rounded-lg border border-zinc-700 relative cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseMove}
    >
      <div
        className="absolute w-4 h-4 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${value.x}%`, top: `${value.y}%` }}
      >
        <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
    </div>
  );
};

export default XYPad;