import React, { useState, useEffect, useRef } from 'react';
import KnobComponent from '../lib/components/Knob.svelte';
import withErrorBoundary from './ui/withErrorBoundary';

interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onChange?: (value: number) => void;
}

const KnobWrapperBase: React.FC<KnobProps> = ({
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
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (ref.current && !knobComponent && !hasError) {
      try {
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
          try {
            component.$destroy();
          } catch (error) {
            console.error("Error destroying knob component:", error);
          }
        };
      } catch (error) {
        console.error("Error initializing knob component:", error);
        setHasError(true);
      }
    }
  }, [ref.current]);
  
  useEffect(() => {
    if (knobComponent && !hasError) {
      try {
        knobComponent.$set({ value, min, max, label, size, color });
      } catch (error) {
        console.error("Error updating knob properties:", error);
        setHasError(true);
      }
    }
  }, [value, min, max, label, size, color, knobComponent]);

  // If there's an error initializing the Svelte component, show a fallback
  if (hasError) {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, #2c2c2c, #252525)',
            boxShadow: 'inset 3px 3px 6px #1a1a1a, inset -3px -3px 6px #363636',
            border: `1px solid rgba(100, 100, 100, 0.3)`
          }}
        >
          <span className="text-red-400 text-xs">Error</span>
        </div>
        {label && <span className="mt-2 text-xs text-zinc-400">{label}</span>}
      </div>
    );
  }

  return <div ref={ref} />;
};

// Add error boundary
const KnobWrapper = withErrorBoundary(KnobWrapperBase, 'KnobWrapper');
export default KnobWrapper;