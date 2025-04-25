import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface WaveformDisplayProps {
  type: 'waveform' | 'spectrum';
  height?: number;
  className?: string;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  type,
  height = 128,
  className = '',
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      
      if (type === 'waveform') {
        initWaveformChart(chart);
      } else {
        initSpectrumChart(chart);
      }
      
      const handleResize = () => {
        chart.resize();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, [type]);

  const initWaveformChart = (chart: any) => {
    // Generate sine wave data
    const data = [];
    for (let i = 0; i <= 360; i++) {
      const radians = (i * Math.PI) / 180;
      const value = Math.sin(radians * 2);
      data.push([i, value]);
    }
    
    const option = {
      animation: false,
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%'
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 360,
        show: false
      },
      yAxis: {
        type: 'value',
        min: -1.2,
        max: 1.2,
        show: false
      },
      series: [
        {
          data: data,
          type: 'line',
          showSymbol: false,
          lineStyle: {
            width: 2,
            color: '#4ade80'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(74, 222, 128, 0.5)' },
                { offset: 1, color: 'rgba(74, 222, 128, 0.05)' }
              ]
            }
          }
        }
      ]
    };
    
    chart.setOption(option);
  };
  
  const initSpectrumChart = (chart: any) => {
    // Generate random spectrum data
    const data = [];
    for (let i = 0; i < 50; i++) {
      const value = Math.random() * 0.7 + 0.1;
      data.push(value);
    }
    
    const option = {
      animation: false,
      grid: {
        left: '5%',
        right: '5%',
        top: '10%',
        bottom: '10%'
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 50 }, (_, i) => i),
        show: false
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 1,
        show: false
      },
      series: [
        {
          data: data,
          type: 'bar',
          barWidth: '60%',
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#a855f7' },
                { offset: 1, color: '#6366f1' }
              ]
            }
          }
        }
      ]
    };
    
    chart.setOption(option);
  };

  return (
    <div 
      ref={chartRef} 
      className={`${className} bg-zinc-800/50 rounded-lg`}
      style={{ height: `${height}px` }}
    />
  );
};

export default WaveformDisplay;