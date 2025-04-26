import React, { useState, useEffect } from 'react';
import Knob from './KnobWrapper';
import { Card } from './ui/card';
import Slider from './ui/slider';
import { Button } from './ui/button';
import LED from './ui/led';
import Switch from './ui/switch';

interface MixerPanelProps {
  className?: string;
}

// Erweiterte Track-Interface mit zusätzlichen Parametern im Qu-16-Stil
interface Track {
  name: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  preamp: number;
  phantomPower: boolean;
  polarity: boolean;
  hpf: number;
  eq: {
    low: number;
    lowFreq: number;
    lowQ?: number; // Optional Q parameter
    mid: number;
    midFreq: number;
    midQ: number;
    high: number;
    highFreq: number;
    highQ?: number; // Optional Q parameter
  };
  compressor: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    makeup: number;  // Added makeup parameter
    active: boolean;  // Added active state
  };
  auxSend: number[];
  postFader: boolean[];
  routing: {
    main: boolean;
  };
  color: string;
}

// Erweiterte Master-Interface
interface Master {
  volume: number;
  auxMaster: number[];
  monitor: {
    phones: boolean;
    phonesLevel: number;
    talkbackLevel: number;
    talkback: boolean;
  };
}

const MixerPanel: React.FC<MixerPanelProps> = ({ className = '' }) => {
  // Erweiterte State mit mehr Parametern und Funktionen
  const [tracks, setTracks] = useState<Track[]>([
    { 
      name: 'Kick', 
      volume: 75, 
      pan: 50, 
      mute: false, 
      solo: false,
      preamp: 65,
      phantomPower: false,
      polarity: false,
      hpf: 20,
      eq: { 
        low: 60, 
        lowFreq: 100,
        lowQ: 0.7,
        mid: 45, 
        midFreq: 1000,
        midQ: 1.0, 
        high: 45, 
        highFreq: 8000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [20, 30, 15, 25],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: '#60a5fa'
    },
    { 
      name: 'Snare', 
      volume: 70, 
      pan: 45, 
      mute: false, 
      solo: false,
      preamp: 60,
      phantomPower: false,
      polarity: false,
      hpf: 30,
      eq: { 
        low: 45, 
        lowFreq: 100,
        lowQ: 0.7, 
        mid: 55, 
        midFreq: 800,
        midQ: 1.0, 
        high: 50, 
        highFreq: 8000,
        highQ: 0.7 
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [25, 15, 30, 20],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: '#f472b6'
    },
    { 
      name: 'Hat', 
      volume: 65, 
      pan: 60, 
      mute: false, 
      solo: false,
      preamp: 55,
      phantomPower: true,
      polarity: false,
      hpf: 50,
      eq: { 
        low: 40, 
        lowFreq: 100,
        lowQ: 0.7, 
        mid: 50, 
        midFreq: 2000,
        midQ: 1.0, 
        high: 70, 
        highFreq: 10000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [10, 25, 15, 20],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: '#a78bfa'
    },
    { 
      name: 'Tom', 
      volume: 60, 
      pan: 40, 
      mute: false, 
      solo: false,
      preamp: 65,
      phantomPower: false,
      polarity: false,
      hpf: 35,
      eq: { 
        low: 55, 
        lowFreq: 200,
        lowQ: 0.7, 
        mid: 60, 
        midFreq: 1000,
        midQ: 1.0, 
        high: 40, 
        highFreq: 6000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [15, 10, 20, 35],
      postFader: [false, false, true, true],
      routing: {
        main: true,
      },
      color: '#fb923c'
    },
    { 
      name: 'Perc', 
      volume: 72, 
      pan: 55, 
      mute: false, 
      solo: false,
      preamp: 60,
      phantomPower: true,
      polarity: false,
      hpf: 40,
      eq: { 
        low: 50, 
        lowFreq: 150,
        lowQ: 0.7, 
        mid: 55, 
        midFreq: 1200,
        midQ: 1.0, 
        high: 50, 
        highFreq: 7000,
        highQ: 0.7 
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [30, 20, 25, 15],
      postFader: [false, false, true, true],
      routing: {
        main: true,
      },
      color: '#fbbf24'
    },
    { 
      name: 'Synth 1', 
      volume: 68, 
      pan: 35, 
      mute: false, 
      solo: false,
      preamp: 55,
      phantomPower: false,
      polarity: false,
      hpf: 60,
      eq: { 
        low: 45, 
        lowFreq: 100,
        lowQ: 0.7, 
        mid: 50, 
        midFreq: 1500,
        midQ: 1.0, 
        high: 60, 
        highFreq: 8000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [25, 35, 15, 20],
      postFader: [true, true, false, false],
      routing: {
        main: true,
      },
      color: '#34d399'
    },
    { 
      name: 'Synth 2', 
      volume: 70, 
      pan: 65, 
      mute: false, 
      solo: false,
      preamp: 60,
      phantomPower: false,
      polarity: false,
      hpf: 50,
      eq: { 
        low: 50, 
        lowFreq: 120,
        lowQ: 0.7, 
        mid: 45, 
        midFreq: 1800,
        midQ: 1.0, 
        high: 65, 
        highFreq: 9000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [20, 30, 25, 35],
      postFader: [true, true, false, false],
      routing: {
        main: true,
      },
      color: '#22d3ee'
    },
    { 
      name: 'FX', 
      volume: 65, 
      pan: 50, 
      mute: false, 
      solo: false,
      preamp: 50,
      phantomPower: false,
      polarity: false,
      hpf: 70,
      eq: { 
        low: 40, 
        lowFreq: 80,
        lowQ: 0.7, 
        mid: 45, 
        midFreq: 2500,
        midQ: 1.0, 
        high: 70, 
        highFreq: 12000,
        highQ: 0.7
      },
      compressor: {
        threshold: -10,
        ratio: 4,
        attack: 10,
        release: 100,
        makeup: 0,
        active: false,
      },
      auxSend: [40, 45, 30, 35],
      postFader: [true, true, true, true],
      routing: {
        main: true,
      },
      color: '#818cf8'
    },
  ]);
  
  // Erweiterter Master-State ohne Gruppen
  const [master, setMaster] = useState<Master>({
    volume: 80,
    auxMaster: [65, 70, 60, 75],
    monitor: {
      phones: true,
      phonesLevel: 70,
      talkbackLevel: 50,
      talkback: false
    }
  });

  // Zustandsvariablen
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  
  // Hilfsfunktionen zum Aktualisieren der States
  const updateTrackVolume = (index: number, value: number) => {
    const newTracks = [...tracks];
    newTracks[index].volume = value;
    setTracks(newTracks);
  };

  const updateTrackPan = (index: number, value: number) => {
    const newTracks = [...tracks];
    newTracks[index].pan = value;
    setTracks(newTracks);
  };

  const toggleTrackMute = (index: number) => {
    const newTracks = [...tracks];
    newTracks[index].mute = !newTracks[index].mute;
    setTracks(newTracks);
  };

  const toggleTrackSolo = (index: number) => {
    const newTracks = [...tracks];
    newTracks[index].solo = !newTracks[index].solo;
    setTracks(newTracks);
  };

  const togglePhantomPower = (index: number) => {
    const newTracks = [...tracks];
    newTracks[index].phantomPower = !newTracks[index].phantomPower;
    setTracks(newTracks);
  };

  const togglePolarity = (index: number) => {
    const newTracks = [...tracks];
    newTracks[index].polarity = !newTracks[index].polarity;
    setTracks(newTracks);
  };

  const updateTrackGain = (index: number, value: number) => {
    const newTracks = [...tracks];
    newTracks[index].preamp = value;
    setTracks(newTracks);
  };

  const updateHPF = (index: number, value: number) => {
    const newTracks = [...tracks];
    newTracks[index].hpf = value;
    setTracks(newTracks);
  };

  const updateAuxSend = (trackIndex: number, auxIndex: number, value: number) => {
    const newTracks = [...tracks];
    newTracks[trackIndex].auxSend[auxIndex] = value;
    setTracks(newTracks);
  };

  const togglePostFader = (trackIndex: number, auxIndex: number) => {
    const newTracks = [...tracks];
    newTracks[trackIndex].postFader[auxIndex] = !newTracks[trackIndex].postFader[auxIndex];
    setTracks(newTracks);
  };

  const updateTrackEQ = (trackIndex: number, band: keyof Track['eq'], value: number) => {
    const newTracks = [...tracks];
    newTracks[trackIndex].eq[band] = value;
    setTracks(newTracks);
  };

  const updateCompressor = (trackIndex: number, param: keyof Track['compressor'], value: number) => {
    const newTracks = [...tracks];
    // Use type assertion to fix the TypeScript error
    (newTracks[trackIndex].compressor[param] as number) = value;
    setTracks(newTracks);
  };

  // Für LED VU-Meter - simulierte Werte
  const [vuLevels, setVuLevels] = useState<number[]>(
    tracks.map(track => Math.min(Math.max(track.volume - 15, 0), 100))
  );
  
  // VU-Meter Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setVuLevels(prevLevels => 
        tracks.map((track, idx) => {
          // Basis-Level basiert auf Lautstärke mit etwas Varianz
          const baseLevel = track.mute ? 0 : track.volume;
          const varianceAmount = track.volume > 70 ? 15 : 8; // Mehr Bewegung bei höheren Pegeln
          const variance = Math.random() * varianceAmount - (varianceAmount / 2);
          return Math.min(Math.max(baseLevel + variance, 0), 100);
        })
      );
    }, 100); // Aktualisiere 10x pro Sekunde
    
    return () => clearInterval(interval);
  }, [tracks]);

  // Render-Funktionen für verschiedene Teile des Mixers

  // 1. Render Eingangskanalzüge (Channel Strips)
  const renderChannelStrips = () => {
    return (
      <div className="grid grid-cols-9 gap-2 mb-4">
        {/* Eingangskanäle (8 Stück) */}
        {tracks.map((track, index) => (
          <div 
            key={index} 
            className={`rounded-lg p-1 flex flex-col items-center relative ${selectedChannel === index ? 'ring-2 ring-blue-500' : ''}`}
            style={{
              background: 'linear-gradient(145deg, #252525, #1e1e1e)',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.1)',
              borderLeft: `2px solid ${track.color}`,
              height: '780px', // Feste Höhe für den gesamten Kanalzug
              display: 'flex',  // Wichtig: Macht den Container zum Flex-Container
              flexDirection: 'column' // Stellt Kinder untereinander
            }}
            onClick={() => setSelectedChannel(index)}
          >
            {/* --- OBERER BEREICH MIT KNOBS UND BUTTONS --- */}
            {/* Dieser Teil nimmt nur so viel Platz wie nötig */}
            <div className="w-full flex-shrink-0"> {/* flex-shrink-0 verhindert Schrumpfen */}
              {/* Kanalname und Aktivitäts-LED */}
              <div className="w-full flex justify-between items-center mb-1">
                <span className="text-xs font-medium">{track.name}</span>
                <LED 
                  active={!track.mute && (!tracks.some(t => t.solo) || track.solo)} 
                  color={track.solo ? "yellow" : "green"} 
                  size="sm" 
                />
              </div>
              
              {/* Oberer Bereich: Gain, 48V, Polarity */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[9px]">Gain</div>
                  <div className="flex">
                    {/* Phantomspeisung-Schalter */}
                    <button 
                      className={`w-4 h-4 rounded-sm mr-1 flex items-center justify-center text-[7px] ${track.phantomPower ? 'bg-red-700' : 'bg-zinc-700'}`}
                      onClick={(e) => { e.stopPropagation(); togglePhantomPower(index); }}
                    >
                      48V
                    </button>
                    
                    {/* Polarity Switch */}
                    <button 
                      className={`w-4 h-4 rounded-sm flex items-center justify-center text-[9px] ${track.polarity ? 'bg-yellow-700' : 'bg-zinc-700'}`}
                      onClick={(e) => { e.stopPropagation(); togglePolarity(index); }}
                    >
                      Ø
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-center items-center">
                  <Knob
                    value={track.preamp}
                    onChange={(value) => updateTrackGain(index, value)}
                    size="sm"
                    color={track.phantomPower ? "#ef4444" : "#f97316"}
                  />
                </div>
              </div>
              
              {/* HPF Regler */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[9px]">HPF</div>
                  <div className="text-[9px]">{Math.round(track.hpf * 2)}Hz</div>
                </div>
                <div className="flex justify-center items-center">
                  <Knob
                    value={track.hpf}
                    onChange={(value) => updateHPF(index, value)}
                    size="sm"
                    color="#f97316"
                  />
                </div>
              </div>
              
              {/* EQ-Sektion mit Drehreglern und Neon-Beleuchtung */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="text-[9px] mb-1 text-center">EQ</div>
                <div className="grid grid-cols-3 gap-1">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px]">Lo</span>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full" style={{
                        boxShadow: '0 0 8px 2px rgba(34, 197, 94, 0.6)',
                        filter: 'blur(2px)'
                      }}></div>
                      <Knob
                        value={track.eq.low}
                        onChange={(value) => updateTrackEQ(index, 'low', value)}
                        size="sm"
                        color="#22c55e"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px]">Mid</span>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full" style={{
                        boxShadow: '0 0 8px 2px rgba(59, 130, 246, 0.6)',
                        filter: 'blur(2px)'
                      }}></div>
                      <Knob
                        value={track.eq.mid}
                        onChange={(value) => updateTrackEQ(index, 'mid', value)}
                        size="sm"
                        color="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[7px]">Hi</span>
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full" style={{
                        boxShadow: '0 0 8px 2px rgba(139, 92, 246, 0.6)',
                        filter: 'blur(2px)'
                      }}></div>
                      <Knob
                        value={track.eq.high}
                        onChange={(value) => updateTrackEQ(index, 'high', value)}
                        size="sm"
                        color="#8b5cf6"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Compressor mit Neon-Beleuchtung */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="text-[9px] mb-1 text-center">Comp</div>
                <div className="flex justify-center items-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full" style={{
                      boxShadow: track.compressor.active ? '0 0 8px 2px rgba(168, 85, 247, 0.6)' : 'none',
                      filter: 'blur(2px)'
                    }}></div>
                    <Knob
                      value={track.compressor.threshold + 60} // Convert -60 to 0 dB range to 0-100 range
                      onChange={(value) => updateCompressor(index, 'threshold', value - 60)}
                      size="sm"
                      color="#a855f7"
                    />
                  </div>
                </div>
              </div>
              
              {/* Aux-Sends mit Drehreglern und Neon-Beleuchtung */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="text-[9px] mb-1 text-center">Aux</div>
                <div className="grid grid-cols-2 gap-1">
                  {track.auxSend.slice(0, 2).map((send, auxIndex) => (
                    <div key={auxIndex} className="flex flex-col items-center">
                      <span className="text-[7px]">A{auxIndex+1}</span>
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full" style={{
                          boxShadow: `0 0 8px 2px ${track.postFader[auxIndex] ? 'rgba(34, 197, 94, 0.6)' : 'rgba(234, 179, 8, 0.6)'}`,
                          filter: 'blur(2px)'
                        }}></div>
                        <Knob
                          value={send}
                          onChange={(value) => updateAuxSend(index, auxIndex, value)}
                          size="sm"
                          color={track.postFader[auxIndex] ? "#22c55e" : "#eab308"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {track.auxSend.slice(2, 4).map((send, auxIndex) => (
                    <div key={auxIndex} className="flex flex-col items-center">
                      <span className="text-[7px]">A{auxIndex+3}</span>
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full" style={{
                          boxShadow: `0 0 8px 2px ${track.postFader[auxIndex+2] ? 'rgba(34, 197, 94, 0.6)' : 'rgba(234, 179, 8, 0.6)'}`,
                          filter: 'blur(2px)'
                        }}></div>
                        <Knob
                          value={send}
                          onChange={(value) => updateAuxSend(index, auxIndex + 2, value)}
                          size="sm"
                          color={track.postFader[auxIndex + 2] ? "#22c55e" : "#eab308"}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pan-Regler */}
              <div className="w-full border-b border-zinc-800 py-1 mb-1">
                <div className="text-[9px] mb-1 text-center">Pan</div>
                <div className="flex justify-center items-center">
                  <Knob
                    value={track.pan}
                    onChange={(value) => updateTrackPan(index, value)}
                    size="sm"
                    color="#60a5fa"
                  />
                </div>
              </div>
              
              {/* Mute/Solo-Tasten */}
              <div className="w-full flex justify-between mb-2">
                <button
                  className={`text-[9px] py-0.5 px-1 rounded-sm ${track.mute ? 'bg-red-900/40 border border-red-500' : 'bg-zinc-800 border border-zinc-700'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackMute(index);
                  }}
                >
                  M
                </button>
                <button
                  className={`text-[9px] py-0.5 px-1 rounded-sm ${track.solo ? 'bg-yellow-900/40 border border-yellow-500' : 'bg-zinc-800 border border-zinc-700'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackSolo(index);
                  }}
                >
                  S
                </button>
                <button
                  className={`text-[9px] py-0.5 px-1 rounded-sm ${selectedChannel === index ? 'bg-blue-900/40 border border-blue-500' : 'bg-zinc-800 border border-zinc-700'}`}
                  onClick={() => setSelectedChannel(index)}
                >
                  SEL
                </button>
              </div>
            </div> {/* Ende des oberen Bereichs */}
            
            {/* --- FADER BEREICH (FLEX-GROW) --- */}
            {/* Dieser Bereich nimmt den übrigen Platz ein, damit der Fader möglichst lang ist */}
            <div className="flex-grow w-full flex flex-col justify-end items-center pt-2 pb-1">
              <div className="h-full w-full flex flex-row justify-center items-center">
                {/* LED VU-Meter - jetzt als Punkt-LEDs und nebeneinander */}
                <div className="h-full flex flex-col justify-center items-center mr-2">
                  <div className="h-full w-3 flex flex-col-reverse">
                    {[...Array(10)].map((_, i) => {
                      // Bestimme die Farbe basierend auf der Position
                      const ledColor = i >= 8 ? '#ef4444' : // rot für die oberen 2
                                      i >= 6 ? '#f97316' : // orange für die mittleren 2
                                      '#22c55e'; // grün für die unteren 6
                      
                      const threshold = (i+1) * 10; // Schwellwert für diesen LED-Punkt
                      const isActive = vuLevels[index] >= threshold;
                      
                      return (
                        <div
                          key={i}
                          className="w-3 h-3 rounded-full my-1 border border-zinc-800 transition-all duration-75"
                          style={{ 
                            background: isActive ? `radial-gradient(circle, ${ledColor} 0%, ${ledColor}80 60%, ${ledColor}50 100%)` : 'radial-gradient(circle, #222 0%, #111 70%, #000 100%)',
                            boxShadow: isActive ? `0 0 4px ${ledColor}80` : 'none',
                          }}
                        />
                      );
                    }).reverse()}
                  </div>
                </div>

                {/* Vertikaler Fader mit Grid-Alignment */}
                <Slider
                  value={track.volume}
                  onChange={(value) => updateTrackVolume(index, value)}
                  orientation="vertical"
                  size="md"
                  color={track.color}
                  snapToGrid={true}
                  gridSize={5}
                  showGridLines={true}
                  gridLineColor="rgba(255, 255, 255, 0.1)"
                  className="h-full"
                />
              </div>
              
              {/* Buttons für Mute und Solo */}
              <div className="flex justify-between items-center w-full mt-1">
                <Button
                  className={`w-6 h-5 text-[9px] ${track.mute ? 'bg-red-600 hover:bg-red-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                  onClick={(e) => { e.stopPropagation(); toggleTrackMute(index); }}
                >
                  M
                </Button>
                <Button
                  className={`w-6 h-5 text-[9px] ${track.solo ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                  onClick={(e) => { e.stopPropagation(); toggleTrackSolo(index); }}
                >
                  S
                </Button>
              </div>
              
              {/* Pan-Regler */}
              <div className="w-full mt-1 mb-2">
                <Slider
                  value={track.pan}
                  onChange={(value) => updateTrackPan(index, value)}
                  size="sm"
                  color={track.color}
                  snapToGrid={true}
                  gridSize={10}
                  showGridLines={true}
                />
              </div>

              {/* Kanalname als Label */}
              <div className="text-xs font-medium text-center bg-zinc-900 px-1 py-0.5 rounded w-full">
                {track.name}
              </div>
            </div>
          </div>
        ))}
        
        {/* Master-Kanal */}
        <div 
          className="rounded-lg p-1 flex flex-col items-center"
          style={{
            background: 'linear-gradient(145deg, #252525, #1e1e1e)',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.1)',
            borderLeft: '2px solid #ef4444',
            height: '780px'
          }}
        >
          {/* Kanalname und Aktivitäts-LED */}
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-xs font-medium">Master</span>
            <LED active={true} color="red" size="sm" />
          </div>
          
          {/* --- FADER BEREICH (FLEX-GROW) --- */}
          <div className="flex-grow w-full flex flex-col justify-end items-center pt-2 pb-1">
            <div className="h-full w-full flex flex-row justify-center items-center">
              {/* LED VU-Meter als Punkt-LEDs für Master - nebeneinander */}
              <div className="h-full flex flex-col justify-center items-center mr-2">
                <div className="h-full w-3 flex flex-col-reverse">
                  {[...Array(10)].map((_, i) => {
                    const ledColor = i >= 8 ? '#ef4444' : 
                                    i >= 6 ? '#f97316' : 
                                    '#22c55e';
                    
                    const threshold = (i+1) * 10;
                    const isActive = master.volume >= threshold;
                    
                    return (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full my-1 border border-zinc-800 transition-all duration-75"
                        style={{ 
                          background: isActive ? `radial-gradient(circle, ${ledColor} 0%, ${ledColor}80 60%, ${ledColor}50 100%)` : 'radial-gradient(circle, #222 0%, #111 70%, #000 100%)',
                          boxShadow: isActive ? `0 0 4px ${ledColor}80` : 'none',
                        }}
                      />
                    );
                  }).reverse()}
                </div>
              </div>
              
              {/* Master Vertikaler Fader mit Grid-Alignment */}
              <Slider
                value={master.volume}
                onChange={(value) => setMaster({...master, volume: value})}
                orientation="vertical"
                size="md"
                color="#ef4444"
                snapToGrid={true}
                gridSize={5}
                showGridLines={true}
                gridLineColor="rgba(255, 255, 255, 0.1)"
                className="h-full"
              />
            </div>
            
            {/* Master-Label */}
            <div className="text-xs font-medium text-center bg-zinc-900/80 px-1 py-0.5 rounded w-full mt-3">
              Master
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Touchscreen/Processing-Sektion für ausgewählten Kanal
  const renderProcessingSection = () => {
    if (selectedChannel === null) return null;
    
    const track = tracks[selectedChannel];
    return (
      <div className="bg-zinc-800/50 rounded-lg p-4 mb-6" style={{
        background: 'linear-gradient(145deg, #2d2d2d, #222222)',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
      }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium" style={{ 
              color: track.color,
              textShadow: `0 0 5px ${track.color}40`
            }}>
              {track.name}
            </h3>
            <div className="text-sm text-gray-400">Channel {selectedChannel + 1}</div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedChannel(null)}
          >
            Close
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* EQ & Filter-Sektion */}
          <div className="bg-zinc-900 rounded-lg p-4" style={{
            background: 'linear-gradient(to bottom, #262626, #1c1c1c)',
            boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.05)'
          }}>
            <h4 className="text-sm font-medium mb-3">Equalizer & Filters</h4>
            
            {/* HPF */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-xs">HPF</span>
                <span className="text-xs">{Math.round(track.hpf * 2)}Hz</span>
              </div>
              <Slider
                value={track.hpf}
                onChange={(value) => updateHPF(selectedChannel, value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            
            {/* Low EQ */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs mb-1">Low Gain</div>
                <Knob
                  value={track.eq.low}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'low', value)}
                  size="md"
                  color="#22c55e"
                />
              </div>
              <div>
                <div className="text-xs mb-1">Low Freq</div>
                <Knob
                  value={track.eq.lowFreq}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'lowFreq', value)}
                  size="md"
                  color="#22c55e"
                />
              </div>
            </div>
            
            {/* Mid EQ */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-xs mb-1">Mid Gain</div>
                <Knob
                  value={track.eq.mid}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'mid', value)}
                  size="md"
                  color="#3b82f6"
                />
              </div>
              <div>
                <div className="text-xs mb-1">Mid Freq</div>
                <Knob
                  value={track.eq.midFreq}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'midFreq', value)}
                  size="md"
                  color="#3b82f6"
                />
              </div>
            </div>
            
            {/* High EQ */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs mb-1">High Gain</div>
                <Knob
                  value={track.eq.high}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'high', value)}
                  size="md"
                  color="#8b5cf6"
                />
              </div>
              <div>
                <div className="text-xs mb-1">High Freq</div>
                <Knob
                  value={track.eq.highFreq}
                  onChange={(value) => updateTrackEQ(selectedChannel, 'highFreq', value)}
                  size="md"
                  color="#8b5cf6"
                />
              </div>
            </div>
          </div>
          
          {/* Aux Sends & Routing-Sektion */}
          <div className="bg-zinc-900 rounded-lg p-4" style={{
            background: 'linear-gradient(to bottom, #262626, #1c1c1c)',
            boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.05)'
          }}>
            <h4 className="text-sm font-medium mb-3">Aux Sends & Routing</h4>
            
            {/* Aux Sends */}
            <div className="mb-4">
              <h5 className="text-xs font-medium mb-2">Aux Sends</h5>
              <div className="grid grid-cols-2 gap-3">
                {track.auxSend.map((send, auxIndex) => (
                  <div key={auxIndex} className="flex flex-col items-center mb-2">
                    <div className="text-xs mb-1">AUX {auxIndex + 1}</div>
                    <Knob
                      value={send}
                      onChange={(value) => updateAuxSend(selectedChannel, auxIndex, value)}
                      size="md"
                      color={track.postFader[auxIndex] ? "#22c55e" : "#eab308"}
                    />
                    <button 
                      className={`text-xs mt-2 px-2 py-1 rounded ${track.postFader[auxIndex] ? 'bg-green-900/40 border border-green-500' : 'bg-yellow-900/40 border border-yellow-500'}`}
                      onClick={() => togglePostFader(selectedChannel, auxIndex)}
                    >
                      {track.postFader[auxIndex] ? "POST" : "PRE"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Routing */}
            <div>
              <h5 className="text-xs font-medium mb-2">Routing</h5>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  className={`py-2 rounded ${track.routing.main ? 'bg-blue-900/40 border border-blue-500' : 'bg-zinc-800 border border-zinc-700'}`}
                  onClick={() => {
                    const newTracks = [...tracks];
                    newTracks[selectedChannel].routing.main = !newTracks[selectedChannel].routing.main;
                    setTracks(newTracks);
                  }}
                >
                  MAIN LR
                </button>
              </div>
            </div>
          </div>
          
          {/* Preamp-Sektion */}
          <div className="bg-zinc-900 rounded-lg p-4" style={{
            background: 'linear-gradient(to bottom, #262626, #1c1c1c)',
            boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.05)'
          }}>
            <h4 className="text-sm font-medium mb-3">Preamp & Processing</h4>
            
            {/* Gain-Regler mit großem Pegel-Meter */}
            <div className="flex justify-between mb-4">
              <div>
                <div className="text-xs mb-1">Gain</div>
                <Knob
                  value={track.preamp}
                  onChange={(value) => updateTrackGain(selectedChannel, value)}
                  size="lg"
                  color={track.phantomPower ? "#ef4444" : "#f97316"}
                />
              </div>
              
              <div className="h-24 w-4 bg-zinc-900 rounded-sm overflow-hidden" style={{
                boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 1px rgba(60, 60, 60, 0.1)'
              }}>
                {/* Enhanced segmented meter for the processing section */}
                {[...Array(30)].map((_, i) => {
                  const segmentHeight = 100 / 30;
                  const segmentPosition = 100 - (i * segmentHeight);
                  
                  // Color gradient
                  let segmentColor = '#22c55e'; // green for lower levels
                  if (i < 3) segmentColor = '#ef4444'; // red for top segments
                  else if (i < 6) segmentColor = '#f97316'; // orange 
                  else if (i < 9) segmentColor = '#eab308'; // yellow
                  
                  // Only show segments up to current preamp value with dynamic peak simulation
                  const preampValue = track.preamp + (Math.random() * 10 - 5); // Add variance
                  const isActive = segmentPosition <= preampValue;
                  
                  return (
                    <div 
                      key={i}
                      className="w-full mb-[1px]"
                      style={{ 
                        height: `${segmentHeight}%`,
                        backgroundColor: isActive ? segmentColor : 'transparent',
                        opacity: isActive ? 0.9 : 0.05,
                        transition: 'opacity 0.05s ease-out',
                        boxShadow: isActive ? `0 0 5px ${segmentColor}80` : 'none'
                      }}
                    />
                  );
                }).reverse()}
              </div>
            </div>
            
            {/* Phantom Power & Polarity Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button 
                className={`py-2 rounded flex items-center justify-center ${track.phantomPower ? 'bg-red-900/40 border border-red-500' : 'bg-zinc-800 border border-zinc-700'}`}
                onClick={() => togglePhantomPower(selectedChannel)}
              >
                <span className="mr-2">48V Phantom</span>
                <LED active={track.phantomPower} color="red" />
              </button>
              
              <button 
                className={`py-2 rounded flex items-center justify-center ${track.polarity ? 'bg-yellow-900/40 border border-yellow-500' : 'bg-zinc-800 border border-zinc-700'}`}
                onClick={() => togglePolarity(selectedChannel)}
              >
                <span className="mr-2">Polarity Ø</span>
                <LED active={track.polarity} color="yellow" />
              </button>
            </div>
            
            {/* Pan-Regler */}
            <div className="mb-4">
              <div className="text-xs mb-1">Pan</div>
              <Slider
                value={track.pan}
                onChange={(value) => updateTrackPan(selectedChannel, value)}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs">L</span>
                <span className="text-xs">{track.pan}</span>
                <span className="text-xs">R</span>
              </div>
            </div>
            
            {/* Mute/Solo-Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={`${track.mute ? 'bg-red-900/40 border border-red-500' : 'bg-zinc-700 border border-zinc-600'} hover:bg-red-900/30 hover:border-red-500`}
                onClick={() => toggleTrackMute(selectedChannel)}
                style={track.mute ? {
                  background: 'linear-gradient(145deg, #f05050, #d03030)',
                  boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.05), 0 0 10px 1px rgba(255, 80, 80, 0.6)'
                } : {
                  background: 'linear-gradient(145deg, #252525, #1d1d1d)',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
                }}
              >
                MUTE
              </Button>
              
              <Button
                variant="outline"
                className={`${track.solo ? 'bg-yellow-900/40 border border-yellow-500' : 'bg-zinc-700 border border-zinc-600'} hover:bg-yellow-900/30 hover:border-yellow-500`}
                onClick={() => toggleTrackSolo(selectedChannel)}
                style={track.solo ? {
                  background: 'linear-gradient(145deg, #f0a040, #d08020)',
                  boxShadow: 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -1px -1px 3px rgba(255, 255, 255, 0.05), 0 0 10px 1px rgba(255, 160, 64, 0.6)'
                } : {
                  background: 'linear-gradient(145deg, #252525, #1d1d1d)',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
                }}
              >
                SOLO
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-zinc-900/70 p-4 rounded-lg ${className}`} style={{
      background: 'linear-gradient(to bottom, #1a1a1a, #111)',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5), inset 0px 1px 0px rgba(255, 255, 255, 0.1)'
    }}>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-gray-200 mb-1">Mixer Panel</h2>
        <div className="text-sm text-gray-400">Audio Mixing Console</div>
      </div>
      
      {renderChannelStrips()}

      {/* Weitere Mixer-Sektionen */}
      {selectedChannel !== null && renderProcessingSection()}
    </div>
  );
};

export default MixerPanel;