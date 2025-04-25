import React, { useState } from 'react';
import withErrorBoundary from './withErrorBoundary';

interface PadProps {
  active?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const PadBase: React.FC<PadProps> = ({
  active = false,
  color = '#42dcdb',
  size = 'md',
  children,
  onClick,
  className = '',
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  // Size mapping
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };
  
  // Handle interaction
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);
  
  const handleClick = () => {
    if (onClick) onClick();
  };
  
  // Visual state
  const isActive = active || isPressed;
  
  // Calculate colors based on active state
  const backgroundColor = isActive 
    ? `${color}30` 
    : 'rgba(30, 30, 30, 0.8)';
  
  const borderColor = isActive 
    ? color 
    : 'rgba(70, 70, 70, 0.5)';
    
  const textColor = isActive 
    ? color 
    : '#aaaaaa';
    
  const shadowColor = isActive 
    ? color 
    : '#000000';
  
  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className={`
        relative ${sizeMap[size]} rounded-md
        flex items-center justify-center
        transition-all duration-75
        ${isActive ? 'transform translate-y-0.5' : ''}
        ${className}
      `}
      style={{
        background: `linear-gradient(145deg, ${
          isActive ? 'rgba(30, 30, 30, 0.9)' : 'rgba(40, 40, 40, 0.9)'
        }, ${
          isActive ? 'rgba(20, 20, 20, 0.9)' : 'rgba(25, 25, 25, 0.9)'
        })`,
        border: `1px solid ${isActive ? borderColor : 'rgba(50, 50, 50, 0.5)'}`,
        boxShadow: isActive
          ? `inset 3px 3px 6px rgba(0, 0, 0, 0.5), 
             inset -2px -2px 5px rgba(60, 60, 60, 0.2),
             0 0 10px ${shadowColor}40`
          : `3px 3px 6px rgba(0, 0, 0, 0.4), 
             -1px -1px 3px rgba(60, 60, 60, 0.1),
             inset 1px 1px 1px rgba(70, 70, 70, 0.1)`,
      }}
    >
      {/* Base inner content */}
      <div 
        className={`text-center transition-colors duration-75 relative z-10`}
        style={{ 
          color: textColor,
          textShadow: isActive ? `0 0 5px ${color}80` : 'none',
        }}
      >
        {children}
      </div>
      
      {/* 3D Lighting effects */}
      <div className="absolute inset-0 pointer-events-none rounded-md overflow-hidden">
        {/* Top reflection */}
        <div 
          className="absolute inset-x-0 top-0 h-1/3 opacity-30"
          style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), transparent)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            opacity: isActive ? 0.2 : 0.15
          }}
        />
        
        {/* Bottom shadow */}
        <div 
          className="absolute inset-x-0 bottom-0 h-1/4 opacity-40"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            borderBottomLeftRadius: 'inherit',
            borderBottomRightRadius: 'inherit'
          }}
        />
        
        {/* Left shadow */}
        <div 
          className="absolute inset-y-0 left-0 w-1/4 opacity-20"
          style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent)',
            borderTopLeftRadius: 'inherit',
            borderBottomLeftRadius: 'inherit'
          }}
        />
        
        {/* Active inner glow */}
        {isActive && (
          <div 
            className="absolute inset-0 rounded-md"
            style={{
              background: backgroundColor,
              boxShadow: `inset 0 0 15px ${color}60`,
              opacity: 0.6
            }}
          />
        )}
      </div>
      
      {/* Interactive lighting effect on hover */}
      <div 
        className="absolute inset-0 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}10, transparent 70%)`,
          mixBlendMode: 'overlay'
        }}
      />
      
      {/* Active indicator glow */}
      {isActive && (
        <div 
          className="absolute -inset-0.5 rounded-md pointer-events-none opacity-50"
          style={{
            boxShadow: `0 0 8px ${color}`,
            filter: 'blur(2px)'
          }}
        />
      )}
    </button>
  );
};

// Add error handling
const Pad = withErrorBoundary(PadBase, 'Pad');
export default Pad;