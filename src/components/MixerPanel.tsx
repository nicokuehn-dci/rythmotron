import React, { useState, useEffect } from 'react';
import Knob from './KnobWrapper';
import { Card } from './ui/card';
import Slider from './ui/slider';
import { Button } from './ui/button';
import LED from './ui/led';
import Switch from './ui/switch';

interface MixerPanelProps {
  className?: string;
  tracks?: Track[];
  assignedPads?: Record<number, number>; // padId -> trackId mapping
  onTrackVolumeChange?: (trackId: number, volume: number) => void;
  onTrackPanChange?: (trackId: number, pan: number) => void;
  onTrackMuteToggle?: (trackId: number) => void;
  onTrackSoloToggle?: (trackId: number) => void;
  selectedTrack?: number;
  onSelectTrack?: (trackId: number) => void;
}

// Erweiterte Track-Interface mit zusätzlichen Parametern im Qu-16-Stil
interface Track {
  id: number;
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

const MixerPanel: React.FC<MixerPanelProps> = ({ 
  className = '',
  tracks: externalTracks,
  assignedPads,
  onTrackVolumeChange,
  onTrackPanChange,
  onTrackMuteToggle,
  onTrackSoloToggle,
  selectedTrack = -1,
  onSelectTrack
}) => {
  // Verwende externe Tracks, falls sie übergeben wurden, sonst den Standard-State
  const [internalTracks, setInternalTracks] = useState<Track[]>([
    { 
      id: 0, 
      name: 'BD', 
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
      color: 'purple'
    },
    { 
      id: 1,
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
      auxSend: [15, 25, 20, 30],
      postFader: [true, false, true, false],
      routing: {
        main: true,
      },
      color: 'blue'
    },
    { 
      id: 2,
      name: 'Hi-Hat', 
      volume: 65, 
      pan: 60, 
      mute: false, 
      solo: false,
      preamp: 55,
      phantomPower: false,
      polarity: false,
      hpf: 50,
      eq: { 
        low: 40, 
        lowFreq: 100,
        lowQ: 0.7, 
        mid: 50, 
        midFreq: 1200,
        midQ: 0.8, 
        high: 60, 
        highFreq: 10000,
        highQ: 0.7 
      },
      compressor: {
        threshold: -15,
        ratio: 3,
        attack: 5,
        release: 80,
        makeup: 2,
        active: true,
      },
      auxSend: [10, 20, 30, 15],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: 'green'
    },
    { 
      id: 3,
      name: 'Clap', 
      volume: 60, 
      pan: 40, 
      mute: false, 
      solo: false,
      preamp: 60,
      phantomPower: false,
      polarity: false,
      hpf: 100,
      eq: { 
        low: 35, 
        lowFreq: 150,
        lowQ: 0.6, 
        mid: 60, 
        midFreq: 1500,
        midQ: 0.7, 
        high: 55, 
        highFreq: 12000,
        highQ: 0.6 
      },
      compressor: {
        threshold: -18,
        ratio: 5,
        attack: 2,
        release: 150,
        makeup: 3,
        active: true,
      },
      auxSend: [25, 15, 10, 20],
      postFader: [true, false, true, false],
      routing: {
        main: true,
      },
      color: 'yellow'
    },
    { 
      id: 4,
      name: 'Tom', 
      volume: 68, 
      pan: 30, 
      mute: false, 
      solo: false,
      preamp: 55,
      phantomPower: false,
      polarity: false,
      hpf: 40,
      eq: { 
        low: 55, 
        lowFreq: 80,
        lowQ: 0.7, 
        mid: 40, 
        midFreq: 600,
        midQ: 1.0, 
        high: 40, 
        highFreq: 6000,
        highQ: 0.7 
      },
      compressor: {
        threshold: -12,
        ratio: 3.5,
        attack: 8,
        release: 120,
        makeup: 1,
        active: false,
      },
      auxSend: [20, 15, 25, 30],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: 'red'
    },
    { 
      id: 5,
      name: 'Perc', 
      volume: 55, 
      pan: 65, 
      mute: false, 
      solo: false,
      preamp: 50,
      phantomPower: false,
      polarity: false,
      hpf: 60,
      eq: { 
        low: 35, 
        lowFreq: 120,
        lowQ: 0.6, 
        mid: 45, 
        midFreq: 900,
        midQ: 0.8, 
        high: 65, 
        highFreq: 9000,
        highQ: 0.6 
      },
      compressor: {
        threshold: -15,
        ratio: 3,
        attack: 5,
        release: 90,
        makeup: 2,
        active: false,
      },
      auxSend: [15, 25, 20, 10],
      postFader: [true, false, true, false],
      routing: {
        main: true,
      },
      color: 'orange'
    },
    { 
      id: 6,
      name: 'Cymbal', 
      volume: 50, 
      pan: 70, 
      mute: false, 
      solo: false,
      preamp: 45,
      phantomPower: false,
      polarity: false,
      hpf: 150,
      eq: { 
        low: 25, 
        lowFreq: 200,
        lowQ: 0.5, 
        mid: 40, 
        midFreq: 2000,
        midQ: 0.5, 
        high: 70, 
        highFreq: 12000,
        highQ: 0.6 
      },
      compressor: {
        threshold: -20,
        ratio: 2.5,
        attack: 15,
        release: 200,
        makeup: 1,
        active: false,
      },
      auxSend: [10, 15, 20, 25],
      postFader: [false, true, false, true],
      routing: {
        main: true,
      },
      color: 'indigo'
    },
    { 
      id: 7,
      name: 'FX', 
      volume: 45, 
      pan: 50, 
      mute: false, 
      solo: false,
      preamp: 50,
      phantomPower: false,
      polarity: false,
      hpf: 40,
      eq: { 
        low: 50, 
        lowFreq: 100,
        lowQ: 0.7, 
        mid: 50, 
        midFreq: 1000,
        midQ: 0.7, 
        high: 50, 
        highFreq: 8000,
        highQ: 0.7 
      },
      compressor: {
        threshold: -12,
        ratio: 3,
        attack: 10,
        release: 120,
        makeup: 0,
        active: false,
      },
      auxSend: [20, 20, 20, 20],
      postFader: [true, true, true, true],
      routing: {
        main: true,
      },
      color: 'pink'
    }
  ]);

  // Master-State
  const [master, setMaster] = useState<Master>({
    volume: 80,
    auxMaster: [70, 65, 60, 75],
    monitor: {
      phones: true,
      phonesLevel: 60,
      talkbackLevel: 50,
      talkback: false
    }
  });

  // Verwende die externen Tracks, falls vorhanden
  const tracks = externalTracks || internalTracks;

  // Erweitern der Track-Parameter
  const handleVolumeChange = (trackId: number, volume: number) => {
    if (onTrackVolumeChange) {
      onTrackVolumeChange(trackId, volume);
    } else {
      setInternalTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? { ...track, volume } : track
        )
      );
    }
  };

  const handlePanChange = (trackId: number, pan: number) => {
    if (onTrackPanChange) {
      onTrackPanChange(trackId, pan);
    } else {
      setInternalTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? { ...track, pan } : track
        )
      );
    }
  };

  const handleMuteToggle = (trackId: number) => {
    if (onTrackMuteToggle) {
      onTrackMuteToggle(trackId);
    } else {
      setInternalTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? { ...track, mute: !track.mute } : track
        )
      );
    }
  };

  const handleSoloToggle = (trackId: number) => {
    if (onTrackSoloToggle) {
      onTrackSoloToggle(trackId);
    } else {
      setInternalTracks(prevTracks => 
        prevTracks.map(track => 
          track.id === trackId ? { ...track, solo: !track.solo } : track
        )
      );
    }
  };

  const handleTrackSelection = (trackId: number) => {
    if (onSelectTrack) {
      onSelectTrack(trackId);
    }
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMaster(prevMaster => ({ ...prevMaster, volume }));
  };

  // Hilfsfunktion zum Konvertieren von Farbnamen in Hex-Codes für CSS-Styling
  const getColorHex = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      'purple': '#9333ea',
      'blue': '#2563eb',
      'green': '#16a34a',
      'yellow': '#ca8a04',
      'red': '#dc2626',
      'orange': '#ea580c',
      'indigo': '#4f46e5',
      'pink': '#be185d',
    };
    return colorMap[colorName] || '#60a5fa'; // Default-Farbe, falls nicht in der Map
  };

  // Hilfsfunktion, um zu prüfen, ob einem Track ein Pad zugeordnet ist
  const getAssignedPads = (trackId: number): number[] => {
    if (!assignedPads) return [];
    
    return Object.entries(assignedPads)
      .filter(([_, id]) => id === trackId)
      .map(([padId]) => parseInt(padId));
  };

  // Anzahl der Aux-Sends (für die Anzeige)
  const auxCount = 4;

  return (
    <div className={`bg-zinc-800 rounded-lg p-4 overflow-x-auto ${className}`} 
      style={{ 
        minHeight: '700px',
        display: 'flex',
        flexDirection: 'column'
      }}>
      <div className="flex space-x-2 mb-4 flex-1">
        {/* Track-Channel-Strips horizontal layout */}
        <div className="flex space-x-2 flex-1">
          {tracks.map((track) => {
            const assignedPadsList = getAssignedPads(track.id);
            const colorHex = getColorHex(track.color);
            
            return (
              <div 
                key={track.id} 
                className={`flex flex-col w-24 bg-zinc-900 rounded-md p-2 overflow-hidden transition-all ${
                  track.id === selectedTrack ? 'ring-2' : ''
                }`}
                style={{ 
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  borderLeft: `3px solid ${colorHex}`,
                  opacity: track.mute ? 0.7 : 1,
                  height: '100%'
                }}
                onClick={() => handleTrackSelection(track.id)}
              >
                {/* Channel-Name und LEDs */}
                <div className="text-center mb-4 relative">
                  <div className="font-semibold text-sm truncate" style={{ color: colorHex }}>
                    {track.name}
                  </div>
                  {/* Zeige zugewiesene Pad-Nummern an */}
                  {assignedPadsList.length > 0 && (
                    <div className="text-[10px] text-zinc-400 mb-1">
                      Pads: {assignedPadsList.map(id => id + 1).join(', ')}
                    </div>
                  )}
                  <div className="flex justify-center space-x-1 mt-1">
                    <LED active={!track.mute} color="#22c55e" size="xs" />
                    <LED active={track.solo} color="#eab308" size="xs" />
                  </div>
                </div>
                
                {/* EQ-Anzeige (vereinfacht) */}
                <div className="h-32 mb-4 bg-zinc-800 rounded p-1 flex items-end space-x-[1px]"> {/* Increased height to h-32 */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    // EQ-Kurve simulieren
                    let height = 30;
                    
                    if (track.eq) {
                      if (i < 3) height = (track.eq.low / 100) * 90; // Increased multiplier for taller bars
                      else if (i < 7) height = (track.eq.mid / 100) * 90; 
                      else height = (track.eq.high / 100) * 90;
                    }
                    
                    return (
                      <div 
                        key={i} 
                        className="flex-1 rounded-t"
                        style={{ 
                          height: `${height}px`,
                          backgroundColor: track.mute ? '#4b5563' : colorHex,
                          opacity: track.mute ? 0.3 : 0.7
                        }}
                      ></div>
                    );
                  })}
                </div>
                
                {/* Pan-Steuerung */}
                <div className="mb-6 text-center"> {/* Increased margin */}
                  <div className="text-xs text-zinc-400 mb-2">Pan</div>
                  <Knob
                    value={track.pan}
                    onChange={(v) => handlePanChange(track.id, v)}
                    min={0}
                    max={100}
                    size="small"
                    color={colorHex}
                  />
                </div>
                
                {/* Fader und Mute/Solo */}
                <div className="flex flex-col items-center flex-1">
                  <div className="h-60 mb-6 w-6 relative"> {/* Increased height from h-40 to h-60 */}
                    <Slider
                      value={track.volume}
                      onChange={(value) => handleVolumeChange(track.id, value)}
                      max={100}
                      step={1}
                      orientation="vertical"
                      className="h-full"
                    />
                    <div 
                      className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 rounded-t"
                      style={{
                        height: `${track.volume}%`,
                        backgroundColor: track.mute ? '#4b5563' : colorHex,
                        opacity: track.mute ? 0.3 : 0.6
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex space-x-1 mt-2">
                    <button 
                      className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
                        track.mute ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMuteToggle(track.id);
                      }}
                    >
                      M
                    </button>
                    <button 
                      className={`w-8 h-8 rounded text-xs flex items-center justify-center ${
                        track.solo ? 'bg-yellow-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSoloToggle(track.id);
                      }}
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master-Channel separated with margin-left */}
        <div className="w-32 bg-zinc-900 rounded-md p-2 border-l-[3px] border-l-gray-400 flex flex-col" style={{ height: '100%' }}>
          <div className="text-center mb-4">
            <div className="font-semibold text-sm text-gray-300">MASTER</div>
            <div className="flex justify-center space-x-1 mt-1">
              <LED active={true} color="#22c55e" size="xs" />
            </div>
          </div>
          
          {/* Level-Anzeige */}
          <div className="h-32 mb-4 bg-zinc-800 rounded p-1 flex space-x-[1px]"> {/* Increased height to h-32 */}
            <div className="flex-1 flex flex-col-reverse">
              <div 
                className="bg-gradient-to-t from-green-500 to-yellow-500 rounded-t"
                style={{ height: `${master.volume * 0.6}%` }}
              ></div>
            </div>
            <div className="flex-1 flex flex-col-reverse">
              <div 
                className="bg-gradient-to-t from-green-500 to-yellow-500 rounded-t"
                style={{ height: `${master.volume * 0.55}%` }}
              ></div>
            </div>
          </div>
          
          {/* Master-Fader */}
          <div className="flex flex-col items-center mt-auto flex-1">
            <div className="text-xs text-zinc-400 mb-2">Level</div>
            <div className="h-60 mb-6 w-10 relative"> {/* Increased height from h-40 to h-60 */}
              <Slider
                value={master.volume}
                onChange={(value) => handleMasterVolumeChange(value)}
                max={100}
                step={1}
                orientation="vertical"
                className="h-full"
              />
              <div 
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 rounded-t bg-gradient-to-t from-blue-500 to-indigo-600 opacity-70"
                style={{ height: `${master.volume}%` }}
              ></div>
            </div>
            <div className="text-sm font-medium text-gray-300 mb-2">{master.volume}</div>
          </div>
        </div>
      </div>
      
      {/* Untere Leiste mit Aux-Sends, etc. */}
      <div className="flex justify-between items-center pt-4 border-t border-zinc-700">
        <div className="text-xs text-zinc-500">
          {tracks.filter(t => t.mute).length} Muted | {tracks.filter(t => t.solo).length} Soloed
        </div>
        <div className="flex space-x-2">
          <button className="text-xs bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-zinc-300">
            Reset All
          </button>
          <button className="text-xs bg-purple-800 hover:bg-purple-700 px-2 py-1 rounded text-white">
            Save Mixer State
          </button>
        </div>
      </div>
    </div>
  );
};

export default MixerPanel;