import AudioMIDITestButton from './AudioMIDITestButton';
import React, { useState, useEffect } from 'react';
import DrumSynth from './DrumSynth';
import WaveformDisplay from './WaveformDisplay';
import { Button } from './ui/button';
import LED from './ui/led';
import { Slider } from './ui/slider';
import Switch from './ui/switch';
import withErrorBoundary from './ui/withErrorBoundary';
import KnobWrapper from './KnobWrapper';
import { DrumSynthType, OscillatorType } from '../lib/services/Sequencer';
import audioEngine from '../lib/services/AudioEngine';

interface DrumSynthPanelProps {
  className?: string;
  selectedTrack?: number;
  trackData?: any;
  onParameterChange?: (param: string, value: number) => void;
  onSoundTrigger?: (soundId: number, velocity: number) => void;
  currentStep?: number;
}

const DrumSynthPanel: React.FC<DrumSynthPanelProps> = ({
  className = '',
  selectedTrack,
  trackData,
  onParameterChange = () => {},
  onSoundTrigger,
  currentStep = -1
}) => {
  // Standard Parameter für alle Drum-Typen
  const [decay, setDecay] = useState(50);
  const [tone, setTone] = useState(50);
  const [tuning, setTuning] = useState(50);
  
  // Spezifische Parameter je nach DrumSynth-Type
  const [attack, setAttack] = useState(70);  // Für Kick: Click-Stärke
  const [snappy, setSnappy] = useState(50);  // Für Snare: Noise/Tone-Verhältnis
  const [color, setColor] = useState(50);    // Für Hats/Percussion: Spektrale Farbe
  
  // State variables for UI controls
  const [masterVolume, setMasterVolume] = useState<number>(80);
  const [viewMode, setViewMode] = useState<'basic' | 'advanced'>('basic');

  // Aktuelle Synth-Typ aus trackData
  const synthType = trackData?.synthType || DrumSynthType.TR808_KICK;

  // Parameter-Update wenn sich der Track ändert
  useEffect(() => {
    if (trackData) {
      // Lade die Parameter aus dem ersten Step des Tracks (als Default-Werte)
      const firstStep = trackData.steps?.[0] || {};
      setDecay(firstStep.decay || 50);
      setTone(firstStep.tone || 50);
      setTuning(firstStep.tuning ? firstStep.tuning + 50 : 50); // -50 bis +50 zu 0-100 konvertieren
      setAttack(firstStep.attack || 70);
      setSnappy(firstStep.snappy || 50);
      setColor(firstStep.color || 50);
    }
  }, [trackData, selectedTrack]);

  // Parameter-Veränderung weiterleiten
  const handleChange = (param: string, value: number) => {
    switch (param) {
      case 'decay':
        setDecay(value);
        break;
      case 'tone':
        setTone(value);
        break;
      case 'tuning':
        setTuning(value);
        break;
      case 'attack':
        setAttack(value);
        break;
      case 'snappy':
        setSnappy(value);
        break;
      case 'color':
        setColor(value);
        break;
    }
    
    onParameterChange(param, value);
  };

  // Sound testen
  const testSound = () => {
    if (!audioEngine.isInitialized) {
      audioEngine.initialize();
    }
    
    // Parameter normalisieren
    const params = {
      velocity: 0.8,
      decay: decay / 100,
      tone: tone / 100,
      tuning: (tuning - 50) / 50, // 0-100 zu -1 bis +1 konvertieren
      attack: attack / 100,
      snappy: snappy / 100,
      color: color / 100,
      synthType: trackData?.synthType || DrumSynthType.TR808_KICK
    };
    
    audioEngine.synthesizeDrum(params.synthType, params);
  };

  // Zeige unterschiedliche Parameter je nach Synth-Typ
  const renderSynthTypeSpecificControls = () => {
    switch (synthType) {
      case DrumSynthType.TR808_KICK:
      case DrumSynthType.TR909_KICK:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Attack"
                value={attack}
                onChange={(value) => handleChange('attack', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Tuning"
                value={tuning}
                onChange={(value) => handleChange('tuning', value)}
                min={0}
                max={100}
                centerMark
              />
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      case DrumSynthType.TR808_SNARE:
      case DrumSynthType.TR909_SNARE:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Tuning"
                value={tuning}
                onChange={(value) => handleChange('tuning', value)}
                min={0}
                max={100}
                centerMark
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Snappy"
                value={snappy}
                onChange={(value) => handleChange('snappy', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      case DrumSynthType.TR808_HAT:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Color"
                value={color}
                onChange={(value) => handleChange('color', value)}
                min={0}
                max={100}
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      case DrumSynthType.TR808_CLAP:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Color"
                value={color}
                onChange={(value) => handleChange('color', value)}
                min={0}
                max={100}
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      case DrumSynthType.TR909_TOM:
      case DrumSynthType.TR808_TOM:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tuning"
                value={tuning}
                onChange={(value) => handleChange('tuning', value)}
                min={0}
                max={100}
                centerMark
              />
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      case DrumSynthType.FM_DRUM:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tuning"
                value={tuning}
                onChange={(value) => handleChange('tuning', value)}
                min={0}
                max={100}
                centerMark
              />
              <KnobWrapper
                label="Color"
                value={color}
                onChange={(value) => handleChange('color', value)}
                min={0}
                max={100}
              />
            </div>
            <div className="param-row">
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
      
      default:
        return (
          <>
            <div className="param-row">
              <KnobWrapper
                label="Tone"
                value={tone}
                onChange={(value) => handleChange('tone', value)}
                min={0}
                max={100}
              />
              <KnobWrapper
                label="Decay"
                value={decay}
                onChange={(value) => handleChange('decay', value)}
                min={0}
                max={100}
              />
            </div>
          </>
        );
    }
  };

  // Synthese-Typ Info anzeigen
  const getSynthTypeTitle = () => {
    switch (synthType) {
      case DrumSynthType.TR808_KICK: return 'TR-808 Kick';
      case DrumSynthType.TR909_KICK: return 'TR-909 Kick';
      case DrumSynthType.TR808_SNARE: return 'TR-808 Snare';
      case DrumSynthType.TR909_SNARE: return 'TR-909 Snare';
      case DrumSynthType.TR808_HAT: return 'TR-808 Hi-Hat';
      case DrumSynthType.TR808_CLAP: return 'TR-808 Clap';
      case DrumSynthType.TR909_TOM: return 'TR-909 Tom';
      case DrumSynthType.TR808_TOM: return 'TR-808 Tom';
      case DrumSynthType.FM_DRUM: return 'FM Percussion';
      case DrumSynthType.NOISE: return 'Noise Percussion';
      default: return 'Drum Synthesizer';
    }
  };

  // Preset management
  const [presets, setPresets] = useState<{[key: string]: any}>({
    'TR-808 Kick': { decay: 60, tone: 40, tuning: 50, attack: 70 },
    'TR-909 Kick': { decay: 50, tone: 60, tuning: 45, attack: 80 },
    'Boom Kick': { decay: 90, tone: 20, tuning: 35, attack: 40 },
    'Tight Snare': { decay: 30, tone: 70, tuning: 55, snappy: 80 },
    'Room Snare': { decay: 70, tone: 50, tuning: 50, snappy: 60 },
    'Crisp Hat': { decay: 20, tone: 80, color: 70 },
    'FM Perc 1': { decay: 40, tone: 60, tuning: 65, color: 75 },
  });
  
  const [showWaveform, setShowWaveform] = useState<boolean>(false);
  const [currentPreset, setCurrentPreset] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  
  // Load a preset
  const loadPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      // Update all parameters from preset
      setDecay(preset.decay || decay);
      setTone(preset.tone || tone);
      setTuning(preset.tuning || tuning);
      setAttack(preset.attack || attack);
      setSnappy(preset.snappy || snappy);
      setColor(preset.color || color);
      
      // Notify parameter changes
      Object.entries(preset).forEach(([param, value]) => {
        onParameterChange(param, value as number);
      });
      
      setCurrentPreset(presetName);
    }
  };
  
  // Save current settings as a preset
  const savePreset = () => {
    const presetName = newPresetName || `Custom ${Object.keys(presets).length + 1}`;
    
    // Create new preset with current values
    const newPreset = {
      decay,
      tone,
      tuning,
      attack,
      snappy,
      color
    };
    
    // Update presets list
    setPresets({
      ...presets,
      [presetName]: newPreset
    });
    
    setCurrentPreset(presetName);
    setNewPresetName('');
    setIsEditing(false);
  };
  
  // Toggle waveform visualization
  const toggleWaveform = () => {
    setShowWaveform(!showWaveform);
  };

  return (
    <div className={`drum-synth-panel ${className}`}>
      {/* Header with title and controls */}
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
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <span className="mr-2 text-sm">Basic</span>
            <Switch
              checked={viewMode === 'advanced'}
              onChange={(checked) => setViewMode(checked ? 'advanced' : 'basic')}
            />
            <span className="ml-2 text-sm">Advanced</span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={toggleWaveform}
            className="text-xs"
          >
            {showWaveform ? 'Hide Waveform' : 'Show Waveform'}
          </Button>
          
          <Button
            size="sm"
            variant="secondary"
            onClick={testSound}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Test Sound
          </Button>
        </div>
      </div>
      
      {/* Synth type display */}
      <div className="bg-black/30 p-3 rounded-md mb-4 flex justify-between items-center">
        <div>
          <h4 className="text-lg font-bold">{getSynthTypeTitle()}</h4>
          <p className="text-xs opacity-70">Track {selectedTrack !== undefined ? selectedTrack + 1 : '-'}</p>
        </div>
        
        {/* Preset selector */}
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <select 
                className="bg-black/50 border border-purple-800/50 rounded-md p-1 text-sm"
                value={currentPreset}
                onChange={(e) => loadPreset(e.target.value)}
              >
                <option value="">Select Preset</option>
                {Object.keys(presets).map(preset => (
                  <option key={preset} value={preset}>{preset}</option>
                ))}
              </select>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>Save</Button>
            </>
          ) : (
            <>
              <input
                type="text"
                placeholder="Preset name"
                className="bg-black/50 border border-purple-800/50 rounded-md p-1 text-sm"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={savePreset}>Save</Button>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          )}
        </div>
      </div>
      
      {/* Waveform visualizer */}
      {showWaveform && (
        <div className="mb-4">
          <WaveformDisplay 
            className="h-24 w-full" 
            synthType={synthType}
            parameters={{
              decay: decay / 100,
              tone: tone / 100,
              tuning: (tuning - 50) / 50,
              attack: attack / 100,
              snappy: snappy / 100,
              color: color / 100
            }}
          />
        </div>
      )}
      
      {/* Main controls section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black/20 p-4 rounded-md">
          <h4 className="text-sm font-medium mb-4 uppercase tracking-wider opacity-70">Synth Parameters</h4>
          {renderSynthTypeSpecificControls()}
        </div>
        
        {viewMode === 'advanced' && (
          <div className="bg-black/20 p-4 rounded-md">
            <h4 className="text-sm font-medium mb-4 uppercase tracking-wider opacity-70">Advanced Controls</h4>
            <div className="param-row">
              <KnobWrapper
                label="Master Volume"
                value={masterVolume}
                onChange={(value) => setMasterVolume(value)}
                min={0}
                max={100}
              />
            </div>
            
            <div className="mt-4">
              <h5 className="text-xs mb-2 opacity-70">Modulation</h5>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="lfo-enable" className="accent-purple-600" />
                  <label htmlFor="lfo-enable" className="text-xs">LFO</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="env-enable" className="accent-purple-600" />
                  <label htmlFor="env-enable" className="text-xs">Envelope</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="rand-enable" className="accent-purple-600" />
                  <label htmlFor="rand-enable" className="text-xs">Randomize</label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer with additional controls */}
      <div className="mt-6 flex justify-between">
        <AudioMIDITestButton variant="outline" size="sm" onClick={testSound} />
        
        <div className="text-xs text-right opacity-70">
          <p>Current preset: {currentPreset || 'None'}</p>
          <p>Drum Type: {getSynthTypeTitle()}</p>
        </div>
      </div>
      
      <style jsx>{`
        .drum-synth-panel {
          background: linear-gradient(to bottom, #303438, #1a1c20);
          border: 1px solid #444;
          border-radius: 8px;
          padding: 15px;
          color: #eee;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          margin-bottom: 20px;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }
        .panel-header h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 500;
          color: #f0f0f0;
        }
        .test-sound-button {
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: bold;
          transition: background 0.2s;
        }
        .test-sound-button:hover {
          background: #c0392b;
        }
        .synth-parameters {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .param-row {
          display: flex;
          justify-content: space-around;
          gap: 15px;
        }
      `}</style>
    </div>
  );
};

export default DrumSynthPanel;