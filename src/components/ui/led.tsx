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
  const dimColor = color + '33'; // 20% opacity of the main color
  
  // Create the inner glow animation when pulsing
  const pulseAnimation = pulse ? 'animate-pulse' : '';
  
  return (
    <div 
      className={`led-enhanced relative rounded-full ${sizeMap[size]} ${className} ${pulseAnimation}`}
      style={{
        // Base container with inset shadow for the "socket"
        background: isOn ? 'transparent' : 'linear-gradient(145deg, #1a1a1a, #222)',
        boxShadow: isOn 
          ? 'none'
          : 'inset 1px 1px 2px rgba(0,0,0,0.7), inset -1px -1px 1px rgba(255,255,255,0.05)',
      }}
    >
      {/* LED housing with 3D effect */}
      <div 
        className="absolute inset-0 rounded-full enhanced-3d"
        style={{
          background: isOn 
            ? `radial-gradient(circle at 30% 30%, ${color}, ${color}cc 60%, ${color}80)`
            : `radial-gradient(circle at 30% 30%, ${offColor}, #1a1a1a)`,
          boxShadow: isOn
            ? `
                0 0 2px ${color}80,
                0 0 4px ${color}40,
                inset 0px 0px 1px rgba(255,255,255,0.6),
                inset 0px 1px 1px rgba(255,255,255,0.4)
              `
            : 'none',
          opacity: isOn ? 1 : 0.8,
          transition: 'all 0.15s ease'
        }}
      />
      
      {/* Light reflection effect */}
      <div 
        className="absolute rounded-full"
        style={{
          width: '50%',
          height: '50%',
          top: '15%',
          left: '15%',
          background: isOn
            ? 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
          opacity: isOn ? 0.7 : 0.2,
        }}
      />
      
      {/* Outer glow when turned on */}
      {isOn && (
        <div 
          className="absolute inset-0 rounded-full -z-10"
          style={{
            boxShadow: `0 0 6px ${color}80, 0 0 10px ${color}40, 0 0 15px ${color}20`,
            filter: 'blur(1px)',
          }}
        />
      )}
    </div>
  );
};

export default LED;