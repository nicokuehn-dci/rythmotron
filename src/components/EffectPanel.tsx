import React from 'react';
import KnobWrapper from './KnobWrapper';
import LED from './ui/led';

interface EffectPanelProps {
  title: string;
  className?: string;
}

interface EffectKnob {
  id: string;
  label: string;
  value: number;
  min?: number;
  max?: number;
}

const EffectPanel: React.FC<EffectPanelProps> = ({ title, className = '' }) => {
  // State für die Effektparameter - mit einem Array für weniger Redundanz
  const [knobs, setKnobs] = React.useState<EffectKnob[]>([
    { id: 'delay', label: 'DELAY', value: 50 },
    { id: 'feedback', label: 'FEEDBACK', value: 30 },
    { id: 'mix', label: 'MIX', value: 20 },
    { id: 'rate', label: 'RATE', value: 45 }
  ]);
  const [active, setActive] = React.useState(true);

  // Handler für Knob Wertänderungen
  const handleKnobChange = (id: string, newValue: number) => {
    setKnobs(knobs.map(knob => 
      knob.id === id ? { ...knob, value: newValue } : knob
    ));
  };

  return (
    <div className={`synthmodule p-4 ${className}`}>
      {/* Title mit 3D Texteffekt */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-3d text-zinc-300 text-lg font-bold">{title}</h3>
        <div className="flex items-center gap-2">
          <LED on={active} color="#42dcdb" size="sm" />
          <div 
            className="button-3d px-3 py-1 text-xs text-zinc-300 cursor-pointer rounded-button"
            onClick={() => setActive(!active)}
          >
            BYPASS
          </div>
        </div>
      </div>
      
      {/* Panel mit Effektreglern */}
      <div className="panel-inset p-3 rounded-lg grid grid-cols-2 gap-x-4 gap-y-6">
        {knobs.map(knob => (
          <KnobWrapper
            key={knob.id}
            value={knob.value}
            onChange={(value) => handleKnobChange(knob.id, value)}
            label={knob.label}
            min={knob.min || 0}
            max={knob.max || 100}
            color="#42dcdb"
            size="md"
          />
        ))}
      </div>

      {/* Preset Auswahl mit 3D-Optik */}
      <div className="mt-4 flex justify-between items-center">
        <select 
          className="bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300 text-sm px-3 py-1 rounded-button border border-zinc-600 shadow-button-3d focus:outline-none focus:ring-1 focus:ring-cyan-400" 
        >
          <option>Preset 1</option>
          <option>Preset 2</option>
          <option>Preset 3</option>
        </select>
        
        <div className="flex gap-2">
          <button className="button-3d h-7 w-7 flex items-center justify-center rounded-button text-zinc-300">
            <span className="text-xs">◀</span>
          </button>
          <button className="button-3d h-7 w-7 flex items-center justify-center rounded-button text-zinc-300">
            <span className="text-xs">▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EffectPanel;