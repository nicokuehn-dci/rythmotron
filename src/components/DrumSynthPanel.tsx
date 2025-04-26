import React, { useState, useEffect } from 'react';
import DrumGrid from './SynthPadGrid'; // Unsere umbenannte Komponente (in der Datei ist der Export noch unter diesem Namen)
import WaveformDisplay from './WaveformDisplay';
import { Button } from './ui/button';
import LED from './ui/led';
import Slider from './ui/slider';
import Switch from './ui/switch';
import withErrorBoundary from './ui/withErrorBoundary';

interface DrumSound {
  id: number;
  name: string;
  type: string;
  soundFile?: string;
  active: boolean;
  velocity: number;
  tuning: number;
  decay?: number;
  tone?: number;
  color?: string;
}

interface DrumSynthPanelProps {
  className?: string;
  onSoundTrigger?: (soundId: number, velocity: number) => void;
  onParameterChange?: (soundId: number, parameter: string, value: number) => void;
  currentStep?: number;
}

export const DrumSynthPanelBase: React.FC<DrumSynthPanelProps> = ({
  className = '',
  onSoundTrigger,
  onParameterChange,
  currentStep = -1
}) => {
  // Demo-Sounds für den DrumSynth
  const [sounds, setSounds] = useState<DrumSound[]>([
    { id: 0, name: 'Bass Drum', type: 'BD', soundFile: 'samples/bd.wav', active: false, velocity: 100, tuning: 0, decay: 50, tone: 60, color: '#9333ea' },
    { id: 1, name: 'Snare', type: 'SD', soundFile: 'samples/sd.wav', active: false, velocity: 90, tuning: 0, decay: 60, tone: 50, color: '#6366f1' },
    { id: 2, name: 'Hihat', type: 'HH', soundFile: 'samples/hh.wav', active: false, velocity: 80, tuning: 0, decay: 30, tone: 70, color: '#10b981' },
    { id: 3, name: 'Clap', type: 'CP', soundFile: 'samples/cp.wav', active: false, velocity: 95, tuning: 0, decay: 40, tone: 55, color: '#f97316' },
    { id: 4, name: 'Tom Low', type: 'TL', soundFile: 'samples/tom1.wav', active: false, velocity: 100, tuning: -10, decay: 65, tone: 40, color: '#f43f5e' },
    { id: 5, name: 'Tom Mid', type: 'TM', soundFile: 'samples/tom2.wav', active: false, velocity: 90, tuning: 0, decay: 60, tone: 45, color: '#ec4899' },
    { id: 6, name: 'Tom Hi', type: 'TH', soundFile: 'samples/tom3.wav', active: false, velocity: 85, tuning: 10, decay: 55, tone: 50, color: '#8b5cf6' },
    { id: 7, name: 'Cymbal', type: 'CY', soundFile: 'samples/cym.wav', active: false, velocity: 75, tuning: 0, decay: 80, tone: 65, color: '#0ea5e9' },
    { id: 8, name: 'Perc 1', type: 'P1', soundFile: 'samples/perc1.wav', active: false, velocity: 70, tuning: 0, decay: 40, tone: 60, color: '#eab308' },
    { id: 9, name: 'Perc 2', type: 'P2', soundFile: 'samples/perc2.wav', active: false, velocity: 85, tuning: 5, decay: 50, tone: 65, color: '#84cc16' },
    { id: 10, name: 'FX 1', type: 'FX', soundFile: 'samples/fx1.wav', active: false, velocity: 90, tuning: 0, decay: 70, tone: 70, color: '#06b6d4' },
    { id: 11, name: 'FX 2', type: 'F2', soundFile: 'samples/fx2.wav', active: false, velocity: 80, tuning: -5, decay: 75, tone: 55, color: '#8b5cf6' },
    { id: 12, name: 'Cowbell', type: 'CB', soundFile: 'samples/cowbell.wav', active: false, velocity: 95, tuning: 0, decay: 45, tone: 60, color: '#fb7185' },
    { id: 13, name: 'Rim', type: 'RM', soundFile: 'samples/rim.wav', active: false, velocity: 100, tuning: 0, decay: 30, tone: 50, color: '#94a3b8' },
    { id: 14, name: 'Shake', type: 'SH', soundFile: 'samples/shake.wav', active: false, velocity: 85, tuning: 0, decay: 90, tone: 65, color: '#a3e635' },
    { id: 15, name: 'Click', type: 'CL', soundFile: 'samples/click.wav', active: false, velocity: 90, tuning: 0, decay: 20, tone: 75, color: '#fbbf24' }
  ]);

  // Zustand für ausgewählten Sound
  const [selectedSound, setSelectedSound] = useState<number>(-1);
  
  // Zustand für Master-Volume
  const [masterVolume, setMasterVolume] = useState<number>(80);
  
  // Zustand für aktuelle Ansicht im Panel (Basic, Advanced)
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  // Sound-Pad aktivieren/deaktivieren
  const handleToggleSound = (soundId: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        // Toggle the active state
        const newActiveState = !sound.active;
        
        // Trigger sound if being activated
        if (newActiveState && onSoundTrigger) {
          onSoundTrigger(soundId, sound.velocity);
        }
        
        return { ...sound, active: newActiveState };
      }
      return sound;
    }));
  };

  // Sound-Pad auswählen für Parameter-Bearbeitung
  const handleSelectSound = (soundId: number) => {
    setSelectedSound(soundId);
  };

  // Parameter eines Sounds ändern
  const handleParameterChange = (soundId: number, param: string, value: number) => {
    setSounds(prev => prev.map(sound => {
      if (sound.id === soundId) {
        const updatedSound = { ...sound, [param]: value };
        
        // Callback für externe Parameter-Änderungen
        if (onParameterChange) {
          onParameterChange(soundId, param, value);
        }
        
        return updatedSound;
      }
      return sound;
    }));
  };

  // Alle Sounds deaktivieren
  const handleClearAll = () => {
    setSounds(prev => prev.map(sound => ({ ...sound, active: false })));
  };

  // Demo-Pattern laden
  const handleLoadDemo = () => {
    // Aktiviere bestimmte Sounds als Demo
    setSounds(prev => prev.map(sound => {
      // BD auf 1, 5, 9, 13
      if (sound.id === 0) {
        return { ...sound, active: [0, 4, 8, 12].includes(currentStep % 16) };
      }
      // SD auf 5, 13
      else if (sound.id === 1) {
        return { ...sound, active: [4, 12].includes(currentStep % 16) };
      }
      // HH auf jedem Schlag
      else if (sound.id === 2) {
        return { ...sound, active: true };
      }
      // Clap auf 5, 13
      else if (sound.id === 3) {
        return { ...sound, active: [4, 12].includes(currentStep % 16) };
      }
      return sound;
    }));
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
      {/* 3D Panel Edges Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-x-0 top-0 h-0.5" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)'
          }} 
        />
        <div 
          className="absolute inset-y-0 right-0 w-0.5" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.1)'
          }} 
        />
        <div 
          className="absolute inset-x-0 bottom-0 h-0.5" 
          style={{ 
            background: 'rgba(0, 0, 0, 0.5)'
          }} 
        />
        <div 
          className="absolute inset-y-0 left-0 w-0.5" 
          style={{ 
            background: 'rgba(0, 0, 0, 0.5)'
          }} 
        />
      </div>
      
      {/* Header mit Titel und Steuerungen */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium relative inline-flex items-center">
          <span 
            className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent"
            style={{
              textShadow: '0 0 15px rgba(168, 85, 247, 0.5)'
            }}
          >
            RYTHMOTRON DRUM SYNTH
          </span>
          <LED active={true} color="#9333ea" className="ml-2" size="sm" pulse />
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* Modus-Umschalter */}
          <div className="flex items-center space-x-2 bg-zinc-800/70 px-3 py-1.5 rounded-md">
            <button 
              className={`text-xs px-2 py-1 rounded transition-colors ${viewMode === 'basic' ? 'bg-purple-800/50 text-purple-200' : 'text-zinc-400'}`}
              onClick={() => setViewMode('basic')}
            >
              Basic
            </button>
            <button 
              className={`text-xs px-2 py-1 rounded transition-colors ${viewMode === 'advanced' ? 'bg-purple-800/50 text-purple-200' : 'text-zinc-400'}`}
              onClick={() => setViewMode('advanced')}
            >
              Advanced
            </button>
          </div>
          
          {/* Master-Volume */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Master</span>
            <Slider
              value={masterVolume}
              onChange={setMasterVolume}
              min={0}
              max={100}
              color="#9333ea"
              size="sm"
              showValue={false}
              className="w-24" 
            />
            <span className="text-xs text-zinc-400 w-6">{masterVolume}</span>
          </div>
        </div>
      </div>

      {/* Hauptinhalt: DrumGrid */}
      <DrumGrid
        pads={sounds.map(sound => ({
          id: sound.id,
          active: sound.active,
          type: sound.type,
          velocity: sound.velocity,
          tuning: sound.tuning,
          soundFile: sound.soundFile,
          decay: sound.decay,
          tone: sound.tone,
          color: sound.color
        }))}
        onTogglePad={handleToggleSound}
        onSelectPad={handleSelectSound}
        onParamChange={handleParameterChange}
        selectedPad={selectedSound}
        currentStep={currentStep}
        className="mb-6"
      />

      {/* Zusätzliche Kontrollen für erweiterten Modus */}
      {viewMode === 'advanced' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Linke Spalte: Global Controls */}
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4 text-zinc-300">Global Controls</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Reverb Send */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Reverb Send</span>
                  <span className="text-xs text-zinc-500">50%</span>
                </div>
                <Slider
                  value={50}
                  onChange={() => {}}
                  min={0}
                  max={100}
                  color="#8b5cf6"
                  size="sm"
                  showValue={false}
                />
              </div>
              
              {/* Delay Send */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Delay Send</span>
                  <span className="text-xs text-zinc-500">30%</span>
                </div>
                <Slider
                  value={30}
                  onChange={() => {}}
                  min={0}
                  max={100}
                  color="#8b5cf6"
                  size="sm"
                  showValue={false}
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              {/* Global Pitch */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Global Pitch</span>
                  <span className="text-xs text-zinc-500">0</span>
                </div>
                <Slider
                  value={50}
                  onChange={() => {}}
                  min={0}
                  max={100}
                  color="#8b5cf6"
                  size="sm"
                  showValue={false}
                />
              </div>
              
              {/* Global Decay */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-zinc-400">Global Decay</span>
                  <span className="text-xs text-zinc-500">100%</span>
                </div>
                <Slider
                  value={100}
                  onChange={() => {}}
                  min={0}
                  max={100}
                  color="#8b5cf6"
                  size="sm"
                  showValue={false}
                />
              </div>
            </div>
          </div>
          
          {/* Rechte Spalte: Utility */}
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-4 text-zinc-300">Utility</h4>
            
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Randomize Velocity</span>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  color="#9333ea"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Humanize Timing</span>
                <Switch
                  checked={true}
                  onChange={() => {}}
                  color="#9333ea"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Sample Mode</span>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  color="#9333ea"
                />
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button 
                onClick={handleClearAll}
                className="bg-zinc-700 hover:bg-zinc-600 text-zinc-200 border-zinc-600"
              >
                Clear All
              </Button>
              <Button 
                onClick={handleLoadDemo}
                className="bg-purple-800 hover:bg-purple-700 text-purple-100 border-purple-700"
              >
                Load Demo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Komponente mit Error Boundary exportieren
const DrumSynthPanel = withErrorBoundary(DrumSynthPanelBase, 'DrumSynthPanel');
export default DrumSynthPanel;