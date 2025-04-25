import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import 'swiper/css';
import 'swiper/css/pagination';
import Knob from 'web/src/lib/components/Knob.svelte'; // Import Knob component

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
const Pad: React.FC<{
active: boolean;
onClick: () => void;
size?: 'sm' | 'md' | 'lg';
}> = ({ active, onClick, size = 'md' }) => {
const padSize = {
sm: 'w-8 h-8',
md: 'w-12 h-12',
lg: 'w-16 h-16',
}[size];
return (
<div
className={`${padSize} rounded-md relative cursor-pointer transition-all duration-200 ${active ? 'bg-purple-900/50' : 'bg-zinc-800'}`}
onClick={onClick}
>
<div className={`absolute inset-0 rounded-md ${active ? 'bg-purple-500/20' : 'bg-transparent'} shadow-lg border border-zinc-700`}>
<div className={`absolute inset-0 flex items-center justify-center ${active ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}>
<div className={`w-3 h-3 rounded-full ${active ? 'bg-purple-400' : 'bg-transparent'} shadow-lg shadow-purple-500/50`} />
</div>
</div>
</div>
);
};
const LED: React.FC<{
active: boolean;
color?: string;
size?: 'xs' | 'sm' | 'md';
}> = ({ active, color = 'green', size = 'sm' }) => {
const ledSize = {
xs: 'w-1.5 h-1.5',
sm: 'w-2 h-2',
md: 'w-3 h-3',
}[size];
const ledColor = {
green: active ? 'bg-green-400 shadow-green-400/50' : 'bg-green-900/30',
red: active ? 'bg-red-400 shadow-red-400/50' : 'bg-red-900/30',
blue: active ? 'bg-blue-400 shadow-blue-400/50' : 'bg-blue-900/30',
purple: active ? 'bg-purple-400 shadow-purple-400/50' : 'bg-purple-900/30',
}[color];
return (
<div className={`${ledSize} rounded-full ${ledColor} ${active ? 'shadow-lg' : ''} transition-all duration-200`} />
);
};
return (
<div className="min-h-screen bg-zinc-900 text-zinc-100">
<header className="border-b border-zinc-800 bg-zinc-900">
<div className="container mx-auto px-4 py-4 flex items-center justify-between">
<div className="flex items-center space-x-2">
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
<i className="fa-solid fa-waveform-path text-white text-sm"></i>
</div>
<div className="font-bold text-xl tracking-tight">ARythm-EMU 2050</div>
</div>
<nav className="hidden md:flex items-center space-x-8">
<a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">Home</a>
<a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">Features</a>
<a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">Presets</a>
<a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">Documentation</a>
<a href="#" className="text-zinc-300 hover:text-white transition-colors cursor-pointer">Support</a>
</nav>
<div className="flex items-center space-x-4">
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-download mr-2"></i>
Download
</Button>
<Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white !rounded-button whitespace-nowrap">
Try Online
</Button>
</div>
</div>
</header>
<main className="container mx-auto px-4 py-12">
<section className="mb-16">
<div className="flex flex-col md:flex-row items-center">
<div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
<h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
Next Generation Audio Synthesis
</h1>
<p className="text-xl text-zinc-400 mb-8">
Experience unparalleled sound design capabilities with our cutting-edge digital synthesizer. Craft sounds from the future, today.
</p>
<div className="flex flex-wrap gap-4">
<Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg !rounded-button whitespace-nowrap">
<i className="fa-solid fa-play mr-2"></i>
Start Creating
</Button>
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg !rounded-button whitespace-nowrap">
<i className="fa-solid fa-headphones mr-2"></i>
Listen to Demos
</Button>
</div>
</div>
<div className="md:w-1/2">
<div className="relative">
<img
src="https://readdy.ai/api/search-image?query=Futuristic%20professional%20audio%20synthesizer%20with%20glowing%20purple%20and%20green%20LED%20interface%2C%20digital%20display%20screen%2C%20multiple%20control%20knobs%20and%20buttons%2C%20sleek%20metallic%20finish%2C%20high-tech%20music%20production%20equipment%20against%20dark%20background%2C%20photorealistic%20product%20shot&width=600&height=400&seq=1&orientation=landscape"
alt="ARythm-EMU 2050 Synthesizer"
className="rounded-lg shadow-2xl shadow-purple-500/10 w-full object-cover object-top"
/>
<div className="absolute -bottom-4 -right-4 bg-zinc-800 rounded-lg px-4 py-2 shadow-lg">
<div className="flex items-center space-x-2">
<LED active={true} color="green" />
<span className="text-sm font-medium">Available Now</span>
</div>
</div>
</div>
</div>
</div>
</section>
<section className="mb-16">
<div className="text-center mb-12">
<h2 className="text-3xl font-bold mb-4">Key Features</h2>
<p className="text-zinc-400 max-w-2xl mx-auto">
ARythm-EMU 2050 combines advanced digital synthesis with intuitive controls, giving you unprecedented creative freedom.
</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{features.map((feature, index) => (
<Card key={index} className="bg-zinc-800/50 border-zinc-700">
<CardHeader>
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
<i className={`${feature.icon} text-purple-400 text-xl`}></i>
</div>
<CardTitle>{feature.title}</CardTitle>
</CardHeader>
<CardContent>
<p className="text-zinc-400">{feature.description}</p>
</CardContent>
</Card>
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
<div className="flex justify-between items-center mb-6">
<div className="flex items-center space-x-4">
<Button
onClick={handlePlayPause}
className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white !rounded-button whitespace-nowrap px-8`}
>
<i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'} mr-2`}></i>
{isPlaying ? 'STOP' : 'PLAY'}
</Button>
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap px-6">
<i className="fa-solid fa-record-vinyl mr-2"></i>
REC
</Button>
<div className="flex items-center space-x-2">
<LED active={isPlaying} color="green" />
<span className="text-sm text-zinc-400">Signal</span>
</div>
</div>
<div className="flex items-center space-x-2">
<span className="text-sm text-zinc-400">Master</span>
<div className="w-24">
<Slider
value={[volume]}
onValueChange={(values) => setVolume(values[0])}
max={100}
step={1}
/>
</div>
<span className="text-sm text-zinc-400">{volume}%</span>
</div>
</div>
<div className="grid grid-cols-1 gap-8">
<div className="grid grid-cols-4 gap-4">
{Array.from({ length: 16 }).map((_, index) => (
<div
key={index}
className={`aspect-square bg-zinc-800 rounded-lg border-2 ${activeSequence[index] ? 'border-purple-500 bg-purple-900/20' : 'border-zinc-700'} p-2 cursor-pointer transition-all duration-200 hover:border-purple-400 relative group`}
onClick={() => toggleSequenceStep(index)}
>
<div className="flex flex-col h-full justify-between">
<div className="flex justify-between items-start">
<div className="flex flex-col">
<span className="text-xs text-zinc-500">PAD {index + 1}</span>
<span className="text-[10px] text-zinc-600">{['BD', 'SD', 'HH', 'CP'][index % 4]}</span>
</div>
<div className="flex flex-col items-end space-y-1">
<LED active={activeSequence[index]} color="purple" />
<LED active={index === 0} color="green" size="xs" />
</div>
</div>
<div className="text-center text-2xl text-zinc-400 relative">
<i className="fa-solid fa-drum"></i>
<div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
</div>
<div className="flex justify-between items-end">
<div className="flex flex-col items-start">
<span className="text-[10px] text-zinc-600">VEL</span>
<span className="text-xs text-zinc-400">127</span>
</div>
<div className="flex flex-col items-end">
<span className="text-[10px] text-zinc-600">TUNE</span>
<span className="text-xs text-zinc-400">0</span>
</div>
</div>
</div>
<div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
</div>
))}
</div>
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
<div className="grid grid-cols-16 gap-1">
{Array.from({ length: 16 }).map((_, i) => (
<div key={i} className="flex flex-col space-y-2">
<div className="text-xs text-zinc-500 text-center">{i + 1}</div>
{Array.from({ length: 8 }).map((_, j) => (
<div
key={j}
className={`h-8 bg-zinc-800 border ${i % 4 === 0 ? 'border-zinc-600' : 'border-zinc-700'} rounded cursor-pointer hover:bg-zinc-700 transition-colors ${j === 0 && i % 4 === 0 ? 'bg-purple-900/20 border-purple-500' : ''}`}
>
<div className="h-full flex flex-col justify-between p-1">
<div className="flex justify-between">
<LED active={j === 0 && i % 4 === 0} color="purple" size="xs" />
<LED active={false} color="green" size="xs" />
</div>
<div className="flex justify-between">
<span className="text-[8px] text-zinc-500">{j === 0 ? '127' : ''}</span>
<span className="text-[8px] text-zinc-500">{j === 0 ? '+0' : ''}</span>
</div>
</div>
</div>
))}
</div>
))}
</div>
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
<div ref={spectrumChartRef} className="h-32 w-full bg-zinc-800/50 rounded-lg"></div>
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
<div className="space-y-2">
{tracks.map((track, index) => (
<div
key={index}
className={`flex items-center justify-between p-2 rounded-lg ${
selectedTrack === index ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-zinc-800'
} cursor-pointer hover:bg-zinc-700 transition-colors`}
onClick={() => setSelectedTrack(index)}
>
<div className="flex items-center space-x-2">
<i className={`fa-solid ${track.icon} text-${track.color}-400`}></i>
<span className="text-sm">{track.name}</span>
</div>
<div className="flex items-center space-x-2">
<Button
size="sm"
variant="ghost"
className={`px-2 ${trackMutes[index] ? 'bg-red-500/20 text-red-400' : 'text-zinc-400'} hover:text-white !rounded-button whitespace-nowrap`}
onClick={(e) => {
e.stopPropagation();
const newMutes = [...trackMutes];
newMutes[index] = !newMutes[index];
setTrackMutes(newMutes);
}}
>
M
</Button>
<Button
size="sm"
variant="ghost"
className={`px-2 ${trackSolos[index] ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-400'} hover:text-white !rounded-button whitespace-nowrap`}
onClick={(e) => {
e.stopPropagation();
const newSolos = [...trackSolos];
newSolos[index] = !newSolos[index];
setTrackSolos(newSolos);
}}
>
S
</Button>
</div>
</div>
))}
</div>
</div>
{/* Step Sequencer */}
<div className="lg:col-span-9 bg-zinc-800/50 rounded-lg p-4">
<div className="flex justify-between items-center mb-4">
<div className="flex items-center space-x-4">
<Button
onClick={handlePlayPause}
className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white !rounded-button whitespace-nowrap`}
>
<i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'} mr-2`}></i>
{isPlaying ? 'Stop' : 'Play'}
</Button>
<div className="flex items-center space-x-2">
<span className="text-sm">BPM</span>
<input
type="number"
className="w-16 bg-zinc-800 border border-zinc-700 rounded text-center"
value="120"
/>
</div>
</div>
<div className="flex items-center space-x-2">
<Button variant="outline" size="sm" className="border-zinc-700 !rounded-button whitespace-nowrap">
<i className="fa-solid fa-copy mr-2"></i>
Copy
</Button>
<Button variant="outline" size="sm" className="border-zinc-700 !rounded-button whitespace-nowrap">
<i className="fa-solid fa-paste mr-2"></i>
Paste
</Button>
</div>
</div>
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
<div
className="aspect-square bg-zinc-900 rounded-lg border border-zinc-700 relative cursor-pointer"
onMouseMove={(e) => {
const rect = e.currentTarget.getBoundingClientRect();
const x = ((e.clientX - rect.left) / rect.width) * 100;
const y = ((e.clientY - rect.top) / rect.height) * 100;
setXyPad({ x, y });
}}
>
<div
className="absolute w-4 h-4 bg-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
style={{ left: `${xyPad.x}%`, top: `${xyPad.y}%` }}
>
<div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
</div>
<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5"></div>
</div>
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
<div
key={index}
className={`aspect-square bg-zinc-800 rounded-lg border border-${sound.color}-500/50 p-2 cursor-pointer hover:bg-${sound.color}-900/20 transition-colors`}
>
<div className="h-full flex flex-col justify-between">
<div className="flex justify-between items-start">
<span className="text-xs text-zinc-400">{sound.name}</span>
<LED active={false} color={sound.color} />
</div>
<div className="text-center">
<i className={`fa-solid ${sound.icon || 'fa-drum'} text-${sound.color}-400 text-xl`}></i>
</div>
</div>
</div>
))}
</div>
</div>
</div>
<div className="flex justify-between items-center mb-6">
<div className="flex items-center space-x-4">
<Button
onClick={handlePlayPause}
className={`${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white !rounded-button whitespace-nowrap px-8`}
>
<i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'} mr-2`}></i>
{isPlaying ? 'STOP' : 'PLAY'}
</Button>
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap px-6">
<i className="fa-solid fa-record-vinyl mr-2"></i>
REC
</Button>
<div className="flex items-center space-x-2">
<LED active={isPlaying} color="green" />
<span className="text-sm text-zinc-400">Running</span>
</div>
</div>
<div className="flex items-center space-x-4">
<div className="flex items-center space-x-2">
<span className="text-sm text-zinc-400">BPM</span>
<input
type="number"
className="w-16 bg-zinc-800 border border-zinc-700 rounded-md text-center text-zinc-300 border-none"
value="120"
/>
</div>
<div className="flex items-center space-x-2">
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-rotate-left"></i>
</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-floppy-disk"></i>
</Button>
</div>
</div>
</div>
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
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<h3 className="text-lg font-medium mb-4">Delay</h3>
<div className="space-y-6">
<div>
<Knob
value={delay}
onChange={setDelay}
label="Time"
color="#6366f1"
/>
</div>
<div>
<Knob
value={40}
onChange={() => {}}
label="Feedback"
color="#6366f1"
/>
</div>
<div>
<Knob
value={70}
onChange={() => {}}
label="Mix"
color="#6366f1"
/>
</div>
<div className="pt-2">
<div className="flex items-center space-x-2">
<Switch id="sync" defaultChecked />
<label htmlFor="sync" className="text-sm text-zinc-400 cursor-pointer">Sync to Tempo</label>
</div>
</div>
</div>
</div>
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<h3 className="text-lg font-medium mb-4">Reverb</h3>
<div className="space-y-6">
<div>
<Knob
value={reverb}
onChange={setReverb}
label="Size"
color="#ec4899"
/>
</div>
<div>
<Knob
value={60}
onChange={() => {}}
label="Damping"
color="#ec4899"
/>
</div>
<div>
<Knob
value={35}
onChange={() => {}}
label="Mix"
color="#ec4899"
/>
</div>
<div className="pt-2">
<select className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-zinc-300 !rounded-button whitespace-nowrap">
<option>Hall</option>
<option>Room</option>
<option>Plate</option>
<option>Chamber</option>
</select>
</div>
</div>
</div>
<div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
<h3 className="text-lg font-medium mb-4">Modulation</h3>
<div className="space-y-6">
<div>
<Knob
value={modulation}
onChange={setModulation}
label="Rate"
color="#0ea5e9"
/>
</div>
<div>
<Knob
value={50}
onChange={() => {}}
label="Depth"
color="#0ea5e9"
/>
</div>
<div>
<Knob
value={30}
onChange={() => {}}
label="Mix"
color="#0ea5e9"
/>
</div>
<div className="pt-2">
<div className="grid grid-cols-2 gap-2">
<Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white !rounded-button whitespace-nowrap">Chorus</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Phaser</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Flanger</Button>
<Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">Tremolo</Button>
</div>
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
<Card
key={index}
className={`bg-zinc-800/50 border-zinc-700 cursor-pointer transition-all duration-200 hover:bg-zinc-800 ${activePreset === index ? 'ring-2 ring-purple-500' : ''}`}
onClick={() => setActivePreset(index)}
>
<CardHeader className="pb-2">
<Badge className="self-start bg-zinc-700 text-zinc-300 hover:bg-zinc-700 !rounded-button whitespace-nowrap">{preset.category}</Badge>
<CardTitle className="mt-2">{preset.name}</CardTitle>
</CardHeader>
<CardContent>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-2">
<LED active={activePreset === index} color="purple" />
<span className="text-xs text-zinc-400">{activePreset === index ? 'Selected' : 'Select'}</span>
</div>
<Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-700 !rounded-button whitespace-nowrap">
<i className="fa-solid fa-play"></i>
</Button>
</div>
</CardContent>
</Card>
))}
</div>
<div className="mt-8 text-center">
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-plus mr-2"></i>
Browse All Presets
</Button>
</div>
</section>
<section className="mb-16">
<div className="bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 rounded-2xl p-8 border border-purple-800/20">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
<div>
<h2 className="text-3xl font-bold mb-4">Ready to Create Future Sounds?</h2>
<p className="text-zinc-400 mb-6">
Join thousands of music producers and sound designers who are already using ARythm-EMU 2050 to push the boundaries of audio creation.
</p>
<div className="flex flex-wrap gap-4">
<Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-download mr-2"></i>
Download Now
</Button>
<Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap">
<i className="fa-solid fa-book mr-2"></i>
Read Documentation
</Button>
</div>
</div>
<div>
<img
src="https://readdy.ai/api/search-image?query=Futuristic%20music%20studio%20setup%20with%20glowing%20purple%20and%20green%20lights%2C%20professional%20audio%20equipment%2C%20synthesizers%20and%20controllers%2C%20dark%20atmospheric%20environment%2C%20high-tech%20music%20production%20workspace%20with%20digital%20displays%20and%20LED%20indicators&width=500&height=300&seq=2&orientation=landscape"
alt="Music Production Studio"
className="rounded-lg shadow-2xl shadow-purple-500/10 w-full object-cover object-top"
/>
</div>
</div>
</div>
</section>
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
<SwiperSlide>
<Card className="bg-zinc-800/50 border-zinc-700 h-full">
<CardContent className="pt-6">
<div className="flex items-center mb-4">
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500"></i>
</div>
<p className="text-zinc-300 mb-4">
"The ARythm-EMU 2050 has completely transformed my production workflow. The sound quality is unmatched and the interface is incredibly intuitive."
</p>
<div className="flex items-center">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
<i className="fa-solid fa-user text-white"></i>
</div>
<div>
<div className="font-medium">Alex Thompson</div>
<div className="text-xs text-zinc-400">Electronic Music Producer</div>
</div>
</div>
</CardContent>
</Card>
</SwiperSlide>
<SwiperSlide>
<Card className="bg-zinc-800/50 border-zinc-700 h-full">
<CardContent className="pt-6">
<div className="flex items-center mb-4">
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500"></i>
</div>
<p className="text-zinc-300 mb-4">
"I've used many synthesizers over the years, but the ARythm-EMU 2050 stands out with its incredible sound design capabilities and forward-thinking interface."
</p>
<div className="flex items-center">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
<i className="fa-solid fa-user text-white"></i>
</div>
<div>
<div className="font-medium">Sarah Chen</div>
<div className="text-xs text-zinc-400">Film Composer</div>
</div>
</div>
</CardContent>
</Card>
</SwiperSlide>
<SwiperSlide>
<Card className="bg-zinc-800/50 border-zinc-700 h-full">
<CardContent className="pt-6">
<div className="flex items-center mb-4">
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star-half-alt text-yellow-500"></i>
</div>
<p className="text-zinc-300 mb-4">
"The modulation matrix and sequencer in the ARythm-EMU 2050 are game-changers. I can create sounds I never thought possible before."
</p>
<div className="flex items-center">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
<i className="fa-solid fa-user text-white"></i>
</div>
<div>
<div className="font-medium">Marcus Williams</div>
<div className="text-xs text-zinc-400">Sound Designer</div>
</div>
</div>
</CardContent>
</Card>
</SwiperSlide>
<SwiperSlide>
<Card className="bg-zinc-800/50 border-zinc-700 h-full">
<CardContent className="pt-6">
<div className="flex items-center mb-4">
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500 mr-1"></i>
<i className="fa-solid fa-star text-yellow-500"></i>
</div>
<p className="text-zinc-300 mb-4">
"The ARythm-EMU 2050 has become the centerpiece of my studio. The sound quality and flexibility are unparalleled in the digital synthesis world."
</p>
<div className="flex items-center">
<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
<i className="fa-solid fa-user text-white"></i>
</div>
<div>
<div className="font-medium">Olivia Rodriguez</div>
<div className="text-xs text-zinc-400">Studio Producer</div>
</div>
</div>
</CardContent>
</Card>
</SwiperSlide>
</Swiper>
</section>
</main>
<footer className="bg-zinc-900 border-t border-zinc-800 py-12">
<div className="container mx-auto px-4">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
<div>
<div className="flex items-center space-x-2 mb-4">
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
<i className="fa-solid fa-waveform-path text-white text-sm"></i>
</div>
<div className="font-bold text-xl tracking-tight">ARythm-EMU 2050</div>
</div>
<p className="text-zinc-400 mb-4">
The future of sound design and music production, available today.
</p>
<div className="flex space-x-4">
<a href="#" className="text-zinc-400 hover:text-white transition-colors">
<i className="fa-brands fa-twitter text-lg"></i>
</a>
<a href="#" className="text-zinc-400 hover:text-white transition-colors">
<i className="fa-brands fa-facebook text-lg"></i>
</a>
<a href="#" className="text-zinc-400 hover:text-white transition-colors">
<i className="fa-brands fa-instagram text-lg"></i>
</a>
<a href="#" className="text-zinc-400 hover:text-white transition-colors">
<i className="fa-brands fa-youtube text-lg"></i>
</a>
</div>
</div>
<div>
<h3 className="font-medium text-lg mb-4">Products</h3>
<ul className="space-y-2">
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">ARythm-EMU 2050</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Sound Packs</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Expansion Modules</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Preset Collections</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Hardware Controllers</a></li>
</ul>
</div>
<div>
<h3 className="font-medium text-lg mb-4">Resources</h3>
<ul className="space-y-2">
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Documentation</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Tutorials</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">User Forum</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Sound Design Blog</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Developer API</a></li>
</ul>
</div>
<div>
<h3 className="font-medium text-lg mb-4">Company</h3>
<ul className="space-y-2">
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">About Us</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Careers</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Contact</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Press Kit</a></li>
<li><a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a></li>
</ul>
</div>
</div>
<Separator className="bg-zinc-800 mb-8" />
<div className="flex flex-col md:flex-row justify-between items-center">
<div className="text-zinc-500 mb-4 md:mb-0">
© 2025 ARythm Audio Technologies. All rights reserved.
</div>
<div className="flex items-center space-x-4">
<div className="flex items-center">
<i className="fa-brands fa-cc-visa text-zinc-400 text-2xl mr-2"></i>
<i className="fa-brands fa-cc-mastercard text-zinc-400 text-2xl mr-2"></i>
<i className="fa-brands fa-cc-paypal text-zinc-400 text-2xl mr-2"></i>
<i className="fa-brands fa-cc-apple-pay text-zinc-400 text-2xl"></i>
</div>
</div>
</div>
</div>
</footer>
</div>
);
};
export default App
