import React from 'react';
import Knob from '@/components/KnobWrapper';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  cutoff: number;
  resonance: number;
  onCutoffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
  activeFilterType?: string;
  onFilterTypeChange?: (type: string) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  cutoff,
  resonance,
  onCutoffChange,
  onResonanceChange,
  activeFilterType = 'Low Pass',
  onFilterTypeChange,
  className = '',
}) => {
  const filterTypes = ['Low Pass', 'High Pass', 'Band Pass', 'Notch'];
  
  return (
    <div className={`bg-zinc-900 rounded-xl p-6 border border-zinc-800 ${className}`}>
      <h3 className="text-lg font-medium mb-4">Filter</h3>
      <div className="space-y-6">
        <div>
          <Knob
            value={cutoff}
            onChange={onCutoffChange}
            label="Cutoff"
            color="#a855f7"
          />
        </div>
        <div>
          <Knob
            value={resonance}
            onChange={onResonanceChange}
            label="Resonance"
            color="#a855f7"
          />
        </div>
        <div className="pt-4">
          <h4 className="text-sm text-zinc-400 mb-2">Filter Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {filterTypes.map((type) => (
              <Button 
                key={type}
                variant="outline" 
                size="sm" 
                className={`border-zinc-700 ${
                  type === activeFilterType ? 'bg-zinc-800' : ''
                } text-zinc-300 hover:bg-zinc-700 hover:text-white !rounded-button whitespace-nowrap`}
                onClick={() => onFilterTypeChange && onFilterTypeChange(type)}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;