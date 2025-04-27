import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import Slider from "./src/components/ui/slider";
import { Button } from "./src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./src/components/ui/tabs";
import { Card, CardContent } from "./src/components/ui/card";
import Switch from "./src/components/ui/switch";
// Korrekter Import von ErrorBoundary
import ErrorBoundary from './src/components/ui/ErrorBoundary';
import 'swiper/css';
import 'swiper/css/pagination';
import styles from './channelstrip.module.css'; // Import CSS module for channel strip


// Import all components with corrected paths
import Knob from './src/components/KnobWrapper';
import LED from './src/components/ui/led';
import Pad from './src/components/ui/pad';
import XYPad from './src/components/ui/xy-pad';
import DrumPad from './src/components/ui/drum-pad';
import WaveformDisplay from './src/components/WaveformDisplay';
import StepSequencer from './src/components/StepSequencer';
import TrackList from './src/components/TrackList';
import FeatureCard from './src/components/FeatureCard';
import PresetCard from './src/components/PresetCard';
import Header from './src/components/Header';
import Footer from './src/components/Footer';
import EffectPanel from './src/components/EffectPanel';
import TransportControls from './src/components/TransportControls';
import TestimonialCard from './src/components/TestimonialCard';
import HeroSection from './src/components/HeroSection';
import CallToActionSection from './src/components/CallToActionSection';
import SynthPadGrid from './src/components/SynthPadGrid';
import MixerPanel from './src/components/MixerPanel'; 
import DrumSynthPanel from './src/components/DrumSynthPanel'; // Import der DrumSynthPanel-Komponente
import DrumSynth from './src/components/DrumSynth'; // Import der DrumSynth-Komponente

// --- Interface für den internen State des ChannelStrips ---
interface ChannelState {
  // Input
  gain: number;
  phaseInvert: boolean;
  hpfFreq: number;
  hpfActive: boolean;
  lpfFreq: number;
  lpfActive: boolean;
  // Gate
  gateThreshold: number;
  gateRange: number;
  gateAttack: number;
  gateRelease: number;
  gateActive: boolean;
  // Compressor
  compThreshold: number;
  compRatio: number;
  compAttack: number;
  compRelease: number;
  compMakeup: number;
  compActive: boolean;
  // EQ (Beispiel für ein Band)
  eqLowFreq: number;
  eqLowGain: number;
  eqLowPeak: boolean;
  // ... weitere EQ Bänder
  eqActive: boolean;
  // DeEsser
  deEsserThreshold: number;
  deEsserFreq: number;
  deEsserActive: boolean;
  // Output
  pan: number;
  volume: number;
  mute: boolean;
  solo: boolean;
}

// Props interface for the OmniChannelStrip component
interface OmniChannelStripProps {
  channelName: string;
  channelColor?: string;
  initialState?: Partial<ChannelState>;
}

