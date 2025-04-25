import React from 'react';
import KnobWrapper from './KnobWrapper';
import LED from './ui/led';
import Switch from './ui/switch';
import { Button } from './ui/button';
import withErrorBoundary from './ui/withErrorBoundary';

interface ParameterProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}

interface ButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}


interface OptionsProps {
  name: string;
  value: string[];
  selected: string;
  onChange: () => void;
}

interface EffectPanelProps {
  title: string;
  className?: string;
  color?: string;
  parameters?: ParameterProps[];
  toggles?: ToggleProps[];
  buttons?: ButtonProps[];
  options?: OptionsProps;
}

const EffectPanelBase: React.FC<EffectPanelProps> = ({ 
  title, 
  className = '',
  color = '#42dcdb',
  parameters = [],
  toggles = [],
  buttons = [],
  options
}) => {
  const [active, setActive] = React.useState(true);

  return (
    <div 
      className={`relative rounded-lg p-5 overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(145deg, #2a2a2a, #222222)',
        boxShadow: '5px 5px 10px rgba(0, 0, 0, 0.4), -2px -2px 6px rgba(60, 60, 60, 0.1)',
        border: '1px solid rgba(70, 70, 70, 0.4)'
      }}
    >
      {/* 3D Panel Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top highlight */}
        <div 
          className="absolute inset-x-0 top-0 h-0.5" 
          style={{ 
            background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent)',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit'
          }} 
        />
        
        {/* Left highlight */}
        <div 
          className="absolute inset-y-0 left-0 w-0.5" 
          style={{ 
            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.05), transparent)',
            borderTopLeftRadius: 'inherit',
            borderBottomLeftRadius: 'inherit'
          }} 
        />
        
        {/* Bottom shadow */}
        <div 
          className="absolute inset-x-0 bottom-0 h-0.5" 
          style={{ 
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent)',
            borderBottomLeftRadius: 'inherit',
            borderBottomRightRadius: 'inherit'
          }} 
        />
        
        {/* Right shadow */}
        <div 
          className="absolute inset-y-0 right-0 w-0.5" 
          style={{ 
            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.1), transparent)',
            borderTopRightRadius: 'inherit',
            borderBottomRightRadius: 'inherit'
          }} 
        />
      </div>
      
      {/* Header with title and bypass button */}
      <div className="flex items-center justify-between mb-5">
        <h3 
          className="text-lg font-bold flex items-center" 
          style={{
            color: color,
            textShadow: `0 0 5px ${color}30`
          }}
        >
          <div 
            className="w-2 h-6 mr-3 rounded-sm" 
            style={{
              background: `linear-gradient(to bottom, ${color}, ${color}80)`,
              boxShadow: `0 0 8px ${color}50`
            }}
          ></div>
          {title}
        </h3>
        
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{
            background: 'linear-gradient(145deg, #252525, #1e1e1e)',
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.2)',
            border: '1px solid rgba(50, 50, 50, 0.6)'
          }}
        >
          <LED active={active} color={color} />
          <div 
            className="text-xs cursor-pointer relative select-none"
            style={{
              color: active ? color : '#a1a1aa',
              textShadow: active ? `0 0 3px ${color}40` : 'none',
              fontWeight: 600
            }}
            onClick={() => setActive(!active)}
          >
            BYPASS
            
            {/* Highlight effect on click */}
            <div 
              className="absolute inset-x-0 bottom-0 h-0.5 origin-left transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                opacity: 0.7
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Parameters (Knobs) in a 3D inset panel */}
      <div 
        className="mb-5 rounded-lg p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)'
        }}
      >
        <div className="grid grid-cols-3 gap-4">
          {parameters.map((param, index) => (
            <div key={index} className="flex flex-col items-center">
              <KnobWrapper
                value={param.value}
                onChange={param.onChange}
                label={param.name}
                min={param.min || 0}
                max={param.max || 100}
                color={color}
                size="sm"
              />
              
              {/* 3D value display */}
              <div 
                className="mt-2 px-2 py-1 rounded-md text-center w-full"
                style={{
                  background: 'linear-gradient(145deg, #222222, #1c1c1c)',
                  boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.5), inset -1px -1px 1px rgba(60, 60, 60, 0.1)',
                  border: '1px solid rgba(40, 40, 40, 0.7)'
                }}
              >
                <span 
                  className="text-xs font-mono"
                  style={{
                    color: color,
                    textShadow: `0 0 2px ${color}30`
                  }}
                >
                  {param.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toggles with 3D styling */}
      {toggles && toggles.length > 0 && (
        <div 
          className="mb-5 rounded-lg p-3 space-y-3"
          style={{
            background: 'rgba(0, 0, 0, 0.15)',
            boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.4), inset -1px -1px 1px rgba(60, 60, 60, 0.1)'
          }}
        >
          {toggles.map((toggle, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between px-2 py-1 rounded-md"
              style={{
                background: toggle.checked ? 'rgba(0, 0, 0, 0.2)' : 'transparent',
                border: toggle.checked ? `1px solid ${color}40` : '1px solid transparent'
              }}
            >
              <label 
                className="text-sm cursor-pointer flex-grow"
                style={{
                  color: toggle.checked ? color : '#a1a1aa',
                  textShadow: toggle.checked ? `0 0 3px ${color}30` : 'none'
                }}
              >
                {toggle.label}
              </label>
              <Switch checked={toggle.checked} onChange={toggle.onChange} color={color} />
            </div>
          ))}
        </div>
      )}

      {/* Options with 3D styling */}
      {options && (
        <div className="mb-5">
          <label 
            className="block text-sm mb-2 font-medium"
            style={{
              color,
              textShadow: `0 0 3px ${color}30`
            }}
          >
            {options.name}
          </label>
          <div
            className="relative rounded-md"
            style={{
              background: 'linear-gradient(145deg, #222222, #1c1c1c)',
              border: `1px solid ${color}40`,
              boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 1px rgba(60, 60, 60, 0.1)'
            }}
          >
            <select 
              className="w-full bg-transparent border-none text-zinc-300 py-2 px-3 pr-8 rounded-md appearance-none focus:outline-none"
              onChange={options.onChange}
              value={options.selected}
              style={{
                color: '#a1a1aa',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)'
              }}
            >
              {options.value.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            
            {/* Custom dropdown arrow with 3D styling */}
            <div 
              className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
            >
              <svg 
                className="h-4 w-4" 
                viewBox="0 0 20 20" 
                fill="none" 
                stroke="currentColor"
                style={{ color }}
              >
                <path d="M7 7l3 3 3-3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Buttons with 3D styling */}
      {buttons && buttons.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {buttons.map((button, index) => (
            <Button
              key={index}
              className="relative overflow-hidden"
              onClick={button.onClick}
              style={{
                background: button.isActive 
                  ? `linear-gradient(145deg, ${color}20, ${color}40)` 
                  : 'linear-gradient(145deg, #2a2a2a, #222222)',
                boxShadow: button.isActive
                  ? `inset 2px 2px 5px rgba(0, 0, 0, 0.5), 
                     inset -1px -1px 2px rgba(80, 80, 80, 0.2),
                     0 0 10px ${color}30`
                  : `2px 2px 5px rgba(0, 0, 0, 0.3), 
                     -1px -1px 3px rgba(60, 60, 60, 0.1)`,
                border: button.isActive 
                  ? `1px solid ${color}` 
                  : '1px solid rgba(70, 70, 70, 0.4)',
                color: button.isActive ? color : '#a1a1aa',
                textShadow: button.isActive ? `0 0 3px ${color}60` : 'none',
                borderRadius: '0.25rem',
                padding: '0.5rem'
              }}
            >
              {button.label}
              
              {/* Inner lighting effects */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
                {/* Top reflection */}
                <div 
                  className="absolute inset-x-0 top-0 h-1/4"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                    opacity: button.isActive ? 0.05 : 0.1
                  }}
                />
                
                {/* Bottom shadow */}
                <div 
                  className="absolute inset-x-0 bottom-0 h-1/4"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                    opacity: button.isActive ? 0.3 : 0.1
                  }}
                />
                
                {/* Active glow */}
                {button.isActive && (
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at center, ${color}20, transparent 70%)`
                    }}
                  />
                )}
              </div>
            </Button>
          ))}
        </div>
      )}
      
      {/* Bottom LED meter - decorative element */}
      <div 
        className="mt-4 h-1.5 rounded-full overflow-hidden"
        style={{
          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.7), inset -1px -1px 1px rgba(255,255,255,0.05)'
        }}
      >
        <div 
          className="h-full transition-all duration-300"
          style={{ 
            width: active ? `${Math.random() * 50 + 50}%` : '0%',
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            boxShadow: `0 0 4px ${color}70`,
          }}
        />
      </div>
    </div>
  );
};

// Export the component already wrapped with error boundary
const EffectPanel = withErrorBoundary(EffectPanelBase, 'EffectPanel');
export default EffectPanel;