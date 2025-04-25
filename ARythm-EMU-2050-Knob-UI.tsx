import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import 'swiper/css';
import 'swiper/css/pagination';

// Import alle Komponenten
import Knob from '@/components/KnobWrapper';
import LED from '@/components/ui/led';
import Pad from '@/components/ui/pad';
import XYPad from '@/components/ui/xy-pad';
import DrumPad from '@/components/ui/drum-pad';
import WaveformDisplay from '@/components/WaveformDisplay';
import StepSequencer from '@/components/StepSequencer';
import TrackList from '@/components/TrackList';
import FeatureCard from '@/components/FeatureCard';
import PresetCard from '@/components/PresetCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EffectPanel from '@/components/EffectPanel';
import TransportControls from '@/components/TransportControls';
import TestimonialCard from '@/components/TestimonialCard';
import HeroSection from '@/components/HeroSection';
import CallToActionSection from '@/components/CallToActionSection';
import SynthPadGrid from '@/components/SynthPadGrid';

const App: React.FC = () => {
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
const [activeTab, setActiveTab] = useState("synth");
const [tempo, setTempo] = useState(120);
const [swing, setSwing] = useState(50);
const [patternLength, setPatternLength] = useState(16);
const [mute, setMute] = useState(Array(8).fill(false));
const [solo, setSolo] = useState(Array(8).fill(false));
const [performance, setPerformance] = useState({
x: 50,
y: 50,
pressure: 0,
});
const [lfo, setLfo] = useState({
rate: 50,
depth: 50,
shape: 'sine',
});
const tracks = [
{ name: 'BD', color: 'purple', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ name: 'SD', color: 'blue', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ name: 'CH', color: 'green', icon: 'fa-hi-hat', pattern: Array(16).fill(false) },
{ name: 'OH', color: 'yellow', icon: 'fa-hi-hat', pattern: Array(16).fill(false) },
{ name: 'TOM', color: 'red', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ name: 'PERC', color: 'orange', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ name: 'CYMB', color: 'indigo', icon: 'fa-drum', pattern: Array(16).fill(false) },
{ name: 'FX', color: 'pink', icon: 'fa-waveform', pattern: Array(16).fill(false) },
];
const drumPadSounds = [
{ name: 'Kick 1', category: 'Kick', color: 'purple' },
{ name: 'Snare 1', category: 'Snare', color: 'blue' },
{ name: 'HiHat 1', category: 'HiHat', color: 'green' },
{ name: 'Clap 1', category: 'Clap', color: 'yellow' },
{ name: 'Tom 1', category: 'Tom', color: 'red' },
{ name: 'Perc 1', category: 'Percussion', color: 'orange' },
{ name: 'Cymbal 1', category: 'Cymbal', color: 'indigo' },
{ name: 'Effect 1', category: 'Effect', color: 'pink' },
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
const data = [];
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
const data = [];
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

// Erstellen von Pad-Daten für SynthPadGrid
const padData = Array.from({ length: 16 }).map((_, index) => ({
id: index,
active: activeSequence[index],
type: ['BD', 'SD', 'HH', 'CP'][index % 4],
velocity: 127,
tuning: 0
}));

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

<Tabs defaultValue="synth" className="w-full" onValueChange={setActiveTab}>
<TabsList className="grid grid-cols-3 mb-8">
<TabsTrigger value="synth" className="!rounded-button whitespace-nowrap">Synthesizer</TabsTrigger>
<TabsTrigger value="sequencer" className="!rounded-button whitespace-nowrap">Sequencer</TabsTrigger>
<TabsTrigger value="effects" className="!rounded-button whitespace-nowrap">Effects</TabsTrigger>
</TabsList>

<TabsContent value="synth" className="mt-0">
<div className="grid grid-cols-1 gap-8">
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<TransportControls
isPlaying={isPlaying}
onPlayPause={handlePlayPause}
showRecord={true}
volume={volume}
onVolumeChange={setVolume}
className="mb-6"
/>

<div className="grid grid-cols-1 gap-8">
<SynthPadGrid 
pads={padData} 
onTogglePad={(id) => toggleSequenceStep(id)} 
currentStep={0}
/>

<div className="mt-8 bg-zinc-800/30 rounded-xl p-6 border border-zinc-700">
<div className="flex justify-between items-center mb-6">
<h3 className="text-lg font-medium">Step Sequencer</h3>
<div className="flex items-center space-x-4">
<div className="flex items-center space-x-2">
<LED active={true} color="green" />
<span className="text-sm text-zinc-400">Pattern A1</span>
</div>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-copy mr-2"></i>
Clone
</Button>
</div>
</div>

<StepSequencer
steps={activeSequence}
onToggleStep={toggleSequenceStep}
currentStep={0}
/>
</div>

<div className="flex justify-between items-center">
<div className="flex space-x-2 items-center">
<LED active={true} color="green" />
<span className="text-xs text-zinc-400">OSC 1</span>
</div>
<div className="flex space-x-4">
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Sine</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Saw</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Square</Button>
</div>
</div>
</div>

<div>
<div className="mb-4">
<h3 className="text-sm text-zinc-400 mb-2">Spectrum</h3>
<WaveformDisplay type="spectrum" height={128} />
</div>
<div className="flex justify-between items-center">
<div className="flex space-x-2 items-center">
<LED active={true} color="purple" />
<span className="text-xs text-zinc-400">Analyzer</span>
</div>
<div className="flex space-x-2 items-center">
<span className="text-xs text-zinc-400">Resolution</span>
<select className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md !rounded-button whitespace-nowrap">
<option>1024</option>
<option>2048</option>
<option>4096</option>
</select>
</div>
</div>
</div>
</div>

<div className="grid grid-cols-2 gap-8 mt-8">
<div>
<h3 className="text-sm text-zinc-400 mb-4">Track Parameters</h3>
<div className="grid grid-cols-4 gap-4">
<div>
<Knob
value={attack}
onChange={setAttack}
label="Attack"
size="sm"
color="#4ade80"
/>
</div>
<div>
<Knob
value={decay}
onChange={setDecay}
label="Decay"
size="sm"
color="#4ade80"
/>
</div>
<div>
<Knob
value={sustain}
onChange={setSustain}
label="Sustain"
size="sm"
color="#4ade80"
/>
</div>
<div>
<Knob
value={release}
onChange={setRelease}
label="Release"
size="sm"
color="#4ade80"
/>
</div>
</div>
</div>
</div>
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<h3 className="text-lg font-medium mb-4">Filter</h3>
<div className="space-y-6">
<div>
<Knob
value={filter}
onChange={setFilter}
label="Cutoff"
color="#a855f7"
/>
</div>
<div>
<Knob
value={resonance}
onChange={setResonance}
label="Resonance"
color="#a855f7"
/>
</div>
<div className="pt-4">
<h4 className="text-sm text-zinc-400 mb-2">Filter Type</h4>
<div className="grid grid-cols-2 gap-2">
<Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white !rounded-button whitespace-nowrap">Low Pass</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">High Pass</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Band Pass</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Notch</Button>
</div>
</div>
</div>
</div>
</div>
</TabsContent>

<TabsContent value="sequencer" className="mt-0">
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* Track List and Controls */}
<div className="lg:col-span-3 bg-zinc-800/50 rounded-lg p-4">
<h3 className="text-sm font-medium mb-4">Tracks</h3>
<TrackList
tracks={tracks}
selectedTrack={selectedTrack}
mutes={trackMutes}
solos={trackSolos}
onSelectTrack={setSelectedTrack}
onToggleMute={(index) => {
const newMutes = [...trackMutes];
newMutes[index] = !newMutes[index];
setTrackMutes(newMutes);
}}
onToggleSolo={(index) => {
const newSolos = [...trackSolos];
newSolos[index] = !newSolos[index];
setTrackSolos(newSolos);
}}
/>
</div>
{/* Step Sequencer */}
<div className="lg:col-span-9 bg-zinc-800/50 rounded-lg p-4">
<TransportControls
isPlaying={isPlaying}
onPlayPause={handlePlayPause}
tempo={tempo}
onTempoChange={setTempo}
className="mb-4"
/>
{/* Step Grid */}
<div className="grid grid-cols-16 gap-1 mb-4">
{Array.from({ length: 16 }).map((_, stepIndex) => (
<div key={stepIndex} className="flex flex-col space-y-1">
<div className="text-xs text-center text-zinc-500">{stepIndex + 1}</div>
{tracks.map((track, trackIndex) => (
<div
key={`${trackIndex}-${stepIndex}`}
className={`h-8 ${
track.pattern[stepIndex]
? `bg-${track.color}-900/30 border-${track.color}-500`
: 'bg-zinc-800 border-zinc-700'
} border rounded cursor-pointer hover:bg-zinc-700 transition-colors`}
onClick={() => {
const newTracks = [...tracks];
newTracks[trackIndex].pattern[stepIndex] = !newTracks[trackIndex].pattern[stepIndex];
// Update tracks state
}}
>
<div className="h-full flex flex-col justify-between p-1">
<div className="flex justify-between">
<LED active={track.pattern[stepIndex]} color={track.color} size="xs" />
<LED active={stepIndex === 0} color="green" size="xs" />
</div>
</div>
</div>
))}
</div>
))}
</div>
{/* Step Parameters */}
<div className="grid grid-cols-3 gap-4">
<div>
<h4 className="text-sm mb-2">Velocity</h4>
<Slider
value={[stepParams[0].velocity]}
onValueChange={(values) => {
const newParams = [...stepParams];
newParams[0].velocity = values[0];
setStepParams(newParams);
}}
max={100}
step={1}
/>
</div>
<div>
<h4 className="text-sm mb-2">Probability</h4>
<Slider
value={[stepParams[0].probability]}
onValueChange={(values) => {
const newParams = [...stepParams];
newParams[0].probability = values[0];
setStepParams(newParams);
}}
max={100}
step={1}
/>
</div>
<div>
<h4 className="text-sm mb-2">Length</h4>
<Slider
value={[stepParams[0].length]}
onValueChange={(values) => {
const newParams = [...stepParams];
newParams[0].length = values[0];
setStepParams(newParams);
}}
max={100}
step={1}
/>
</div>
</div>
</div>
</div>
{/* Performance Controls */}
<div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* XY Pad */}
<div className="lg:col-span-4 bg-zinc-800/50 rounded-lg p-4">
<h3 className="text-sm font-medium mb-4">XY Performance Pad</h3>
<XYPad
value={xyPad}
onChange={setXyPad}
/>
</div>
{/* LFO Controls */}
<div className="lg:col-span-4 bg-zinc-800/50 rounded-lg p-4">
<h3 className="text-sm font-medium mb-4">LFO</h3>
<div className="space-y-4">
<div>
<label className="text-sm mb-2 block">Rate</label>
<Slider
value={[lfoRate]}
onValueChange={(values) => setLfoRate(values[0])}
max={100}
step={1}
/>
</div>
<div>
<label className="text-sm mb-2 block">Depth</label>
<Slider
value={[lfoDepth]}
onValueChange={(values) => setLfoDepth(values[0])}
max={100}
step={1}
/>
</div>
<div>
<label className="text-sm mb-2 block">Shape</label>
<div className="grid grid-cols-4 gap-2">
{['sine', 'triangle', 'square', 'saw'].map((shape) => (
<Button
key={shape}
variant="outline"
size="sm"
className={`border-zinc-700 ${
lfoShape === shape ? 'bg-purple-900/30 border-purple-500' : ''
} !rounded-button whitespace-nowrap`}
onClick={() => setLfoShape(shape)}
>
<i className={`fa-solid fa-waveform-${shape}`}></i>
</Button>
))}
</div>
</div>
</div>
</div>
{/* Drum Pads */}
<div className="lg:col-span-4 bg-zinc-800/50 rounded-lg p-4">
<h3 className="text-sm font-medium mb-4">Drum Pads</h3>
<div className="grid grid-cols-4 gap-2">
{drumPadSounds.map((sound, index) => (
<DrumPad
key={index}
name={sound.name}
category={sound.category}
color={sound.color}
icon={sound.icon || 'fa-drum'}
/>
))}
</div>
</div>
</div>