// --- Die OmniChannelStrip Komponente ---
const OmniChannelStrip: React.FC<OmniChannelStripProps> = ({
  channelName,
  channelColor = '#60a5fa', // Default-Farbe
  initialState = {},
}) => {
  // Rudimentärer interner State für Demo-Zwecke
  const [state, setState] = useState<ChannelState>({
    gain: 50, phaseInvert: false, hpfFreq: 20, hpfActive: false, lpfFreq: 20000, lpfActive: false,
    gateThreshold: -20, gateRange: 40, gateAttack: 1, gateRelease: 100, gateActive: false,
    compThreshold: -15, compRatio: 4, compAttack: 5, compRelease: 150, compMakeup: 0, compActive: false,
    eqLowFreq: 100, eqLowGain: 0, eqLowPeak: false, /*...*/ eqActive: false,
    deEsserThreshold: -10, deEsserFreq: 6000, deEsserActive: false,
    pan: 50, volume: 75, mute: false, solo: false,
    ...initialState, // Überschreibe Defaults mit initialen Props
  });

  // Helper für State-Updates (vereinfacht)
  const updateState = (param: keyof ChannelState, value: number | boolean) => {
    setState(prevState => ({ ...prevState, [param]: value }));
  };

  return (
    <div className={styles.channelStripOmni} style={{ '--channel-color': channelColor } as React.CSSProperties}>

      {/* --- Header --- */}
      <div className={styles.header}>
        <span className={styles.channelName}>{channelName}</span>
        {/* Hier könnte eine kleine Aktivitäts-LED hin */}
        <LED active={!state.mute && !state.solo} color={channelColor} />
      </div>

      {/* --- Modul: Preamp / Input --- */}
      <div className={styles.moduleSection}>
        <div className={styles.moduleTitle}>Input</div>
        <div className={styles.controlsGrid}>
          <Knob 
            label="Gain" 
            value={state.gain} 
            onChange={(v) => updateState('gain', v)}
            min={0}
            max={100}
          />
          <Button 
            variant={state.phaseInvert ? "default" : "outline"} 
            onClick={() => updateState('phaseInvert', !state.phaseInvert)}
            className={styles.buttonPlaceholder}
          >
            Ø
          </Button>
          <Knob 
            label="HPF" 
            value={state.hpfFreq} 
            onChange={(v) => updateState('hpfFreq', v)}
            min={20}
            max={500}
          />
          <Button 
            variant={state.hpfActive ? "default" : "outline"} 
            onClick={() => updateState('hpfActive', !state.hpfActive)}
            className={styles.buttonPlaceholder}
          >
            HPF
          </Button>
          <Knob 
            label="LPF" 
            value={state.lpfFreq} 
            onChange={(v) => updateState('lpfFreq', v)}
            min={1000}
            max={20000}
          />
          <Button 
            variant={state.lpfActive ? "default" : "outline"} 
            onClick={() => updateState('lpfActive', !state.lpfActive)}
            className={styles.buttonPlaceholder}
          >
            LPF
          </Button>
        </div>
      </div>

      {/* --- Modul: Gate/Expander --- */}
      <div className={styles.moduleSection}>
        <div className={styles.moduleTitle}>Gate</div>
        <div className={styles.controlsGrid}>
          <Knob 
            label="Threshold" 
            value={state.gateThreshold} 
            onChange={(v) => updateState('gateThreshold', v)}
            min={-60}
            max={0}
          />
          <Knob 
            label="Range" 
            value={state.gateRange} 
            onChange={(v) => updateState('gateRange', v)}
            min={0}
            max={100}
          />
          <Knob 
            label="Attack" 
            value={state.gateAttack} 
            onChange={(v) => updateState('gateAttack', v)}
            min={0.1}
            max={100}
          />
          <Knob 
            label="Release" 
            value={state.gateRelease} 
            onChange={(v) => updateState('gateRelease', v)}
            min={10}
            max={1000}
          />
          <Button 
            variant={!state.gateActive ? "default" : "outline"} 
            onClick={() => updateState('gateActive', !state.gateActive)}
            className={styles.buttonPlaceholder}
          >
            BYP
          </Button>
        </div>
      </div>

      {/* --- Modul: Compressor --- */}
      <div className={styles.moduleSection}>
        <div className={styles.moduleTitle}>Compressor</div>
        <div className={styles.controlsGrid}>
          <Knob 
            label="Threshold" 
            value={state.compThreshold} 
            onChange={(v) => updateState('compThreshold', v)}
            min={-60}
            max={0}
          />
          <Knob 
            label="Ratio" 
            value={state.compRatio} 
            onChange={(v) => updateState('compRatio', v)}
            min={1}
            max={20}
          />
          <Knob 
            label="Attack" 
            value={state.compAttack} 
            onChange={(v) => updateState('compAttack', v)}
            min={0.1}
            max={100}
          />
          <Knob 
            label="Release" 
            value={state.compRelease} 
            onChange={(v) => updateState('compRelease', v)}
            min={10}
            max={1000}
          />
          <Knob 
            label="Makeup" 
            value={state.compMakeup} 
            onChange={(v) => updateState('compMakeup', v)}
            min={0}
            max={24}
          />
          <Button 
            variant={!state.compActive ? "default" : "outline"} 
            onClick={() => updateState('compActive', !state.compActive)}
            className={styles.buttonPlaceholder}
          >
            BYP
          </Button>
        </div>
      </div>

      {/* --- Modul: Equalizer --- */}
      <div className={styles.moduleSection}>
        <div className={styles.moduleTitle}>Equalizer</div>
        <div className={styles.controlsGrid}>
          <Knob 
            label="LF Freq" 
            value={state.eqLowFreq} 
            onChange={(v) => updateState('eqLowFreq', v)}
            min={20}
            max={500}
          />
          <Knob 
            label="LF Gain" 
            value={state.eqLowGain} 
            onChange={(v) => updateState('eqLowGain', v)}
            min={-18}
            max={18}
          />
          <Button 
            variant={state.eqLowPeak ? "default" : "outline"} 
            onClick={() => updateState('eqLowPeak', !state.eqLowPeak)}
            className={styles.buttonPlaceholder}
          >
            Peak
          </Button>
          <Button 
            variant={!state.eqActive ? "default" : "outline"} 
            onClick={() => updateState('eqActive', !state.eqActive)}
            className={styles.buttonPlaceholder}
          >
            EQ BYP
          </Button>
        </div>
      </div>

      {/* --- Modul: DeEsser --- */}
      <div className={styles.moduleSection}>
        <div className={styles.moduleTitle}>DeEsser</div>
        <div className={styles.controlsGrid}>
          <Knob 
            label="Threshold" 
            value={state.deEsserThreshold} 
            onChange={(v) => updateState('deEsserThreshold', v)}
            min={-40}
            max={0}
          />
          <Knob 
            label="Frequency" 
            value={state.deEsserFreq} 
            onChange={(v) => updateState('deEsserFreq', v)}
            min={2000}
            max={16000}
          />
          <Button 
            variant={!state.deEsserActive ? "default" : "outline"} 
            onClick={() => updateState('deEsserActive', !state.deEsserActive)}
            className={styles.buttonPlaceholder}
          >
            BYP
          </Button>
        </div>
      </div>

      {/* --- Modul: Output / Fader --- */}
      <div className={`${styles.moduleSection} ${styles.outputSection}`}>
        <div className={styles.faderMeterWrapper}>
          <div className={styles.faderControls}>
            <Knob 
              label="Pan" 
              value={state.pan} 
              onChange={(v) => updateState('pan', v)}
              min={0}
              max={100}
              size="small"
            />
            <Button 
              variant={state.mute ? "destructive" : "outline"} 
              onClick={() => updateState('mute', !state.mute)}
              className={`${styles.buttonPlaceholder} ${state.mute ? styles.muteButton : ''}`}
            >
              M
            </Button>
            <Button 
              variant={state.solo ? "default" : "outline"} 
              onClick={() => updateState('solo', !state.solo)}
              className={`${styles.buttonPlaceholder} ${state.solo ? styles.soloButton : ''}`}
            >
              S
            </Button>
          </div>
          <Slider 
            value={[state.volume]} 
            onValueChange={(v) => updateState('volume', v[0])}
            orientation="vertical"
            min={0}
            max={100}
            step={1}
            className={styles.faderPlaceholderWrapper}
          />
          <div className={styles.meterPlaceholder}>
            <div className={styles.meterFill} style={{ height: `${state.volume}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppBase: React.FC = () => {
const [activePreset, setActivePreset] = useState(0);
const [isPlaying, setIsPlaying] = useState(false);
const [volume, setVolume] = useState(75);
const [filter, setFilter] = useState(50);
const [resonance, setResonance] = useState(30);
const [selectedTrack, setSelectedTrack] = useState(0);
const [trackMutes, setTrackMutes] = useState(Array(8).fill(false));
const [trackSolos, setTrackSolos] = useState(Array(8).fill(false));
const [trackVolumes, setTrackVolumes] = useState(Array(8).fill(75));
const [trackPans, setTrackPans] = useState(Array(8).fill(50));
const [lfoRate, setLfoRate] = useState(50);
const [lfoDepth, setLfoDepth] = useState(50);
const [lfoShape, setLfoShape] = useState('sine');
const [xyPad, setXyPad] = useState({ x: 50, y: 50 });
const [stepParams, setStepParams] = useState(Array(16).fill({ velocity: 100, probability: 100, length: 100 }));
const [delay, setDelay] = useState(25);
const [reverb, setReverb] = useState(40);
const [modulation, setModulation] = useState(60);
const [attack, setAttack] = useState(20);
const [decay, setDecay] = useState(50);
const [sustain, setSustain] = useState(70);
const [release, setRelease] = useState(45);
const [activeSequence, setActiveSequence] = useState(Array(16).fill(false));
const [activeTab, setActiveTab] = useState("drumsynth");
const [tempo, setTempo] = useState(120); // Hinzugefügt: Fehlender State für tempo

// Neue Zustandsvariable für Pad-Mixer-Track-Zuweisungen
const [padMixerAssignments, setPadMixerAssignments] = useState<Record<number, number>>({});

const tracks = [
{ id: 0, name: 'BD', color: 'purple', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ id: 1, name: 'SD', color: 'blue', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ id: 2, name: 'CH', color: 'green', icon: 'fa-hi-hat', pattern: Array(16).fill(false) },
{ id: 3, name: 'OH', color: 'yellow', icon: 'fa-hi-hat', pattern: Array(16).fill(false) },
{ id: 4, name: 'TOM', color: 'red', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ id: 5, name: 'PERC', color: 'orange', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ id: 6, name: 'CYMB', color: 'indigo', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ id: 7, name: 'FX', color: 'pink', icon: 'fa-waveform', pattern: Array(16).fill(false) },
];
const drumPadSounds = [
{ name: 'Kick 1', category: 'Kick', color: 'purple', icon: 'fa-drum' },
{ name: 'Snare 1', category: 'Snare', color: 'blue', icon: 'fa-drum' },
{ name: 'HiHat 1', category: 'HiHat', color: 'green', icon: 'fa-hi-hat' },
{ name: 'Clap 1', category: 'Clap', color: 'yellow', icon: 'fa-hands-clapping' },
{ name: 'Tom 1', category: 'Tom', color: 'red', icon: 'fa-drum' },
{ name: 'Perc 1', category: 'Percussion', color: 'orange', icon: 'fa-drum' },
{ name: 'Cymbal 1', category: 'Cymbal', color: 'indigo', icon: 'fa-circle' },
{ name: 'Effect 1', category: 'Effect', color: 'pink', icon: 'fa-waveform' },
];
const waveformChartRef = useRef<HTMLDivElement>(null);
const spectrumChartRef = useRef<HTMLDivElement>(null);
const presets = [
{ name: "Deep Bass", category: "Bass" },
{ name: "Cosmic Lead", category: "Lead" },
{ name: "Ambient Pad", category: "Pad" },
{ name: "Techno Pluck", category: "Pluck" },
{ name: "Quantum Drone", category: "Ambient" },
{ name: "Acid Sequence", category: "Sequence" },
{ name: "Nebula Texture", category: "Texture" },
{ name: "Pulse Wave", category: "Bass" },
];
const features = [
{
title: "Advanced Synthesis Engine",
description: "Dual oscillators with wavetable morphing and FM capabilities",
icon: "fa-solid fa-wave-square"
},
{
title: "Modulation Matrix",
description: "16-slot modulation matrix with customizable routing options",
icon: "fa-solid fa-sliders"
},
{
title: "Quantum Filter",
description: "Multi-mode resonant filter with analog modeling technology",
icon: "fa-solid fa-filter"
},
{
title: "Step Sequencer",
description: "16-step sequencer with per-step parameter control",
icon: "fa-solid fa-table-cells"
},
];
const toggleSequenceStep = (index: number) => {
const newSequence = [...activeSequence];
newSequence[index] = !newSequence[index];
setActiveSequence(newSequence);
};
const initWaveformChart = () => {
if (waveformChartRef.current) {
const chart = echarts.init(waveformChartRef.current);
// Generate sine wave data
const data: [number, number][] = [];
for (let i = 0; i <= 360; i++) {
const radians = (i * Math.PI) / 180;
const value = Math.sin(radians * 2);
data.push([i, value]);
}
const option = {
animation: false,
grid: {
left: '5%',
right: '5%',
top: '10%',
bottom: '10%'
},
xAxis: {
type: 'value',
min: 0,
max: 360,
show: false
},
yAxis: {
type: 'value',
min: -1.2,
max: 1.2,
show: false
},
series: [
{
data: data,
type: 'line',
showSymbol: false,
lineStyle: {
width: 2,
color: '#4ade80'
},
areaStyle: {
color: {
type: 'linear',
x: 0,
y: 0,
x2: 0,
y2: 1,
colorStops: [
{ offset: 0, color: 'rgba(74, 222, 128, 0.5)' },
{ offset: 1, color: 'rgba(74, 222, 128, 0.05)' }
]
}
}
}
]
};
chart.setOption(option);
window.addEventListener('resize', () => {
chart.resize();
});
}
};
const initSpectrumChart = () => {
if (spectrumChartRef.current) {
const chart = echarts.init(spectrumChartRef.current);
// Generate random spectrum data
const data: number[] = [];
for (let i = 0; i < 50; i++) {
const value = Math.random() * 0.7 + 0.1;
data.push(value);
}
const option = {
animation: false,
grid: {
left: '5%',
right: '5%',
top: '10%',
bottom: '10%'
},
xAxis: {
type: 'category',
data: Array.from({ length: 50 }, (_, i) => i),
show: false
},
yAxis: {
type: 'value',
min: 0,
max: 1,
show: false
},
series: [
{
data: data,
type: 'bar',
barWidth: '60%',
itemStyle: {
color: {
type: 'linear',
x: 0,
y: 0,
x2: 0,
y2: 1,
colorStops: [
{ offset: 0, color: '#a855f7' },
{ offset: 1, color: '#6366f1' }
]
}
}
}
]
};
chart.setOption(option);
window.addEventListener('resize', () => {
chart.resize();
});
}
};
useEffect(() => {
initWaveformChart();
initSpectrumChart();
}, []);
const handlePlayPause = () => {
setIsPlaying(!isPlaying);
};

// Initialisiere Pad-Mixer-Zuordnungen, so dass jedes Pad seinem entsprechenden Track zugeordnet ist
useEffect(() => {
  // Erstelle eine direkte 1:1-Zuordnung: Pad 0 zu Track 0, Pad 1 zu Track 1, usw.
  const initialAssignments: Record<number, number> = {};
  for (let i = 0; i < Math.min(16, tracks.length); i++) {
    initialAssignments[i] = i % tracks.length;
  }
  setPadMixerAssignments(initialAssignments);
}, []);

// Erstellen von Pad-Daten für DrumSynth, bei direkter Zuordnung zu den entsprechenden Tracks
const padData = Array.from({ length: 16 }).map((_, index) => ({
  id: index,
  active: activeSequence[index],
  // Verwende den Track-Typ direkt vom zugehörigen Track
  type: tracks[index % tracks.length].name,
  velocity: 127,
  tuning: 0,
  // Direkte 1:1-Zuordnung: Pad-ID entspricht Track-ID (modulo Anzahl der Tracks)
  mixerTrackId: index % tracks.length
}));

// Funktion zum Zuweisen eines Pads zu einem Mixer-Track
const assignPadToMixerTrack = (padId: number, trackId: number) => {
  setPadMixerAssignments(prev => ({
    ...prev,
    [padId]: trackId
  }));
  console.log(`Pad ${padId + 1} wurde dem Mixer-Track "${tracks[trackId].name}" zugewiesen`);
};

const testimonials = [
{
rating: 5,
text: "The ARythm-EMU 2050 has completely transformed my production workflow. The sound quality is unmatched and the interface is incredibly intuitive.",
authorName: "Alex Thompson",
authorRole: "Electronic Music Producer"
},
{
rating: 5,
text: "I've used many synthesizers over the years, but the ARythm-EMU 2050 stands out with its incredible sound design capabilities and forward-thinking interface.",
authorName: "Sarah Chen",
authorRole: "Film Composer"
},
{
rating: 4.5,
text: "The modulation matrix and sequencer in the ARythm-EMU 2050 are game-changers. I can create sounds I never thought possible before.",
authorName: "Marcus Williams",
authorRole: "Sound Designer"
},
{
rating: 5,
text: "The ARythm-EMU 2050 has become the centerpiece of my studio. The sound quality and flexibility are unparalleled in the digital synthesis world.",
authorName: "Olivia Rodriguez",
authorRole: "Studio Producer"
}
];

return (
<div className="min-h-screen bg-zinc-900 text-zinc-100">
<Header />

<main className="container mx-auto px-4 py-12">
<HeroSection />

<section className="mb-16">
  <div className="text-center mb-12">
    <h2 className="text-3xl font-bold mb-4">Key Features</h2>
    <p className="text-zinc-400 max-w-2xl mx-auto">
      ARythm-EMU 2050 combines advanced digital synthesis with intuitive controls, giving you unprecedented creative freedom.
    </p>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {features.map((feature, index) => (
      <FeatureCard
        key={index}
        title={feature.title}
        description={feature.description}
        icon={feature.icon}
      />
    ))}
  </div>
</section>

<section className="mb-16">
  <div className="bg-zinc-800/30 rounded-2xl p-8 border border-zinc-700/50">
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-4">Interactive Demo</h2>
      <p className="text-zinc-400 max-w-2xl mx-auto">
        Get a feel for the ARythm-EMU 2050 interface with our interactive demo. Adjust parameters and see how they affect the sound.
      </p>
    </div>

    <Tabs defaultValue="drumsynth" className="w-full" onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="drumsynth" className="!rounded-button whitespace-nowrap">Drum Synth</TabsTrigger>
        <TabsTrigger value="sequencer" className="!rounded-button whitespace-nowrap">Sequencer</TabsTrigger>
        <TabsTrigger value="effects" className="!rounded-button whitespace-nowrap">Effects</TabsTrigger>
        <TabsTrigger value="mixer" className="!rounded-button whitespace-nowrap">Mixer</TabsTrigger>
      </TabsList>

      <TabsContent value="drumsynth" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          {/* DrumSynth Panel Component */}
          <DrumSynthPanel 
            selectedTrack={selectedTrack}
            trackData={tracks[selectedTrack]}
            onParameterChange={(param, value) => {
              // Handle parameter changes here
              console.log(`Parameter ${param} changed to ${value} for track ${selectedTrack}`);
            }}
            currentStep={isPlaying ? 0 : -1} // Just for visualization, would be dynamic in real app
          />

          {/* DrumSynth component with square pads in a grid layout */}
          <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/50">
            <h3 className="text-lg font-medium mb-4">Drum Pad Matrix</h3>
            <DrumSynth 
              pads={padData.map((pad, index) => ({
                ...pad,
                // Use actual track types for more variety
                type: tracks[index % tracks.length].name
              }))}
              onTogglePad={(id) => toggleSequenceStep(id)} 
              currentStep={isPlaying ? 0 : -1}
              selectedPad={selectedTrack}
              onSelectPad={(id) => setSelectedTrack(id)}
              onParamChange={(padId, param, value) => {
                console.log(`Pad ${padId} parameter ${param} changed to ${value}`);
              }}
              // Neue Props für Mixer-Track-Integration
              mixerTracks={tracks}
              onAssignToMixerTrack={assignPadToMixerTrack}
              className="mb-4"
            />
            
            <div className="flex justify-between mt-6 items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-zinc-400">Active Step</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm text-zinc-400">Selected Pad</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">Rechtsklick: Parameter-Bearbeitung</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="sequencer" className="mt-0">
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
          {/* ... sequencer content ... */}
        </div>
      </TabsContent>

      <TabsContent value="effects" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Effects Panel Component */}
          <EffectPanel />
        </div>
      </TabsContent>

      <TabsContent value="mixer" className="mt-0">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-zinc-800/30 rounded-xl p-6 border border-zinc-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Mixer Panel</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-zinc-400">Track:</span>
                  <span className="text-sm font-medium">{selectedTrack >= 0 ? tracks[selectedTrack % tracks.length].name : 'None'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
            </div>
            
            {/* MixerPanel Komponente mit den Drum-Pad Tracks */}
            <MixerPanel 
              className="w-full"
              tracks={tracks}
              assignedPads={padMixerAssignments}
              selectedTrack={selectedTrack}
              onSelectTrack={setSelectedTrack}
              onTrackVolumeChange={(trackId, volume) => {
                // Handle volume change
                console.log(`Track ${trackId} volume changed to ${volume}`);
                const newVolumes = [...trackVolumes];
                newVolumes[trackId] = volume;
                setTrackVolumes(newVolumes);
              }}
              onTrackPanChange={(trackId, pan) => {
                // Handle pan change
                console.log(`Track ${trackId} pan changed to ${pan}`);
                const newPans = [...trackPans];
                newPans[trackId] = pan;
                setTrackPans(newPans);
              }}
              onTrackMuteToggle={(trackId) => {
                // Handle mute toggle
                console.log(`Track ${trackId} mute toggled`);
                const newMutes = [...trackMutes];
                newMutes[trackId] = !newMutes[trackId];
                setTrackMutes(newMutes);
              }}
              onTrackSoloToggle={(trackId) => {
                // Handle solo toggle
                console.log(`Track ${trackId} solo toggled`);
                const newSolos = [...trackSolos];
                newSolos[trackId] = !newSolos[trackId];
                setTrackSolos(newSolos);
              }}
            />
            
            <div className="mt-6 bg-zinc-900/50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Pad-zu-Track-Zuordnung</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tracks.map((track, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-3 rounded-lg cursor-pointer ${
                      index === selectedTrack 
                        ? `bg-${track.color}-900/30 border border-${track.color}-500` 
                        : 'bg-zinc-800/50 border border-zinc-700'
                    }`}
                    onClick={() => setSelectedTrack(index)}
                  >
                    <div 
                      className="w-8 h-8 rounded-md mr-3 flex items-center justify-center text-lg"
                      style={{
                        background: `linear-gradient(145deg, #${track.color === 'purple' ? '9333ea' : 
                                                             track.color === 'blue' ? '2563eb' : 
                                                             track.color === 'green' ? '16a34a' :
                                                             track.color === 'yellow' ? 'ca8a04' :
                                                             track.color === 'red' ? 'dc2626' :
                                                             track.color === 'orange' ? 'ea580c' :
                                                             track.color === 'indigo' ? '4f46e5' :
                                                             track.color === 'pink' ? 'be185d' : '9333ea'}33, #${
                                                             track.color === 'purple' ? '9333ea' : 
                                                             track.color === 'blue' ? '2563eb' : 
                                                             track.color === 'green' ? '16a34a' :
                                                             track.color === 'yellow' ? 'ca8a04' :
                                                             track.color === 'red' ? 'dc2626' :
                                                             track.color === 'orange' ? 'ea580c' :
                                                             track.color === 'indigo' ? '4f46e5' :
                                                             track.color === 'pink' ? 'be185d' : '9333ea'}66)`,
                        boxShadow: `inset 0 0 5px rgba(0,0,0,0.2), 0 0 10px rgba(${
                                    track.color === 'purple' ? '147, 51, 234' : 
                                    track.color === 'blue' ? '37, 99, 235' : 
                                    track.color === 'green' ? '22, 163, 74' :
                                    track.color === 'yellow' ? '202, 138, 4' :
                                    track.color === 'red' ? '220, 38, 38' :
                                    track.color === 'orange' ? '234, 88, 12' :
                                    track.color === 'indigo' ? '79, 70, 229' :
                                    track.color === 'pink' ? '190, 24, 93' : '147, 51, 234'}, 0.3)`
                      }}
                    >
                      <i className={`fa-solid ${track.icon}`}></i>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Pad {index + 1}</div>
                      <div className="text-xs text-zinc-400">
                        Track {index + 1}: {track.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
</section>

<section className="mb-16">
<div className="text-center mb-12">
<h2 className="text-3xl font-bold mb-4">Sound Presets</h2>
<p className="text-zinc-400 max-w-2xl mx-auto">
Explore our library of professionally designed presets to jumpstart your creativity.
</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{presets.map((preset, index) => (
<PresetCard
key={index}
name={preset.name}
category={preset.category}
isActive={activePreset === index}
onClick={() => setActivePreset(index)}
onPlay={() => {}}
/>
))}
</div>
<div className="mt-8 text-center">
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-plus mr-2"></i>
Browse All Presets
</Button>
</div>
</section>

<CallToActionSection 
title="Ready to Create Future Sounds?"
description="Join thousands of music producers and sound designers who are already using ARythm-EMU 2050 to push the boundaries of audio creation."
primaryButtonText="Download Now"
primaryButtonIcon="fa-download"
secondaryButtonText="Read Documentation"
secondaryButtonIcon="fa-book"
imageSrc="https://readdy.ai/api/search-image?query=Futuristic%20music%20studio%20setup%20with%20glowing%20purple%20and%20green%20lights%2C%20professional%20audio%20equipment%2C%20synthesizers%20and%20controllers%2C%20dark%20atmospheric%20environment%2C%20high-tech%20music%20production%20workspace%20with%20digital%20displays%20and%20LED%20indicators&width=500&height=300&seq=2&orientation=landscape"
imageAlt="Music Production Studio"
/>

<section>
<div className="text-center mb-12">
<h2 className="text-3xl font-bold mb-4">Testimonials</h2>
<p className="text-zinc-400 max-w-2xl mx-auto">
See what professional producers and sound designers are saying about ARythm-EMU 2050.
</p>
</div>
<Swiper
modules={[Pagination, Autoplay]}
spaceBetween={30}
slidesPerView={1}
breakpoints={{
640: {
slidesPerView: 2,
},
1024: {
slidesPerView: 3,
},
}}
pagination={{ clickable: true }}
autoplay={{ delay: 5000 }}
className="pb-12"
>
{testimonials.map((testimonial, index) => (
<SwiperSlide key={index}>
<TestimonialCard 
rating={testimonial.rating}
text={testimonial.text}
authorName={testimonial.authorName}
authorRole={testimonial.authorRole}
/>
</SwiperSlide>
))}
</Swiper>
</section>
</main>

<Footer />
</div>
);
};

// Wrap the component with an error boundary
const App: React.FC = () => (
  <ErrorBoundary componentName="ARythm-EMU-2050-UI">
    <AppBase />
  </ErrorBoundary>
);

export default App;
