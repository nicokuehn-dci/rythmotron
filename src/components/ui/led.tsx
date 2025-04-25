import React from 'react';

interface LEDProps {
  active?: boolean;
  on?: boolean;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  className?: string;
}

const LED: React.FC<LEDProps> = ({
  active = false,
  on = false,
  color = '#42dcdb', // Default teal color
  size = 'md',
  pulse = false,
  className = '',
}) => {
  // Support both active and on props for compatibility
  const isOn = active || on;
  
  // Size mappings
  const sizeMap = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  // Calculate colors based on state
  const offColor = '#232323';
  
  // Create the inner glow animation when pulsing
  const pulseAnimation = pulse ? 'animate-pulse' : '';
  
  return (
    <div 
      className={`led-enhanced relative rounded-full ${sizeMap[size]} ${className} ${pulseAnimation}`}
      style={{
        // Flat background without gradient
        background: isOn ? color : offColor,
        // No shadow
        transition: 'all 0.15s ease'
      }}
    />
  );
};

export default LED;