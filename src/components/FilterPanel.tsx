import React from 'react';
import Knob from '@/components/KnobWrapper';
import { Button } from '@/components/ui/button';
import withErrorBoundary from './ui/withErrorBoundary';

interface FilterPanelProps {
  cutoff: number;
  resonance: number;
  onCutoffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
  activeFilterType: string;
  onFilterTypeChange: (type: string) => void;
  className?: string;
}

export const FilterPanelBase: React.FC<FilterPanelProps> = ({
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
    <div 
      className={`synthmodule p-6 ${className} rounded-xl relative overflow-hidden`}
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
      
      <h3 
        className="text-xl font-bold mb-5 flex items-center" 
        style={{
          color: '#ec4899',
          textShadow: '0 0 5px rgba(236, 72, 153, 0.3)'
        }}
      >
        <div 
          className="w-2 h-6 mr-3 rounded-sm" 
          style={{
            background: 'linear-gradient(to bottom, #ec4899, #be185d)',
            boxShadow: '0 0 8px rgba(236, 72, 153, 0.5)'
          }}
        ></div>
        Filter
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/20 rounded-lg p-4" style={{
          boxShadow: 'inset 2px 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(70, 70, 70, 0.1)'
        }}>
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
              />
              <div className="mt-2 text-center">
                <span 
                  className="text-sm font-mono" 
                  style={{
                    color: '#f9a8d4', 
                    textShadow: '0 0 3px rgba(249, 168, 212, 0.3)'
                  }}
                >
                  {getDisplayFrequency(cutoff)}
                </span>
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
              />
              <div className="mt-2 text-center">
                <span 
                  className="text-sm font-mono" 
                  style={{
                    color: '#f9a8d4', 
                    textShadow: '0 0 3px rgba(249, 168, 212, 0.3)'
                  }}
                >
                  {resonance}%
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h4 
            className="text-sm font-medium mb-3" 
            style={{
              color: '#f9a8d4',
              textShadow: '0 0 2px rgba(249, 168, 212, 0.2)'
            }}
          >
            Filter Type
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {filterTypes.map((type) => (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className={`relative overflow-hidden transition-all duration-150`}
                style={{
                  background: activeFilterType === type 
                    ? 'linear-gradient(145deg, #421527, #2d0f1b)' 
                    : 'linear-gradient(145deg, #2a2a2a, #222222)',
                  boxShadow: activeFilterType === type
                    ? `inset 2px 2px 5px rgba(0, 0, 0, 0.5), 
                       inset -1px -1px 2px rgba(80, 80, 80, 0.2),
                       0 0 10px rgba(236, 72, 153, 0.3)`
                    : `1px 1px 3px rgba(0, 0, 0, 0.3), 
                       -1px -1px 2px rgba(60, 60, 60, 0.1)`,
                  border: activeFilterType === type 
                    ? '1px solid #ec4899' 
                    : '1px solid rgba(70, 70, 70, 0.4)',
                  color: activeFilterType === type ? '#f9a8d4' : '#a1a1aa',
                  textShadow: activeFilterType === type ? '0 0 3px rgba(249, 168, 212, 0.3)' : 'none',
                  borderRadius: '0.25rem'
                }}
                onClick={() => onFilterTypeChange(type)}
              >
                {type}
                
                {/* Inner lighting effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
                  {/* Top reflection */}
                  <div 
                    className="absolute inset-x-0 top-0 h-1/4"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
                      opacity: activeFilterType === type ? 0.05 : 0.1
                    }}
                  />
                  
                  {/* Bottom shadow */}
                  <div 
                    className="absolute inset-x-0 bottom-0 h-1/4"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
                      opacity: activeFilterType === type ? 0.3 : 0.1
                    }}
                  />
                  
                  {/* Active glow */}
                  {activeFilterType === type && (
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(236, 72, 153, 0.15), transparent 70%)'
                      }}
                    />
                  )}
                </div>
              </Button>
            ))}
          </div>
          
          <div className="mt-4">
            <div 
              className="h-24 w-full rounded-lg overflow-hidden p-2 relative"
              style={{
                background: 'linear-gradient(145deg, #1a1a1a, #151515)',
                boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)',
                border: '1px solid rgba(40, 40, 40, 0.5)'
              }}
            >
              {/* Grid reflection effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(145deg, transparent, rgba(255, 255, 255, 0.02))'
                }}
              />
              
              <svg
                viewBox="0 0 100 50"
                className="w-full h-full relative z-10"
                preserveAspectRatio="none"
              >
                {/* Grid lines with 3D depth */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="#3f3f46" strokeWidth="0.5" opacity="0.7" />
                <line x1="0" y1="25" x2="100" y2="25" stroke="#3f3f46" strokeWidth="0.5" opacity="0.5" />
                <line x1="0" y1="0" x2="100" y2="0" stroke="#3f3f46" strokeWidth="0.5" opacity="0.7" />
                
                {/* Vertical grid lines for 3D effect */}
                {[0, 20, 40, 60, 80, 100].map(x => (
                  <line 
                    key={x} 
                    x1={x} y1="0" 
                    x2={x} y2="50" 
                    stroke="#3f3f46" 
                    strokeWidth="0.5" 
                    opacity="0.3" 
                  />
                ))}
                
                {/* Filter response curve based on filter type */}
                {activeFilterType === 'Low Pass' && (
                  <>
                    {/* Glowing shadow for the curve */}
                    <path
                      d={`
                        M 0,0 
                        L ${cutoff * 0.8},0
                        C ${cutoff * 0.9},0 ${cutoff * 0.95},${25 - resonance * 0.4} ${cutoff},${50 + resonance}
                        C ${cutoff + 5},${50 - resonance * 0.2} ${cutoff + 10},50 ${cutoff + 15},50
                        L 100,50
                      `}
                      fill="none"
                      stroke="rgba(236, 72, 153, 0.3)"
                      strokeWidth="4"
                      filter="blur(3px)"
                    />
                    
                    {/* Main curve */}
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
                  </>
                )}
                
                {/* Similar enhanced rendering for other filter types */}
                {activeFilterType === 'High Pass' && (
                  <>
                    {/* Glowing shadow for the curve */}
                    <path
                      d={`
                        M 0,50
                        L ${100 - cutoff * 0.8},50
                        C ${100 - cutoff * 0.9},50 ${100 - cutoff * 0.95},${25 - resonance * 0.4} ${100 - cutoff},${50 + resonance}
                        C ${100 - cutoff - 5},${50 - resonance * 0.2} ${100 - cutoff - 10},0 ${100 - cutoff - 15},0
                        L 100,0
                      `}
                      fill="none"
                      stroke="rgba(236, 72, 153, 0.3)"
                      strokeWidth="4"
                      filter="blur(3px)"
                    />
                    
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
                  </>
                )}
                
                {activeFilterType === 'Band Pass' && (
                  <>
                    {/* Glowing shadow for the curve */}
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
                      stroke="rgba(236, 72, 153, 0.3)"
                      strokeWidth="4"
                      filter="blur(3px)"
                    />
                    
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
                  </>
                )}
                
                {activeFilterType === 'Notch' && (
                  <>
                    {/* Glowing shadow for the curve */}
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
                      stroke="rgba(236, 72, 153, 0.3)"
                      strokeWidth="4"
                      filter="blur(3px)"
                    />
                    
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
                  </>
                )}
                
                {/* Cutoff frequency marker */}
                <line 
                  x1={cutoff} 
                  y1="0" 
                  x2={cutoff} 
                  y2="50" 
                  stroke="#ec4899" 
                  strokeWidth="1" 
                  strokeDasharray="2,2" 
                  opacity="0.7"
                />
                <circle 
                  cx={cutoff} 
                  cy={activeFilterType === 'Low Pass' || activeFilterType === 'Notch' ? 0 : 50} 
                  r="2" 
                  fill="#ec4899" 
                  filter="drop-shadow(0 0 2px #ec4899)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add error boundary
const FilterPanel = withErrorBoundary(FilterPanelBase, 'FilterPanel');
export default FilterPanel;