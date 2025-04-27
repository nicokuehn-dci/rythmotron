import React, { useState, useRef, useEffect } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  formatValue?: (value: number) => string;
  showValue?: boolean;
  snapToGrid?: boolean; // Added prop for explicit grid snapping
  gridSize?: number; // Added prop for custom grid size
  showGridLines?: boolean; // Added prop to control grid line visibility
  gridLineColor?: string; // Added prop to control grid line color
}

const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  color = '#42dcdb',
  label,
  size = 'md',
  orientation = 'horizontal',
  className = '',
  formatValue,
  showValue = true,
  snapToGrid = true, // Default to false for backward compatibility
  gridSize = 20

  , // Default grid size of 5
  showGridLines = true, // Show grid lines by default when snapToGrid is true
  gridLineColor = 'rgba(255, 255, 255, 0.15)' // Default grid line color
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Size mapping
  const sizeMap = {
    sm: orientation === 'horizontal' ? 'h-2 w-full' : 'w-2 h-full',
    md: orientation === 'horizontal' ? 'h-3 w-full' : 'w-3 h-full',
    lg: orientation === 'horizontal' ? 'h-4 w-full' : 'w-4 h-full',
  };
  
  const thumbSizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',    
  };
  
  // Calculate percentage for positioning
  const percent = ((value - min) / (max - min)) * 100;
  
  // Handle click and drag
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updateValue(e);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateValue(e);
  };
  
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };
  
  // Update value based on pointer position
  const updateValue = (e: React.PointerEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    let percentage;
    
    if (orientation === 'horizontal') {
      percentage = (e.clientX - rect.left) / rect.width;
    } else {
      percentage = 1 - (e.clientY - rect.top) / rect.height;
    }
    
    // Clamp percentage between 0-1
    percentage = Math.max(0, Math.min(1, percentage));
    
    // Calculate new value
    let newValue = min + percentage * (max - min);
    
    // Apply step if provided
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    
    // Apply additional grid snapping if enabled
    if (snapToGrid) {
      newValue = Math.round(newValue / gridSize) * gridSize;
    }
    
    // Ensure value is within bounds
    newValue = Math.max(min, Math.min(max, newValue));
      
    onChange(newValue);
  };
  
  // Format display value
  const displayValue = formatValue ? formatValue(value) : value.toString();
  
  // Calculate the number of grid lines to show
  const gridLines = snapToGrid || step > 0 ? Math.floor((max - min) / (snapToGrid ? gridSize : step)) + 1 : 0;
  
  return (
    <div 
      className={`${className} ${orientation === 'vertical' ? 'flex-row h-40' : 'flex-col'} flex`}
    >
      {/* Label and value display */}
      {(label || showValue) && (
        <div className={`flex justify-between items-center ${orientation === 'vertical' ? 'flex-col mr-2' : 'mb-1.5'}`}>
          {label && (
            <span className="text-3d text-sm font-medium text-zinc-300">{label}</span>
          )}
          {showValue && (
            <span className="text-3d text-xs text-zinc-400">{displayValue}</span>
          )}
        </div>
      )}
      
      {/* Slider track */}
      <div
        ref={sliderRef}
        className={`
          slider-track relative rounded-full cursor-pointer
          ${sizeMap[size]}
        `}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          backgroundImage: (snapToGrid && showGridLines) ? `repeating-linear-gradient(
            ${orientation === 'horizontal' ? '90deg' : '0deg'},
            transparent,
            transparent calc(${100/gridLines}% - 1px),
            ${gridLineColor} calc(${100/gridLines}% - 1px),
            ${gridLineColor} ${100/gridLines}%
          )` : 'none',
          backgroundSize: '100% 100%'
        }}
      >
        {/* Track fill */}
        <div
          className="absolute rounded-full"
          style={{
            background: `linear-gradient(${orientation === 'horizontal' ? '90deg' : '0deg'}, ${color}80, ${color})`,
            boxShadow: `0 0 4px ${color}40`,
            ...(orientation === 'horizontal'
              ? { left: 0, top: 0, bottom: 0, width: `${percent}%` }
              : { left: 0, right: 0, bottom: 0, height: `${percent}%` })
          }}
        />
        
        {/* Thumb */}
        <div
          className={`
            slider-thumb absolute rounded-full bg-gradient-knob border border-gray-700
            ${thumbSizeMap[size]} ${isDragging ? 'scale-110' : ''}
          `}
          style={{
            boxShadow: `0 0 5px rgba(0, 0, 0, 0.5), 0 0 3px ${color}80`,
            transform: orientation === 'horizontal'
              ? `translateX(-50%) translateY(-50%)`
              : `translateY(50%) translateX(-50%)`,
            ...(orientation === 'horizontal'
              ? { left: `${percent}%`, top: '50%' }
              : { bottom: `${percent}%`, left: '50%' }),
            transition: isDragging ? 'none' : 'transform 0.1s ease'
          }}
        >
          {/* Thumb reflection */}
          <div 
            className="absolute rounded-full w-2/3 h-1/3 top-1/4 left-1/4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)',
              opacity: 0.4
            }}
          />
        </div>
        
        {/* Grid lines for steps */}
        {showGridLines && gridLines > 0 && (
          <div className="absolute inset-0 pointer-events-none grid-lines">
            {Array.from({ length: gridLines }).map((_, i) => {
              const linePosition = i / (gridLines - 1) * 100;
              return (
                <div
                  key={i}
                  className="absolute bg-white/20"
                  style={{
                    ...(orientation === 'horizontal'
                      ? { width: '1px', height: '100%', left: `${linePosition}%` }
                      : { height: '1px', width: '100%', bottom: `${linePosition}%` })
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Exportiere als benannte und Default-Export für Kompatibilität mit verschiedenen Import-Stilen
export { Slider };
export default Slider;