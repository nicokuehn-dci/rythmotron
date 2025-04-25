<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let label: string = '';
  export let value: number = 0; // Normalized 0-1 initially
  export let min: number = 0;
  export let max: number = 127;
  export let step: number = 1;
  export let size: number = 44; // Size in pixels

  const dispatch = createEventDispatcher();

  // Constants for knob rotation
  const START_ANGLE = -135; // -135 degrees
  const END_ANGLE = 135; // 135 degrees
  const ANGLE_RANGE = END_ANGLE - START_ANGLE; // 270 degrees

  let internalValue = ((value - min) / (max - min)) * 100; // 0-100 for rotation/arc
  let rotation = START_ANGLE + (internalValue / 100) * ANGLE_RANGE;
  let displayValue = value;

  // Create a tweened store for smooth animations
  const tweenedRotation = tweened(rotation, {
    duration: 300,
    easing: cubicOut
  });

  let isDragging = false;
  let startY = 0;
  let startValue = 0;

  function handleMouseDown(event: MouseEvent) {
    isDragging = true;
    startY = event.clientY;
    startValue = internalValue;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    event.preventDefault(); // Prevent text selection during drag
  }

  function handleMouseMove(event: MouseEvent) {
    if (!isDragging) return;
    const dy = startY - event.clientY; // Inverted drag
    const sensitivity = 0.5;
    let newValue = startValue + dy * sensitivity;
    internalValue = Math.max(0, Math.min(100, newValue));
    updateValueFromInternal();
  }

  function handleMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  function updateValueFromInternal() {
    // Denormalize
    let rawValue = min + (internalValue / 100) * (max - min);
    // Snap to step
    value = Math.round(rawValue / step) * step;
    value = Math.max(min, Math.min(max, value)); // Clamp

    displayValue = value; // Or format as needed
    rotation = START_ANGLE + (internalValue / 100) * ANGLE_RANGE;
    $tweenedRotation = rotation; // Update the tweened store
    dispatch('change', { value });
  }

  // Helper function to create the SVG arc path
  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
  
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  // Calculate the arc path for the background track and value indicator
  $: backgroundArc = describeArc(25, 25, 20, START_ANGLE, END_ANGLE);
  $: valueArc = describeArc(25, 25, 20, START_ANGLE, $tweenedRotation);

  // Touch events support
  function handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      isDragging = true;
      startY = event.touches[0].clientY;
      startValue = internalValue;
      event.preventDefault();
    }
  }

  function handleTouchMove(event: TouchEvent) {
    if (!isDragging || event.touches.length !== 1) return;
    const dy = startY - event.touches[0].clientY;
    const sensitivity = 0.5;
    let newValue = startValue + dy * sensitivity;
    internalValue = Math.max(0, Math.min(100, newValue));
    updateValueFromInternal();
    event.preventDefault();
  }

  function handleTouchEnd() {
    isDragging = false;
  }

  // Reactive update if value prop changes externally
  $: if (!isDragging) {
    internalValue = ((value - min) / (max - min)) * 100;
    rotation = START_ANGLE + (internalValue / 100) * ANGLE_RANGE;
    $tweenedRotation = rotation;
    displayValue = value;
  }
</script>

<div class="flex flex-col items-center space-y-1 w-16 text-center">
  <svg width={size} height={size} viewBox="0 0 50 50"
       class="cursor-ns-resize drop-shadow-md {isDragging ? 'scale-105' : 'transition-transform duration-200'}"
       on:mousedown={handleMouseDown}
       on:touchstart={handleTouchStart}
       on:touchmove={handleTouchMove}
       on:touchend={handleTouchEnd}>

    <!-- Background knob shape -->
    <circle cx="25" cy="25" r="22" class="fill-rytm-surface stroke-rytm-border" stroke-width="1"/>
    
    <!-- Background track -->
    <path d={backgroundArc} fill="none" class="stroke-rytm-border opacity-30" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Value track -->
    <path d={valueArc} fill="none" class="stroke-rytm-accent {isDragging ? 'stroke-rytm-accent-hover' : ''}" 
          stroke-width="3" stroke-linecap="round"/>
    
    <!-- Indicator line -->
    <line x1="25" y1="25" x2="25" y2="9"
          class="stroke-rytm-accent {isDragging ? 'stroke-rytm-accent-hover' : ''}"
          stroke-width="2" stroke-linecap="round"
          transform={`rotate(${$tweenedRotation} 25 25)`} />
    
    <!-- Knob highlight -->
    <circle cx="25" cy="25" r="18" class="fill-transparent stroke-white opacity-10" stroke-width="1"/>
    
    <!-- Center dot -->
    <circle cx="25" cy="25" r="3" class="fill-rytm-surface stroke-rytm-border" stroke-width="0.5" />
    
    <!-- Focus ring that appears when dragging -->
    {#if isDragging}
    <circle cx="25" cy="25" r="24" class="fill-transparent stroke-rytm-accent-hover" 
            stroke-width="1" stroke-dasharray="2 1" opacity="0.6" />
    {/if}
  </svg>
  <span class="text-xs font-medium text-rytm-text-secondary truncate w-full px-1">{label}</span>
  <span class="text-[0.65rem] font-mono text-rytm-text-primary">{displayValue}</span>
</div>
