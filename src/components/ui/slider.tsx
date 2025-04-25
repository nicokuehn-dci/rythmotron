import * as React from "react"

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value = [0],
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  className = '',
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  
  const handleChange = (e: React.MouseEvent | React.TouchEvent) => {
    if (!trackRef.current) return;
    
    const rect = trackRef.current.getBoundingClientRect();
    let clientPos;
    
    if ('touches' in e) {
      clientPos = orientation === 'horizontal' ? e.touches[0].clientX : e.touches[0].clientY;
    } else {
      clientPos = orientation === 'horizontal' ? e.clientX : e.clientY;
    }
    
    const pos = orientation === 'horizontal' 
      ? (clientPos - rect.left) / rect.width
      : 1 - (clientPos - rect.top) / rect.height;
    
    const newValue = min + pos * (max - min);
    const clampedValue = Math.max(min, Math.min(max, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;
    
    onValueChange([steppedValue]);
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    handleChange(e);
    
    const handleMouseMove = (e: MouseEvent) => {
      handleChange(e as unknown as React.MouseEvent);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const thumbPosition = ((value[0] - min) / (max - min)) * 100;
  
  return (
    <div 
      className={`relative ${orientation === 'horizontal' ? 'h-2' : 'w-2 h-full'} bg-zinc-700 rounded-full cursor-pointer ${className}`}
      ref={trackRef}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="absolute bg-purple-600 rounded-full"
        style={
          orientation === 'horizontal'
            ? { left: 0, width: `${thumbPosition}%`, height: '100%' }
            : { bottom: 0, height: `${thumbPosition}%`, width: '100%' }
        }
      ></div>
      <div
        className="absolute w-3 h-3 bg-white rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/2"
        style={
          orientation === 'horizontal'
            ? { left: `${thumbPosition}%`, top: '50%' }
            : { left: '50%', bottom: `${thumbPosition}%`, transform: 'translate(-50%, 50%)' }
        }
      ></div>
    </div>
  );
};