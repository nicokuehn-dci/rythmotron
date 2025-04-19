"""
ARythm-EMU Layout Manager
Handles the hardware-inspired layout of the application's UI components.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QGridLayout, 
    QLabel, QPushButton, QDial, QSlider, QFrame,
    QGroupBox, QScrollArea, QSpacerItem, QSizePolicy
)
from PySide6.QtCore import Qt, Signal, QSize
from PySide6.QtGui import QColor, QPainter, QPen, QFont, QFontMetrics, QPainterPath

from .style import Colors, StyleSheets
from .controls.button_components import TrigButton, ParameterPageButton


class VirtualPad(QPushButton):
    """A virtual drum pad that can be pressed and show different states."""
    
    def __init__(self, track_name, track_color, parent=None):
        super().__init__(parent)
        self.track_name = track_name
        self.track_color = track_color
        self.is_selected = False
        self.is_active = False
        self.velocity = 0
        self.aftertouch = 0
        self.is_triggered = False
        self.trigger_countdown = 0
        
        # Configure appearance
        self.setFixedSize(70, 70)
        self.setText(track_name)
        self.setCheckable(True)
        
    def setSelected(self, selected):
        """Set whether this pad is selected (current track)."""
        self.is_selected = selected
        self.update()
        
    def setActive(self, active):
        """Set whether this pad is active (has sound)."""
        self.is_active = active
        self.update()
        
    def setVelocity(self, velocity):
        """Set velocity value (0-127) for visual feedback."""
        self.velocity = min(127, max(0, velocity))
        self.update()
        
    def setAftertouch(self, aftertouch):
        """Set aftertouch value (0-127) for visual feedback."""
        self.aftertouch = min(127, max(0, aftertouch))
        self.update()
        
    def triggerVisualFeedback(self):
        """Trigger a visual flash for sequencer playback."""
        self.is_triggered = True
        self.trigger_countdown = 5  # Will count down in timer events
        self.update()
        
    def decrementTrigger(self):
        """Count down the trigger visual feedback."""
        if self.trigger_countdown > 0:
            self.trigger_countdown -= 1
            if self.trigger_countdown == 0:
                self.is_triggered = False
            self.update()
            
    def paintEvent(self, event):
        """Custom paint event to draw the pad with visual feedback."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect().adjusted(2, 2, -2, -2)
        
        # Draw base pad
        base_color = QColor(self.track_color)
        if not self.is_active:
            base_color.setAlpha(60)  # Dim if inactive
        
        # Border radius for rounded corners
        border_radius = 10
        
        # Draw background
        path = QPainterPath()
        path.addRoundedRect(rect, border_radius, border_radius)
        painter.fillPath(path, QColor(Colors.SURFACE))
        
        # Draw border
        border_pen = QPen(base_color)
        border_pen.setWidth(2)
        painter.setPen(border_pen)
        painter.drawRoundedRect(rect, border_radius, border_radius)
        
        # Selected state (current track)
        if self.is_selected:
            # Draw a red border around the selected track
            select_pen = QPen(QColor("#FF3333"))
            select_pen.setWidth(3)
            painter.setPen(select_pen)
            painter.drawRoundedRect(rect.adjusted(1, 1, -1, -1), border_radius, border_radius)
        
        # Pressed state (isDown)
        if self.isDown() or self.isChecked():
            # Fill with track color when pressed
            inner_rect = rect.adjusted(3, 3, -3, -3)
            
            # Fill with gradient based on velocity if available
            intensity = self.velocity / 127 if self.velocity > 0 else 0.8
            
            # Make color brighter based on velocity
            glow_color = QColor(self.track_color)
            if intensity < 0.5:
                glow_color = glow_color.darker(150 - intensity * 100)
            else:
                glow_color = glow_color.lighter(100 + intensity * 50)
                
            painter.fillRect(inner_rect, glow_color)
            
        # Triggered by sequencer
        if self.is_triggered:
            # Flash white when triggered by sequencer
            flash_color = QColor("#FFFFFF")
            flash_color.setAlpha(180 - (5 - self.trigger_countdown) * 30)  # Fade out
            painter.fillRect(rect.adjusted(5, 5, -5, -5), flash_color)
        
        # Draw text
        painter.setPen(QColor(Colors.TEXT_PRIMARY))
        painter.drawText(rect, Qt.AlignCenter, self.track_name)


class VirtualKnob(QDial):
    """A custom knob control with visual feedback."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(60, 60)
        self.setNotchesVisible(True)
        self.setWrapping(False)
        self.setRange(0, 127)
        self.setSingleStep(1)
        self.setPageStep(5)
        self.setValue(64)  # Default center value
        
        # Appearance settings
        self.knob_color = QColor(Colors.SURFACE)
        self.indicator_color = QColor(Colors.ACCENT)
        self.is_active = False
        
    def setActive(self, active):
        """Set whether this knob is active/focused."""
        self.is_active = active
        self.update()
        
    def paintEvent(self, event):
        """Custom paint event to draw the knob."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # Get the rect to draw in
        rect = self.rect()
        center = rect.center()
        radius = min(rect.width(), rect.height()) / 2 - 5
        
        # Draw knob base
        painter.setBrush(self.knob_color)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(center, radius, radius)
        
        # Draw border
        border_color = QColor(Colors.ACCENT) if self.is_active else QColor(Colors.GRID_LINES)
        border_pen = QPen(border_color)
        border_pen.setWidth(2)
        painter.setPen(border_pen)
        painter.drawEllipse(center, radius, radius)
        
        # Calculate angle based on value
        angle = (self.value() - self.minimum()) * 270 / (self.maximum() - self.minimum()) - 225
        
        # Draw indicator line
        painter.save()
        painter.translate(center)
        painter.rotate(angle)
        
        indicator_pen = QPen(self.indicator_color)
        indicator_pen.setWidth(3)
        painter.setPen(indicator_pen)
        painter.drawLine(0, 0, 0, -radius + 5)
        
        painter.restore()
        
        # Draw value indicator dot at end of line
        dot_x = center.x() + (radius - 8) * -1 * (angle - 90) * 3.14159 / 180
        dot_y = center.y() + (radius - 8) * -1 * (angle + 180) * 3.14159 / 180
        
        painter.setBrush(self.indicator_color)
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(int(dot_x), int(dot_y), 6, 6)


class DisplayArea(QFrame):
    """Main display area that shows parameters and other content."""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFrameShape(QFrame.StyledPanel)
        self.setMinimumSize(400, 250)
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        
        # Main layout
        self.main_layout = QVBoxLayout(self)
        
        # Header
        self.header_label = QLabel("SYNTH PARAMETERS")
        self.header_label.setAlignment(Qt.AlignCenter)
        self.main_layout.addWidget(self.header_label)
        
        # Content area - will be filled by specific views
        self.content_widget = QWidget()
        self.content_layout = QGridLayout(self.content_widget)
        
        self.main_layout.addWidget(self.content_widget)
        
        # Start with parameter display
        self.show_parameter_page("SYNTH")
        
    def show_parameter_page(self, page_name):
        """Show a parameter page with 8 parameters."""
        # Clear existing content
        while self.content_layout.count():
            item = self.content_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        self.header_label.setText(f"{page_name} PARAMETERS")
        
        # Mock parameters based on page
        params = []
        if page_name == "SYNTH":
            params = [("OSC TYPE", "SINE"), ("TUNE", "0"), ("DECAY", "64"), 
                     ("SWEEP", "0"), ("HARM", "32"), ("NOISE", "0"),
                     ("CLICK", "50"), ("BOOST", "0")]
        elif page_name == "SAMPLE":
            params = [("SAMPLE", "KICK_01"), ("TUNE", "0"), ("START", "0"), 
                     ("LENGTH", "100"), ("LOOP", "OFF"), ("LEVEL", "100"),
                     ("DIST", "0"), ("RATE", "1X")]
        elif page_name == "FILTER":
            params = [("TYPE", "LP2"), ("CUTOFF", "120"), ("RES", "0"), 
                     ("ENV", "64"), ("ATTACK", "0"), ("DECAY", "64"),
                     ("TRAK", "0"), ("LFO", "0")]
        elif page_name == "AMP":
            params = [("ATTACK", "0"), ("HOLD", "0"), ("DECAY", "64"), 
                     ("OVER", "0"), ("DELAY", "0"), ("REV", "0"),
                     ("PAN", "C"), ("VOL", "100")]
        else:
            params = [(f"PARAM {i+1}", str(64)) for i in range(8)]
            
        # Create parameter displays
        for i, (name, value) in enumerate(params):
            row = i // 4
            col = i % 4
            
            param_frame = QFrame()
            param_layout = QVBoxLayout(param_frame)
            
            name_label = QLabel(name)
            name_label.setAlignment(Qt.AlignCenter)
            param_layout.addWidget(name_label)
            
            value_label = QLabel(value)
            value_label.setAlignment(Qt.AlignCenter)
            value_label.setStyleSheet(f"color: {Colors.ACCENT}; font-size: 14pt; font-weight: bold;")
            param_layout.addWidget(value_label)
            
            self.content_layout.addWidget(param_frame, row, col)
            
    def show_kit_browser(self):
        """Show kit browser view."""
        # Clear existing content
        while self.content_layout.count():
            item = self.content_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()
                
        self.header_label.setText("KIT BROWSER")
        
        # Mock kit list
        kits = ["INIT KIT", "TECHNO BASICS", "HOUSE ESSENTIALS", "TRAP KIT", "ELECTRO"]
        
        kit_list_widget = QWidget()
        kit_list_layout = QVBoxLayout(kit_list_widget)
        
        for kit_name in kits:
            kit_btn = QPushButton(kit_name)
            kit_btn.setStyleSheet(StyleSheets.BUTTON)
            kit_list_layout.addWidget(kit_btn)
            
        kit_list_layout.addStretch()
        
        self.content_layout.addWidget(kit_list_widget, 0, 0, 2, 4)
        
    def show_sample_browser(self):
        """Show sample browser view."""
        # Similar to kit browser but for samples
        pass


class LayoutManager:
    """Manages the overall layout of the ARythm-EMU interface."""
    
    def __init__(self, parent_widget):
        self.parent = parent_widget
        self.main_layout = QVBoxLayout(parent_widget)
        self.main_layout.setSpacing(10)
        self.main_layout.setContentsMargins(10, 10, 10, 10)
        
        # 1. Top section - Global controls
        self.create_top_section()
        
        # 2. Center section - Pads & Display
        self.create_center_section()
        
        # 3. Bottom section - Sequencer & Controls
        self.create_bottom_section()
        
    def create_top_section(self):
        """Create the top section with global controls."""
        top_frame = QFrame()
        top_frame.setFrameShape(QFrame.StyledPanel)
        top_frame.setStyleSheet(f"background-color: {Colors.BACKGROUND_DARK};")
        top_layout = QHBoxLayout(top_frame)
        
        # Project info
        project_info = QFrame()
        project_layout = QVBoxLayout(project_info)
        
        project_label = QLabel("PROJECT:")
        project_name = QLabel("NEW PROJECT")
        project_name.setStyleSheet(f"color: {Colors.TEXT_PRIMARY}; font-weight: bold;")
        
        kit_label = QLabel("KIT:")
        kit_name = QLabel("TEST KIT")
        kit_name.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        
        pattern_label = QLabel("PATTERN:")
        pattern_name = QLabel("TEST PATTERN")
        pattern_name.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        
        project_layout.addWidget(project_label)
        project_layout.addWidget(project_name)
        project_layout.addWidget(kit_label)
        project_layout.addWidget(kit_name)
        project_layout.addWidget(pattern_label)
        project_layout.addWidget(pattern_name)
        
        top_layout.addWidget(project_info)
        
        # Tempo and time signature
        tempo_frame = QFrame()
        tempo_layout = QVBoxLayout(tempo_frame)
        
        tempo_label = QLabel("TEMPO")
        tempo_layout.addWidget(tempo_label)
        
        tempo_display = QLabel("120.0")
        tempo_display.setStyleSheet("font-size: 24pt; font-weight: bold;")
        tempo_layout.addWidget(tempo_display)
        
        tap_button = QPushButton("TAP")
        tap_button.setStyleSheet(StyleSheets.ACCENT_BUTTON)
        tempo_layout.addWidget(tap_button)
        
        top_layout.addWidget(tempo_frame)
        
        # Master volume
        volume_frame = QFrame()
        volume_layout = QVBoxLayout(volume_frame)
        
        volume_label = QLabel("MASTER VOLUME")
        volume_layout.addWidget(volume_label)
        
        volume_knob = VirtualKnob()
        volume_knob.setRange(0, 127)
        volume_knob.setValue(100)
        volume_layout.addWidget(volume_knob, 0, Qt.AlignHCenter)
        
        volume_value = QLabel("100")
        volume_value.setStyleSheet(f"color: {Colors.ACCENT}; font-weight: bold;")
        volume_value.setAlignment(Qt.AlignCenter)
        volume_layout.addWidget(volume_value)
        
        top_layout.addWidget(volume_frame)
        
        # Transport controls
        transport_frame = QFrame()
        transport_layout = QHBoxLayout(transport_frame)
        
        play_button = QPushButton("PLAY")
        play_button.setStyleSheet(StyleSheets.TRANSPORT_BUTTON)
        play_button.setObjectName("play_button")
        play_button.setFixedSize(60, 60)
        transport_layout.addWidget(play_button)
        
        stop_button = QPushButton("STOP")
        stop_button.setStyleSheet(StyleSheets.TRANSPORT_BUTTON)
        stop_button.setFixedSize(60, 60)
        transport_layout.addWidget(stop_button)
        
        rec_button = QPushButton("REC")
        rec_button.setStyleSheet(StyleSheets.TRANSPORT_BUTTON)
        rec_button.setFixedSize(60, 60)
        transport_layout.addWidget(rec_button)
        
        top_layout.addWidget(transport_frame)
        
        self.main_layout.addWidget(top_frame)
        
    def create_center_section(self):
        """Create the center section with pads and display."""
        center_frame = QFrame()
        center_layout = QHBoxLayout(center_frame)
        
        # Left: Virtual Pads
        pads_frame = QFrame()
        pads_layout = QGridLayout(pads_frame)
        pads_layout.setSpacing(5)
        
        from .constants import Track, TRACK_COLORS
        
        self.pads = {}
        track_list = list(Track)
        
        for i, track in enumerate(track_list[:12]):  # First 12 tracks (not FX)
            row = i // 3
            col = i % 3
            
            pad = VirtualPad(track.name, TRACK_COLORS[track])
            pads_layout.addWidget(pad, row, col)
            self.pads[track] = pad
            
        center_layout.addWidget(pads_frame)
        
        # Right: Main Display
        self.display_area = DisplayArea()
        center_layout.addWidget(self.display_area)
        
        self.main_layout.addWidget(center_frame)
        
    def create_bottom_section(self):
        """Create the bottom section with sequencer and parameter controls."""
        bottom_frame = QFrame()
        bottom_layout = QHBoxLayout(bottom_frame)
        
        # Left: Mode buttons & Track select
        modes_frame = QFrame()
        modes_layout = QVBoxLayout(modes_frame)
        
        # Mode buttons
        mode_buttons_layout = QHBoxLayout()
        
        mute_button = QPushButton("MUTE")
        mute_button.setCheckable(True)
        mute_button.setStyleSheet(StyleSheets.BUTTON)
        mode_buttons_layout.addWidget(mute_button)
        
        chrom_button = QPushButton("CHROM")
        chrom_button.setCheckable(True)
        chrom_button.setStyleSheet(StyleSheets.BUTTON)
        mode_buttons_layout.addWidget(chrom_button)
        
        modes_layout.addLayout(mode_buttons_layout)
        
        mode_buttons_layout2 = QHBoxLayout()
        
        scene_button = QPushButton("SCENE")
        scene_button.setCheckable(True)
        scene_button.setStyleSheet(StyleSheets.BUTTON)
        mode_buttons_layout2.addWidget(scene_button)
        
        perf_button = QPushButton("PERF")
        perf_button.setCheckable(True)
        perf_button.setStyleSheet(StyleSheets.BUTTON)
        mode_buttons_layout2.addWidget(perf_button)
        
        modes_layout.addLayout(mode_buttons_layout2)
        
        # Track select
        track_label = QLabel("TRACK SELECT")
        track_label.setAlignment(Qt.AlignCenter)
        modes_layout.addWidget(track_label)
        
        track_scroll = QScrollArea()
        track_scroll.setWidgetResizable(True)
        track_scroll.setFixedHeight(100)
        track_scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        
        track_widget = QWidget()
        track_layout = QVBoxLayout(track_widget)
        
        from .constants import Track, TRACK_COLORS
        
        for track in Track:
            track_btn = QPushButton(track.name)
            track_btn.setStyleSheet(f"background-color: {TRACK_COLORS[track]}; color: black;")
            track_layout.addWidget(track_btn)
            
        track_layout.addStretch()
        track_scroll.setWidget(track_widget)
        modes_layout.addWidget(track_scroll)
        
        bottom_layout.addWidget(modes_frame)
        
        # Center: Sequencer area
        sequencer_frame = QFrame()
        sequencer_layout = QVBoxLayout(sequencer_frame)
        
        # Trig buttons in a grid
        trig_grid = QWidget()
        trig_layout = QGridLayout(trig_grid)
        trig_layout.setSpacing(3)
        
        self.trig_buttons = []
        for i in range(16):
            row = i // 8
            col = i % 8
            
            trig = TrigButton(i)
            trig_layout.addWidget(trig, row, col)
            self.trig_buttons.append(trig)
            
        sequencer_layout.addWidget(trig_grid)
        
        # Page/Scale controls
        page_control_layout = QHBoxLayout()
        
        page_label = QLabel("PAGE:")
        page_control_layout.addWidget(page_label)
        
        for i in range(4):
            page_led = QFrame()
            page_led.setFixedSize(15, 15)
            page_led.setStyleSheet(f"background-color: {Colors.BACKGROUND_LIGHT}; border-radius: 7px;")
            page_control_layout.addWidget(page_led)
            
        page_control_layout.addStretch()
        
        scale_label = QLabel("SCALE:")
        page_control_layout.addWidget(scale_label)
        
        scale_combo = QComboBox()
        scale_combo.setStyleSheet(StyleSheets.COMBO_BOX)
        scale_combo.addItems(["1/16", "1/8", "1/8T", "1/4"])
        page_control_layout.addWidget(scale_combo)
        
        sequencer_layout.addLayout(page_control_layout)
        
        bottom_layout.addWidget(sequencer_frame)
        
        # Right: Parameter knobs & page select
        params_frame = QFrame()
        params_layout = QVBoxLayout(params_frame)
        
        # Page select buttons
        page_buttons_layout = QHBoxLayout()
        
        self.page_buttons = []
        for page in ["SYNTH", "SAMPLE", "FILTER", "AMP", "LFO"]:
            page_btn = ParameterPageButton(page)
            page_btn.setStyleSheet(StyleSheets.BUTTON)
            page_buttons_layout.addWidget(page_btn)
            self.page_buttons.append(page_btn)
            
        params_layout.addLayout(page_buttons_layout)
        
        # Parameter knobs
        knobs_grid = QWidget()
        knobs_layout = QGridLayout(knobs_grid)
        knobs_layout.setSpacing(5)
        
        self.param_knobs = []
        for i in range(8):
            row = i // 4
            col = i % 4
            
            knob = VirtualKnob()
            knobs_layout.addWidget(knob, row, col, Qt.AlignCenter)
            self.param_knobs.append(knob)
            
        params_layout.addWidget(knobs_grid)
        
        bottom_layout.addWidget(params_frame)
        
        self.main_layout.addWidget(bottom_frame)
        
    def connect_signals(self, main_window):
        """Connect UI signals to main window slots."""
        # Connect page buttons to display area
        for btn in self.page_buttons:
            btn.clicked.connect(
                lambda checked, name=btn.page_name: self.display_area.show_parameter_page(name)
            )
            
        # Other connections would go here