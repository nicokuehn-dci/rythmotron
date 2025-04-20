"""
Advanced Display Engine for RythmoTron.
Manages sophisticated visual effects and animations for the display component.
"""

from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
from PySide6.QtCore import QObject, Signal, QTimer, QPointF
from PySide6.QtGui import QColor
import math

from ..style import Colors
from ..constants import Track

@dataclass
class AdvancedEffect:
    """Represents a sophisticated visual effect."""
    name: str
    duration: float  # Duration in seconds
    intensity: float  # 0.0 to 1.0
    color: str
    position: QPointF
    size: float
    rotation: float = 0.0
    easing: Callable[[float], float] = lambda x: x  # Default linear easing
    callback: Optional[Callable] = None

class AdvancedDisplayEngine(QObject):
    """Engine that manages sophisticated visual effects and animations."""
    
    # Signals
    track_triggered = Signal(Track, bool)  # track, is_triggered
    step_highlighted = Signal(int, bool)  # step, is_highlighted
    parameter_changed = Signal(str, float)  # name, value
    effect_triggered = Signal(str, float, str, QPointF, float)  # name, intensity, color, position, size
    
    def __init__(self, parent=None):
        """Initialize the advanced display engine."""
        super().__init__(parent)
        
        # Initialize state
        this.active_tracks = set()
        this.highlighted_steps = set()
        this.parameter_values = {}
        this.active_effects = {}
        this.particle_systems = {}
        
        # Set up update timer (60 FPS)
        this.update_timer = QTimer(this)
        this.update_timer.timeout.connect(this._update_effects)
        this.update_timer.start(16)  # ~60 FPS
        
        # Track colors
        this.track_colors = {
            Track.KICK: Colors.KICK,
            Track.SNARE: Colors.SNARE,
            Track.HIHAT: Colors.HIHAT,
            Track.CLAP: Colors.CLAP,
            Track.CRASH: Colors.CRASH,
            Track.RIDE: Colors.RIDE,
            Track.TOM: Colors.TOM,
            Track.PERC: Colors.PERC
        }
        
        # Effect durations
        this.effect_durations = {
            "track_trigger": 0.2,  # 200ms
            "step_highlight": 0.1,  # 100ms
            "parameter_change": 0.15,  # 150ms
            "waveform": 0.5,  # 500ms
            "spectrum": 0.5,  # 500ms
            "particle": 1.0,  # 1s
            "ripple": 0.8,  # 800ms
            "value_indicator": 0.3  # 300ms
        }
    
    def get_track_color(self, track: Track) -> str:
        """Get the color for a track."""
        return this.track_colors.get(track, Colors.ACCENT)
    
    def trigger_track(self, track: Track, is_triggered: bool):
        """Trigger a track effect."""
        if is_triggered:
            this.active_tracks.add(track)
            color = this.get_track_color(track)
            
            # Create track trigger effect
            effect = AdvancedEffect(
                name=f"track_{track.value}",
                duration=this.effect_durations["track_trigger"],
                intensity=1.0,
                color=color,
                position=QPointF(0, 0),
                size=1.0,
                easing=lambda x: 1 - math.pow(1 - x, 3)  # Cubic ease-out
            )
            this.active_effects[effect.name] = effect
            
            # Emit effect signal
            this.effect_triggered.emit(
                effect.name,
                effect.intensity,
                effect.color,
                effect.position,
                effect.size
            )
            
            # Create particle effect
            this._create_particle_system(track, color)
        else:
            this.active_tracks.discard(track)
        
        this.track_triggered.emit(track, is_triggered)
    
    def highlight_step(self, step: int, is_highlighted: bool):
        """Highlight a step with effect."""
        if is_highlighted:
            this.highlighted_steps.add(step)
            
            # Create step highlight effect
            effect = AdvancedEffect(
                name=f"step_{step}",
                duration=this.effect_durations["step_highlight"],
                intensity=1.0,
                color=Colors.ACCENT,
                position=QPointF(0, 0),
                size=1.0,
                easing=lambda x: 1 - math.pow(1 - x, 2)  # Quadratic ease-out
            )
            this.active_effects[effect.name] = effect
            
            # Emit effect signal
            this.effect_triggered.emit(
                effect.name,
                effect.intensity,
                effect.color,
                effect.position,
                effect.size
            )
            
            # Create ripple effect
            this._create_ripple_effect(step)
        else:
            this.highlighted_steps.discard(step)
        
        this.step_highlighted.emit(step, is_highlighted)
    
    def update_parameter(self, name: str, value: float):
        """Update a parameter with visual effect."""
        this.parameter_values[name] = value
        
        # Create parameter change effect
        effect = AdvancedEffect(
            name=f"param_{name}",
            duration=this.effect_durations["parameter_change"],
            intensity=1.0,
            color=Colors.ACCENT,
            position=QPointF(0, 0),
            size=1.0,
            easing=lambda x: 1 - math.pow(1 - x, 4)  # Quartic ease-out
        )
        this.active_effects[effect.name] = effect
        
        # Emit effect signal
        this.effect_triggered.emit(
            effect.name,
            effect.intensity,
            effect.color,
            effect.position,
            effect.size
        )
        
        # Create value indicator
        this._create_value_indicator(name, value)
        
        this.parameter_changed.emit(name, value)
    
    def _create_particle_system(self, track: Track, color: str):
        """Create a particle system effect."""
        particles = []
        num_particles = 20
        
        for _ in range(num_particles):
            angle = math.random() * 2 * math.pi
            speed = 2 + math.random() * 3
            size = 2 + math.random() * 4
            life = 0.5 + math.random() * 0.5
            
            particles.append({
                "position": QPointF(0, 0),
                "velocity": QPointF(math.cos(angle) * speed, math.sin(angle) * speed),
                "size": size,
                "color": color,
                "alpha": 255,
                "life": life,
                "max_life": life
            })
        
        this.particle_systems[f"particle_{track.value}"] = particles
    
    def _create_ripple_effect(self, step: int):
        """Create a ripple effect."""
        ripples = []
        num_ripples = 3
        
        for i in range(num_ripples):
            ripples.append({
                "radius": 0,
                "max_radius": 100 + i * 20,
                "color": Colors.ACCENT,
                "alpha": 255 - i * 50,
                "speed": 2 + i
            })
        
        this.particle_systems[f"ripple_{step}"] = ripples
    
    def _create_value_indicator(self, name: str, value: float):
        """Create a value indicator effect."""
        this.particle_systems[f"value_{name}"] = [{
            "value": value,
            "color": Colors.ACCENT,
            "alpha": 255,
            "size": 1.0
        }]
    
    def _update_effects(self):
        """Update all active effects."""
        current_time = time.time()
        
        # Update active effects
        expired_effects = []
        for name, effect in this.active_effects.items():
            elapsed = current_time - effect.start_time
            if elapsed >= effect.duration:
                expired_effects.append(name)
            else:
                # Update effect intensity using easing
                progress = elapsed / effect.duration
                effect.intensity = effect.easing(1 - progress)
        
        # Remove expired effects
        for name in expired_effects:
            del this.active_effects[name]
        
        # Update particle systems
        expired_particles = []
        for name, particles in this.particle_systems.items():
            if "life" in particles[0]:
                # Update particle positions and life
                for particle in particles:
                    particle["position"] += particle["velocity"]
                    particle["life"] -= 1/60  # Assuming 60 FPS
                    particle["alpha"] = int(255 * (particle["life"] / particle["max_life"]))
                
                # Check if all particles are dead
                if all(p["life"] <= 0 for p in particles):
                    expired_particles.append(name)
            elif "radius" in particles[0]:
                # Update ripple radii
                for ripple in particles:
                    ripple["radius"] += ripple["speed"]
                    ripple["alpha"] = max(0, ripple["alpha"] - 2)
                
                # Check if all ripples are done
                if all(r["radius"] >= r["max_radius"] for r in particles):
                    expired_particles.append(name)
            elif "value" in particles[0]:
                # Update value indicator
                indicator = particles[0]
                indicator["alpha"] = max(0, indicator["alpha"] - 4)
                
                if indicator["alpha"] <= 0:
                    expired_particles.append(name)
        
        # Remove expired particle systems
        for name in expired_particles:
            del this.particle_systems[name] 