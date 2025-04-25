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
  <div class="knob" 
    on:mousedown={handleMouseDown}
    style="
      width: {knobSize}px; 
      height: {knobSize}px;
      cursor: pointer;
    "
  >
    <div class="knob-body" style="
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #282830;
      border: 2px solid #32323A;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2), inset 0 -2px 5px rgba(0, 0, 0, 0.33);
      position: relative;
    ">
      <div class="knob-indicator" style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate({angle}deg);
        width: {knobSize * 0.8}px;
        height: 2px;
      ">
        <div style="
          width: {knobSize * 0.05}px;
          height: {knobSize * 0.15}px;
          background-color: {color};
          border-radius: 2px;
          position: absolute;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          box-shadow: 0 0 5px {color}80;
        "></div>
      </div>
      
      <div class="knob-value" style="
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        padding-bottom: {knobSize * 0.15}px;
      ">
        <span style="
          font-size: {knobSize * 0.2}px;
          color: {color};
          font-weight: 500;
        ">{value}</span>
      </div>
    </div>
  </div>
  
  {#if label}
    <div class="knob-label" style="
      text-align: center;
      margin-top: 5px;
      font-size: {knobSize * 0.18}px;
      color: #9CA3AF;
    ">
      {label}
    </div>
  {/if}
  
  <div class="knob-track" style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    pointer-events: none;
    overflow: hidden;
  ">
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
      opacity: 0.2;
    "></div>
  </div>
</div>

<style>
  .knob-container {
    position: relative;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
  }
</style>