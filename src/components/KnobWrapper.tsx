import React, { useState, useEffect, useRef } from 'react';
import KnobComponent from '../lib/components/Knob.svelte';

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onChange?: (value: number) => void;
}

const KnobWrapper: React.FC<KnobProps> = ({
  value = 50,
  min = 0,
  max = 100,
  label = '',
  size = 'md',
  color = '#6366f1',
  onChange
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [knobComponent, setKnobComponent] = useState<any>(null);

  useEffect(() => {
    if (ref.current && !knobComponent) {
      const component = new KnobComponent({
        target: ref.current,
        props: { value, min, max, label, size, color }
      });
      
      // Subscribe to value changes
      component.$on('change', (event: any) => {
        if (onChange) onChange(event.detail);
      });
      
      setKnobComponent(component);
      
      return () => {
        component.$destroy();
      };
    }
  }, [ref.current]);
  
  useEffect(() => {
    if (knobComponent) {
      knobComponent.$set({ value, min, max, label, size, color });
    }
  }, [value, min, max, label, size, color, knobComponent]);

  return <div ref={ref} />;
};

export default KnobWrapper;