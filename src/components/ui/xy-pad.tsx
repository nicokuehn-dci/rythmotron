import React, { useState, useRef, useEffect, useCallback } from 'react';
import withErrorBoundary from './withErrorBoundary';

interface XYPadProps {
  value?: { x: number; y: number };
  onChange?: (value: { x: number; y: number }) => void;
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  className?: string;
  mode?: 'standard' | 'premium' | 'vintage';
}

const XYPadBase: React.FC<XYPadProps> = ({
  value = { x: 0.5, y: 0.5 },
  onChange,
  width = 200,
  height = 200,
  color = '#42dcdb',
  label,
  className = '',
  mode = 'standard',
}) => {
  const { x, y } = value;
  const [isActive, setIsActive] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);
  const [trail, setTrail] = useState<{x: number, y: number}[]>([]);

  // Convert normalized coordinates (0-1) to pixel values
  const getPixelX = useCallback(() => Math.max(0, Math.min(width, x * width)), [x, width]);
  const getPixelY = useCallback(() => Math.max(0, Math.min(height, (1-y) * height)), [y, height]);

  // Update trail for effect
  useEffect(() => {
    if (mode === 'premium') {
      const newPoint = {x: getPixelX() / width, y: getPixelY() / height};
      setTrail(prev => {
        const updated = [...prev, newPoint];
        return updated.slice(-10); // Keep last 10 points
      });
    }
  }, [x, y, mode, getPixelX, getPixelY, width, height]);

  // Handle pointer movements
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsActive(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateCoordinates(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isActive) return;
    updateCoordinates(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsActive(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // Update coordinates based on pointer position
  const updateCoordinates = useCallback((e: React.PointerEvent) => {
    if (!padRef.current || !onChange) return;
    
    const rect = padRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const relY = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    
    onChange({ x: relX, y: relY });
  }, [onChange]);

  // Draw grid lines
  const gridLines = () => {
    const lines = [];
    const gridCount = 4;
    
    // Horizontal lines
    for (let i = 1; i < gridCount; i++) {
      const yPos = (i / gridCount) * 100;
      lines.push(
        <line
          key={`h-${i}`}
          x1="0"
          y1={`${yPos}%`}
          x2="100%"
          y2={`${yPos}%`}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    // Vertical lines
    for (let i = 1; i < gridCount; i++) {
      const xPos = (i / gridCount) * 100;
      lines.push(
        <line
          key={`v-${i}`}
          x1={`${xPos}%`}
          y1="0"
          x2={`${xPos}%`}
          y2="100%"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
      );
    }
    
    return lines;
  };

  // Determine the styles based on the mode
  const getPadStyles = () => {
    switch(mode) {
      case 'premium':
        return {
          background: 'linear-gradient(145deg, #1c1c1c, #131313)',
          boxShadow: isHovered 
            ? 'inset 4px 4px 8px rgba(0, 0, 0, 0.6), inset -3px -3px 6px rgba(60, 60, 60, 0.15), 6px 6px 14px rgba(0, 0, 0, 0.25)'
            : 'inset 3px 3px 7px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(60, 60, 60, 0.1), 5px 5px 10px rgba(0, 0, 0, 0.2)',
          border: `1px solid rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`
        };
      case 'vintage':
        return {
          background: 'linear-gradient(145deg, #2a2a28, #1e1e1c)',
          boxShadow: 'inset 3px 3px 7px rgba(0, 0, 0, 0.6), inset -2px -2px 5px rgba(80, 80, 70, 0.15), 5px 5px 10px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(60, 60, 50, 0.6)'
        };
      default: 
        return {
          background: 'linear-gradient(145deg, #1a1a1a, #151515)',
          boxShadow: 'inset 3px 3px 7px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(60, 60, 60, 0.1), 5px 5px 10px rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(40, 40, 40, 0.6)'
        };
    }
  };

  // Create trail path from the stored points
  const createTrailPath = () => {
    if (trail.length < 2) return '';
    
    let path = `M${trail[0].x * 100}% ${trail[0].y * 100}%`;
    for (let i = 1; i < trail.length; i++) {
      path += ` L${trail[i].x * 100}% ${trail[i].y * 100}%`;
    }
    
    return path;
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <div className="mb-2 text-center">
          <span 
            className="text-sm font-medium tracking-wide" 
            style={{ 
              color: color,
              textShadow: `0 0 4px ${color}40, 0 1px 2px rgba(0, 0, 0, 0.8)`,
              letterSpacing: '0.05em' 
            }}
          >
            {label}
          </span>
        </div>
      )}
      
      <div 
        ref={padRef}
        className="relative cursor-pointer overflow-hidden rounded-lg transition-all duration-200"
        style={{ 
          width, 
          height,
          ...getPadStyles(),
          transform: isActive ? 'scale(0.99)' : isHovered ? 'scale(1.01)' : 'scale(1)'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setIsHovered(false);
          handlePointerUp;
        }}
        onPointerEnter={() => setIsHovered(true)}
        onPointerCancel={handlePointerUp}
      >
        {/* Enhanced 3D Edge Highlights */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top highlight - enhanced */}
          <div 
            className="absolute inset-x-0 top-0 h-1" 
            style={{ 
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.09), transparent)',
              borderTopLeftRadius: 'inherit',
              borderTopRightRadius: 'inherit',
              opacity: isHovered ? 0.8 : 0.6
            }} 
          />
          
          {/* Left highlight - enhanced */}
          <div 
            className="absolute inset-y-0 left-0 w-1" 
            style={{ 
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.07), transparent)',
              borderTopLeftRadius: 'inherit',
              borderBottomLeftRadius: 'inherit',
              opacity: isHovered ? 0.7 : 0.5
            }} 
          />
          
          {/* Bottom shadow - enhanced */}
          <div 
            className="absolute inset-x-0 bottom-0 h-1" 
            style={{ 
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent)',
              borderBottomLeftRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
              opacity: isHovered ? 0.9 : 0.7
            }} 
          />
          
          {/* Right shadow - enhanced */}
          <div 
            className="absolute inset-y-0 right-0 w-1" 
            style={{ 
              background: 'linear-gradient(to left, rgba(0, 0, 0, 0.3), transparent)',
              borderTopRightRadius: 'inherit',
              borderBottomRightRadius: 'inherit',
              opacity: isHovered ? 0.8 : 0.6
            }} 
          />

          {/* Corner accents for more dimensional feel */}
          <div 
            className="absolute top-0 left-0 w-8 h-8 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top left, rgba(255, 255, 255, 0.15), transparent 70%)',
              borderTopLeftRadius: 'inherit'
            }}
          />
          
          <div 
            className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at bottom right, rgba(0, 0, 0, 0.2), transparent 70%)',
              borderBottomRightRadius: 'inherit'
            }}
          />
        </div>
        
        {/* Background with grid pattern and enhanced reflections */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/30 to-zinc-900/60">
          {/* Background glow based on current position - enhanced */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${getPixelX() / width * 100}% ${getPixelY() / height * 100}%, ${color}50 0%, transparent 70%)`,
              filter: 'blur(15px)',
              opacity: isActive ? 0.5 : isHovered ? 0.3 : 0.2
            }}
          />
          
          {/* Grid reflection - enhanced */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: isHovered 
                ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.03), transparent 70%)' 
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.01), transparent 70%)',
              borderRadius: 'inherit',
              transition: 'all 0.3s ease'
            }} 
          />
          
          {/* Moire pattern overlay for vintage mode */}
          {mode === 'vintage' && (
            <div 
              className="absolute inset-0 rounded-lg opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg, 
                  #000000, 
                  #000000 2px, 
                  transparent 2px, 
                  transparent 4px
                )`
              }}
            />
          )}
          
          <svg
            width="100%"
            height="100%"
            className="absolute inset-0"
            style={{ pointerEvents: 'none' }}
          >
            {/* Grid lines */}
            {gridLines()}
            
            {/* Center crosshair */}
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1"
            />
            
            {/* Track lines with glowing effect - enhanced */}
            <line
              x1="0"
              y1={`${getPixelY() / height * 100}%`}
              x2="100%"
              y2={`${getPixelY() / height * 100}%`}
              stroke={`${color}${isHovered ? 'a0' : '80'}`}
              strokeWidth={isHovered ? "1.5" : "1"}
              strokeDasharray="2 2"
              filter={`drop-shadow(0 0 3px ${color}80)`}
            />
            <line
              x1={`${getPixelX() / width * 100}%`}
              y1="0"
              x2={`${getPixelX() / width * 100}%`}
              y2="100%"
              stroke={`${color}${isHovered ? 'a0' : '80'}`}
              strokeWidth={isHovered ? "1.5" : "1"}
              strokeDasharray="2 2"
              filter={`drop-shadow(0 0 3px ${color}80)`}
            />
            
            {/* Position path trail effect */}
            <path
              d={`M50% 50% L${getPixelX() / width * 100}% ${getPixelY() / height * 100}%`}
              fill="none"
              stroke={color}
              strokeWidth="1"
              strokeOpacity={isHovered ? "0.4" : "0.3"}
              strokeDasharray="3 2"
            />
            
            {/* Motion trail effect for premium mode */}
            {mode === 'premium' && trail.length > 1 && (
              <path
                d={createTrailPath()}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`drop-shadow(0 0 2px ${color}40)`}
              />
            )}
          </svg>
        </div>

        {/* Overlay scan effect for premium mode */}
        {mode === 'premium' && (
          <div 
            className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg"
            style={{ opacity: 0.1 }}
          >
            <div 
              className="w-full absolute h-[2px] animate-scan"
              style={{
                background: `linear-gradient(to right, transparent, ${color}, transparent)`,
                boxShadow: `0 0 8px ${color}40, 0 0 4px ${color}`,
                top: 0,
                animationDuration: '3s',
              }}
            />
          </div>
        )}

        {/* Handle with enhanced 3D effects */}
        <div
          className="absolute transition-all duration-100"
          style={{
            width: isActive ? 22 : isHovered ? 18 : 16,
            height: isActive ? 22 : isHovered ? 18 : 16,
            borderRadius: '50%',
            transform: `translate(${getPixelX() - (isActive ? 11 : isHovered ? 9 : 8)}px, ${getPixelY() - (isActive ? 11 : isHovered ? 9 : 8)}px)`,
            background: `radial-gradient(circle at 25% 25%, ${color}ee, ${color}aa)`,
            boxShadow: isActive 
              ? `0 0 10px ${color}80, 0 0 18px ${color}40, inset 2px 2px 4px rgba(255, 255, 255, 0.4), inset -2px -2px 4px rgba(0, 0, 0, 0.4)`
              : isHovered
              ? `0 0 8px ${color}80, 0 0 15px ${color}40, inset 2px 2px 3px rgba(255, 255, 255, 0.4), inset -2px -2px 3px rgba(0, 0, 0, 0.3)`
              : `0 0 5px ${color}80, 0 0 10px ${color}40, inset 1px 1px 2px rgba(255, 255, 255, 0.4), inset -1px -1px 2px rgba(0, 0, 0, 0.3)`,
            border: '1px solid rgba(255, 255, 255, 0.9)',
            zIndex: 20
          }}
        >
          {/* Inner shadow to create enhanced 3D button effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Top highlight */}
            <div 
              className="absolute inset-x-0 top-0 h-1/3" 
              style={{ 
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.7), transparent)',
                opacity: 0.6
              }} 
            />
            
            {/* Bottom shadow */}
            <div 
              className="absolute inset-x-0 bottom-0 h-1/3" 
              style={{ 
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent)',
                opacity: 0.5
              }} 
            />
            
            {/* Inner glow */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, transparent 40%, rgba(0, 0, 0, 0.2) 80%)',
                opacity: 0.5
              }}
            />
          </div>
        </div>
        
        {/* Active touch feedback - enhanced */}
        {isActive && (
          <div
            className="absolute rounded-full animate-ping"
            style={{
              width: 40,
              height: 40,
              transform: `translate(${getPixelX() - 20}px, ${getPixelY() - 20}px)`,
              background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
              boxShadow: `0 0 15px ${color}a0`,
              opacity: 0.6
            }}
          />
        )}
      </div>
      
      {/* Coordinates display with enhanced 3D text effect */}
      <div className="mt-3 flex justify-between items-center text-xs">
        <div 
          className="px-2 py-1 rounded" 
          style={{
            background: 'linear-gradient(145deg, #242424, #1c1c1c)',
            boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 1px rgba(60, 60, 60, 0.1)',
            color: '#a1a1aa',
            border: '1px solid rgba(40, 40, 40, 0.8)',
            transition: 'all 0.2s ease',
            transform: value.x > 0.8 ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          <span style={{ 
            color,
            textShadow: `0 0 2px ${color}40`
          }}>X:</span> {Math.round(x * 100)}
        </div>
        
        <div 
          className="px-2 py-1 rounded"
          style={{
            background: 'linear-gradient(145deg, #242424, #1c1c1c)',
            boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 1px rgba(60, 60, 60, 0.1)',
            color: '#a1a1aa',
            border: '1px solid rgba(40, 40, 40, 0.8)',
            transition: 'all 0.2s ease',
            transform: value.y > 0.8 ? 'scale(1.05)' : 'scale(1)'
          }}
        >
          <span style={{ 
            color,
            textShadow: `0 0 2px ${color}40`
          }}>Y:</span> {Math.round(y * 100)}
        </div>
      </div>
    </div>
  );
};

// Add error handling
const XYPad = withErrorBoundary(XYPadBase, 'XYPad');
export default XYPad;