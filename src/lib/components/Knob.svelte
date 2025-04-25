<script>
  export let value = 50;
  export let min = 0;
  export let max = 100;
  export let label = "";
  export let size = "md";
  export let color = "#6366f1";
  
  let dragging = false;
  let startY;
  let startValue;

  const sizeMap = {
    sm: 50,
    md: 70,
    lg: 100
  };
  
  const knobSize = sizeMap[size] || sizeMap.md;
  const angle = Math.min(270, Math.max(0, ((value - min) / (max - min)) * 270));
  
  function handleMouseDown(event) {
    dragging = true;
    startY = event.clientY;
    startValue = value;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }
  
  function handleMouseMove(event) {
    if (!dragging) return;
    
    const deltaY = startY - event.clientY;
    const newValue = startValue + (deltaY / 100) * (max - min);
    value = Math.min(max, Math.max(min, newValue));
  }
  
  function handleMouseUp() {
    dragging = false;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }
</script>

<div class="knob-container" style="width: {knobSize}px; height: {knobSize}px">
  <!-- Knob Shadow Base for 3D depth effect -->
  <div style="
    position: absolute;
    width: {knobSize * 0.95}px;
    height: {knobSize * 0.95}px;
    border-radius: 50%;
    top: {knobSize * 0.05}px;
    left: {knobSize * 0.025}px;
    background: rgba(0, 0, 0, 0.5);
    filter: blur(4px);
    z-index: 1;
  "></div>
  
  <div class="knob" 
    on:mousedown={handleMouseDown}
    style="
      width: {knobSize}px; 
      height: {knobSize}px;
      cursor: pointer;
      position: relative;
      z-index: 2;
      transform-style: preserve-3d;
      transform: perspective(500px) {dragging ? 'scale(1.05)' : ''};
      transition: transform 0.15s ease;
    "
  >
    <!-- Knob Body with 3D layering -->
    <div class="knob-body" style="
      width: 100%;
      height: 100%;
      border-radius: 50%;
      position: relative;
      transform-style: preserve-3d;
      background: linear-gradient(145deg, #333338, #25252a);
      border: 2px solid #44444c;
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.4), 
        0 2px 4px rgba(0, 0, 0, 0.6),
        inset 0 -2px 5px rgba(0, 0, 0, 0.5), 
        inset 0 2px 5px rgba(255, 255, 255, 0.1);
    ">
      <!-- Knob Rim Edge (3D effect) -->
      <div style="
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        pointer-events: none;
        border: 2px solid rgba(100, 100, 100, 0.5);
        opacity: 0.8;
      "></div>
      
      <!-- Knob Inner Circle -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: {knobSize * 0.7}px;
        height: {knobSize * 0.7}px;
        border-radius: 50%;
        background: linear-gradient(145deg, #222228, #33333c);
        box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.7), inset -1px -1px 2px rgba(80, 80, 80, 0.2);
      "></div>
      
      <!-- Indicator Track (partial ring showing value) -->
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: {knobSize * 0.85}px;
        height: {knobSize * 0.85}px;
        border-radius: 50%;
        overflow: hidden;
        pointer-events: none;
      ">
        <!-- Value track gradient with glow effect -->
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: conic-gradient(
            {color} 0deg,
            {color} {angle}deg,
            transparent {angle}deg,
            transparent 360deg
          );
          opacity: 0.3;
          filter: blur(1px);
        "></div>
      </div>
      
      <!-- Knob Indicator with 3D elevation -->
      <div class="knob-indicator" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate({angle}deg);
        width: {knobSize * 0.8}px;
        height: 2px;
        transform-style: preserve-3d;
      ">
        <div style="
          width: {knobSize * 0.06}px;
          height: {knobSize * 0.18}px;
          background: linear-gradient(to right, {color}cc, {color});
          border-radius: 2px;
          position: absolute;
          top: 50%;
          right: 2px;
          transform: translateY(-50%) translateZ(1px);
          box-shadow: 
            0 0 5px {color}80,
            0 0 2px {color},
            0 0 8px {color}40;
        "></div>
        
        <!-- Indicator base shadow for 3D effect -->
        <div style="
          width: {knobSize * 0.06}px;
          height: {knobSize * 0.18}px;
          background: rgba(0,0,0,0.5);
          border-radius: 2px;
          position: absolute;
          top: 50%;
          right: 3px;
          transform: translateY(-45%);
          filter: blur(1px);
          opacity: 0.5;
        "></div>
      </div>
      
      <!-- Top Reflection -->
      <div style="
        position: absolute;
        top: 10%;
        left: 20%;
        width: 60%;
        height: 30%;
        background: linear-gradient(145deg, rgba(255,255,255,0.15), transparent);
        border-radius: 50% 50% 0 0;
        transform: rotate(-20deg);
        opacity: 0.6;
        pointer-events: none;
      "></div>
      
      <!-- Edge Reflection -->
      <div style="
        position: absolute;
        top: -1px;
        left: -1px;
        right: -1px;
        bottom: -1px;
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-bottom-color: transparent;
        border-right-color: transparent;
        border-radius: 50%;
        transform: rotate(-45deg);
        pointer-events: none;
      "></div>
      
      <!-- Knob Value Display with 3D Inset -->
      <div class="knob-value" style="
        position: absolute;
        bottom: 20%;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        z-index: 5;
      ">
        <div style="
          background: #1a1a1f;
          padding: 2px {knobSize * 0.12}px;
          border-radius: {knobSize * 0.1}px;
          box-shadow: inset 1px 1px 2px rgba(0,0,0,0.8), inset -1px -1px 1px rgba(60,60,60,0.2);
        ">
          <span style="
            font-size: {knobSize * 0.18}px;
            color: {color};
            font-weight: 500;
            text-shadow: 0 0 4px {color}60;
            font-family: monospace;
          ">{Math.round(value)}</span>
        </div>
      </div>
      
      <!-- 3D Side/Edge Effect (gives the illusion of thickness) -->
      <div style="
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        box-shadow: 0px 2px 0px rgba(255,255,255,0.05) inset, 
                   0px -2px 0px rgba(0,0,0,0.2) inset;
        pointer-events: none;
      "></div>
      
      <!-- Grooves for grip texture -->
      {#each Array(12) as _, i}
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          width: {knobSize * 0.85}px;
          height: {knobSize * 0.85}px;
          transform: translate(-50%, -50%) rotate({i * 30}deg);
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 50%;
            height: {knobSize * 0.15}px;
            width: 2px;
            background: rgba(0, 0, 0, 0.4);
            border-radius: 1px;
            transform: translateX(-50%);
          "></div>
        </div>
      {/each}
    </div>
  </div>
  
  <!-- Label with 3D text effect -->
  {#if label}
    <div class="knob-label" style="
      text-align: center;
      margin-top: 8px;
      font-size: {knobSize * 0.16}px;
      color: {color};
      text-shadow: 0 0 4px {color}40;
      font-weight: 500;
      position: relative;
      z-index: 10;
    ">
      {label}
    </div>
  {/if}
  
  <!-- Knob min/max indicators -->
  <div style="
    position: absolute;
    bottom: {knobSize * 0.15}px;
    left: 2px;
    font-size: {knobSize * 0.12}px;
    color: #71717a;
  ">{min}</div>
  
  <div style="
    position: absolute;
    bottom: {knobSize * 0.15}px;
    right: 2px;
    font-size: {knobSize * 0.12}px;
    color: #71717a;
  ">{max}</div>
</div>

<style>
  .knob-container {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    transform-style: preserve-3d;
  }
  
  /* Interactivity effects */
  .knob:hover {
    filter: brightness(1.1);
  }
  
  .knob:active {
    transform: perspective(500px) scale(0.98);
  }
</style>