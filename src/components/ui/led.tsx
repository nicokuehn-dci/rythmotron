import React from 'react';

interface LEDProps {
  active: boolean;
  color?: 'green' | 'red' | 'blue' | 'purple';
  size?: 'xs' | 'sm' | 'md';
}

export const LED: React.FC<LEDProps> = ({ 
  active, 
  color = 'green', 
  size = 'sm' 
}) => {
  const ledSize = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
  }[size];
  
  const ledColor = {
    green: active ? 'bg-green-400 shadow-green-400/50' : 'bg-green-900/30',
    red: active ? 'bg-red-400 shadow-red-400/50' : 'bg-red-900/30',
    blue: active ? 'bg-blue-400 shadow-blue-400/50' : 'bg-blue-900/30',
    purple: active ? 'bg-purple-400 shadow-purple-400/50' : 'bg-purple-900/30',
  }[color];
  
  return (
    <div 
      className={`${ledSize} rounded-full ${ledColor} ${active ? 'shadow-lg' : ''} transition-all duration-200`} 
    />
  );
};

export default LED;