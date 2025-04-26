import React, { useState } from 'react';
import LED from '@/components/ui/led';
import withErrorBoundary from './ui/withErrorBoundary';
import Slider from '@/components/ui/slider'; // Slider statt react-native Slider
import WaveformDisplay from './WaveformDisplay'; // Importiere die Wellenformanzeige als Default-Export

interface DrumPadData {
  id: number;
  active: boolean;
  type: string;
  velocity: number;
  tuning: number;
  soundFile?: string;
  decay?: number;
  tone?: number;
  color?: string;
}

interface DrumGridProps {
  pads: DrumPadData[];
  onTogglePad: (id: number) => void;
  currentStep?: number;
  className?: string;
  selectedPad?: number;
  onSelectPad?: (id: number) => void;
  onParamChange?: (padId: number, param: string, value: number) => void;
}

export const DrumGridBase: React.FC<DrumGridProps> = ({
  pads,
  onTogglePad,
  currentStep = -1,
  className = '',
  selectedPad = -1,
  onSelectPad,
  onParamChange
}) => {
  // Standard Paramater für unausgewählten Pad
  const defaultParams = {
    velocity: 100,
    tuning: 0,
    decay: 50,
    tone: 50
  };

  // Der aktuell ausgewählte Pad oder Default-Werte
  const selectedPadData = pads.find(pad => pad.id === selectedPad) || {
    id: -1,
    active: false,
    type: '',
    ...defaultParams
  };

  // Parameteränderung verarbeiten
  const handleParamChange = (param: string, value: number) => {
    if (selectedPad >= 0 && onParamChange) {
      onParamChange(selectedPad, param, value);
    }
  };

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Left side: Smaller pads grid */}
      <div className="grid grid-cols-4 gap-2 w-1/2">
        {pads.map((pad) => (
          <div
            key={pad.id}
            className={`aspect-square rounded-lg cursor-pointer transition-all duration-200 relative group`}
            onClick={() => onTogglePad(pad.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (onSelectPad) onSelectPad(pad.id);
            }}
            style={{
              background: pad.active 
                ? 'linear-gradient(145deg, #342b4a, #251d36)' 
                : 'linear-gradient(145deg, #2a2a2a, #232323)',
              boxShadow: pad.active
                ? 'inset 5px 5px 10px #1e1727, inset -5px -5px 10px #3c3158, 0 0 15px rgba(168, 85, 247, 0.3)'
                : 'inset 5px 5px 10px #1e1e1e, inset -5px -5px 10px #323232',
              border: pad.id === selectedPad 
                ? '2px solid rgba(168, 85, 247, 0.9)'
                : pad.active 
                ? '1px solid rgba(168, 85, 247, 0.5)' 
                : '1px solid rgba(82, 82, 82, 0.3)'
            }}
          >
            <div className="flex flex-col h-full justify-between p-3">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-xs font-medium" style={{
                    color: pad.id === selectedPad ? '#e9d5ff' : pad.active ? '#d8b4fe' : '#a1a1aa',
                    textShadow: pad.id === selectedPad ? '0 0 8px rgba(216, 180, 254, 0.8)' : pad.active ? '0 0 5px rgba(216, 180, 254, 0.5)' : 'none'
                  }}>PAD {pad.id + 1}</span>
                  <span className="text-[10px] text-zinc-600">{pad.type}</span>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <LED active={pad.active} color="purple" />
                  <LED active={pad.id === currentStep} color="green" size="xs" />
                  {pad.id === selectedPad && <LED active={true} color="#e9d5ff" size="xs" />}
                </div>
              </div>
              
              <div 
                className="text-center text-2xl relative flex items-center justify-center h-16 w-16 mx-auto"
                style={{
                  color: pad.id === selectedPad ? '#e9d5ff' : pad.active ? '#d8b4fe' : '#71717a',
                  textShadow: pad.id === selectedPad ? '0 0 15px rgba(168, 85, 247, 0.9)' : pad.active ? '0 0 10px rgba(168, 85, 247, 0.7)' : 'none',
                }}
              >
                <i className={pad.type === 'HH' ? 'fa-solid fa-hat-cowboy' : 'fa-solid fa-drum'}></i>
                
                {/* 3D Push effect for active pads */}
                {pad.active && (
                  <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-br from-purple-300/10 via-transparent to-transparent"></div>
                )}
                
                {/* Interactive hover effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)'
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col items-start p-1 rounded bg-zinc-900/30">
                  <span className="text-[10px] text-zinc-600">VEL</span>
                  <span className="text-xs" style={{ 
                    color: pad.id === selectedPad ? '#e9d5ff' : pad.active ? '#d8b4fe' : '#a1a1aa',
                    textShadow: pad.id === selectedPad ? '0 0 5px rgba(216, 180, 254, 0.5)' : pad.active ? '0 0 3px rgba(216, 180, 254, 0.3)' : 'none'
                  }}>{pad.velocity}</span>
                </div>
                <div className="flex flex-col items-end p-1 rounded bg-zinc-900/30">
                  <span className="text-[10px] text-zinc-600">TUNE</span>
                  <span className="text-xs" style={{ 
                    color: pad.id === selectedPad ? '#e9d5ff' : pad.active ? '#d8b4fe' : '#a1a1aa',
                    textShadow: pad.id === selectedPad ? '0 0 5px rgba(216, 180, 254, 0.5)' : pad.active ? '0 0 3px rgba(216, 180, 254, 0.3)' : 'none'
                  }}>{pad.tuning}</span>
                </div>
              </div>
            </div>
            
            {/* Bottom highlight bar */}
            <div 
              className="absolute inset-x-0 bottom-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
              style={{
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0) 0%, rgba(168, 85, 247, 0.7) 50%, rgba(168, 85, 247, 0) 100%)',
                boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
              }}
            ></div>
          </div>
        ))}
      </div>
      
      {/* Right side: Purple screen with 3D shadow and gradient - now showing pad parameters */}
      <div className="w-1/2 rounded-xl relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #9333ea, #7e22ce, #6b21a8)',
        boxShadow: '0 10px 30px rgba(168, 85, 247, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)',
        border: '1px solid rgba(168, 85, 247, 0.8)'
      }}>
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(233, 213, 255, 0.3) 0%, transparent 50%)'
        }}></div>
        
        <div className="p-6 h-full flex flex-col">
          <div className="text-white text-lg font-medium mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">DRUMSYNTH</span>
              <LED active={true} color="purple" />
            </div>
            <div className="text-sm">
              {selectedPad >= 0 ? `PAD ${selectedPad + 1} ${selectedPadData.type}` : 'NO PAD SELECTED'}
            </div>
          </div>
          
          {/* Hauptinhalt des Screens */}
          <div className="flex-1 flex flex-col">
            {selectedPad >= 0 ? (
              <>
                {/* Wellenformanzeige */}
                <div className="mb-4 bg-black/20 rounded-md p-2" style={{
                  boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5)'
                }}>
                  <WaveformDisplay 
                    height={80} 
                    color="#e9d5ff" 
                    isPlaying={true}
                  />
                </div>
                
                {/* Parameter-Steuerungen */}
                <div className="space-y-4">
                  {/* Velocity-Steuerung */}
                  <div className="flex items-center">
                    <span className="w-20 text-xs text-white/80">VELOCITY</span>
                    <div className="flex-grow">
                      <Slider
                        value={selectedPadData.velocity || defaultParams.velocity}
                        onChange={(val) => handleParamChange('velocity', val)}
                        min={0}
                        max={127}
                        color="#e9d5ff"
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-white/80">
                      {selectedPadData.velocity || defaultParams.velocity}
                    </span>
                  </div>
                  
                  {/* Tuning-Steuerung */}
                  <div className="flex items-center">
                    <span className="w-20 text-xs text-white/80">TUNING</span>
                    <div className="flex-grow">
                      <Slider
                        value={selectedPadData.tuning !== undefined ? selectedPadData.tuning + 50 : defaultParams.tuning + 50}
                        onChange={(val) => handleParamChange('tuning', val - 50)}
                        min={0}
                        max={100}
                        color="#e9d5ff"
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-white/80">
                      {selectedPadData.tuning !== undefined ? selectedPadData.tuning : defaultParams.tuning}
                    </span>
                  </div>
                  
                  {/* Decay-Steuerung */}
                  <div className="flex items-center">
                    <span className="w-20 text-xs text-white/80">DECAY</span>
                    <div className="flex-grow">
                      <Slider
                        value={selectedPadData.decay || defaultParams.decay}
                        onChange={(val) => handleParamChange('decay', val)}
                        min={0}
                        max={100}
                        color="#e9d5ff"
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-white/80">
                      {selectedPadData.decay || defaultParams.decay}
                    </span>
                  </div>
                  
                  {/* Tone/Filter-Steuerung */}
                  <div className="flex items-center">
                    <span className="w-20 text-xs text-white/80">TONE</span>
                    <div className="flex-grow">
                      <Slider
                        value={selectedPadData.tone || defaultParams.tone}
                        onChange={(val) => handleParamChange('tone', val)}
                        min={0}
                        max={100}
                        color="#e9d5ff"
                      />
                    </div>
                    <span className="w-10 text-right text-xs text-white/80">
                      {selectedPadData.tone || defaultParams.tone}
                    </span>
                  </div>
                </div>

                {/* Sound-Datei-Info (falls vorhanden) */}
                {selectedPadData.soundFile && (
                  <div className="mt-4 text-xs text-white/70 bg-black/20 rounded p-2">
                    <div className="font-medium">Sound File:</div>
                    <div className="truncate">{selectedPadData.soundFile}</div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-white text-lg opacity-80 text-center" style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
                }}>
                  <div className="text-4xl mb-2">
                    <i className="fa-solid fa-waveform"></i>
                  </div>
                  <div>Rechtsklick auf Pad für Parameter</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Screen texture overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1), rgba(255,255,255,0.1) 1px, transparent 1px, transparent 2px)'
          }}></div>
          
          {/* Reflection/glare effect */}
          <div className="absolute inset-0 opacity-20" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, transparent 100%)'
          }}></div>
          
          {/* Bottom information bar */}
          <div className="border-t border-white/20 mt-auto pt-2 text-xs text-white/70 flex justify-between">
            <span>{selectedPad >= 0 ? 'PARAMETER EDIT MODE' : 'SYSTEM READY'}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// Umbenennen der Komponente zu DrumGrid
const DrumGrid = withErrorBoundary(DrumGridBase, 'DrumGrid');
export default DrumGrid;