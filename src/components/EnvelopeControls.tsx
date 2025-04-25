import React from 'react';
import Knob from './KnobWrapper';
import withErrorBoundary from './ui/withErrorBoundary';

interface EnvelopeControlsProps {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  onAttackChange: (value: number) => void;
  onDecayChange: (value: number) => void;
  onSustainChange: (value: number) => void;
  onReleaseChange: (value: number) => void;
  className?: string;
  color?: string;
}

const EnvelopeControlsBase: React.FC<EnvelopeControlsProps> = ({
  attack,
  decay,
  sustain,
  release,
  onAttackChange,
  onDecayChange,
  onSustainChange,
  onReleaseChange,
  className = '',
  color = '#10b981',
}) => {
  // Helper function to format time values
  const formatTime = (value: number): string => {
    if (value < 10) {
      return `${value.toFixed(2)}ms`;
    } else if (value < 1000) {
      return `${Math.round(value)}ms`;
    } else {
      return `${(value / 1000).toFixed(2)}s`;
    }
  };

  // Convert normalized values (0-100) to time values
  const getAttackTime = (value: number) => Math.pow(value / 100, 2) * 2000; // 0-2s exponential
  const getDecayTime = (value: number) => Math.pow(value / 100, 2) * 1500;  // 0-1.5s exponential
  const getReleaseTime = (value: number) => Math.pow(value / 100, 2) * 3000; // 0-3s exponential

  return (
    <div 
      className={`p-5 rounded-xl relative overflow-hidden ${className}`}
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
        Envelope
      </h3>
      
      {/* Parameters in a 3D inset panel */}
      <div 
        className="mb-5 rounded-lg p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 2px rgba(60, 60, 60, 0.1)'
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Attack */}
          <div className="flex flex-col items-center">
            <Knob
              value={attack}
              onChange={onAttackChange}
              label="Attack"
              size="md"
              color={color}
              min={0}
              max={100}
            />
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
                {formatTime(getAttackTime(attack))}
              </span>
            </div>
          </div>
          
          {/* Decay */}
          <div className="flex flex-col items-center">
            <Knob
              value={decay}
              onChange={onDecayChange}
              label="Decay"
              size="md"
              color={color}
              min={0}
              max={100}
            />
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
                {formatTime(getDecayTime(decay))}
              </span>
            </div>
          </div>
          
          {/* Sustain */}
          <div className="flex flex-col items-center">
            <Knob
              value={sustain}
              onChange={onSustainChange}
              label="Sustain"
              size="md"
              color={color}
              min={0}
              max={100}
            />
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
                {sustain}%
              </span>
            </div>
          </div>
          
          {/* Release */}
          <div className="flex flex-col items-center">
            <Knob
              value={release}
              onChange={onReleaseChange}
              label="Release"
              size="md"
              color={color}
              min={0}
              max={100}
            />
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
                {formatTime(getReleaseTime(release))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Envelope visualization with 3D depth */}
      <div className="mt-5">
        <div 
          className="h-28 w-full rounded-lg overflow-hidden p-2 relative"
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
            preserveAspectRatio="none"
            className="w-full h-full relative z-10"
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
            
            {/* Envelope path with enhanced 3D glow */}
            {(() => {
              // Calculate envelope points based on ADSR values
              const attackWidth = Math.max(3, Math.min(25, attack / 4)); // 0-25
              const decayWidth = Math.max(3, Math.min(20, decay / 5)); // 0-20
              const sustainHeight = 50 - sustain / 2; // 50-0 (inverted for SVG)
              const releaseWidth = Math.max(3, Math.min(30, release / 3.33)); // 0-30
              
              // Fixed points
              const start = [0, 50];
              const peak = [attackWidth, 0];
              const sustainStart = [attackWidth + decayWidth, sustainHeight];
              const sustainEnd = [70, sustainHeight];
              const end = [70 + releaseWidth, 50];
              
              const path = `
                M ${start[0]},${start[1]}
                L ${peak[0]},${peak[1]}
                L ${sustainStart[0]},${sustainStart[1]}
                L ${sustainEnd[0]},${sustainEnd[1]}
                L ${end[0]},${end[1]}
              `;
              
              return (
                <>
                  {/* Shadow effect for 3D depth */}
                  <path
                    d={path}
                    fill="none"
                    stroke={`${color}40`}
                    strokeWidth="6"
                    filter="blur(4px)"
                  />
                  
                  {/* Main line */}
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    filter="drop-shadow(0 0 2px ${color}60)"
                  />
                </>
              );
            })()}

            {/* Marker points */}
            {(() => {
              const attackWidth = Math.max(3, Math.min(25, attack / 4));
              const decayWidth = Math.max(3, Math.min(20, decay / 5));
              const sustainHeight = 50 - sustain / 2;
              
              return (
                <>
                  <circle cx={attackWidth} cy={0} r="2" fill={color} />
                  <circle cx={attackWidth + decayWidth} cy={sustainHeight} r="2" fill={color} />
                </>
              );
            })()}
          </svg>

          {/* Labels with 3D text effect */}
          <div className="absolute bottom-2 left-2 text-xs opacity-70" style={{ color }}>A</div>
          <div className="absolute bottom-2 left-[calc(25%+2px)] text-xs opacity-70" style={{ color }}>D</div>
          <div className="absolute bottom-2 left-[calc(50%+2px)] text-xs opacity-70" style={{ color }}>S</div>
          <div className="absolute bottom-2 left-[calc(75%+2px)] text-xs opacity-70" style={{ color }}>R</div>
        </div>
      </div>
    </div>
  );
};

// Add error handling
const EnvelopeControls = withErrorBoundary(EnvelopeControlsBase, 'EnvelopeControls');
export default EnvelopeControls;