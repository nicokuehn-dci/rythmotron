import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TransportControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onRecord?: () => void;
  onMetronome?: () => void;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  isRecording?: boolean;
  isMetronomeOn?: boolean;
  className?: string;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  onPlay,
  onStop,
  onRecord,
  onMetronome,
  tempo = 120,
  onTempoChange,
  isRecording = false,
  isMetronomeOn = false,
  className = '',
}) => {
  const [tempoBpm, setTempoBpm] = useState(tempo);
  const [isEditingTempo, setIsEditingTempo] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(1);
  const [tempoInputValue, setTempoInputValue] = useState(tempo.toString());
  
  // Handle beat counter when playing
  useEffect(() => {
    let intervalId: number;
    
    if (isPlaying) {
      // Calculate beat duration in milliseconds (60000ms / BPM)
      const beatDuration = 60000 / tempoBpm;
      
      intervalId = window.setInterval(() => {
        setCurrentBeat(prev => (prev % 4) + 1); // 1-4 counter
      }, beatDuration);
    } else {
      setCurrentBeat(1);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, tempoBpm]);
  
  // Handle tempo changes
  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempoInputValue(e.target.value);
  };
  
  const handleTempoBlur = () => {
    const newTempo = parseInt(tempoInputValue, 10);
    
    if (!isNaN(newTempo) && newTempo >= 20 && newTempo <= 300) {
      setTempoBpm(newTempo);
      if (onTempoChange) {
        onTempoChange(newTempo);
      }
    } else {
      // Reset to current tempo if invalid
      setTempoInputValue(tempoBpm.toString());
    }
    
    setIsEditingTempo(false);
  };
  
  const handleTempoKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTempoBlur();
    } else if (e.key === 'Escape') {
      setTempoInputValue(tempoBpm.toString());
      setIsEditingTempo(false);
    }
  };
  
  // Transport button icons
  const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
  
  const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
    </svg>
  );
  
  const RecordIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8"></circle>
    </svg>
  );
  
  const MetronomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l4 10-4 10H8L4 12z"></path>
      <path d="M12 6v14"></path>
    </svg>
  );
  
  return (
    <div className={`bg-zinc-900 rounded-xl p-4 border border-zinc-800 ${className}`}>
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex space-x-2">
          <Button
            variant={isPlaying ? "outline" : "default"}
            size="icon"
            onClick={onPlay}
            className={isPlaying ? "bg-green-900/30 text-green-400 hover:text-green-50 border-green-700" : ""}
          >
            <PlayIcon />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onStop}
          >
            <StopIcon />
          </Button>
          
          {onRecord && (
            <Button
              variant={isRecording ? "outline" : "outline"}
              size="icon"
              onClick={onRecord}
              className={isRecording ? "bg-red-900/30 text-red-400 hover:text-red-50 border-red-700" : ""}
            >
              <RecordIcon />
            </Button>
          )}
          
          {onMetronome && (
            <Button
              variant={isMetronomeOn ? "outline" : "outline"}
              size="icon"
              onClick={onMetronome}
              className={isMetronomeOn ? "bg-blue-900/30 text-blue-400 hover:text-blue-50 border-blue-700" : ""}
            >
              <MetronomeIcon />
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Beat counter */}
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map(beat => (
              <div 
                key={`beat-${beat}`} 
                className={`w-2 h-2 rounded-full ${
                  isPlaying && beat === currentBeat 
                    ? 'bg-green-500' 
                    : beat === 1 
                      ? 'bg-zinc-400' 
                      : 'bg-zinc-700'
                }`}
              ></div>
            ))}
          </div>
          
          {/* Tempo */}
          <div className="flex items-center">
            <span className="text-zinc-400 text-xs mr-2">BPM</span>
            
            {isEditingTempo ? (
              <input
                type="text"
                value={tempoInputValue}
                onChange={handleTempoChange}
                onBlur={handleTempoBlur}
                onKeyDown={handleTempoKeyDown}
                className="w-12 bg-zinc-800 text-zinc-100 rounded px-1 text-center text-sm border border-zinc-700 focus:border-purple-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingTempo(true)}
                className="w-12 bg-zinc-800 text-zinc-100 rounded px-1 text-center text-sm border border-zinc-700 cursor-pointer hover:border-zinc-600"
              >
                {tempoBpm}
              </div>
            )}
          </div>
          
          {/* Tempo adjustment buttons */}
          <div className="flex flex-col">
            <button
              className="text-zinc-400 hover:text-zinc-100 focus:outline-none h-3"
              onClick={() => {
                const newTempo = Math.min(300, tempoBpm + 1);
                setTempoBpm(newTempo);
                setTempoInputValue(newTempo.toString());
                if (onTempoChange) onTempoChange(newTempo);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
            </button>
            <button
              className="text-zinc-400 hover:text-zinc-100 focus:outline-none h-3"
              onClick={() => {
                const newTempo = Math.max(20, tempoBpm - 1);
                setTempoBpm(newTempo);
                setTempoInputValue(newTempo.toString());
                if (onTempoChange) onTempoChange(newTempo);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportControls;