import React, { useState, useEffect } from 'react';
import LED from './components/ui/led';
import Pad from './components/ui/pad';
import XYPad from './components/ui/xy-pad';
import DrumPad from './components/ui/drum-pad';
import Switch from './components/ui/switch';
import Slider from './components/ui/slider';
import EffectPanel from './components/EffectPanel';
import TransportControls from './components/TransportControls';
import StepSequencer from './components/StepSequencer';
import WaveformDisplay from './components/WaveformDisplay';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const SimplifiedSynthDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentStep, setCurrentStep] = useState(0);
  const [delay, setDelay] = useState(30);
  const [feedback, setFeedback] = useState(45);
  const [mix, setMix] = useState(60);
  const [xyValue, setXyValue] = useState({ x: 0.5, y: 0.5 });
  const [switchValue, setSwitchValue] = useState(false);
  const [sliderValue, setSliderValue] = useState(50);
  const [stepData, setStepData] = useState(Array(16).fill(false));
  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Effekt für das Sequencer-Timing
  useEffect(() => {
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  // Toggle play state
  const togglePlay = () => {
    if (!isPlaying) {
      // Starten des Sequencers
      const id = window.setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % 16);
      }, 60000 / tempo / 4); // Tempo in Millisekunden pro Schlag
      setIntervalId(id);
    } else {
      // Stoppen des Sequencers
      if (intervalId !== null) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
    
    setIsPlaying(!isPlaying);
  };

  // Toggle step in sequencer
  const toggleStep = (index: number) => {
    const newSteps = [...stepData];
    newSteps[index] = !newSteps[index];
    setStepData(newSteps);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-black p-8">
      <h1 className="text-3d text-zinc-100 text-3xl font-bold mb-8 text-center">ARythm-EMU 2050 Synthesizer</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Transport Controls */}
        <Card variant="synthmodule">
          <CardHeader>
            <CardTitle>Transport</CardTitle>
          </CardHeader>
          <CardContent>
            <TransportControls 
              tempo={tempo}
              onTempoChange={setTempo}
              isPlaying={isPlaying}
              onPlay={togglePlay}
              onStop={togglePlay}
            />
          </CardContent>
        </Card>

        {/* Waveform Display */}
        <Card variant="synthmodule">
          <CardContent className="p-4">
            <div className="screen-effect p-2 rounded-lg">
              <WaveformDisplay
                height={120}
                isPlaying={isPlaying}
                color="#42dcdb"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step Sequencer */}
      <Card variant="synthmodule" className="mb-8">
        <CardHeader className="pb-0">
          <CardTitle>Step Sequencer</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <StepSequencer 
            steps={stepData}
            onToggleStep={toggleStep}
            currentStep={isPlaying ? currentStep : -1}
            color="#42dcdb"
          />
        </CardContent>
      </Card>

      {/* UI Components Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {/* Effect Panel */}
        <Card variant="synthmodule">
          <CardHeader className="pb-0">
            <CardTitle>Delay Effect</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <EffectPanel title="" />
          </CardContent>
        </Card>

        {/* XY Pad */}
        <Card variant="synthmodule">
          <CardHeader className="pb-0">
            <CardTitle>XY Controller</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex justify-center">
            <XYPad
              value={xyValue}
              onChange={(val) => setXyValue(val)}
              width={200}
              height={200}
              color="#42dcdb"
              label="Filter/Resonance"
            />
          </CardContent>
        </Card>

        {/* Controls Showcase */}
        <Card variant="synthmodule">
          <CardHeader className="pb-0">
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col space-y-6">
              {/* LED Demo */}
              <div>
                <h3 className="text-3d text-zinc-400 text-sm mb-2">LEDs</h3>
                <div className="flex space-x-4">
                  <LED on={true} color="#42dcdb" size="sm" />
                  <LED on={true} color="#ec4899" size="md" />
                  <LED on={false} color="#42dcdb" size="lg" />
                  <LED on={true} color="#10b981" size="md" pulse />
                </div>
              </div>
              
              {/* Switch Demo */}
              <div>
                <h3 className="text-3d text-zinc-400 text-sm mb-2">Switches</h3>
                <div className="flex space-x-4">
                  <Switch 
                    checked={switchValue} 
                    onChange={setSwitchValue} 
                    label="Filter" 
                  />
                  <Switch 
                    checked={!switchValue} 
                    onChange={(val) => setSwitchValue(!val)} 
                    label="LFO" 
                    color="#ec4899"
                  />
                </div>
              </div>
              
              {/* Slider Demo */}
              <div>
                <h3 className="text-3d text-zinc-400 text-sm mb-2">Sliders</h3>
                <div className="flex space-x-8">
                  <Slider 
                    value={sliderValue} 
                    onChange={setSliderValue} 
                    label="Cutoff" 
                    min={0} 
                    max={100}
                    formatValue={(val) => `${val}%`}
                  />
                  <Slider 
                    value={100 - sliderValue} 
                    onChange={(val) => setSliderValue(100 - val)} 
                    label="Volume" 
                    min={0} 
                    max={100} 
                    orientation="vertical"
                    formatValue={(val) => `${val}%`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pads Section */}
      <Card variant="synthmodule" className="mb-8">
        <CardHeader className="pb-0">
          <CardTitle>Drum Pads</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <DrumPad color="#42dcdb" label="Kick" velocity={80} />
            <DrumPad color="#ec4899" label="Snare" velocity={90} />
            <DrumPad color="#10b981" label="Hi-Hat" velocity={70} />
            <DrumPad color="#f59e0b" label="Clap" velocity={85} />
            <DrumPad color="#8b5cf6" label="Tom" velocity={75} />
            <DrumPad color="#ef4444" label="Cymbal" velocity={60} />
            <DrumPad color="#0ea5e9" label="Perc" velocity={95} />
            <DrumPad color="#a855f7" label="FX" velocity={65} />
          </div>
        </CardContent>
      </Card>

      {/* Basic Controls Section */}
      <Card variant="synthmodule">
        <CardHeader className="pb-0">
          <CardTitle>Basic Controls</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3d text-zinc-400 text-sm mb-2">Buttons</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="3d" className="w-full h-12 flex items-center justify-center">A</Button>
                <Button variant="3d" className="w-full h-12 flex items-center justify-center">B</Button>
                <Button variant="3d" className="w-full h-12 flex items-center justify-center">C</Button>
                <Button variant="3d" className="w-full h-12 flex items-center justify-center">D</Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-3d text-zinc-400 text-sm mb-2">LED Indicators</h3>
              <div className="panel-inset p-4 rounded-md grid grid-cols-4 gap-2">
                <div className="flex flex-col items-center space-y-1">
                  <LED on={true} color="#ef4444" size="md" />
                  <span className="text-3d text-xs text-zinc-400">Record</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <LED on={isPlaying} color="#10b981" size="md" />
                  <span className="text-3d text-xs text-zinc-400">Play</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <LED on={false} color="#f59e0b" size="md" />
                  <span className="text-3d text-xs text-zinc-400">Sync</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <LED on={true} color="#0ea5e9" size="md" pulse />
                  <span className="text-3d text-xs text-zinc-400">MIDI</span>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <h3 className="text-3d text-zinc-400 text-sm mb-2">Slider Controls</h3>
              <div className="panel-inset p-4 rounded-md grid grid-cols-3 gap-4">
                <Slider value={delay} onChange={setDelay} label="Delay" color="#42dcdb" />
                <Slider value={feedback} onChange={setFeedback} label="Feedback" color="#ec4899" />
                <Slider value={mix} onChange={setMix} label="Mix" color="#8b5cf6" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-8 text-center text-zinc-500">
        <p className="text-3d">ARythm-EMU 2050 Synthesizer Interface Demo</p>
      </div>
    </div>
  );
};

export default SimplifiedSynthDemo;