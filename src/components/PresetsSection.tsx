import React from 'react';
import PresetCard from '@/components/PresetCard';
import { Button } from '@/components/ui/button';

export interface Preset {
  name: string;
  category: string;
}

interface PresetsSectionProps {
  title?: string;
  subtitle?: string;
  presets: Preset[];
  activePreset: number;
  onSelectPreset: (index: number) => void;
  onPlayPreset?: (index: number) => void;
  browseButtonText?: string;
  onBrowseClick?: () => void;
  className?: string;
}

export const PresetsSection: React.FC<PresetsSectionProps> = ({
  title = "Sound Presets",
  subtitle = "Explore our library of professionally designed presets to jumpstart your creativity.",
  presets,
  activePreset,
  onSelectPreset,
  onPlayPreset,
  browseButtonText = "Browse All Presets",
  onBrowseClick,
  className = '',
}) => {
  return (
    <section className={`mb-16 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {presets.map((preset, index) => (
          <PresetCard
            key={index}
            name={preset.name}
            category={preset.category}
            isActive={activePreset === index}
            onClick={() => onSelectPreset(index)}
            onPlay={() => onPlayPreset && onPlayPreset(index)}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button 
          variant="outline" 
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap"
          onClick={onBrowseClick}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          {browseButtonText}
        </Button>
      </div>
    </section>
  );
};

export default PresetsSection;