import React from 'react';
import { Button } from '@/components/ui/button';

interface Track {
  name: string;
  color: string;
  icon: string;
  pattern: boolean[];
}

interface TrackListProps {
  tracks: Track[];
  selectedTrack: number;
  mutes: boolean[];
  solos: boolean[];
  onSelectTrack: (index: number) => void;
  onToggleMute: (index: number) => void;
  onToggleSolo: (index: number) => void;
  className?: string;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  selectedTrack,
  mutes,
  solos,
  onSelectTrack,
  onToggleMute,
  onToggleSolo,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {tracks.map((track, index) => (
        <div
          key={index}
          className={`flex items-center justify-between p-2 rounded-lg ${
            selectedTrack === index ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-zinc-800'
          } cursor-pointer hover:bg-zinc-700 transition-colors`}
          onClick={() => onSelectTrack(index)}
        >
          <div className="flex items-center space-x-2">
            <i className={`fa-solid ${track.icon} text-${track.color}-400`}></i>
            <span className="text-sm">{track.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className={`px-2 ${mutes[index] ? 'bg-red-500/20 text-red-400' : 'text-zinc-400'} hover:text-white !rounded-button whitespace-nowrap`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute(index);
              }}
            >
              M
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`px-2 ${solos[index] ? 'bg-yellow-500/20 text-yellow-400' : 'text-zinc-400'} hover:text-white !rounded-button whitespace-nowrap`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleSolo(index);
              }}
            >
              S
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackList;