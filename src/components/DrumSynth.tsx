import React, { useState, useEffect } from 'react';
import LED from './ui/led';
import withErrorBoundary from './ui/withErrorBoundary';
import { Slider } from './ui/slider'; // Korrekter Import der Slider-Komponente
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

interface DrumSynthProps {
  pads: DrumPadData[];
  onTogglePad: (id: number) => void;
  currentStep?: number;
  className?: string;
  selectedPad?: number;
  onSelectPad?: (id: number) => void;
  onParamChange?: (padId: number, param: string, value: number) => void;
}

// Array von möglichen Pad-Farben
const padColors = [
  { base: '#9333ea', light: '#d8b4fe', highlight: '#e9d5ff' }, // Purple
  { base: '#2563eb', light: '#93c5fd', highlight: '#bfdbfe' }, // Blue
  { base: '#16a34a', light: '#86efac', highlight: '#bbf7d0' }, // Green
  { base: '#ca8a04', light: '#fcd34d', highlight: '#fef08a' }, // Yellow
  { base: '#dc2626', light: '#fca5a5', highlight: '#fee2e2' }, // Red
  { base: '#ea580c', light: '#fdba74', highlight: '#fed7aa' }, // Orange
  { base: '#0284c7', light: '#7dd3fc', highlight: '#bae6fd' }, // Sky Blue
  { base: '#0f766e', light: '#5eead4', highlight: '#99f6e4' }, // Teal
  { base: '#4f46e5', light: '#a5b4fc', highlight: '#c7d2fe' }, // Indigo
  { base: '#be185d', light: '#f9a8d4', highlight: '#fbcfe8' }, // Pink
];

export const DrumSynthBase: React.FC<DrumSynthProps> = ({
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

  // Generiere eine konsistente Pad-Farbe für jedes Pad basierend auf dessen ID
  const getPadColor = (padId: number) => {
    // Benutze den Pad-ID als Seed für die Farbauswahl
    const colorIndex = padId % padColors.length;
    return padColors[colorIndex];
  };

  return (
    <div className={`flex gap-6 ${className}`}>
      {/* Left side: Square pads grid with random colors */}
      <div className="grid grid-cols-4 gap-3 w-1/2">
        {pads.map((pad) => {
          // Wähle eine Farbe basierend auf der Pad-ID
          const padColor = getPadColor(pad.id);
          
          return (
            <div
              key={pad.id}
              className="aspect-square rounded-lg cursor-pointer transition-all duration-200 relative group"
              onClick={() => onTogglePad(pad.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                if (onSelectPad) onSelectPad(pad.id);
              }}
              style={{
                background: pad.active 
                  ? `linear-gradient(145deg, ${padColor.base}33, ${padColor.base}66)` 
                  : 'linear-gradient(145deg, #2a2a2a, #232323)',
                boxShadow: pad.active
                  ? `inset 5px 5px 10px ${padColor.base}33, inset -5px -5px 10px ${padColor.base}66, 0 0 15px ${padColor.base}66`
                  : 'inset 5px 5px 10px #1e1e1e, inset -5px -5px 10px #323232',
                border: pad.id === selectedPad 
                  ? `2px solid ${padColor.highlight}`
                  : pad.active 
                  ? `1px solid ${padColor.light}80` 
                  : '1px solid rgba(82, 82, 82, 0.3)',
                // Ensure perfect square with equal width and height
                width: '100%',
                height: '0',
                paddingBottom: '100%'
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-between p-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium" style={{
                      color: pad.id === selectedPad ? padColor.highlight : pad.active ? padColor.light : '#a1a1aa',
                      textShadow: pad.id === selectedPad ? `0 0 8px ${padColor.light}cc` : pad.active ? `0 0 5px ${padColor.light}80` : 'none'
                    }}>PAD {pad.id + 1}</span>
                    <span className="text-[10px] text-zinc-600">{pad.type}</span>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <LED active={pad.active} color={padColor.base} />
                    <LED active={pad.id === currentStep} color="#16a34a" size="xs" />
                    {pad.id === selectedPad && <LED active={true} color={padColor.light} size="xs" />}
                  </div>
                </div>
                
                <div 
                  className="text-center text-2xl relative flex items-center justify-center h-16 w-16 mx-auto"
                  style={{
                    color: pad.id === selectedPad ? padColor.highlight : pad.active ? padColor.light : '#71717a',
                    textShadow: pad.id === selectedPad ? `0 0 15px ${padColor.base}` : pad.active ? `0 0 10px ${padColor.base}` : 'none',
                  }}
                >
                  <i className={pad.type === 'HH' ? 'fa-solid fa-hat-cowboy' : 'fa-solid fa-drum'}></i>
                  
                  {/* 3D Push effect for active pads */}
                  {pad.active && (
                    <div className="absolute inset-0 rounded-full opacity-30 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
                  )}
                  
                  {/* Interactive hover effect */}
                  <div 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background: `radial-gradient(circle, ${padColor.base}33 0%, transparent 70%)`
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="flex flex-col items-start p-1 rounded bg-zinc-900/30">
                    <span className="text-[10px] text-zinc-600">VEL</span>
                    <span className="text-xs" style={{ 
                      color: pad.id === selectedPad ? padColor.highlight : pad.active ? padColor.light : '#a1a1a1',
                      textShadow: pad.id === selectedPad ? `0 0 5px ${padColor.light}` : pad.active ? `0 0 3px ${padColor.light}` : 'none'
                    }}>{pad.velocity}</span>
                  </div>
                  <div className="flex flex-col items-end p-1 rounded bg-zinc-900/30">
                    <span className="text-[10px] text-zinc-600">TUNE</span>
                    <span className="text-xs" style={{ 
                      color: pad.id === selectedPad ? padColor.highlight : pad.active ? padColor.light : '#a1a1a1',
                      textShadow: pad.id === selectedPad ? `0 0 5px ${padColor.light}` : pad.active ? `0 0 3px ${padColor.light}` : 'none'
                    }}>{pad.tuning}</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom highlight bar */}
              <div 
                className="absolute inset-x-0 bottom-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                style={{
                  background: `linear-gradient(90deg, ${padColor.base}00 0%, ${padColor.base}cc 50%, ${padColor.base}00 100%)`,
                  boxShadow: `0 0 10px ${padColor.base}80`
                }}
              ></div>
            </div>
          );
        })}
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
                    color={getPadColor(selectedPad).light} 
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
                        color={getPadColor(selectedPad).light}
                        showValue={false}
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
                        color={getPadColor(selectedPad).light}
                        showValue={false}
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
                        color={getPadColor(selectedPad).light}
                        showValue={false}
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
                        color={getPadColor(selectedPad).light}
                        showValue={false}
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


// Umbenennen der Komponente zu DrumSynth
const DrumSynth = withErrorBoundary(DrumSynthBase, 'DrumSynth');
export default DrumSynth;