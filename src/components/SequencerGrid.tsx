import React, { useState } from 'react';
import LED from './ui/led';
import withErrorBoundary from './ui/withErrorBoundary';

interface Track {
  id: number;
  name: string;
  color: string;
  pattern: boolean[];
}

interface SequencerGridProps {
  tracks: Track[];
  steps: number;
  currentStep?: number;
  onToggleStep?: (trackId: number, step: number) => void;
  className?: string;
}

const SequencerGridBase: React.FC<SequencerGridProps> = ({
  tracks = [],
  steps = 16,
  currentStep = -1,
  onToggleStep = () => {},
  className = ''
}) => {
  // State to track cells that are animating
  const [animatingCells, setAnimatingCells] = useState<{[key: string]: boolean}>({});
  
  // Handle step toggle with animation
  const handleToggleStep = (trackId: number, stepIndex: number) => {
    onToggleStep(trackId, stepIndex);
    
    // Create a unique key for this cell
    const cellKey = `${trackId}-${stepIndex}`;
    
    // Set this cell as animating
    setAnimatingCells(prev => ({ ...prev, [cellKey]: true }));
    
    // Remove animating state after animation completes
    setTimeout(() => {
      setAnimatingCells(prev => {
        const updated = { ...prev };
        delete updated[cellKey];
        return updated;
      });
    }, 500); // Animation duration
  };

  return (
    <div 
      className={`${className} bg-zinc-900/40 rounded-lg p-4 border border-zinc-800/50 relative`} 
      style={{
        boxShadow: 'inset 2px 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 4px rgba(255, 255, 255, 0.05)',
        overflow: 'hidden'
      }}
    >
      <div className="overflow-x-auto">
        <div className="grid" style={{ 
          gridTemplateColumns: `minmax(80px, auto) repeat(${steps}, minmax(40px, 1fr))`
        }}>
          {/* Header row with step numbers */}
          <div 
            className="flex items-center justify-center font-medium h-8 text-zinc-400 text-sm"
          >
            Tracks
          </div>
          
          {Array.from({ length: steps }).map((_, stepIndex) => (
            <div 
              key={`header-${stepIndex}`} 
              className={`flex items-center justify-center h-8 text-xs font-medium ${currentStep === stepIndex ? 'text-green-400' : 'text-zinc-500'}`}
              style={{
                textShadow: currentStep === stepIndex ? '0 0 5px rgba(74, 222, 128, 0.5)' : 'none',
                transition: 'transform 0.3s ease'
              }}
            >
              {stepIndex + 1}
            </div>
          ))}
          
          {/* Track rows */}
          {tracks.map((track) => (
            <React.Fragment key={`track-${track.id}`}>
              {/* Track name */}
              <div 
                className="flex items-center px-3 h-10 font-medium rounded-l-md"
                style={{ 
                  background: 'linear-gradient(145deg, #292929, #222222)', 
                  boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), -1px -1px 2px rgba(60, 60, 60, 0.1)',
                  borderLeft: `2px solid ${track.color}`
                }}
              >
                <span className="text-sm" style={{
                  color: track.color,
                  textShadow: `0 0 3px ${track.color}40`
                }}>
                  {track.name}
                </span>
              </div>
              
              {/* Step cells */}
              {Array.from({ length: steps }).map((_, stepIndex) => {
                const isActive = track.pattern[stepIndex] || false;
                const cellKey = `${track.id}-${stepIndex}`;
                const isAnimating = animatingCells[cellKey];
                const isCurrentStep = currentStep === stepIndex;
                
                return (
                  <div 
                    key={cellKey} 
                    className="p-1 relative group"
                  >
                    <div
                      className={`
                        h-8 rounded-md cursor-pointer relative
                        ${isCurrentStep ? 'ring-1 ring-white/30' : ''}
                        ${isAnimating ? 'animate-step-toggle' : 'transition-all duration-150'}
                      `}
                      style={{
                        background: isActive 
                          ? `linear-gradient(145deg, #252525, #1e1e1e)` 
                          : 'linear-gradient(145deg, #2a2a2a, #222222)',
                        boxShadow: isActive
                          ? `inset 2px 2px 4px rgba(0, 0, 0, 0.5), 
                             inset -1px -1px 2px rgba(60, 60, 60, 0.2),
                             0 0 6px ${track.color}40`
                          : `1px 1px 3px rgba(0, 0, 0, 0.3), 
                             -1px -1px 2px rgba(60, 60, 60, 0.1)`,
                        border: isActive 
                          ? `1px solid ${track.color}` 
                          : '1px solid rgba(60, 60, 60, 0.3)'
                      }}
                      onClick={() => handleToggleStep(track.id, stepIndex)}
                    >
                      {/* LED indicator */}
                      <div className="h-full w-full flex items-center justify-center">
                        <LED active={isActive} color={track.color} size="xs" />
                      </div>
                      
                      {/* Current step indicator */}
                      {isCurrentStep && (
                        <div 
                          className="absolute inset-0 rounded-md animate-pulse" 
                          style={{
                            boxShadow: `0 0 5px ${track.color}, inset 0 0 5px ${track.color}`, 
                            opacity: 0.3
                          }} 
                        />
                      )}
                      
                      {/* Inner shadows and highlights */}
                      <div className="absolute inset-0 pointer-events-none rounded-md overflow-hidden">
                        {/* Top shadow */}
                        <div className="absolute inset-x-0 top-0 h-1/4 bg-black/20" style={{
                          opacity: isActive ? 0.25 : 0.1
                        }}/>
                        
                        {/* Bottom highlight */}
                        <div className="absolute inset-x-0 bottom-0 h-1/5 bg-white/5" style={{
                          opacity: isActive ? 0.05 : 0.1
                        }}/>
                        
                        {/* Active inner glow */}
                        {isActive && (
                          <div className="absolute inset-0" style={{
                            background: `radial-gradient(circle at center, ${track.color}20 0%, transparent 70%)`
                          }} />
                        )}
                      </div>
                    </div>
                    
                    {/* Bottom highlight on hover */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mx-1" 
                      style={{
                        background: `linear-gradient(90deg, transparent, ${track.color}, transparent)`,
                        boxShadow: `0 0 4px ${track.color}`,
                        transform: 'translateY(-1px)'
                      }} 
                    />
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Reflective Floor (kept from original design) */}
      <div 
        className="absolute left-0 right-0 bottom-0 opacity-10 pointer-events-none"
        style={{
          height: '30px',
          background: 'linear-gradient(to bottom, rgba(180,180,180,0.3), transparent)',
          transform: 'rotateX(60deg) translateY(15px)',
          transformOrigin: 'bottom'
        }}
      />
    </div>
  );
};

// Add error handling
const SequencerGrid = withErrorBoundary(SequencerGridBase, 'SequencerGrid');
export default SequencerGrid;