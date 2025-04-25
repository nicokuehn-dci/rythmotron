import * as React from "react"
import { useState, useRef, useEffect } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | '3d' | 'premium' | 'vintage';
  size?: 'default' | 'sm' | 'lg';
  glowColor?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default',
  glowColor = "#9d4dfa",
  className = '',
  children,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [rippleEffect, setRippleEffect] = useState<{x: number, y: number, visible: boolean}>({ x: 0, y: 0, visible: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Add shimmering effect for premium buttons
  const [shimmerActive, setShimmerActive] = useState(false);
  
  useEffect(() => {
    let shimmerInterval: NodeJS.Timeout;
    
    if (variant === 'premium' && isHovered) {
      shimmerInterval = setInterval(() => {
        setShimmerActive(true);
        setTimeout(() => setShimmerActive(false), 1500);
      }, 3000);
    }
    
    return () => {
      if (shimmerInterval) clearInterval(shimmerInterval);
    };
  }, [variant, isHovered]);
  
  const baseStyles = "font-medium rounded-md focus:outline-none transition-all relative overflow-hidden"
  const variantStyles = {
    default: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md",
    outline: "bg-transparent border border-current hover:bg-zinc-100 dark:hover:bg-zinc-800 text-current shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-current shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:translate-y-0",
    '3d': "button-3d bg-gradient-to-b from-zinc-800 to-zinc-900 border border-zinc-700 text-zinc-300 hover:from-zinc-700 hover:to-zinc-800 rounded-button",
    premium: "button-premium text-zinc-200 rounded-button",
    vintage: "button-vintage text-amber-100 rounded-button"
  }
  const sizeStyles = {
    default: "py-2 px-4 text-sm",
    sm: "py-1 px-3 text-xs",
    lg: "py-3 px-6 text-base",
  }
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`
  
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsActive(false);
  };
  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsActive(true);
    
    // Create ripple effect
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setRippleEffect({x, y, visible: true});
      
      setTimeout(() => {
        setRippleEffect(prev => ({...prev, visible: false}));
      }, 800); // Match the animation duration
    }
  };
  const handleMouseUp = () => setIsActive(false);
  
  // Get the button style based on variant and state
  const getButtonStyle = () => {
    switch(variant) {
      case 'premium':
        return {
          background: isActive 
            ? "linear-gradient(145deg, #1a1a1a, #262626)" 
            : isHovered
            ? "linear-gradient(145deg, #2a2a2a, #202020)"
            : "linear-gradient(145deg, #252525, #1d1d1d)",
          boxShadow: isActive 
            ? `inset 2px 2px 5px rgba(0, 0, 0, 0.7), inset -1px -1px 3px rgba(70, 70, 70, 0.2), 0 0 5px ${glowColor}40` 
            : isHovered
            ? `0 5px 15px rgba(0, 0, 0, 0.5), 0 -1px 2px rgba(255, 255, 255, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 0 8px ${glowColor}60`
            : `0 4px 8px rgba(0, 0, 0, 0.4), 0 -1px 1px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 0 5px ${glowColor}30`,
          border: `1px solid rgba(80, 80, 80, 0.4)`,
          transform: isActive 
            ? "scale(0.97)" 
            : isHovered 
            ? "scale(1.02) translateY(-1px)" 
            : "scale(1)",
        };
      case 'vintage':
        return {
          background: isActive 
            ? "linear-gradient(145deg, #2a2517, #332d1c)" 
            : isHovered
            ? "linear-gradient(145deg, #3a331f, #2d2815)"
            : "linear-gradient(145deg, #33301c, #292515)",
          boxShadow: isActive 
            ? "inset 2px 2px 5px rgba(0, 0, 0, 0.6), inset -1px -1px 3px rgba(80, 70, 40, 0.2)" 
            : isHovered
            ? "0 5px 15px rgba(0, 0, 0, 0.5), 0 -1px 2px rgba(255, 240, 200, 0.1), inset 0 1px 1px rgba(255, 240, 200, 0.1)"
            : "0 4px 8px rgba(0, 0, 0, 0.4), 0 -1px 1px rgba(255, 240, 200, 0.05), inset 0 1px 1px rgba(255, 240, 200, 0.05)",
          border: "1px solid rgba(100, 90, 50, 0.4)",
          transform: isActive 
            ? "scale(0.97)" 
            : isHovered 
            ? "scale(1.02) translateY(-1px)" 
            : "scale(1)",
        };
      case '3d':
        return {
          background: isActive 
            ? "linear-gradient(145deg, #1c1c1c, #262626)" 
            : isHovered
            ? "linear-gradient(145deg, #2d2d2d, #232323)"
            : "linear-gradient(145deg, #2a2a2a, #222222)",
          boxShadow: isActive 
            ? "inset 2px 2px 4px rgba(0, 0, 0, 0.6), inset -1px -1px 3px rgba(60, 60, 60, 0.2), 0 2px 5px rgba(0, 0, 0, 0.2)" 
            : isHovered
            ? "0 6px 12px rgba(0, 0, 0, 0.5), 0 -1px 2px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.15)"
            : "0 4px 8px rgba(0, 0, 0, 0.5), 0 -1px 1px rgba(255, 255, 255, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(70, 70, 70, 0.4)",
          transform: isActive 
            ? "scale(0.97)" 
            : isHovered 
            ? "scale(1.02) translateY(-1px)" 
            : "scale(1)",
        };
      default:
        return {
          transition: "all 0.2s ease-in-out",
          boxShadow: variant === 'default' 
            ? "0 4px 6px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)" 
            : variant === 'outline' 
            ? "0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)" 
            : "0 1px 2px rgba(0, 0, 0, 0.1)",
        };
    }
  };

  return (
    <button 
      ref={buttonRef}
      className={combinedClassName} 
      style={{
        transition: "all 0.2s ease-in-out",
        ...getButtonStyle()
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      {...props}
    >
      {(variant === '3d' || variant === 'premium' || variant === 'vintage') && (
        <div className="absolute inset-0 pointer-events-none rounded-md overflow-hidden">
          {/* Top highlight */}
          <div 
            className="absolute inset-x-0 top-0 h-1/3" 
            style={{ 
              background: variant === 'vintage'
                ? 'linear-gradient(to bottom, rgba(255, 240, 200, 0.15), transparent)'
                : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)',
              opacity: isActive ? 0.5 : 1
            }} 
          />
          
          {/* Bottom shadow */}
          <div 
            className="absolute inset-x-0 bottom-0 h-1/3" 
            style={{ 
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent)',
              opacity: isActive ? 1 : 0.7
            }} 
          />
          
          {/* Left highlight */}
          <div 
            className="absolute inset-y-0 left-0 w-1/4" 
            style={{ 
              background: variant === 'vintage'
                ? 'linear-gradient(to right, rgba(255, 240, 200, 0.1), transparent)'
                : 'linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent)',
              opacity: isActive ? 0.4 : 0.8
            }} 
          />
          
          {/* Right shadow */}
          <div 
            className="absolute inset-y-0 right-0 w-1/4" 
            style={{ 
              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.2), transparent)',
              opacity: isActive ? 0.8 : 0.6 
            }} 
          />
          
          {/* Active state effect */}
          <div 
            className="absolute inset-0 bg-black transition-opacity duration-100"
            style={{
              opacity: isActive ? 0.2 : 0,
            }}
          />
          
          {/* Premium glow effect */}
          {variant === 'premium' && (
            <div 
              className="absolute inset-0 transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at center, ${glowColor}20, transparent 70%)`,
                opacity: isActive ? 0.6 : isHovered ? 0.9 : 0.5,
                filter: `blur(8px)`
              }}
            />
          )}
          
          {/* Premium shine animation */}
          {variant === 'premium' && shimmerActive && (
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: `linear-gradient(45deg, transparent 45%, ${glowColor}80 50%, transparent 55%)`,
                animation: 'shine 1.5s ease-in-out'
              }}
            />
          )}
          
          {/* Vintage grain effect */}
          {variant === 'vintage' && (
            <div className="vintage-texture" />
          )}
          
          {/* Click ripple effect */}
          {rippleEffect.visible && (
            <div 
              className="absolute rounded-full bg-white animate-ripple"
              style={{
                width: '15px',
                height: '15px',
                left: rippleEffect.x - 7.5,
                top: rippleEffect.y - 7.5,
                opacity: variant === 'vintage' ? 0.15 : 0.2
              }}
            />
          )}
          
          {/* Additional 3D effect outer shadow */}
          {variant === '3d' && (
            <div 
              className="absolute -inset-1 -z-10 rounded-lg opacity-50 transition-opacity"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.1))',
                filter: 'blur(3px)',
                opacity: isActive ? 0 : isHovered ? 1 : 0.5
              }}
            />
          )}
          
          {/* Premium outer glow */}
          {variant === 'premium' && (
            <div className="premium-glow" style={{ opacity: isHovered ? 1 : 0 }} />
          )}
        </div>
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}