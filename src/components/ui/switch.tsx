import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  color?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  color = '#42dcdb',
  disabled = false,
  className = '',
  size = 'md'
}) => {
  // Size mapping
  const sizeMap = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3' },
    md: { track: 'w-10 h-5', thumb: 'w-4 h-4' },
    lg: { track: 'w-12 h-6', thumb: 'w-5 h-5' },
  };

  // Handle toggle
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div 
      className={`flex items-center ${disabled ? 'opacity-50' : ''} ${className}`}
      onClick={handleToggle}
    >
      <div className="relative">
        {/* Track */}
        <div 
          className={`
            relative cursor-pointer rounded-full transition-colors duration-200 ease-in-out
            ${sizeMap[size].track}
          `}
          style={{
            background: checked 
              ? `linear-gradient(to right, ${color}80, ${color})`
              : 'linear-gradient(to right, #3a3a3a, #222)',
            boxShadow: checked
              ? `0 0 5px ${color}50, inset 0 1px 1px rgba(255, 255, 255, 0.2)`
              : 'inset 1px 1px 2px rgba(0, 0, 0, 0.5), inset -1px -1px 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Thumb */}
          <span 
            className={`
              absolute rounded-full transform transition-transform duration-200 ease-in-out
              ${sizeMap[size].thumb}
            `}
            style={{
              background: checked 
                ? `radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0)`
                : `radial-gradient(circle at 30% 30%, #d0d0d0, #9c9c9c)`,
              boxShadow: `0 1px 3px 0 rgba(0, 0, 0, 0.3)`,
              top: '50%',
              left: checked ? 'calc(100% - 2px)' : '2px',
              transform: `translateX(${checked ? '-100%' : '0%'}) translateY(-50%)`,
            }}
          >
            {/* Thumb reflection */}
            <span 
              className="absolute rounded-full"
              style={{
                width: '60%',
                height: '40%',
                top: '20%',
                left: '20%',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.1))',
              }}
            />
          </span>
        </div>
      </div>
      
      {/* Label */}
      {label && (
        <span className="text-3d text-sm text-zinc-300 ml-2 cursor-pointer">
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;