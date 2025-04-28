import React, { useEffect, useState } from 'react';
import DrumSynthPanel from './DrumSynthPanel';
import TransportControls from './TransportControls';
import SequencerTab from './SequencerTab'; // Importiere die neue SequencerTab-Komponente
import audioEngine from '../lib/services/AudioEngine';
import midiService from '../lib/services/MIDIService';
import sequencer from '../lib/services/Sequencer';

interface AudioMIDITestPageProps {
  isModal?: boolean;
}

const AudioMIDITestPage: React.FC<AudioMIDITestPageProps> = ({
  isModal = false
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempo, setTempo] = useState<number>(120);
  const [volume, setVolume] = useState<number>(75);
  const [midiStatus, setMidiStatus] = useState<string>('Not initialized');
  const [midiInputs, setMidiInputs] = useState<{ id: string; name: string }[]>([]);
  const [selectedMidiInput, setSelectedMidiInput] = useState<string>('');
  const [audioInitialized, setAudioInitialized] = useState<boolean>(false);
  const [samplesLoaded, setSamplesLoaded] = useState<boolean>(false);
  const [lastMidiEvent, setLastMidiEvent] = useState<string>('No MIDI input yet');
  const [currentStep, setCurrentStep] = useState<number>(-1);
  
  // Initialize audio and MIDI on component mount
  useEffect(() => {
    let mounted = true;
    
    const initializeServices = async () => {
      // Initialize audio engine
      const audioInit = await audioEngine.initialize();
      if (mounted) setAudioInitialized(audioInit);
      
      // Preload drum samples if audio is initialized
      if (audioInit && mounted) {
        const loaded = await audioEngine.preloadDrumSamples();
        setSamplesLoaded(loaded);
      }
      
      // Initialize MIDI if supported by browser
      if (midiService.constructor.isSupported) {
        try {
          const midiInit = await midiService.initialize();
          if (midiInit && mounted) {
            setMidiStatus('MIDI initialized');
            setMidiInputs(midiService.getInputs());
          } else if (mounted) {
            setMidiStatus('Failed to initialize MIDI');
          }
        } catch (error) {
          if (mounted) {
            setMidiStatus('Error initializing MIDI');
            console.error('MIDI initialization error:', error);
          }
        }
      } else if (mounted) {
        setMidiStatus('Web MIDI API not supported in this browser');
      }
    };
    
    initializeServices();
    
    // Set up sequencer event listener
    const handleStepChange = (step: number) => {
      if (mounted) setCurrentStep(step);
    };
    
    const handlePlayStateChange = (playing: boolean) => {
      if (mounted) setIsPlaying(playing);
    };
    
    sequencer.on('step', handleStepChange);
    sequencer.on('playStateChange', handlePlayStateChange);
    
    // Clean up on unmount
    return () => {
      mounted = false;
      sequencer.off('step', handleStepChange);
      sequencer.off('playStateChange', handlePlayStateChange);
      
      // If in modal mode, don't dispose audio engine on unmount
      // since it might be used elsewhere in the app
      if (isModal) {
        if (isPlaying) {
          sequencer.stop();
        }
      } else {
        audioEngine.dispose();
      }
    };
  }, [isModal, isPlaying]);
  
  // Set up MIDI event listener when selectedMidiInput changes
  useEffect(() => {
    if (!selectedMidiInput) return;
    
    // Set the active MIDI input
    midiService.setActiveInput(selectedMidiInput);
    
    // Handle incoming MIDI messages
    const handleMidiEvent = (event: any) => {
      if (event.type === 'noteOn') {
        const noteName = getMidiNoteName(event.note);
        setLastMidiEvent(`Note On: ${noteName} (${event.note}) - Velocity: ${event.velocity}`);
        
        // Map MIDI notes to drum sounds (C1-B1 = drums 0-11)
        if (event.note >= 36 && event.note <= 47) {
          const drumId = event.note - 36;
          triggerDrumSound(drumId, event.velocity);
        }
      } else if (event.type === 'noteOff') {
        const noteName = getMidiNoteName(event.note);
        setLastMidiEvent(`Note Off: ${noteName} (${event.note})`);
      } else if (event.type === 'cc') {
        setLastMidiEvent(`CC: ${event.controller} - Value: ${event.value}`);
      }
    };
    
    midiService.addEventListener(handleMidiEvent);
    
    return () => {
      midiService.removeEventListener(handleMidiEvent);
    };
  }, [selectedMidiInput]);
  
  // Get MIDI note name from note number
  const getMidiNoteName = (midiNote: number): string => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const note = notes[midiNote % 12];
    return `${note}${octave}`;
  };
  
  // Trigger a drum sound by ID
  const triggerDrumSound = (drumId: number, velocity: number = 127) => {
    const sounds = [
      'samples/bd.wav',
      'samples/sd.wav',
      'samples/hh.wav',
      'samples/cp.wav',
      'samples/tom1.wav',
      'samples/tom2.wav',
      'samples/tom3.wav',
      'samples/cym.wav',
      'samples/perc1.wav',
      'samples/perc2.wav',
      'samples/fx1.wav',
      'samples/fx2.wav',
      'samples/cowbell.wav',
      'samples/rim.wav',
      'samples/shake.wav',
      'samples/click.wav'
    ];
    
    if (drumId >= 0 && drumId < sounds.length) {
      audioEngine.playSample(sounds[drumId], {
        velocity,
        decay: 50,
      });
    }
  };
  
  // Handle MIDI input selection change
  const handleMidiInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMidiInput(event.target.value);
  };
  
  // Handle play/pause from transport controls
  const handlePlayPause = (playing: boolean) => {
    setIsPlaying(playing);
  };
  
  // Handle tempo change from transport controls
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
  };
  
  // Handle volume change from transport controls
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };
  
  // Handle drum trigger from DrumSynthPanel
  const handleSoundTrigger = (soundId: number, velocity: number) => {
    triggerDrumSound(soundId, velocity);
  };

  return (
    <div className={`bg-zinc-900 text-white ${isModal ? 'min-h-[80vh]' : 'min-h-screen'} p-4`}>
      <h1 className="text-3xl font-bold mb-4">Rythmotron Audio & MIDI Test</h1>
      
      {/* Sequencer Tab - moved to the beginning of the audio routing chain */}
      <SequencerTab className="mb-6" />
      
      {/* Transport Controls - noch in der Seite für globale Kontrolle */}
      <TransportControls
        isPlaying={isPlaying}
        onPlay={handlePlayPause}
        tempo={tempo}
        onTempoChange={handleTempoChange}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        showRecord={true}
        showResetButton={true}
        showSaveButton={false}
        className="mb-6"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Status Panel */}
        <div className="lg:col-span-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 p-4">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Audio Engine:</span>
              <span className={audioInitialized ? 'text-green-400' : 'text-red-400'}>
                {audioInitialized ? 'Initialized' : 'Not Initialized'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Samples:</span>
              <span className={samplesLoaded ? 'text-green-400' : 'text-yellow-400'}>
                {samplesLoaded ? 'Loaded' : 'Not Loaded'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">MIDI Status:</span>
              <span className={midiStatus === 'MIDI initialized' ? 'text-green-400' : 'text-yellow-400'}>
                {midiStatus}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">MIDI Input:</span>
              <select 
                value={selectedMidiInput}
                onChange={handleMidiInputChange}
                className="bg-zinc-700 border border-zinc-600 rounded text-sm p-1"
              >
                <option value="">-- Select MIDI Input --</option>
                {midiInputs.map(input => (
                  <option key={input.id} value={input.id}>{input.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Last MIDI Event:</span>
              <span className="text-blue-300 text-sm truncate max-w-[200px]">{lastMidiEvent}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Sequencer Step:</span>
              <span className="text-purple-300">{currentStep >= 0 ? currentStep + 1 : '-'}</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">MIDI Mapping</h3>
            <div className="text-sm text-zinc-400">
              <p>Notes C1-B1 (36-47) trigger drums 1-12</p>
              <p>CC 1: Modulation</p>
              <p>CC 7: Volume</p>
              <p>CC 10: Pan</p>
            </div>
          </div>
        </div>
        
        {/* Drum Synth Panel */}
        <div className="lg:col-span-8">
          <DrumSynthPanel 
            onSoundTrigger={handleSoundTrigger} 
            currentStep={currentStep}
          />
        </div>
      </div>
      
      {/* Testing Controls */}
      <div className="p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button 
            className="bg-purple-700 hover:bg-purple-600 p-3 rounded-lg text-white"
            onClick={() => audioEngine.playTestTone(440, 1)}
          >
            Test Tone (A4)
          </button>
          
          <button 
            className="bg-blue-700 hover:bg-blue-600 p-3 rounded-lg text-white"
            onClick={() => triggerDrumSound(0, 127)}
          >
            Play Kick Drum
          </button>
          
          <button 
            className="bg-green-700 hover:bg-green-600 p-3 rounded-lg text-white"
            onClick={() => {
              const pattern = sequencer.getCurrentPattern();
              if (pattern) {
                pattern.tracks.forEach(track => {
                  if (track.name === 'Kick') {
                    track.steps[0].active = true;
                    track.steps[8].active = true;
                  }
                  if (track.name === 'Snare') {
                    track.steps[4].active = true;
                    track.steps[12].active = true;
                  }
                  if (track.name === 'HiHat') {
                    for (let i = 0; i < track.steps.length; i += 2) {
                      track.steps[i].active = true;
                    }
                  }
                });
              }
            }}
          >
            Create Basic Beat
          </button>
          
          <button 
            className="bg-red-700 hover:bg-red-600 p-3 rounded-lg text-white"
            onClick={() => {
              const pattern = sequencer.getCurrentPattern();
              if (pattern) {
                pattern.tracks.forEach(track => {
                  track.steps.forEach(step => {
                    step.active = false;
                  });
                });
              }
            }}
          >
            Clear Pattern
          </button>
        </div>
      </div>
      
      <div className="text-sm text-zinc-500 mt-8">
        <p className="mb-2">
          Note: Make sure your browser supports the Web Audio API and Web MIDI API.
          For better latency, use Chrome or Edge. Firefox has limited MIDI support.
        </p>
        <p>
          Connect a MIDI controller and select it from the dropdown to play the drum sounds.
          You can also click on the drum pads or sequencer steps to trigger sounds.
        </p>
      </div>
    </div>
  );
};

export default AudioMIDITestPage;