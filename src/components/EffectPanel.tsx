import React from 'react';
import Knob from '@/components/KnobWrapper';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

interface EffectPanelProps {
  title: string;
  color: string;
  parameters: {
    name: string;
    value: number;
    onChange: (value: number) => void;
  }[];
  options?: {
    name: string;
    value: string[];
    selected: string;
    onChange: (value: string) => void;
  };
  toggles?: {
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }[];
  buttons?: {
    label: string;
    isActive: boolean;
    onClick: () => void;
  }[];
  className?: string;
}

export const EffectPanel: React.FC<EffectPanelProps> = ({
  title,
  color,
  parameters,
  options,
  toggles,
  buttons,
  className = '',
}) => {
  return (
    <div className={`bg-zinc-900 rounded-xl p-6 border border-zinc-800 ${className}`}>
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div className="space-y-6">
        {parameters.map((param, index) => (
          <div key={index}>
            <Knob
              value={param.value}
              onChange={param.onChange}
              label={param.name}
              color={color}
            />
          </div>
        ))}
        
        {toggles && toggles.length > 0 && (
          <div className="pt-2">
            {toggles.map((toggle) => (
              <div key={toggle.id} className="flex items-center space-x-2">
                <Switch 
                  id={toggle.id} 
                  checked={toggle.checked}
                  onCheckedChange={toggle.onChange}
                />
                <label htmlFor={toggle.id} className="text-sm text-zinc-400 cursor-pointer">
                  {toggle.label}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {options && (
          <div className="pt-2">
            <select 
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-zinc-300 !rounded-button whitespace-nowrap"
              value={options.selected}
              onChange={(e) => options.onChange(e.target.value)}
            >
              {options.value.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {buttons && buttons.length > 0 && (
          <div className="pt-2">
            <div className="grid grid-cols-2 gap-2">
              {buttons.map((button, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className={`border-zinc-700 ${
                    button.isActive ? 'bg-zinc-800' : ''
                  } text-zinc-300 hover:bg-zinc-700 hover:text-white !rounded-button whitespace-nowrap`}
                  onClick={button.onClick}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EffectPanel;