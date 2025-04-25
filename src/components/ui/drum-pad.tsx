import React, { useState, useEffect } from 'react';
import LED from './led';
import withErrorBoundary from './withErrorBoundary';

interface DrumPadProps {
  color?: string;
  activeColor?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string;
  category?: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
  velocity?: number;
}

const DrumPadBase: React.FC<DrumPadProps> = ({
  color = '#42dcdb',
  activeColor = '#10b981',
  size = 'md',
  name = '',
  category = '',
  icon = 'fa-drum',
  onClick,
  className = '',
  velocity = 100
}) => {
  const [isActive, setIsActive] = useState(false);
  const [animationIntensity, setAnimationIntensity] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // Size mapping
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };
  
  // Function to handle click with visual feedback
  const handleClick = () => {
    setIsActive(true);
    setAnimationIntensity(1);
    
    // Trigger the callback
    if (onClick) onClick();
    
    // Reset active state after a short delay
    setTimeout(() => {
      setIsActive(false);
    }, 150);
    
    // Create decay animation for the intensity
    const decay = () => {
      setAnimationIntensity((prev) => {
        const newValue = prev * 0.85; // Faster decay for more responsive feel
        if (newValue < 0.01) return 0;
        requestAnimationFrame(decay);
        return newValue;
      });
    };
    
    requestAnimationFrame(decay);
  };
  
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative ${sizeMap[size]} rounded-xl
          flex flex-col items-center justify-center
          transition-all duration-100
          ${isActive ? 'transform scale-95' : isHovered ? 'transform scale-[1.02]' : ''}
        `}
        style={{
          background: isActive 
            ? `linear-gradient(145deg, rgba(20, 20, 20, 0.95), rgba(12, 12, 12, 0.9))`
            : `linear-gradient(145deg, rgba(40, 40, 40, 0.9), rgba(25, 25, 25, 0.9))`,
          border: `1px solid ${isActive ? color : isHovered ? 'rgba(80, 80, 80, 0.7)' : 'rgba(60, 60, 60, 0.5)'}`,
          boxShadow: isActive
            ? `inset 3px 3px 10px rgba(0, 0, 0, 0.7), 
               inset -1px -1px 4px rgba(80, 80, 80, 0.2),
               0 0 12px ${color}60`
            : isHovered
            ? `4px 4px 10px rgba(0, 0, 0, 0.6), 
               -2px -2px 6px rgba(80, 80, 80, 0.15),
               0 0 3px rgba(255, 255, 255, 0.05),
               inset 1px 1px 1px rgba(50, 50, 50, 0.2)`
            : `3px 3px 8px rgba(0, 0, 0, 0.5), 
               -1px -1px 4px rgba(80, 80, 80, 0.1),
               inset 1px 1px 1px rgba(50, 50, 50, 0.1)`
        }}
      >
        {/* LED indicator with enhanced 3D look */}
        <div className="absolute top-1.5 right-1.5" style={{
          filter: isActive ? 'drop-shadow(0 0 3px ${color})' : 'none'
        }}>
          <LED 
            active={isActive} 
            color={color}
            size="sm"
          />
        </div>
        
        {/* Icon */}
        <div 
          className="text-xl mb-1"
          style={{ 
            color: isActive ? color : isHovered ? '#aaa' : '#888',
            textShadow: isActive ? `0 0 8px ${color}` : isHovered ? '0 0 2px rgba(255,255,255,0.2)' : 'none',
            transition: 'all 0.1s ease',
            transform: isActive ? 'translateY(1px)' : 'none'
          }}
        >
          <i className={`fas ${icon}`}></i>
        </div>
        
        {/* Sound name */}
        <div className="text-xs font-medium" style={{ 
          color: isActive ? color : isHovered ? '#bbb' : '#aaa',
          textShadow: isActive ? `0 0 5px ${color}80` : isHovered ? '0 0 2px rgba(255,255,255,0.1)' : 'none',
          transform: isActive ? 'translateY(1px)' : 'none'
        }}>
          {name}
        </div>
        
        {/* Enhanced 3D effects */}
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          {/* Top reflection - enhanced */}
          <div 
            className="absolute inset-x-0 top-0 h-1/3"
            style={{
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
              opacity: isActive ? 0.07 : 0.15,
              transform: isActive ? 'translateY(1px)' : 'none'
            }}
          />
          
          {/* Bottom shadow */}
          <div 
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent)',
              borderBottomLeftRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
              opacity: isActive ? 0.8 : 0.6
            }}
          />
          
          {/* Left edge lighting */}
          <div 
            className="absolute inset-y-2 left-0 w-[2px]"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.05), transparent)',
              opacity: isActive ? 0.05 : 0.1
            }}
          />
          
          {/* Visual pressure feedback - enhanced ripple effect */}
          <div 
            className="absolute inset-0 rounded-xl transition-all duration-200 pointer-events-none"
            style={{ 
              opacity: animationIntensity * 0.9,
              background: `radial-gradient(circle at center, ${color}70 0%, transparent 80%)`,
              transform: `scale(${1 + animationIntensity * 0.15})`,
              filter: `blur(${animationIntensity * 2}px)`
            }}
          />
          
          {/* Embossed button effect - enhanced */}
          <div 
            className="absolute inset-0 rounded-xl"
            style={{
              boxShadow: isActive
                ? 'inset 0 4px 8px rgba(0,0,0,0.5), inset 0 2px 2px rgba(0,0,0,0.8)'
                : 'inset 0 -2px 3px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
              opacity: 0.6
            }}
          />
        </div>
        
        {/* Enhanced active glow effect */}
        <div 
          className="absolute -inset-1 rounded-xl pointer-events-none transition-opacity duration-200"
          style={{
            boxShadow: `0 0 15px ${color}${isActive ? 'aa' : '20'}`,
            filter: 'blur(2px)',
            opacity: isActive ? 0.7 : isHovered ? 0.2 : 0
          }}
        />
        
        {/* Press effect - subtle circular shadow */}
        {isActive && (
          <div 
            className="absolute inset-2 rounded-full pointer-events-none"
            style={{
              boxShadow: 'inset 0 3px 5px rgba(0,0,0,0.7)',
              opacity: 0.6
            }}
          />
        )}
      </button>
      
      {/* Velocity indicator - enhanced with more 3D inset look */}
      <div className="mt-2 w-full bg-zinc-900/70 h-1.5 rounded-full overflow-hidden" style={{
        boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.7), inset -1px -1px 1px rgba(255,255,255,0.05)',
        border: '1px solid rgba(0,0,0,0.5)',
      }}>
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: `${velocity}%`,
            background: `linear-gradient(to right, ${color}40, ${color})`,
            boxShadow: `0 0 4px ${color}70`,
          }}
        />
      </div>
      
      {/* Category label */}
      {category && (
        <div className="mt-1 text-[10px] text-zinc-500">{category}</div>
      )}
    </div>
  );
};

// Add error boundary
const DrumPad = withErrorBoundary(DrumPadBase, 'DrumPad');
export default DrumPad;