<TransportControls
isPlaying={isPlaying}
onPlayPause={handlePlayPause}
showRecord={true}
tempo={tempo}
onTempoChange={setTempo}
showResetButton={true}
showSaveButton={true}
className="mb-6 mt-6"
/>

<div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
<div className="grid grid-cols-16 gap-2">
{Array.from({ length: 16 }).map((_, index) => (
<div key={index} className="flex flex-col items-center">
<div className="mb-2 text-xs text-zinc-500">{index + 1}</div>
<Pad
active={activeSequence[index]}
onClick={() => toggleSequenceStep(index)}
/>
<div className="mt-2">
<Slider
value={[50]}
onValueChange={() => {}}
max={100}
step={1}
orientation="vertical"
className="h-20"
/>
</div>
</div>
))}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div>
<h3 className="text-sm text-zinc-400 mb-4">Step Parameters</h3>
<div className="space-y-4">
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Gate</span>
<div className="w-32">
<Slider
value={[75]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">75%</span>
</div>
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Velocity</span>
<div className="w-32">
<Slider
value={[90]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">90%</span>
</div>
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Pitch</span>
<div className="w-32">
<Slider
value={[50]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">0</span>
</div>
</div>
</div>
<div>
<h3 className="text-sm text-zinc-400 mb-4">Modulation</h3>
<div className="space-y-4">
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Filter</span>
<div className="w-32">
<Slider
value={[60]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">60%</span>
</div>
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Resonance</span>
<div className="w-32">
<Slider
value={[40]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">40%</span>
</div>
<div className="flex items-center justify-between">
<span className="text-sm text-zinc-400">Decay</span>
<div className="w-32">
<Slider
value={[25]}
onValueChange={() => {}}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">25%</span>
</div>
</div>
</div>
<div>
<h3 className="text-sm text-zinc-400 mb-4">Sequence Settings</h3>
<div className="space-y-4">
<div className="flex items-center space-x-2">
<Switch id="loop" />
<label htmlFor="loop" className="text-sm text-zinc-400 cursor-pointer">Loop Sequence</label>
</div>
<div className="flex items-center space-x-2">
<Switch id="quantize" defaultChecked />
<label htmlFor="quantize" className="text-sm text-zinc-400 cursor-pointer">Quantize</label>
</div>
<div className="flex items-center space-x-2">
<Switch id="swing" />
<label htmlFor="swing" className="text-sm text-zinc-400 cursor-pointer">Swing</label>
</div>
<div className="pt-2">
<Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-random mr-2"></i>
Randomize
</Button>
</div>
</div>
</div>
</div>
</div>
</TabsContent>

<TabsContent value="effects" className="mt-0">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
<EffectPanel
title="Delay"
color="#6366f1"
parameters={[
{ name: "Time", value: delay, onChange: setDelay },
{ name: "Feedback", value: 40, onChange: () => {} },
{ name: "Mix", value: 70, onChange: () => {} }
]}
toggles={[
{ id: "sync", label: "Sync to Tempo", checked: true, onChange: () => {} }
]}
/>

<EffectPanel
title="Reverb"
color="#ec4899"
parameters={[
{ name: "Size", value: reverb, onChange: setReverb },
{ name: "Damping", value: 60, onChange: () => {} },
{ name: "Mix", value: 35, onChange: () => {} }
]}
options={{
name: "Type",
value: ["Hall", "Room", "Plate", "Chamber"],
selected: "Hall",
onChange: () => {}
}}
/>

<EffectPanel
title="Modulation"
color="#0ea5e9"
parameters={[
{ name: "Rate", value: modulation, onChange: setModulation },
{ name: "Depth", value: 50, onChange: () => {} },
{ name: "Mix", value: 30, onChange: () => {} }
]}
buttons={[
{ label: "Chorus", isActive: true, onClick: () => {} },
{ label: "Phaser", isActive: false, onClick: () => {} },
{ label: "Flanger", isActive: false, onClick: () => {} },
{ label: "Tremolo", isActive: false, onClick: () => {} }
]}
/>
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
export default App;
