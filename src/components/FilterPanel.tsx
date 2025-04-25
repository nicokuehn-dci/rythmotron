import React from 'react';
import Knob from '@/components/KnobWrapper';
import { Button } from '@/components/ui/button';

interface FilterPanelProps {
  cutoff: number;
  resonance: number;
  onCutoffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
  activeFilterType: string;
  onFilterTypeChange: (type: string) => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  cutoff,
  resonance,
  onCutoffChange,
  onResonanceChange,
  activeFilterType,
  onFilterTypeChange,
  className = '',
}) => {
  const filterTypes = ['Low Pass', 'High Pass', 'Band Pass', 'Notch'];

  // Helper function to convert the cutoff value to a frequency display value
  const getDisplayFrequency = (value: number) => {
    // Exponential mapping to create a more natural frequency response
    const minFreq = 20;
    const maxFreq = 20000;
    
    // Convert linear parameter to exponential
    const expValue = Math.pow(value / 100, 2);
    const freq = minFreq + expValue * (maxFreq - minFreq);
    
    // Format the frequency display
    if (freq >= 1000) {
      return `${(freq / 1000).toFixed(1)}kHz`;
    } else {
      return `${Math.round(freq)}Hz`;
    }
  };

  return (
    <div className={`bg-zinc-900 rounded-xl p-6 border border-zinc-800 ${className}`}>
      <h3 className="text-sm text-zinc-400 mb-4">Filter</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex space-x-6">
            <div className="w-1/2">
              <Knob
                value={cutoff}
                onChange={onCutoffChange}
                label="Cutoff"
                size="md"
                color="#ec4899"
                min={0}
                max={100}
                step={1}
              />
              <div className="mt-2 text-center">
                <span className="text-sm text-zinc-300">{getDisplayFrequency(cutoff)}</span>
              </div>
            </div>
            <div className="w-1/2">
              <Knob
                value={resonance}
                onChange={onResonanceChange}
                label="Resonance"
                size="md"
                color="#ec4899"
                min={0}
                max={100}
                step={1}
              />
              <div className="mt-2 text-center">
                <span className="text-sm text-zinc-300">{resonance}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm text-zinc-400 mb-3">Filter Type</h4>
          <div className="grid grid-cols-2 gap-2">
            {filterTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={`${
                  activeFilterType === type
                    ? 'bg-pink-900/30 border-2 border-pink-500 text-pink-100'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                } !rounded-button whitespace-nowrap`}
                onClick={() => onFilterTypeChange(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          
          <div className="mt-4">
            <div className="h-24 w-full bg-zinc-800/50 rounded-lg overflow-hidden p-2 border border-zinc-700">
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#3f3f46" strokeWidth="0.5" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#3f3f46" strokeWidth="0.5" />
                <line x1="0" y1="0" x2="100" y2="0" stroke="#3f3f46" strokeWidth="0.5" />
                
                {/* Filter response curve based on filter type */}
                {activeFilterType === 'Low Pass' && (
                  <path
                    d={`
                      M 0,0 
                      L ${cutoff * 0.8},0
                      C ${cutoff * 0.9},0 ${cutoff * 0.95},${25 - resonance * 0.4} ${cutoff},${50 + resonance}
                      C ${cutoff + 5},${50 - resonance * 0.2} ${cutoff + 10},50 ${cutoff + 15},50
                      L 100,50
                    `}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                )}
                
                {activeFilterType === 'High Pass' && (
                  <path
                    d={`
                      M 0,50
                      L ${100 - cutoff * 0.8},50
                      C ${100 - cutoff * 0.9},50 ${100 - cutoff * 0.95},${25 - resonance * 0.4} ${100 - cutoff},${50 + resonance}
                      C ${100 - cutoff - 5},${50 - resonance * 0.2} ${100 - cutoff - 10},0 ${100 - cutoff - 15},0
                      L 100,0
                    `}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                )}
                
                {activeFilterType === 'Band Pass' && (
                  <path
                    d={`
                      M 0,50
                      L ${cutoff * 0.5},50
                      C ${cutoff * 0.7},50 ${cutoff * 0.9},${25 - resonance * 0.6} ${cutoff},${0 + resonance * 0.2}
                      C ${cutoff + (resonance * 0.2)},${0 + resonance * 0.1} ${cutoff + (resonance * 0.2)},${0 + resonance * 0.1} ${cutoff + (100 - cutoff) * 0.2},${0 + resonance * 0.2}
                      C ${cutoff + (100 - cutoff) * 0.3},${25 - resonance * 0.6} ${cutoff + (100 - cutoff) * 0.5},50 ${cutoff + (100 - cutoff) * 0.7},50
                      L 100,50
                    `}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                )}
                
                {activeFilterType === 'Notch' && (
                  <path
                    d={`
                      M 0,0
                      L ${cutoff * 0.5},0
                      C ${cutoff * 0.7},0 ${cutoff * 0.9},${25 + resonance * 0.6} ${cutoff},${50 - resonance * 0.2}
                      C ${cutoff + (resonance * 0.2)},${50 - resonance * 0.1} ${cutoff + (resonance * 0.2)},${50 - resonance * 0.1} ${cutoff + (100 - cutoff) * 0.2},${50 - resonance * 0.2}
                      C ${cutoff + (100 - cutoff) * 0.3},${25 + resonance * 0.6} ${cutoff + (100 - cutoff) * 0.5},0 ${cutoff + (100 - cutoff) * 0.7},0
                      L 100,0
                    `}
                    fill="none"
                    stroke="#ec4899"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;