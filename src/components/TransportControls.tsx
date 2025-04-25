import React from 'react';
import { Button } from './ui/button';
import Slider from './ui/slider';
import LED from './ui/led';
import withErrorBoundary from './ui/withErrorBoundary';

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  tempo?: number;
  onTempoChange?: (newTempo: number) => void;
  volume?: number; 
  onVolumeChange?: (newVolume: number) => void;
  showRecord?: boolean;
  showResetButton?: boolean;
  showSaveButton?: boolean;
  className?: string;
  onPlay?: () => void;
  onStop?: () => void;
}

const TransportControlsBase: React.FC<TransportControlsProps> = ({
  isPlaying,
  onPlayPause,
  tempo = 120,
  onTempoChange = () => {},
  volume = 75,
  onVolumeChange = () => {},
  showRecord = false,
  showResetButton = false,
  showSaveButton = false,
  className = '',
  onPlay,
  onStop
}) => {
  const handlePlayPause = () => {
    if (isPlaying && onStop) {
      onStop();
    } else if (!isPlaying && onPlay) {
      onPlay();
    } else {
      onPlayPause();
    }
  };

  return (
    <div className={`panel-inset p-4 rounded-lg ${className}`}>
      <div className="flex items-center space-x-4">
        {/* Play/Pause Button */}
        <Button 
          variant="3d"
          size="default"
          className="h-10 w-10 rounded-full flex items-center justify-center"
          onClick={handlePlayPause}
          style={{
            background: isPlaying 
              ? "linear-gradient(145deg, #2a2a2a, #1d1d1d)" 
              : "linear-gradient(145deg, #4ade8080, #4ade8040)",
            borderColor: isPlaying ? '#333' : '#4ade8080'
          }}
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} ${isPlaying ? 'text-zinc-300' : 'text-4ade80'}`}></i>
        </Button>
        
        {/* Record Button (optional) */}
        {showRecord && (
          <Button 
            variant="3d" 
            size="default"
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #2a2a2a, #1d1d1d)",
              borderColor: '#333'
            }}
          >
            <i className="fas fa-circle text-red-500"></i>
          </Button>
        )}
        
        {/* Reset Button (optional) */}
        {showResetButton && (
          <Button 
            variant="3d" 
            size="default"
            className="h-10 w-10 rounded-full flex items-center justify-center"
          >
            <i className="fas fa-redo-alt"></i>
          </Button>
        )}

        {/* Tempo Display and Controls */}
        <div className="flex items-center space-x-2 bg-zinc-800/50 px-3 py-2 rounded-md border border-zinc-700 shadow-button-3d">
          <span className="text-sm font-medium text-3d text-zinc-300">BPM</span>
          <div className="w-16 text-center panel-inset px-2 py-1 rounded">
            <span className="text-lg font-mono text-3d text-zinc-200">{tempo}</span>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="3d" 
              size="sm"
              className="h-7 w-7 p-0 flex items-center justify-center"
              onClick={() => onTempoChange(Math.max(60, tempo - 1))}
            >
              <i className="fas fa-minus text-xs"></i>
            </Button>
            <Button 
              variant="3d" 
              size="sm"
              className="h-7 w-7 p-0 flex items-center justify-center"
              onClick={() => onTempoChange(Math.min(200, tempo + 1))}
            >
              <i className="fas fa-plus text-xs"></i>
            </Button>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center space-x-3 ml-auto">
          <i className="fas fa-volume-down text-3d text-zinc-400"></i>
          <div className="w-24">
            <Slider
              value={volume}
              onChange={onVolumeChange}
              min={0}
              max={100}
              color="#4ade80"
              showValue={false}
            />
          </div>
          <i className="fas fa-volume-up text-3d text-zinc-400"></i>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-3 bg-zinc-800/50 px-3 py-2 rounded-md border border-zinc-700 shadow-button-3d">
          <div className="flex items-center space-x-1">
            <LED active={true} color="#4ade80" size="xs" pulse />
            <span className="text-xs text-3d text-zinc-400">MIDI</span>
          </div>
          <div className="flex items-center space-x-1">
            <LED active={isPlaying} color="#ec4899" size="xs" />
            <span className="text-xs text-3d text-zinc-400">CLOCK</span>
          </div>
        </div>
        
        {/* Save Button (optional) */}
        {showSaveButton && (
          <Button 
            variant="3d" 
            size="sm"
          >
            <i className="fas fa-save mr-2"></i>
            Save
          </Button>
        )}
      </div>
    </div>
  );
};

// Export the component wrapped with error boundary
const TransportControls = withErrorBoundary(TransportControlsBase, 'TransportControls');
export default TransportControls;