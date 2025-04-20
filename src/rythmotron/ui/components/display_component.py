"""
Display Component for RythmoTron.
Renders sophisticated visual effects and animations using the advanced display engine.
"""

from PySide6.QtWidgets import (QWidget, QVBoxLayout, QSizePolicy, QMenuBar, 
                              QMenu, QLabel, QHBoxLayout, QPushButton,
                              QSlider, QComboBox, QSpinBox, QCheckBox, QToolBar)
from PySide6.QtCore import Qt, QRectF, QPointF, QSizeF, QTimer, Signal, Slot
from PySide6.QtGui import QPainter, QColor, QLinearGradient, QRadialGradient, QFont, QPen, QBrush, QPainterPath, QIcon, QAction

from ...display.advanced_engine import AdvancedDisplayEngine
from ...style.skin_manager import SkinManager
from ...constants import Track

class DisplayComponent(QWidget):
    """Component that renders sophisticated visual effects and animations."""
    
    # Define signals for external connections
    track_triggered = Signal(Track, bool)
    step_highlighted = Signal(int, bool)
    parameter_changed = Signal(str, float)
    effect_triggered = Signal(str, float, str, QPointF, float)
    
    def __init__(self, display_engine: AdvancedDisplayEngine, skin_manager: SkinManager, parent=None):
        """Initialize the display component."""
        super().__init__(parent)
        
        self.display_engine = display_engine
        self.skin_manager = skin_manager
        
        self.setup_ui()
        self.connect_signals()
        
        # Set up widget properties
        self.setMinimumSize(800, 480)  # 16:9 aspect ratio
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setAttribute(Qt.WA_NoSystemBackground)
        
        # Initialize state
        self.active_tracks = set()
        self.highlighted_steps = set()
        self.parameter_values = {}
        self.active_effects = {}
        self.particle_systems = {}
        
        # Set up fonts
        self._update_fonts()
        
        # Animation timer for smooth transitions
        self.animation_timer = QTimer(self)
        self.animation_timer.timeout.connect(self.update)
        self.animation_timer.start(16)  # ~60 FPS
        
        # Scale factors for responsive design
        self.scale_factor = 1.0
        self.update_scale_factor()
    
    def setup_ui(self):
        """Set up the UI components."""
        # Main layout
        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(0, 0, 0, 0)
        self.main_layout.setSpacing(0)
        
        # Create menu bar
        self.menu_bar = QMenuBar(self)
        self.main_layout.addWidget(self.menu_bar)
        
        # File menu
        self.file_menu = QMenu("File", self.menu_bar)
        self.menu_bar.addMenu(self.file_menu)
        
        self.new_action = QAction("New", self)
        self.new_action.triggered.connect(self._on_new)
        self.file_menu.addAction(self.new_action)
        
        self.open_action = QAction("Open", self)
        self.open_action.triggered.connect(self._on_open)
        self.file_menu.addAction(self.open_action)
        
        self.save_action = QAction("Save", self)
        self.save_action.triggered.connect(self._on_save)
        self.file_menu.addAction(self.save_action)
        
        self.file_menu.addSeparator()
        
        self.exit_action = QAction("Exit", self)
        self.exit_action.triggered.connect(self._on_exit)
        self.file_menu.addAction(self.exit_action)
        
        # Edit menu
        self.edit_menu = QMenu("Edit", self.menu_bar)
        self.menu_bar.addMenu(self.edit_menu)
        
        self.undo_action = QAction("Undo", self)
        self.undo_action.triggered.connect(self._on_undo)
        self.edit_menu.addAction(self.undo_action)
        
        self.redo_action = QAction("Redo", self)
        self.redo_action.triggered.connect(self._on_redo)
        self.edit_menu.addAction(self.redo_action)
        
        # View menu
        self.view_menu = QMenu("View", self.menu_bar)
        self.menu_bar.addMenu(self.view_menu)
        
        self.fullscreen_action = QAction("Fullscreen", self)
        self.fullscreen_action.triggered.connect(self._on_fullscreen)
        self.view_menu.addAction(self.fullscreen_action)
        
        # Help menu
        self.help_menu = QMenu("Help", self.menu_bar)
        self.menu_bar.addMenu(self.help_menu)
        
        self.about_action = QAction("About", self)
        self.about_action.triggered.connect(self._on_about)
        self.help_menu.addAction(self.about_action)
        
        # Create toolbar
        self.toolbar = QToolBar("Main Toolbar", self)
        self.toolbar.setMovable(False)
        self.main_layout.addWidget(self.toolbar)
        
        # Add toolbar actions
        self.play_button = QPushButton("Play", self)
        self.play_button.setCheckable(True)
        self.play_button.clicked.connect(self._on_play_clicked)
        self.toolbar.addWidget(self.play_button)
        
        self.stop_button = QPushButton("Stop", self)
        self.stop_button.clicked.connect(self._on_stop_clicked)
        self.toolbar.addWidget(self.stop_button)
        
        self.toolbar.addSeparator()
        
        self.tempo_label = QLabel("Tempo:", self)
        self.toolbar.addWidget(self.tempo_label)
        
        self.tempo_spinbox = QSpinBox(self)
        self.tempo_spinbox.setRange(20, 300)
        self.tempo_spinbox.setValue(120)
        self.tempo_spinbox.valueChanged.connect(self._on_tempo_changed)
        self.toolbar.addWidget(self.tempo_spinbox)
        
        self.toolbar.addSeparator()
        
        self.skin_combo = QComboBox(self)
        self.skin_combo.addItems(["Default", "Dark", "Light", "Retro"])
        self.skin_combo.currentTextChanged.connect(self._on_skin_changed)
        self.toolbar.addWidget(self.skin_combo)
        
        # Create display widget
        self.display_widget = QWidget()
        self.display_widget.setMinimumSize(400, 300)
        self.display_widget.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.main_layout.addWidget(self.display_widget)
        
        # Create control panel
        self.control_panel = QWidget()
        self.control_layout = QHBoxLayout(self.control_panel)
        self.control_layout.setContentsMargins(10, 5, 10, 5)
        self.main_layout.addWidget(self.control_panel)
        
        # Add track controls
        for track in Track:
            track_widget = QWidget()
            track_layout = QVBoxLayout(track_widget)
            track_layout.setContentsMargins(5, 5, 5, 5)
            
            track_label = QLabel(track.value, track_widget)
            track_label.setAlignment(Qt.AlignCenter)
            track_layout.addWidget(track_label)
            
            track_button = QPushButton("Mute", track_widget)
            track_button.setCheckable(True)
            track_button.clicked.connect(lambda checked, t=track: self._on_track_mute(t, checked))
            track_layout.addWidget(track_button)
            
            track_solo = QPushButton("Solo", track_widget)
            track_solo.setCheckable(True)
            track_solo.clicked.connect(lambda checked, t=track: self._on_track_solo(t, checked))
            track_layout.addWidget(track_solo)
            
            track_volume = QSlider(Qt.Vertical, track_widget)
            track_volume.setRange(0, 100)
            track_volume.setValue(75)
            track_volume.valueChanged.connect(lambda value, t=track: self._on_track_volume(t, value))
            track_layout.addWidget(track_volume)
            
            self.control_layout.addWidget(track_widget)
        
        # Add master controls
        master_widget = QWidget()
        master_layout = QVBoxLayout(master_widget)
        master_layout.setContentsMargins(5, 5, 5, 5)
        
        master_label = QLabel("Master", master_widget)
        master_label.setAlignment(Qt.AlignCenter)
        master_layout.addWidget(master_label)
        
        master_mute = QPushButton("Mute", master_widget)
        master_mute.setCheckable(True)
        master_mute.clicked.connect(self._on_master_mute)
        master_layout.addWidget(master_mute)
        
        master_volume = QSlider(Qt.Vertical, master_widget)
        master_volume.setRange(0, 100)
        master_volume.setValue(75)
        master_volume.valueChanged.connect(self._on_master_volume)
        master_layout.addWidget(master_volume)
        
        self.control_layout.addWidget(master_widget)
        
        # Add credits label
        self.credits_label = QLabel("Coded by Nico Kuehn", self)
        self.credits_label.setAlignment(Qt.AlignRight | Qt.AlignBottom)
        self.main_layout.addWidget(self.credits_label)
        
        # Apply skin
        self._apply_skin()
    
    def connect_signals(self):
        """Connect signals to slots."""
        self.display_engine.track_triggered.connect(self._on_track_triggered)
        self.display_engine.step_highlighted.connect(self._on_step_highlighted)
        self.display_engine.parameter_changed.connect(self._on_parameter_changed)
        self.display_engine.effect_triggered.connect(self._on_effect_triggered)
        
        # Connect skin manager signals
        self.skin_manager.skin_changed.connect(self._on_skin_changed)
    
    def _apply_skin(self):
        """Apply the current skin to the component."""
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {self.skin_manager.get_color('background')};
                color: {self.skin_manager.get_color('text')};
            }}
            QMenuBar {{
                background-color: {self.skin_manager.get_color('SURFACE_DARK')};
                color: {self.skin_manager.get_color('TEXT')};
            }}
            QMenu {{
                background-color: {self.skin_manager.get_color('SURFACE_DARK')};
                color: {self.skin_manager.get_color('TEXT')};
            }}
            QToolBar {{
                background-color: {self.skin_manager.get_color('SURFACE_DARK')};
                border: none;
            }}
            QPushButton {{
                background-color: {self.skin_manager.get_color('BUTTON')};
                color: {self.skin_manager.get_color('TEXT')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 4px;
                padding: 4px 8px;
            }}
            QPushButton:checked {{
                background-color: {self.skin_manager.get_color('ACCENT')};
            }}
            QSlider::groove:vertical {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                width: 10px;
                border-radius: 5px;
            }}
            QSlider::handle:vertical {{
                background: {self.skin_manager.get_color('ACCENT')};
                height: 18px;
                margin: 0 -5px;
                border-radius: 9px;
            }}
            QComboBox {{
                background-color: {self.skin_manager.get_color('BUTTON')};
                color: {self.skin_manager.get_color('TEXT')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 4px;
                padding: 4px 8px;
            }}
            QSpinBox {{
                background-color: {self.skin_manager.get_color('BUTTON')};
                color: {self.skin_manager.get_color('TEXT')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 4px;
                padding: 4px 8px;
            }}
        """)
    
    def _update_fonts(self):
        """Update fonts based on current skin."""
        font_family = self.skin_manager.get_font_family()
        self.title_font = QFont(font_family, self.skin_manager.get_font_size("title"), QFont.Bold)
        self.header_font = QFont(font_family, self.skin_manager.get_font_size("header"), QFont.DemiBold)
        self.value_font = QFont(font_family, self.skin_manager.get_font_size("value"))
    
    def _on_skin_changed(self, skin_name):
        """Handle skin changes."""
        self.skin_manager.set_skin(skin_name)
        self._update_fonts()
        self.update()
    
    def resizeEvent(self, event):
        """Handle resize events to update scaling factors."""
        super().resizeEvent(event)
        self.update_scale_factor()
    
    def update_scale_factor(self):
        """Update the scale factor based on the current size."""
        # Base size is 800x480 (16:9)
        base_width = 800
        base_height = 480
        
        # Calculate scale factor based on the smaller dimension
        width_scale = self.width() / base_width
        height_scale = self.height() / base_height
        
        self.scale_factor = min(width_scale, height_scale)
    
    def paintEvent(self, event):
        """Render the display with all active effects."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Draw background
        self._draw_background(painter)
        
        # Draw grid
        self._draw_grid(painter)
        
        # Draw tracks
        self._draw_tracks(painter)
        
        # Draw steps
        self._draw_steps(painter)
        
        # Draw parameters
        self._draw_parameters(painter)
        
        # Draw effects
        self._draw_effects(painter)
        
        # Draw particles
        self._draw_particles(painter)
        
        # Draw overlay
        self._draw_overlay(painter)
    
    def _draw_background(self, painter):
        """Draw the background with gradient."""
        # Create a more sophisticated gradient
        gradient = QLinearGradient(0, 0, 0, self.height())
        gradient.setColorAt(0, QColor(self.skin_manager.get_color("SURFACE")))
        gradient.setColorAt(0.5, QColor(self.skin_manager.get_color("SURFACE_DARK")))
        gradient.setColorAt(1, QColor(self.skin_manager.get_color("SURFACE_DARKER")))
        painter.fillRect(self.rect(), gradient)
        
        # Add subtle noise texture
        self._draw_noise_texture(painter)
    
    def _draw_noise_texture(self, painter):
        """Draw a subtle noise texture overlay."""
        # This is a simplified noise effect
        for i in range(0, self.width(), 4):
            for j in range(0, self.height(), 4):
                if (i + j) % 8 == 0:
                    alpha = 5  # Very subtle
                    painter.setPen(QColor(255, 255, 255, alpha))
                    painter.drawPoint(i, j)
    
    def _draw_grid(self, painter):
        """Draw the perspective grid with improved scaling."""
        # Calculate grid dimensions based on scale factor
        grid_spacing_x = 50 * self.scale_factor
        grid_spacing_y = 50 * self.scale_factor
        
        # Set up pen with appropriate width
        pen_width = max(1, 1 * self.scale_factor)
        painter.setPen(QPen(QColor(self.skin_manager.get_color("GRID")), pen_width))
        
        # Draw horizontal lines
        for i in range(int(self.height() / grid_spacing_y) + 1):
            y = i * grid_spacing_y
            painter.drawLine(0, y, self.width(), y)
        
        # Draw vertical lines with perspective
        for i in range(int(self.width() / grid_spacing_x) + 1):
            x = i * grid_spacing_x
            y1 = 0
            y2 = self.height()
            painter.drawLine(x, y1, x, y2)
    
    def _draw_tracks(self, painter):
        """Draw track headers and indicators with improved scaling."""
        # Calculate dimensions based on scale factor
        track_height = 40 * self.scale_factor
        track_spacing = 10 * self.scale_factor
        
        for i, track in enumerate(Track):
            y = i * (track_height + track_spacing)
            
            # Draw track header
            painter.setFont(self.header_font)
            color = QColor(self.skin_manager.get_color(track.value))
            
            if track in self.active_tracks:
                # Draw active track header with modern glow effect
                path = QPainterPath()
                path.addRoundedRect(0, y, self.width(), track_height, 5 * self.scale_factor, 5 * self.scale_factor)
                
                # Create gradient for glow effect
                gradient = QLinearGradient(0, y, 0, y + track_height)
                gradient.setColorAt(0, color)
                gradient.setColorAt(0.5, color.darker(120))
                gradient.setColorAt(1, color.darker(150))
                
                painter.fillPath(path, gradient)
                
                # Add subtle highlight at the top
                highlight_height = 2 * self.scale_factor
                highlight_gradient = QLinearGradient(0, y, 0, y + highlight_height)
                highlight_gradient.setColorAt(0, QColor(255, 255, 255, 50))
                highlight_gradient.setColorAt(1, QColor(255, 255, 255, 0))
                painter.fillRect(0, y, self.width(), highlight_height, highlight_gradient)
                
                # Draw track name with shadow
                painter.setPen(QColor(0, 0, 0, 100))
                painter.drawText(12, y + track_height - 8, track.value)
                painter.setPen(QColor(self.skin_manager.get_color("TEXT")))
                painter.drawText(10, y + track_height - 10, track.value)
            else:
                # Draw inactive track header with subtle effect
                path = QPainterPath()
                path.addRoundedRect(0, y, self.width(), track_height, 5 * self.scale_factor, 5 * self.scale_factor)
                
                # Create subtle gradient for inactive tracks
                gradient = QLinearGradient(0, y, 0, y + track_height)
                gradient.setColorAt(0, QColor(self.skin_manager.get_color("SURFACE_DARK")))
                gradient.setColorAt(1, QColor(self.skin_manager.get_color("SURFACE_DARKER")))
                
                painter.fillPath(path, gradient)
                
                # Draw track name with muted color
                painter.setPen(color.darker(150))
                painter.drawText(10, y + track_height - 10, track.value)
    
    def _draw_steps(self, painter):
        """Draw step indicators and highlights with improved scaling."""
        # Calculate dimensions based on scale factor
        step_width = 40 * self.scale_factor
        step_height = 40 * self.scale_factor
        step_spacing = 5 * self.scale_factor
        
        # Calculate how many steps to show based on available width
        available_width = self.width() - 20  # Leave some margin
        max_steps = min(32, int(available_width / (step_width + step_spacing)))
        
        for i in range(max_steps):
            x = i * (step_width + step_spacing) + 10  # Add margin
            y = self.height() - step_height - 10
            
            if i in self.highlighted_steps:
                # Draw highlighted step with modern glow effect
                path = QPainterPath()
                path.addRoundedRect(x, y, step_width, step_height, 5 * self.scale_factor, 5 * self.scale_factor)
                
                # Create radial gradient for glow
                gradient = QRadialGradient(
                    x + step_width/2, y + step_height/2, 
                    step_width * 1.5
                )
                gradient.setColorAt(0, QColor(self.skin_manager.get_color("ACCENT")))
                gradient.setColorAt(0.7, QColor(self.skin_manager.get_color("ACCENT_DARK")))
                gradient.setColorAt(1, QColor(self.skin_manager.get_color("ACCENT_DARKER")))
                
                painter.fillPath(path, gradient)
                
                # Add subtle highlight
                highlight_height = 2 * self.scale_factor
                highlight_gradient = QLinearGradient(x, y, x, y + highlight_height)
                highlight_gradient.setColorAt(0, QColor(255, 255, 255, 50))
                highlight_gradient.setColorAt(1, QColor(255, 255, 255, 0))
                painter.fillRect(x, y, step_width, highlight_height, highlight_gradient)
            else:
                # Draw normal step with subtle effect
                path = QPainterPath()
                path.addRoundedRect(x, y, step_width, step_height, 5 * self.scale_factor, 5 * self.scale_factor)
                
                # Create subtle gradient
                gradient = QLinearGradient(x, y, x, y + step_height)
                gradient.setColorAt(0, QColor(self.skin_manager.get_color("SURFACE")))
                gradient.setColorAt(1, QColor(self.skin_manager.get_color("SURFACE_DARK")))
                
                painter.fillPath(path, gradient)
                
                # Add subtle border
                painter.setPen(QPen(QColor(self.skin_manager.get_color("GRID_LINES")), 1 * self.scale_factor))
                painter.drawPath(path)
    
    def _draw_parameters(self, painter):
        """Draw parameter displays and value indicators with improved scaling."""
        # Calculate dimensions based on scale factor
        param_width = 100 * self.scale_factor
        param_height = 30 * self.scale_factor
        param_spacing = 10 * self.scale_factor
        
        for i, (name, value) in enumerate(self.parameter_values.items()):
            x = self.width() - param_width - 10
            y = i * (param_height + param_spacing)
            
            # Draw parameter name
            painter.setFont(self.value_font)
            painter.setPen(QColor(self.skin_manager.get_color("TEXT_SECONDARY")))
            painter.drawText(x, y + param_height - 5, name)
            
            # Draw value indicator with modern style
            if f"value_{name}" in self.particle_systems:
                indicator = self.particle_systems[f"value_{name}"][0]
                alpha = indicator["alpha"]
                color = QColor(indicator["color"])
                color.setAlpha(alpha)
                
                # Create path for rounded rectangle
                path = QPainterPath()
                path.addRoundedRect(x, y, param_width * value, param_height, 3 * self.scale_factor, 3 * self.scale_factor)
                
                # Create gradient
                gradient = QLinearGradient(x, y, x, y + param_height)
                gradient.setColorAt(0, color)
                gradient.setColorAt(1, color.darker(120))
                
                painter.fillPath(path, gradient)
                
                # Add subtle highlight
                highlight_height = 2 * self.scale_factor
                highlight_gradient = QLinearGradient(x, y, x, y + highlight_height)
                highlight_gradient.setColorAt(0, QColor(255, 255, 255, 50))
                highlight_gradient.setColorAt(1, QColor(255, 255, 255, 0))
                painter.fillRect(x, y, param_width * value, highlight_height, highlight_gradient)
    
    def _draw_effects(self, painter):
        """Draw active visual effects with improved scaling."""
        for name, effect in self.active_effects.items():
            if "track" in name:
                # Draw track trigger effect with modern style
                color = QColor(effect.color)
                color.setAlpha(int(255 * effect.intensity))
                
                # Create path for expanding circle
                radius = 50 * effect.intensity * self.scale_factor
                path = QPainterPath()
                path.addEllipse(effect.position, radius, radius)
                
                # Create gradient for glow effect
                gradient = QRadialGradient(
                    effect.position, radius * 1.5
                )
                gradient.setColorAt(0, color)
                gradient.setColorAt(0.7, color.darker(120))
                gradient.setColorAt(1, QColor(0, 0, 0, 0))
                
                painter.fillPath(path, gradient)
            
            elif "step" in name:
                # Draw step highlight effect with modern style
                color = QColor(effect.color)
                color.setAlpha(int(255 * effect.intensity))
                
                # Create path for pulsing rectangle
                size = 40 * (1 + effect.intensity * 0.2) * self.scale_factor
                path = QPainterPath()
                path.addRoundedRect(
                    effect.position.x() - size/2,
                    effect.position.y() - size/2,
                    size, size, 5 * self.scale_factor, 5 * self.scale_factor
                )
                
                # Create gradient
                gradient = QRadialGradient(
                    effect.position, size
                )
                gradient.setColorAt(0, color)
                gradient.setColorAt(0.7, color.darker(120))
                gradient.setColorAt(1, QColor(0, 0, 0, 0))
                
                painter.fillPath(path, gradient)
    
    def _draw_particles(self, painter):
        """Draw particle systems with improved scaling."""
        for particles in self.particle_systems.values():
            for particle in particles:
                if "life" in particle:
                    # Draw particle with modern style
                    color = QColor(particle["color"])
                    color.setAlpha(particle["alpha"])
                    
                    # Create path for particle
                    pos = particle["position"]
                    size = particle["size"] * self.scale_factor
                    path = QPainterPath()
                    path.addEllipse(pos, size, size)
                    
                    # Create gradient
                    gradient = QRadialGradient(pos, size * 1.5)
                    gradient.setColorAt(0, color)
                    gradient.setColorAt(0.7, color.darker(120))
                    gradient.setColorAt(1, QColor(0, 0, 0, 0))
                    
                    painter.fillPath(path, gradient)
                
                elif "radius" in particle:
                    # Draw ripple with modern style
                    color = QColor(particle["color"])
                    color.setAlpha(particle["alpha"])
                    
                    # Create path for ripple
                    pos = QPointF(self.width()/2, self.height()/2)
                    radius = particle["radius"] * self.scale_factor
                    path = QPainterPath()
                    path.addEllipse(pos, radius, radius)
                    
                    # Create gradient
                    gradient = QRadialGradient(pos, radius * 1.5)
                    gradient.setColorAt(0, QColor(0, 0, 0, 0))
                    gradient.setColorAt(0.7, color)
                    gradient.setColorAt(1, QColor(0, 0, 0, 0))
                    
                    painter.fillPath(path, gradient)
    
    def _draw_overlay(self, painter):
        """Draw overlay information with improved scaling."""
        # Draw title with modern style
        painter.setFont(self.title_font)
        
        # Create gradient for title
        title_gradient = QLinearGradient(10, 10, 10 + 200, 10)
        title_gradient.setColorAt(0, QColor(self.skin_manager.get_color("ACCENT")))
        title_gradient.setColorAt(1, QColor(self.skin_manager.get_color("ACCENT_LIGHTER")))
        
        painter.setPen(QPen(title_gradient, 1))
        painter.drawText(10, 40, "RythmoTron")
        
        # Draw status with modern style
        painter.setFont(self.value_font)
        painter.setPen(QColor(self.skin_manager.get_color("TEXT_SECONDARY")))
        status = f"Active Tracks: {len(self.active_tracks)}"
        painter.drawText(10, self.height() - 10, status)
    
    # Menu action handlers
    def _on_new(self):
        """Handle new action."""
        # Reset all tracks and parameters
        self.active_tracks.clear()
        self.highlighted_steps.clear()
        self.parameter_values.clear()
        self.active_effects.clear()
        self.particle_systems.clear()
        self.update()
    
    def _on_open(self):
        """Handle open action."""
        # This would typically open a file dialog and load a project
        # For now, just show a message
        print("Open project")
    
    def _on_save(self):
        """Handle save action."""
        # This would typically save the current project
        # For now, just show a message
        print("Save project")
    
    def _on_exit(self):
        """Handle exit action."""
        # Close the application
        self.close()
    
    def _on_undo(self):
        """Handle undo action."""
        # Undo the last action
        print("Undo")
    
    def _on_redo(self):
        """Handle redo action."""
        # Redo the last undone action
        print("Redo")
    
    def _on_fullscreen(self):
        """Handle fullscreen action."""
        # Toggle fullscreen mode
        if self.isFullScreen():
            self.showNormal()
        else:
            self.showFullScreen()
    
    def _on_about(self):
        """Handle about action."""
        # Show about dialog
        print("About RythmoTron")
    
    # Playback controls
    def _on_play_clicked(self, checked):
        """Handle play button click."""
        if checked:
            # Start playback
            print("Play")
            # Trigger some effects to show it's working
            self._trigger_playback_effects()
        else:
            # Pause playback
            print("Pause")
    
    def _on_stop_clicked(self):
        """Handle stop button click."""
        # Stop playback
        self.play_button.setChecked(False)
        print("Stop")
    
    def _on_tempo_changed(self, value):
        """Handle tempo change."""
        # Update tempo
        print(f"Tempo: {value} BPM")
    
    # Track controls
    def _on_track_mute(self, track, checked):
        """Handle track mute toggle."""
        if checked:
            # Mute track
            print(f"Mute {track.value}")
        else:
            # Unmute track
            print(f"Unmute {track.value}")
    
    def _on_track_solo(self, track, checked):
        """Handle track solo toggle."""
        if checked:
            # Solo track
            print(f"Solo {track.value}")
        else:
            # Unsolo track
            print(f"Unsolo {track.value}")
    
    def _on_track_volume(self, track, value):
        """Handle track volume change."""
        # Update track volume
        print(f"{track.value} volume: {value}")
    
    # Master controls
    def _on_master_mute(self, checked):
        """Handle master mute toggle."""
        if checked:
            # Mute master
            print("Mute master")
        else:
            # Unmute master
            print("Unmute master")
    
    def _on_master_volume(self, value):
        """Handle master volume change."""
        # Update master volume
        print(f"Master volume: {value}")
    
    # Effect triggers
    def _trigger_playback_effects(self):
        """Trigger effects to show playback is working."""
        # Trigger some random effects
        import random
        
        # Trigger a track effect
        track = random.choice(list(Track))
        self.track_triggered.emit(track, True)
        
        # Trigger a step highlight
        step = random.randint(0, 15)
        self.step_highlighted.emit(step, True)
        
        # Trigger a parameter change
        param = random.choice(["Tempo", "Swing", "Drive"])
        value = random.random()
        self.parameter_changed.emit(param, value)
        
        # Trigger a visual effect
        effect_name = f"effect_{random.randint(1, 5)}"
        intensity = random.random()
        color = self.skin_manager.get_color("ACCENT")
        position = QPointF(random.randint(0, self.width()), random.randint(0, self.height()))
        size = random.randint(10, 50)
        self.effect_triggered.emit(effect_name, intensity, color, position, size)
    
    def _on_track_triggered(self, track: Track, is_triggered: bool):
        """Handle track trigger events."""
        if is_triggered:
            self.active_tracks.add(track)
        else:
            self.active_tracks.discard(track)
        self.update()
    
    def _on_step_highlighted(self, step: int, is_highlighted: bool):
        """Handle step highlight events."""
        if is_highlighted:
            self.highlighted_steps.add(step)
        else:
            self.highlighted_steps.discard(step)
        self.update()
    
    def _on_parameter_changed(self, name: str, value: float):
        """Handle parameter change events."""
        self.parameter_values[name] = value
        self.update()
    
    def _on_effect_triggered(self, name: str, intensity: float, color: str, position: QPointF, size: float):
        """Handle effect trigger events."""
        self.active_effects[name] = {
            "intensity": intensity,
            "color": color,
            "position": position,
            "size": size
        }
        self.update()
    
    def update_display(self):
        """Force a redraw of the display."""
        self.update() 