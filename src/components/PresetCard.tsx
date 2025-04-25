import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import LED from '@/components/ui/led';

interface PresetCardProps {
  name: string;
  category: string;
  isActive: boolean;
  onClick: () => void;
  onPlay?: () => void;
  className?: string;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  name,
  category,
  isActive,
  onClick,
  onPlay,
  className = '',
}) => {
  return (
    <Card
      className={`bg-zinc-800/50 border-zinc-700 cursor-pointer transition-all duration-200 hover:bg-zinc-800 ${
        isActive ? 'ring-2 ring-purple-500' : ''
      } ${className}`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <Badge className="self-start bg-zinc-700 text-zinc-300 hover:bg-zinc-700 !rounded-button whitespace-nowrap">
          {category}
        </Badge>
        <CardTitle className="mt-2">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LED active={isActive} color="purple" />
            <span className="text-xs text-zinc-400">{isActive ? 'Selected' : 'Select'}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-zinc-700 !rounded-button whitespace-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              if (onPlay) onPlay();
            }}
          >
            <i className="fa-solid fa-play"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PresetCard;