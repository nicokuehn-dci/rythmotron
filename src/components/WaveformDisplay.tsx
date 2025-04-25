import React, { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  audioBuffer?: AudioBuffer | null;
  color?: string;
  backgroundColor?: string;
  isPlaying?: boolean;
  progress?: number; // 0 to 1
  showTimeMarkers?: boolean;
  showProgressIndicator?: boolean;
  height?: number;
  className?: string;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  audioBuffer,
  color = '#a855f7',
  backgroundColor = '#27272a',
  isPlaying = false,
  progress = 0,
  showTimeMarkers = true,
  showProgressIndicator = true,
  height = 100,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw waveform when component mounts or when audioBuffer changes
  useEffect(() => {
    if (!canvasRef.current || !audioBuffer) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    
    // Scale the context for high DPI screens
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Get the audio data
    const channelData = audioBuffer.getChannelData(0); // Mono for simplicity
    const step = Math.ceil(channelData.length / canvas.width);
    const amplitude = canvas.clientHeight / 2;
    
    // Clear the canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    
    // Draw the center line
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.moveTo(0, amplitude);
    ctx.lineTo(canvas.clientWidth, amplitude);
    ctx.stroke();
    
    // Draw time markers if requested
    if (showTimeMarkers) {
      const duration = audioBuffer.duration;
      const markers = [0.25, 0.5, 0.75]; // At 25%, 50%, and 75% positions
      
      ctx.font = '10px system-ui';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.textAlign = 'center';
      
      markers.forEach(marker => {
        const x = Math.floor(canvas.clientWidth * marker);
        
        // Draw marker line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.setLineDash([2, 2]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.clientHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw time text
        const seconds = duration * marker;
        const formattedTime = seconds.toFixed(2);
        ctx.fillText(`${formattedTime}s`, x, 12);
      });
    }
    
    // Draw the waveform
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    
    // Draw the top half of the waveform (positive values)
    for (let i = 0; i < canvas.clientWidth; i++) {
      const x = i;
      const startSample = i * step;
      
      // Find the max value in this sample range
      let max = 0;
      for (let j = 0; j < step && startSample + j < channelData.length; j++) {
        const value = channelData[startSample + j];
        if (value > max) max = value;
      }
      
      const y = amplitude - (max * amplitude);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    // Continue with the bottom half (negative values)
    for (let i = canvas.clientWidth - 1; i >= 0; i--) {
      const x = i;
      const startSample = i * step;
      
      // Find the min value in this sample range
      let min = 0;
      for (let j = 0; j < step && startSample + j < channelData.length; j++) {
        const value = channelData[startSample + j];
        if (value < min) min = value;
      }
      
      const y = amplitude - (min * amplitude);
      ctx.lineTo(x, y);
    }
    
    ctx.closePath();
    ctx.fillStyle = `${color}40`; // Add transparency to fill color
    ctx.fill();
    ctx.stroke();
    
  }, [audioBuffer, color, backgroundColor, canvasRef]);
  
  // Update progress indicator when playing
  useEffect(() => {
    if (!canvasRef.current || !showProgressIndicator) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // If playing, we need to continuously update the progress indicator
    if (isPlaying) {
      const animationId = requestAnimationFrame(() => {
        // Only redraw the parts that changed - the progress indicator
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.clientWidth, 3); // Clear top bar
        
        // Draw the progress indicator
        const x = Math.floor(canvas.clientWidth * progress);
        ctx.fillStyle = '#10b981'; // Green progress color
        ctx.fillRect(0, 0, x, 3);
      });
      
      return () => cancelAnimationFrame(animationId);
    } else if (progress > 0) {
      // If not playing but progress exists, draw static progress indicator
      const x = Math.floor(canvas.clientWidth * progress);
      ctx.fillStyle = '#10b981'; // Green progress color
      ctx.fillRect(0, 0, x, 3);
    }
  }, [isPlaying, progress, showProgressIndicator]);
  
  return (
    <div 
      className={`relative border border-zinc-700 rounded-lg overflow-hidden ${className}`}
      style={{ height: `${height}px` }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {showProgressIndicator && isPlaying && (
        <div 
          className="absolute top-0 left-0 h-full w-px bg-green-500 pointer-events-none"
          style={{ left: `${progress * 100}%`, boxShadow: '0 0 10px rgba(16, 185, 129, 0.7)' }}
        />
      )}
      
      {!audioBuffer && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm">
          No audio data available
        </div>
      )}
    </div>
  );
};

export default WaveformDisplay;