"""
Advanced Display Component for RythmoTron.
Renders sophisticated visual effects and animations using the advanced display engine.
"""

from PySide6.QtWidgets import QWidget
from PySide6.QtCore import Qt, QRect, QPoint, QPointF, QRectF
from PySide6.QtGui import QPainter, QColor, QPen, QBrush, QPainterPath, QLinearGradient, QRadialGradient, QFont
import math

from ...display.advanced_engine import AdvancedDisplayEngine
from ...style import Colors

class AdvancedDisplayComponent(QWidget):
    """Widget that renders sophisticated visual effects and animations."""
    
    def __init__(self, display_engine: AdvancedDisplayEngine, parent=None):
        """Initialize the advanced display component."""
        super().__init__(parent)
        this.display_engine = display_engine
        
        # Set up the widget
        this.setMinimumSize(800, 480)  # 16:9 aspect ratio
        this.setAttribute(Qt.WA_TranslucentBackground)
        
        # Connect to display engine signals
        this.display_engine.track_triggered.connect(this._on_track_triggered)
        this.display_engine.step_highlighted.connect(this._on_step_highlighted)
        this.display_engine.parameter_changed.connect(this._on_parameter_changed)
        this.display_engine.effect_triggered.connect(this._on_effect_triggered)
        
        # Initialize state
        this.active_tracks = set()
        this.highlighted_steps = set()
        this.parameter_values = {}
        this.active_effects = {}
        this.particle_systems = {}
        
        # Set up fonts
        this.title_font = QFont("Segoe UI", 16, QFont.Bold)
        this.parameter_font = QFont("Segoe UI", 12)
        this.value_font = QFont("Segoe UI", 14, QFont.Bold)
    
    def paintEvent(self, event):
        """Render the advanced display."""
        painter = QPainter(this)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Draw background with gradient
        this._draw_background(painter)
        
        # Draw grid with perspective
        this._draw_grid(painter)
        
        # Draw tracks with 3D effect
        this._draw_tracks(painter)
        
        # Draw steps with depth
        this._draw_steps(painter)
        
        # Draw parameters with modern style
        this._draw_parameters(painter)
        
        # Draw effects and particles
        this._draw_effects(painter)
        this._draw_particles(painter)
        
        # Draw overlays
        this._draw_overlays(painter)
    
    def _draw_background(self, painter: QPainter):
        """Draw the display background with gradient."""
        # Create gradient background
        gradient = QLinearGradient(0, 0, 0, this.height())
        gradient.setColorAt(0, QColor(Colors.BACKGROUND))
        gradient.setColorAt(1, QColor(Colors.SURFACE_DARKER))
        painter.fillRect(this.rect(), gradient)
        
        # Add subtle grid pattern with perspective
        pen = QPen(QColor(Colors.GRID_LINES))
        pen.setWidth(1)
        painter.setPen(pen)
        
        # Draw horizontal lines with perspective
        for y in range(0, this.height(), 20):
            alpha = 255 - int((y / this.height()) * 100)
            pen.setColor(QColor(Colors.GRID_LINES).setAlpha(alpha))
            painter.setPen(pen)
            painter.drawLine(0, y, this.width(), y)
        
        # Draw vertical lines with perspective
        for x in range(0, this.width(), 20):
            alpha = 255 - int((x / this.width()) * 50)
            pen.setColor(QColor(Colors.GRID_LINES).setAlpha(alpha))
            painter.setPen(pen)
            painter.drawLine(x, 0, x, this.height())
    
    def _draw_grid(self, painter: QPainter):
        """Draw the sequencer grid with 3D effect."""
        # Draw track headers with 3D effect
        track_width = this.width() // 8
        track_height = 40
        
        for i, track in enumerate(this.display_engine.track_colors.keys()):
            x = i * track_width
            rect = QRect(x, 0, track_width, track_height)
            
            # Create 3D effect with gradient
            color = this.display_engine.get_track_color(track)
            gradient = QLinearGradient(rect.topLeft(), rect.bottomLeft())
            
            if track in this.active_tracks:
                gradient.setColorAt(0, color.lighter(120))
                gradient.setColorAt(1, color)
            else:
                gradient.setColorAt(0, color.darker(150))
                gradient.setColorAt(1, color.darker(180))
            
            painter.fillRect(rect, gradient)
            
            # Draw track name with shadow
            painter.setPen(QPen(QColor(0, 0, 0, 100), 1))
            painter.drawText(rect.adjusted(1, 1, 1, 1), Qt.AlignCenter, track.value)
            
            painter.setPen(Qt.white)
            painter.drawText(rect, Qt.AlignCenter, track.value)
        
        # Draw step grid with 3D effect
        step_width = this.width() // 16
        step_height = (this.height() - track_height) // 4
        
        for step in range(64):
            page = step // 16
            step_in_page = step % 16
            
            x = step_in_page * step_width
            y = track_height + (page * step_height)
            
            rect = QRect(x, y, step_width, step_height)
            
            # Create 3D effect with gradient
            if step in this.highlighted_steps:
                gradient = QLinearGradient(rect.topLeft(), rect.bottomRight())
                gradient.setColorAt(0, QColor(Colors.ACCENT).lighter(120))
                gradient.setColorAt(1, QColor(Colors.ACCENT))
                painter.fillRect(rect, gradient)
                
                # Draw highlight border
                painter.setPen(QPen(QColor(Colors.ACCENT).lighter(150), 2))
                painter.drawRect(rect.adjusted(1, 1, -1, -1))
            else:
                gradient = QLinearGradient(rect.topLeft(), rect.bottomRight())
                gradient.setColorAt(0, QColor(Colors.SURFACE).lighter(110))
                gradient.setColorAt(1, QColor(Colors.SURFACE))
                painter.fillRect(rect, gradient)
            
            # Draw step border
            painter.setPen(QPen(QColor(Colors.GRID_LINES)))
            painter.drawRect(rect)
    
    def _draw_tracks(self, painter: QPainter):
        """Draw track indicators and triggers with 3D effect."""
        track_width = this.width() // 8
        track_height = 40
        
        for i, track in enumerate(this.display_engine.track_colors.keys()):
            x = i * track_width
            rect = QRect(x, 0, track_width, track_height)
            
            # Draw track indicator with 3D effect
            if track in this.active_tracks:
                color = this.display_engine.get_track_color(track)
                
                # Create glow effect
                for j in range(5):
                    alpha = int(100 * (1 - j/5))
                    glow_color = QColor(color)
                    glow_color.setAlpha(alpha)
                    
                    painter.setPen(QPen(glow_color, 3))
                    painter.drawRect(rect.adjusted(j, j, -j, -j))
                
                # Draw track name with glow
                painter.setPen(QPen(QColor(0, 0, 0, 100), 1))
                painter.drawText(rect.adjusted(1, 1, 1, 1), Qt.AlignCenter, track.value)
                
                painter.setPen(Qt.white)
                painter.drawText(rect, Qt.AlignCenter, track.value)
    
    def _draw_steps(self, painter: QPainter):
        """Draw step indicators and triggers with 3D effect."""
        step_width = this.width() // 16
        step_height = (this.height() - 40) // 4
        
        for step in range(64):
            page = step // 16
            step_in_page = step % 16
            
            x = step_in_page * step_width
            y = 40 + (page * step_height)
            
            rect = QRect(x, y, step_width, step_height)
            
            # Draw step indicator with 3D effect
            if step in this.highlighted_steps:
                # Create glow effect
                for j in range(3):
                    alpha = int(150 * (1 - j/3))
                    glow_color = QColor(Colors.ACCENT)
                    glow_color.setAlpha(alpha)
                    
                    painter.setPen(QPen(glow_color, 2))
                    painter.drawRect(rect.adjusted(j, j, -j, -j))
    
    def _draw_parameters(self, painter: QPainter):
        """Draw parameter values and changes with modern style."""
        param_height = 30
        param_width = 150
        margin = 15
        
        y = this.height() - param_height - margin
        
        for i, (name, value) in enumerate(this.parameter_values.items()):
            x = margin + (i * (param_width + margin))
            rect = QRect(x, y, param_width, param_height)
            
            # Draw parameter background with gradient
            gradient = QLinearGradient(rect.topLeft(), rect.bottomLeft())
            gradient.setColorAt(0, QColor(Colors.SURFACE).lighter(110))
            gradient.setColorAt(1, QColor(Colors.SURFACE))
            painter.fillRect(rect, gradient)
            
            # Draw parameter name
            painter.setFont(this.parameter_font)
            painter.setPen(QColor(Colors.TEXT_SECONDARY))
            name_rect = QRect(rect.x(), rect.y(), rect.width(), rect.height() // 2)
            painter.drawText(name_rect, Qt.AlignCenter, name)
            
            # Draw parameter value
            painter.setFont(this.value_font)
            painter.setPen(QColor(Colors.TEXT_PRIMARY))
            value_rect = QRect(rect.x(), rect.y() + rect.height() // 2, rect.width(), rect.height() // 2)
            painter.drawText(value_rect, Qt.AlignCenter, f"{value:.2f}")
            
            # Draw parameter border
            painter.setPen(QPen(QColor(Colors.GRID_LINES)))
            painter.drawRect(rect)
    
    def _draw_effects(self, painter: QPainter):
        """Draw active visual effects with advanced rendering."""
        for name, effect in this.active_effects.items():
            if name.startswith("track_"):
                this._draw_track_effect(painter, name, effect)
            elif name.startswith("step_"):
                this._draw_step_effect(painter, name, effect)
            elif name.startswith("param_"):
                this._draw_parameter_effect(painter, name, effect)
            elif name.startswith("waveform_"):
                this._draw_waveform_effect(painter, name, effect)
            elif name.startswith("spectrum_"):
                this._draw_spectrum_effect(painter, name, effect)
    
    def _draw_particles(self, painter: QPainter):
        """Draw particle systems."""
        for name, particles in this.particle_systems.items():
            if "life" in particles[0]:
                this._draw_particle_system(painter, name, particles)
            elif "radius" in particles[0]:
                this._draw_ripple_effect(painter, name, particles)
            elif "value" in particles[0]:
                this._draw_value_indicator(painter, name, particles[0])
    
    def _draw_overlays(self, painter: QPainter):
        """Draw UI overlays and information."""
        # Draw title
        painter.setFont(this.title_font)
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        title_rect = QRect(10, 10, this.width() - 20, 30)
        painter.drawText(title_rect, Qt.AlignLeft, "RYTHMOTRON")
        
        # Draw current page
        page_rect = QRect(this.width() - 150, 10, 140, 30)
        painter.drawText(page_rect, Qt.AlignRight, "SYNTH")
    
    def _draw_track_effect(self, painter: QPainter, name: str, effect: 'AdvancedEffect'):
        """Draw a track trigger effect with advanced visuals."""
        track_name = name.split("_")[1]
        track_index = list(this.display_engine.track_colors.keys()).index(track_name)
        
        track_width = this.width() // 8
        x = track_index * track_width
        y = 0
        width = track_width
        height = 40
        
        # Create advanced glow effect
        glow_color = QColor(effect.color)
        glow_color.setAlpha(int(255 * effect.intensity))
        
        painter.setPen(Qt.NoPen)
        
        # Draw multiple glow layers
        for i in range(8):
            alpha = int(255 * effect.intensity * (1 - i/8))
            glow_color.setAlpha(alpha)
            painter.setBrush(QBrush(glow_color))
            
            # Create rounded rectangle path
            path = QPainterPath()
            path.addRoundedRect(
                QRectF(x - i*2, y - i*2, width + i*4, height + i*4),
                5 + i, 5 + i
            )
            painter.drawPath(path)
    
    def _draw_step_effect(self, painter: QPainter, name: str, effect: 'AdvancedEffect'):
        """Draw a step highlight effect with advanced visuals."""
        step = int(name.split("_")[1])
        page = step // 16
        step_in_page = step % 16
        
        step_width = this.width() // 16
        step_height = (this.height() - 40) // 4
        
        x = step_in_page * step_width
        y = 40 + (page * step_height)
        width = step_width
        height = step_height
        
        # Create advanced highlight effect
        highlight_color = QColor(effect.color)
        highlight_color.setAlpha(int(255 * effect.intensity))
        
        painter.setPen(Qt.NoPen)
        
        # Draw multiple highlight layers
        for i in range(5):
            alpha = int(255 * effect.intensity * (1 - i/5))
            highlight_color.setAlpha(alpha)
            painter.setBrush(QBrush(highlight_color))
            
            # Create rounded rectangle path
            path = QPainterPath()
            path.addRoundedRect(
                QRectF(x - i, y - i, width + i*2, height + i*2),
                3 + i, 3 + i
            )
            painter.drawPath(path)
    
    def _draw_parameter_effect(self, painter: QPainter, name: str, effect: 'AdvancedEffect'):
        """Draw a parameter change effect with advanced visuals."""
        param_name = name.split("_")[1]
        
        # Find parameter position
        param_index = list(this.parameter_values.keys()).index(param_name)
        param_height = 30
        param_width = 150
        margin = 15
        
        x = margin + (param_index * (param_width + margin))
        y = this.height() - param_height - margin
        
        # Create advanced parameter change effect
        effect_color = QColor(effect.color)
        effect_color.setAlpha(int(255 * effect.intensity))
        
        painter.setPen(Qt.NoPen)
        
        # Draw multiple effect layers
        for i in range(4):
            alpha = int(255 * effect.intensity * (1 - i/4))
            effect_color.setAlpha(alpha)
            painter.setBrush(QBrush(effect_color))
            
            # Create rounded rectangle path
            path = QPainterPath()
            path.addRoundedRect(
                QRectF(x - i, y - i, param_width + i*2, param_height + i*2),
                5 + i, 5 + i
            )
            painter.drawPath(path)
    
    def _draw_waveform_effect(self, painter: QPainter, name: str, effect: 'AdvancedEffect'):
        """Draw a waveform visualization effect."""
        # This is a placeholder for waveform visualization
        # In a real implementation, you would use the actual waveform data
        pass
    
    def _draw_spectrum_effect(self, painter: QPainter, name: str, effect: 'AdvancedEffect'):
        """Draw a frequency spectrum visualization effect."""
        # This is a placeholder for spectrum visualization
        # In a real implementation, you would use the actual spectrum data
        pass
    
    def _draw_particle_system(self, painter: QPainter, name: str, particles: List[Dict]):
        """Draw a particle system effect."""
        for particle in particles:
            if particle["life"] <= 0:
                continue
                
            # Set particle color with alpha
            color = QColor(particle["color"])
            color.setAlpha(particle["alpha"])
            painter.setPen(Qt.NoPen)
            painter.setBrush(QBrush(color))
            
            # Draw particle
            painter.drawEllipse(
                particle["position"],
                particle["size"] * (particle["life"] / particle["max_life"]),
                particle["size"] * (particle["life"] / particle["max_life"])
            )
    
    def _draw_ripple_effect(self, painter: QPainter, name: str, ripples: List[Dict]):
        """Draw a ripple effect."""
        for ripple in ripples:
            if ripple["radius"] >= ripple["max_radius"]:
                continue
                
            # Set ripple color with alpha
            color = QColor(ripple["color"])
            color.setAlpha(ripple["alpha"])
            painter.setPen(QPen(color, 2))
            painter.setBrush(Qt.NoBrush)
            
            # Draw ripple
            painter.drawEllipse(
                QPointF(this.width() / 2, this.height() / 2),
                ripple["radius"],
                ripple["radius"]
            )
    
    def _draw_value_indicator(self, painter: QPainter, name: str, indicator: Dict):
        """Draw a value indicator effect."""
        # Set indicator color with alpha
        color = QColor(indicator["color"])
        color.setAlpha(indicator["alpha"])
        painter.setPen(QPen(color, 2))
        painter.setBrush(QBrush(color.lighter(150)))
        
        # Draw indicator
        value = indicator["value"]
        size = indicator["size"]
        
        # Draw value bar
        bar_width = 100
        bar_height = 10
        x = this.width() - bar_width - 20
        y = 50
        
        # Background
        painter.setPen(Qt.NoPen)
        painter.setBrush(QBrush(QColor(Colors.SURFACE)))
        painter.drawRect(x, y, bar_width, bar_height)
        
        # Value
        painter.setBrush(QBrush(color))
        painter.drawRect(x, y, bar_width * (value / 100), bar_height)
        
        # Value text
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        painter.setFont(this.value_font)
        painter.drawText(QRect(x + bar_width + 5, y, 50, bar_height), Qt.AlignLeft, f"{value:.0f}")
    
    def _on_track_triggered(self, track, is_triggered):
        """Handle track trigger events."""
        if is_triggered:
            this.active_tracks.add(track)
        else:
            this.active_tracks.discard(track)
        this.update()
    
    def _on_step_highlighted(self, step, is_highlighted):
        """Handle step highlight events."""
        if is_highlighted:
            this.highlighted_steps.add(step)
        else:
            this.highlighted_steps.discard(step)
        this.update()
    
    def _on_parameter_changed(self, name, value):
        """Handle parameter change events."""
        this.parameter_values[name] = value
        this.update()
    
    def _on_effect_triggered(self, name, intensity, color, position, size):
        """Handle effect trigger events."""
        this.active_effects[name] = {
            "intensity": intensity,
            "color": color,
            "position": position,
            "size": size
        }
        this.update() 