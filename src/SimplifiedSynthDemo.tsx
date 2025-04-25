import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Slider } from './components/ui/slider';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Separator } from './components/ui/separator';
import { Switch } from './components/ui/switch';

// Import Svelte component
import KnobComponent from './lib/components/Knob.svelte';

// Wrapper for Svelte component
const Knob = ({ value, min, max, label, size, color, onChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [knobComponent, setKnobComponent] = React.useState<any>(null);

  React.useEffect(() => {
    if (ref.current && !knobComponent) {
      const component = new KnobComponent({
        target: ref.current,
        props: { value, min, max, label, size, color }
      });
      
      // Subscribe to value changes
      component.$on('change', (event) => {
        if (onChange) onChange(event.detail);
      });
      
      setKnobComponent(component);
      
      return () => {
        component.$destroy();
      };
    }
  }, [ref.current]);
  
  React.useEffect(() => {
    if (knobComponent) {
      knobComponent.$set({ value });
    }
  }, [value, knobComponent]);

  return <div ref={ref} />;
};

export default function SimplifiedSynthDemo() {
  // State for synth parameters
  const [volume, setVolume] = useState<number>(75);
  const [filter, setFilter] = useState<number>(50);
  const [resonance, setResonance] = useState<number>(30);
  const [attack, setAttack] = useState<number>(20);
  const [decay, setDecay] = useState<number>(60);
  const [sustain, setSustain] = useState<number>(50);
  const [release, setRelease] = useState<number>(40);
  const [tempo, setTempo] = useState<number>(120);
  const [swing, setSwing] = useState<number>(10);
  const [delayTime, setDelayTime] = useState<number>(40);
  const [delayFeedback, setDelayFeedback] = useState<number>(30);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Sequencer steps
  const [steps, setSteps] = useState<boolean[]>(Array(16).fill(false));
  
  // Toggle a step in the sequencer
  const toggleStep = (index: number) => {
    const newSteps = [...steps];
    newSteps[index] = !newSteps[index];
    setSteps(newSteps);
  };
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-500 to-indigo-500 text-transparent bg-clip-text">
          ARythm-EMU 2050 Synthesizer
        </h1>
        <p className="text-center text-zinc-400 mt-2">
          Advanced Digital Synthesis Platform
        </p>
      </header>
      
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="synth">
          <TabsList className="mb-6 bg-zinc-800 p-1 rounded-md">
            <TabsTrigger value="synth">
              <i className="fas fa-wave-square mr-2" />Synthesizer
            </TabsTrigger>
            <TabsTrigger value="sequencer">
              <i className="fas fa-sliders-h mr-2" />Sequencer
            </TabsTrigger>
            <TabsTrigger value="effects">
              <i className="fas fa-magic mr-2" />Effects
            </TabsTrigger>
          </TabsList>
          
          {/* Synthesizer Tab */}
          <TabsContent value="synth">
            <Card>
              <CardHeader>
                <CardTitle>Synth Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-8">
                  <div className="text-center">
                    <Knob 
                      value={volume} 
                      min={0} 
                      max={100} 
                      label="Volume" 
                      size="md" 
                      color="#a855f7" 
                      onChange={setVolume} 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Knob 
                      value={filter} 
                      min={0} 
                      max={100} 
                      label="Filter" 
                      size="md" 
                      color="#6366f1" 
                      onChange={setFilter} 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Knob 
                      value={resonance} 
                      min={0} 
                      max={100} 
                      label="Resonance" 
                      size="md" 
                      color="#ec4899" 
                      onChange={setResonance} 
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Attack</h3>
                    <Slider value={[attack]} onValueChange={(values) => setAttack(values[0])} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Decay</h3>
                    <Slider value={[decay]} onValueChange={(values) => setDecay(values[0])} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Sustain</h3>
                    <Slider value={[sustain]} onValueChange={(values) => setSustain(values[0])} />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Release</h3>
                    <Slider value={[release]} onValueChange={(values) => setRelease(values[0])} />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="mr-3"
                  >
                    <i className={`fas fa-${isPlaying ? 'stop' : 'play'} mr-1`} />
                    {isPlaying ? 'Stop' : 'Play'}
                  </Button>
                  
                  <Button variant="outline">
                    <i className="fas fa-save mr-1" />
                    Save Preset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sequencer Tab */}
          <TabsContent value="sequencer">
            <Card>
              <CardHeader>
                <CardTitle>Step Sequencer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-16 gap-2 mb-6">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`aspect-square rounded-md cursor-pointer border ${
                        step ? 'bg-purple-600 border-purple-500' : 'bg-zinc-800 border-zinc-700'
                      }`}
                      onClick={() => toggleStep(index)}
                    />
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tempo: {tempo} BPM</h3>
                    <Slider 
                      value={[tempo]} 
                      min={60}
                      max={200}
                      onValueChange={(values) => setTempo(values[0])} 
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Swing: {swing}%</h3>
                    <Slider 
                      value={[swing]} 
                      min={0}
                      max={50}
                      onValueChange={(values) => setSwing(values[0])} 
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="mr-3"
                  >
                    <i className={`fas fa-${isPlaying ? 'stop' : 'play'} mr-1`} />
                    {isPlaying ? 'Stop' : 'Play'}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="mr-3"
                    onClick={() => setSteps(Array(16).fill(false))}
                  >
                    <i className="fas fa-trash mr-1" />
                    Clear
                  </Button>
                  
                  <div className="flex items-center">
                    <label htmlFor="loop" className="text-sm mr-2">Loop</label>
                    <Switch id="loop" checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Effects Tab */}
          <TabsContent value="effects">
            <Card>
              <CardHeader>
                <CardTitle>Effects Processor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-8">
                  <div className="text-center">
                    <Knob 
                      value={delayTime} 
                      min={0} 
                      max={100} 
                      label="Delay Time" 
                      size="md" 
                      color="#a855f7" 
                      onChange={setDelayTime} 
                    />
                  </div>
                  
                  <div className="text-center">
                    <Knob 
                      value={delayFeedback} 
                      min={0} 
                      max={100} 
                      label="Feedback" 
                      size="md" 
                      color="#6366f1" 
                      onChange={setDelayFeedback} 
                    />
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <label htmlFor="delay" className="text-sm mr-2">Delay</label>
                    <Switch id="delay" checked={true} />
                  </div>
                  
                  <div className="flex items-center">
                    <label htmlFor="reverb" className="text-sm mr-2">Reverb</label>
                    <Switch id="reverb" checked={false} />
                  </div>
                  
                  <div className="flex items-center">
                    <label htmlFor="chorus" className="text-sm mr-2">Chorus</label>
                    <Switch id="chorus" checked={false} />
                  </div>
                  
                  <div className="flex items-center">
                    <label htmlFor="distortion" className="text-sm mr-2">Distortion</label>
                    <Switch id="distortion" checked={false} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}