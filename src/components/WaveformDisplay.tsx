import React, { useRef, useEffect } from 'react';
import withErrorBoundary from './ui/withErrorBoundary';

interface WaveformDisplayProps {
  type?: 'waveform' | 'spectrum' | 'waterfall';
  data?: number[];
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
  showLabels?: boolean;
  animated?: boolean;
}

const WaveformDisplayBase: React.FC<WaveformDisplayProps> = ({
  type = 'waveform',
  data,
  height = 100,
  color = '#4ade80',
  className = '',
  showGrid = true,
  showLabels = false,
  animated = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate random data if none provided
  const generateData = () => {
    const length = 100;
    if (type === 'waveform') {
      return Array.from({ length }, (_, i) => {
        // Create sine wave with some noise
        const t = i / length * Math.PI * 2 * 3;
        return Math.sin(t) * 0.8 + (Math.random() * 0.4 - 0.2);
      });
    } else {
      return Array.from({ length }, () => Math.random());
    }
  };
  
  // Get data to display
  const displayData = data || generateData();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height);

    // Draw grid if needed
    if (showGrid) {
      const gridColor = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Horizontal grid lines
      for (let i = 0; i <= height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(rect.width, i);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 0; i <= rect.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
    }

    if (type === 'waveform') {
      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      const step = rect.width / (displayData.length - 1);
      
      displayData.forEach((value, i) => {
        const x = i * step;
        const y = height / 2 * (1 - value);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Fill area under the curve
      ctx.lineTo((displayData.length - 1) * step, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}80`);
      gradient.addColorStop(1, `${color}05`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    } else if (type === 'spectrum') {
      // Draw spectrum
      const barWidth = rect.width / displayData.length;
      const gapWidth = Math.max(1, barWidth * 0.2);
      const actualBarWidth = barWidth - gapWidth;

      ctx.fillStyle = color;

      displayData.forEach((value, i) => {
        const x = i * barWidth;
        const barHeight = value * height * 0.9;
        ctx.fillRect(
          x + gapWidth/2, 
          height - barHeight, 
          actualBarWidth, 
          barHeight
        );
      });
      
      // Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      displayData.forEach((value, i) => {
        const x = i * barWidth;
        const barHeight = value * height * 0.9;
        if (value > 0.7) {
          ctx.fillRect(
            x + gapWidth/2, 
            height - barHeight, 
            actualBarWidth, 
            2
          );
        }
      });
      ctx.shadowBlur = 0;
    }

    // Add animation frame if animated
    if (animated) {
      const animationFrame = requestAnimationFrame(() => {
        // This will re-render on next frame
      });
      
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [displayData, type, height, color, showGrid, animated]);

  return (
    <div className={`relative ${className}`} style={{ height: `${height}px` }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-md bg-zinc-900/50"
        style={{ height: `${height}px` }}
      />
      {showLabels && (
        <div className="absolute bottom-1 left-1 text-xs text-zinc-500">
          {type === 'waveform' ? 'Time' : 'Frequency'}
        </div>
      )}
    </div>
  );
};

// Export the component wrapped with error boundary
const WaveformDisplay = withErrorBoundary(WaveformDisplayBase, 'WaveformDisplay');
export default WaveformDisplay;