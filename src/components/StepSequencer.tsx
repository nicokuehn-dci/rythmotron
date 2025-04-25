import React, { useState } from 'react';
import LED from './ui/led';
import withErrorBoundary from './ui/withErrorBoundary';

interface StepSequencerProps {
  steps: boolean[];
  onToggleStep: (index: number) => void;
  currentStep?: number;
  color?: string;
  className?: string;
  showLabels?: boolean;
  is3D?: boolean;
}

const StepSequencerBase: React.FC<StepSequencerProps> = ({
  steps,
  onToggleStep,
  currentStep = -1,
  color = '#4ade80',
  className = '',
  showLabels = true,
  is3D = true
}) => {
  // State to track elements that are animating
  const [animatingSteps, setAnimatingSteps] = useState<{[key: number]: boolean}>({});
  
  // Trigger animation when a step is toggled
  const handleToggleStep = (index: number) => {
    onToggleStep(index);
    
    // Set this step as animating
    setAnimatingSteps(prev => ({ ...prev, [index]: true }));
    
    // Remove animating state after animation completes
    setTimeout(() => {
      setAnimatingSteps(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }, 500); // Animation duration
  };

  return (
    <div className={`relative ${className}`}>
      {/* Grid container */}
      <div className="grid grid-cols-16 gap-1.5">
        {steps.map((isActive, index) => {
          const isAnimating = animatingSteps[index];
          const isCurrentStep = currentStep === index;
          
          return (
            <div key={index} className="flex flex-col items-center group">
              {showLabels && (
                <div 
                  className={`mb-1 text-xs font-medium transition-all duration-300 ${isActive ? 'text-3d-glow' : ''}`}
                  style={{
                    color: isActive ? color : '#71717a',
                    textShadow: isActive ? `0 0 5px ${color}80` : 'none',
                  }}
                >
                  {index + 1}
                </div>
              )}
              
              {/* 3D Button Container */}
              <div
                className={`
                  w-full aspect-square cursor-pointer transition-all relative 
                  ${isCurrentStep ? 'ring-1 ring-white/50' : ''}
                  ${is3D ? 'transform-gpu' : ''}
                `}
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                {/* 3D Button Face */}
                <div
                  className={`
                    absolute inset-0 rounded-md 
                    ${isAnimating ? 'animate-step-toggle' : ''}
                  `}
                  style={{
                    background: isActive 
                      ? `linear-gradient(145deg, #252525, #1e1e1e)` 
                      : 'linear-gradient(145deg, #292929, #222222)',
                    boxShadow: isActive
                      ? `inset 2px 2px 4px rgba(0, 0, 0, 0.6), 
                         inset -1px -1px 3px rgba(60, 60, 60, 0.2),
                         0 0 8px ${color}40`
                      : `2px 2px 4px rgba(0, 0, 0, 0.4), 
                         -1px -1px 2px rgba(60, 60, 60, 0.1)`,
                    border: isActive 
                      ? `1px solid ${color}` 
                      : '1px solid rgba(60, 60, 60, 0.5)',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transformStyle: 'preserve-3d',
                    transform: is3D && isActive ? 'translateZ(2px)' : 'translateZ(0)',
                  }}
                  onClick={() => handleToggleStep(index)}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    {/* LED with enhanced 3D glow */}
                    <div className="relative" style={{ transform: is3D ? 'translateZ(3px)' : 'none' }}>
                      <LED active={isActive} color={color} size="sm" />
                    </div>
                    
                    {/* Current step indicator with animated 3D pulse */}
                    {isCurrentStep && (
                      <div 
                        className="absolute inset-0 rounded-md animate-pulse-3d" 
                        style={{
                          boxShadow: `0 0 8px ${color}, inset 0 0 8px ${color}`, 
                          opacity: 0.5,
                          transform: is3D ? 'translateZ(1px)' : 'none'
                        }} 
                      />
                    )}
                    
                    {/* Hover effect - illuminated 3D edge */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                      style={{
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                        boxShadow: `0 0 6px ${color}`,
                        transform: is3D ? 'translateZ(2px)' : 'none'
                      }} 
                    />
                  </div>
                  
                  {/* 3D inner shadows and highlights */}
                  <div className="absolute inset-0 pointer-events-none rounded-md overflow-hidden">
                    {/* Top shadow - 3D depth effect */}
                    <div className="absolute inset-x-0 top-0 h-1/4 bg-black/20" style={{
                      opacity: isActive ? 0.3 : 0.1,
                      transform: is3D ? 'rotateX(45deg) translateZ(-1px)' : 'none'
                    }}/>
                    
                    {/* Bottom highlight - 3D depth effect */}
                    <div className="absolute inset-x-0 bottom-0 h-1/5 bg-white/5" style={{
                      opacity: isActive ? 0.05 : 0.1,
                      transform: is3D ? 'rotateX(-45deg) translateZ(-1px)' : 'none'
                    }}/>
                    
                    {/* Active inner 3D glow */}
                    {isActive && (
                      <div 
                        className="absolute inset-0" 
                        style={{
                          background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
                          transform: is3D ? 'translateZ(1px)' : 'none'
                        }} 
                      />
                    )}
                  </div>
                  
                  {/* 3D Press effect */}
                  <div className="absolute inset-0 bg-white opacity-0 active:opacity-10 transition-opacity rounded-md" 
                    style={{
                      transform: is3D ? 'translateZ(4px)' : 'none'
                    }}
                  />
                </div>
                
                {/* 3D Button Bottom/Side (only in 3D mode) */}
                {is3D && (
                  <>
                    {/* Bottom face */}
                    <div 
                      className="absolute inset-x-0 h-2 rounded-b-sm bg-zinc-900"
                      style={{
                        bottom: '-2px',
                        transformOrigin: 'bottom',
                        transform: 'rotateX(-90deg)',
                        boxShadow: isActive ? `0 8px 10px -6px ${color}40` : 'none'
                      }}
                    />
                    
                    {/* Left face */}
                    <div 
                      className="absolute inset-y-0 w-1 rounded-l-sm bg-zinc-800"
                      style={{
                        left: '-1px',
                        transformOrigin: 'left',
                        transform: 'rotateY(90deg)'
                      }}
                    />
                    
                    {/* Right face */}
                    <div 
                      className="absolute inset-y-0 w-1 rounded-r-sm bg-zinc-950"
                      style={{
                        right: '-1px',
                        transformOrigin: 'right',
                        transform: 'rotateY(-90deg)'
                      }}
                    />
                    
                    {/* Top face */}
                    <div 
                      className="absolute inset-x-0 h-1 rounded-t-sm bg-zinc-800"
                      style={{
                        top: '-1px',
                        transformOrigin: 'top',
                        transform: 'rotateX(90deg)'
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Export the component wrapped with error boundary
const StepSequencer = withErrorBoundary(StepSequencerBase, 'StepSequencer');
export default StepSequencer;