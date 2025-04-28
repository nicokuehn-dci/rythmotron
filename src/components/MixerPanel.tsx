import React, { useState, useEffect, useRef } from 'react';
import Knob from './KnobWrapper';
import Slider from './ui/slider';
import LED from './ui/led';
import Switch from './ui/switch';
import styles from './mixerpanel.module.css';

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

// Extended Track interface with additional parameters in the style of Qu-16
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

// Extended Master interface
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
  // Use external tracks if provided, otherwise default to internal state
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

  // Master state
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

  // Use external tracks if available
  const tracks = externalTracks || internalTracks;

  // Expand track parameters
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

  // Helper function to convert color names to hex codes for CSS styling
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
    return colorMap[colorName] || '#60a5fa'; // Default color if not in map
  };

  // Helper function to check if a track has an assigned pad
  const getAssignedPads = (trackId: number): number[] => {
    if (!assignedPads) return [];
    
    return Object.entries(assignedPads)
      .filter(([_, id]) => id === trackId)
      .map(([padId]) => parseInt(padId));
  };

  // Number of aux sends (for display)
  const auxCount = 4;

  // Add animation frame reference for level meters
  const animationRef = useRef<number | null>(null);
  const [meterLevels, setMeterLevels] = useState<number[]>([]);
  
  // Simulate audio meter levels - in a real app, this would come from actual audio analysis
  useEffect(() => {
    const updateMeters = () => {
      const newLevels = tracks.map(track => {
        // Base level on volume but add random fluctuation to simulate audio
        const baseLevel = track.mute ? 0 : (track.volume / 100);
        const fluctuation = Math.random() * 0.2 * baseLevel;
        return Math.min(baseLevel + fluctuation, 1);
      });
      
      setMeterLevels(newLevels);
      animationRef.current = requestAnimationFrame(updateMeters);
    };
    
    animationRef.current = requestAnimationFrame(updateMeters);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [tracks]);

  // Create a reverse mapping for displaying pad assignments
  const createPadToTrackMap = () => {
    if (!assignedPads) return {};
    
    const padMap: Record<number, {trackId: number, trackName: string, trackColor: string}> = {};
    
    Object.entries(assignedPads).forEach(([padId, trackId]) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        padMap[parseInt(padId)] = {
          trackId, 
          trackName: track.name,
          trackColor: track.color
        };
      }
    });
    
    return padMap;
  };
  
  const padToTrackMap = createPadToTrackMap();

  return (
    <>
      {/* Pad Assignment Box */}
      {Object.keys(padToTrackMap).length > 0 && (
        <div className={styles.padAssignmentBox}>
          <div className={styles.padAssignmentTitle}>Pad Assignments</div>
          <div className={styles.padAssignmentGrid}>
            {Array.from({ length: 16 }).map((_, i) => {
              const padInfo = padToTrackMap[i];
              const colorHex = padInfo ? getColorHex(padInfo.trackColor) : '';
              
              return (
                <div key={i} className={styles.padItem}>
                  <div className={styles.padNumber}>{i + 1}</div>
                  {padInfo ? (
                    <>
                      <div className={styles.padTrack}>{padInfo.trackName}</div>
                      <div 
                        className={styles.padTrackColored} 
                        style={{ backgroundColor: colorHex }}
                      />
                    </>
                  ) : (
                    <div className={styles.padTrack}>-</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className={`rounded-lg p-4 ${styles.mixerContainer} ${className}`}>
        {/* Audio channels in grid */}
        {tracks.map((track, index) => {
          const assignedPadsList = getAssignedPads(track.id);
          const colorHex = getColorHex(track.color);
          const meterLevel = meterLevels[index] || 0;
          
          return (
            <div 
              key={track.id} 
              className={`${styles.channelStrip} ${
                track.id === selectedTrack ? styles.selectedChannel : ''
              }`}
              style={{ 
                borderLeft: `3px solid ${colorHex}`,
                opacity: track.mute ? 0.7 : 1,
              }}
              onClick={() => handleTrackSelection(track.id)}
            >
              {/* Channel Name and LEDs */}
              <div className="text-center mb-2 relative">
                <div className={styles.channelLabel} style={{ color: colorHex }}>
                  {track.name}
                </div>
                
                {/* Assigned Pad Numbers */}
                {assignedPadsList.length > 0 && (
                  <div className="text-[8px] text-zinc-400 mb-1">
                    Pads: {assignedPadsList.map(id => id + 1).join(', ')}
                  </div>
                )}
                
                <div className="flex justify-center space-x-1 mt-1">
                  <LED active={!track.mute} color="#22c55e" size="xs" />
                  <LED active={track.solo} color="#eab308" size="xs" />
                </div>
              </div>
              
              {/* EQ Visualization */}
              <div className={styles.eqDisplay}>
                {Array.from({ length: 8 }).map((_, i) => {
                  // Simulate EQ curve
                  let height = 20;
                  
                  if (track.eq) {
                    if (i < 2) height = (track.eq.low / 100) * 40;
                    else if (i < 5) height = (track.eq.mid / 100) * 40; 
                    else height = (track.eq.high / 100) * 40;
                  }
                  
                  return (
                    <div 
                      key={i} 
                      className={styles.eqBar}
                      style={{ 
                        height: `${height}px`,
                        backgroundColor: track.mute ? '#4b5563' : colorHex,
                        opacity: track.mute ? 0.3 : 0.7,
                      }}
                    ></div>
                  );
                })}
              </div>
              
              {/* Level Meter */}
              <div className={styles.levelMeter}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const threshold = i / 12;
                  const isActive = meterLevel >= threshold;
                  let color = '#22c55e'; // green for lower levels
                  
                  if (i > 8) color = '#dc2626'; // red for high levels
                  else if (i > 6) color = '#eab308'; // yellow for mid levels
                  
                  return (
                    <div 
                      key={i} 
                      className={`${styles.meterSegment} ${isActive ? styles.active : ''}`}
                      style={{
                        backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                      }}
                    ></div>
                  );
                })}
              </div>
              
              {/* Pan Control */}
              <div className={styles.panControl}>
                <div className="text-[10px] text-zinc-400 mb-1">Pan</div>
                <div className={styles.knobContainer}>
                  <Knob
                    value={track.pan}
                    onChange={(v) => handlePanChange(track.id, v)}
                    min={0}
                    max={100}
                    size="small"
                    color={colorHex}
                  />
                </div>
              </div>
              
              {/* Fader */}
              <div className="flex flex-col items-center flex-1">
                <div className={styles.faderContainer}>
                  <Slider
                    value={track.volume}
                    onChange={(value) => handleVolumeChange(track.id, value)}
                    max={100}
                    step={1}
                    orientation="vertical"
                    className={styles.fader}
                  />
                  <div 
                    className={styles.faderTrack}
                    style={{
                      height: `${track.volume}%`,
                      backgroundColor: track.mute ? '#4b5563' : colorHex,
                    }}
                  ></div>
                </div>
                
                <div className={styles.channelControls}>
                  <button 
                    className={`${styles.channelButton} ${track.mute ? styles.muteActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleMuteToggle(track.id);
                    }}
                    title="Mute"
                  >
                    M
                  </button>
                  <button 
                    className={`${styles.channelButton} ${track.solo ? styles.soloActive : ''}`}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleSoloToggle(track.id);
                    }}
                    title="Solo"
                  >
                    S
                  </button>
                </div>
                
                <div className="text-[10px] text-zinc-400">{track.id + 1}</div>
              </div>
            </div>
          );
        })}
        
        {/* Master Channel */}
        <div className={styles.masterSection}>
          <div className="text-center mb-3">
            <div className={styles.masterLabel}>MASTER</div>
            <div className="flex justify-center space-x-1 mt-1">
              <LED active={true} color="#22c55e" size="xs" />
              <LED active={master.monitor.phones} color="#3b82f6" size="xs" />
              <LED active={master.monitor.talkback} color="#eab308" size="xs" />
            </div>
          </div>
          
          {/* Master Level Visualization */}
          <div className={styles.masterLevels}>
            <div className={styles.masterLevelLeft}>
              {Array.from({ length: 15 }).map((_, i) => {
                const threshold = i / 15;
                const avgLevel = tracks.filter(t => !t.mute).reduce((sum, t, idx) => 
                  sum + (meterLevels[idx] || 0), 0) / 
                  tracks.filter(t => !t.mute).length;
                const masterLevel = avgLevel * (master.volume / 100);
                const isActive = masterLevel >= threshold;
                
                let color = '#22c55e'; // green
                if (i > 11) color = '#dc2626'; // red
                else if (i > 9) color = '#eab308'; // yellow
                
                return (
                  <div 
                    key={i} 
                    className={`${styles.masterMeterSegment} ${isActive ? styles.active : ''}`}
                    style={{
                      backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                    }}
                  ></div>
                );
              })}
            </div>
            <div className={styles.masterLevelRight}>
              {Array.from({ length: 15 }).map((_, i) => {
                const threshold = i / 15;
                const avgLevel = tracks.filter(t => !t.mute).reduce((sum, t, idx) => 
                  sum + (meterLevels[idx] || 0), 0) / 
                  tracks.filter(t => !t.mute).length;
                const masterLevel = avgLevel * (master.volume / 100);
                const isActive = masterLevel >= threshold;
                
                let color = '#22c55e'; // green
                if (i > 11) color = '#dc2626'; // red
                else if (i > 9) color = '#eab308'; // yellow
                
                return (
                  <div 
                    key={i} 
                    className={`${styles.masterMeterSegment} ${isActive ? styles.active : ''}`}
                    style={{
                      backgroundColor: isActive ? color : 'rgba(255,255,255,0.1)',
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
          
          {/* Master Fader */}
          <div className={styles.masterFaderContainer}>
            <Slider
              value={master.volume}
              onChange={handleMasterVolumeChange}
              max={100}
              step={1}
              orientation="vertical"
              className={styles.masterFader}
            />
            <div 
              className={styles.masterFaderTrack}
              style={{
                height: `${master.volume}%`,
              }}
            ></div>
          </div>
          
          {/* Master Controls */}
          <div className="w-full mt-auto">
            <div className={styles.monitorSection}>
              <h4 className="text-[10px] font-semibold mb-2 text-center">Monitor</h4>
              <div className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-zinc-400">Phones</label>
                  <Switch 
                    checked={master.monitor.phones} 
                    onCheckedChange={(checked) => setMaster(prev => ({
                      ...prev, 
                      monitor: {...prev.monitor, phones: checked}
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-[9px] text-zinc-400">Talk</label>
                  <Switch 
                    checked={master.monitor.talkback} 
                    onCheckedChange={(checked) => setMaster(prev => ({
                      ...prev, 
                      monitor: {...prev.monitor, talkback: checked}
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MixerPanel;