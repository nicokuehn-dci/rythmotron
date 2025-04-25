import React from 'react';
import { Button } from '@/components/ui/button';
import LED from '@/components/ui/led';
import { Slider } from '@/components/ui/slider';

interface TransportControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  showRecord?: boolean;
  onRecord?: () => void;
  isRecording?: boolean;
  tempo?: number;
  onTempoChange?: (tempo: number) => void;
  volume?: number;
  onVolumeChange?: (volume: number) => void;
  showResetButton?: boolean;
  onReset?: () => void;
  showSaveButton?: boolean;
  onSave?: () => void;
  className?: string;
}

export const TransportControls: React.FC<TransportControlsProps> = ({
  isPlaying,
  onPlayPause,
  showRecord = false,
  onRecord = () => {},
  isRecording = false,
  tempo,
  onTempoChange,
  volume,
  onVolumeChange,
  showResetButton = false,
  onReset = () => {},
  showSaveButton = false,
  onSave = () => {},
  className = '',
}) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <div className="flex items-center space-x-4">
        <Button
          onClick={onPlayPause}
          className={`${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white !rounded-button whitespace-nowrap px-8`}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-stop' : 'fa-play'} mr-2`}></i>
          {isPlaying ? 'STOP' : 'PLAY'}
        </Button>
        
        {showRecord && (
          <Button 
            variant="outline" 
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap px-6"
            onClick={onRecord}
          >
            <i className="fa-solid fa-record-vinyl mr-2"></i>
            REC
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          <LED active={isPlaying} color="green" />
          <span className="text-sm text-zinc-400">{isPlaying ? 'Running' : 'Signal'}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {tempo !== undefined && onTempoChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">BPM</span>
            <input
              type="number"
              className="w-16 bg-zinc-800 border border-zinc-700 rounded-md text-center text-zinc-300 border-none"
              value={tempo}
              onChange={(e) => onTempoChange(parseInt(e.target.value))}
            />
          </div>
        )}
        
        {volume !== undefined && onVolumeChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Master</span>
            <div className="w-24">
              <Slider
                value={[volume]}
                onValueChange={(values) => onVolumeChange(values[0])}
                max={100}
                step={1}
              />
            </div>
            <span className="text-sm text-zinc-400">{volume}%</span>
          </div>
        )}
        
        {(showResetButton || showSaveButton) && (
          <div className="flex items-center space-x-2">
            {showResetButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap"
                onClick={onReset}
              >
                <i className="fa-solid fa-rotate-left"></i>
              </Button>
            )}
            
            {showSaveButton && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap"
                onClick={onSave}
              >
                <i className="fa-solid fa-floppy-disk"></i>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportControls;