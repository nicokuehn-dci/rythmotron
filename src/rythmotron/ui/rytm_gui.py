"""
RythmoTron - Main GUI Application

This module provides the main GUI application for the RythmoTron.
It integrates all the sections of the interface into a cohesive application.
"""

import sys
from PySide6.QtWidgets import QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QApplication
from PySide6.QtCore import Qt, QTimer
import logging
from PySide6.QtGui import QIcon
from PySide6.QtCore import Signal
import PySide6.QtCore as QtCore                

from .sections.top_section import TopBarSection as TopSection
from .sections.pads_section import PadsSection
from .sections.display_section import DisplaySection
from .sections.sequencer_section import SequencerSection
from .sections.parameters_section import ParametersSection
from .sections.modes_section import ModesSection
from ..constants import Track
from ..style import Colors


class RythmGUI(QMainWindow):
    """
    Main window for the RythmoTron application.
    Integrates all UI sections and handles global events.
    """
    
    def __init__(self):
        """Initialize the RythmoTron main window."""
        super().__init__()
        self.setWindowTitle("RythmoTron")
        self.setMinimumSize(1200, 800)
        
        # Initialize instance variables
        self.current_track = Track.BD
        self.current_parameter_page = "SYNTH"
        self.is_playing = False
        self.is_recording = False
        self.current_step = -1
        
        # Set up the main layout and UI components
        self.setup_ui()
        
        # Set up timers for animations and UI updates
        self.setup_timers()
        
        # Set initial application state
        self.apply_global_style()
        
    def setup_ui(self):
        """Set up the main UI structure"""
        # Central widget and main layout
        central_widget = QWidget()
        central_widget.setStyleSheet(f"background-color: {Colors.BACKGROUND};")
        
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        main_layout.setContentsMargins(10, 10, 10, 10)
        
        # Create UI sections
        
        # Top section (project info, transport, etc.)
        self.top_section = TopSection()
        self.top_section.play_clicked.connect(self.on_play_pressed)
        self.top_section.stop_clicked.connect(self.on_stop_pressed)
        self.top_section.record_clicked.connect(self.on_record_pressed)
        self.top_section.volume_changed.connect(self.on_master_volume_changed)
        self.top_section.tap_tempo_clicked.connect(self.on_tap_tempo)
        main_layout.addWidget(self.top_section)
        
        # Center section (pads and display)
        center_section = QHBoxLayout()
        center_section.setSpacing(10)
        
        # Pads section
        self.pads_section = PadsSection()
        self.pads_section.pad_pressed.connect(self.on_pad_pressed)
        self.pads_section.pad_triggered.connect(self.on_pad_triggered)
        center_section.addWidget(self.pads_section)
        
        # Display section
        self.display_section = DisplaySection()
        self.display_section.page_changed.connect(self.on_display_page_changed)
        center_section.addWidget(self.display_section, 1)  # Display takes more space
        
        main_layout.addLayout(center_section, 1)  # Center section takes more vertical space
        
        # Bottom section (modes, sequencer, parameter knobs)
        bottom_section = QHBoxLayout()
        bottom_section.setSpacing(10)
        
        # Modes section
        self.modes_section = ModesSection()
        self.modes_section.mode_toggled.connect(self.on_mode_toggled)
        self.modes_section.track_selected.connect(self.on_track_selected)
        bottom_section.addWidget(self.modes_section)
        
        # Sequencer section
        self.sequencer_section = SequencerSection()
        self.sequencer_section.step_toggled.connect(self.on_step_toggled)
        self.sequencer_section.page_changed.connect(self.on_page_changed)
        self.sequencer_section.scale_changed.connect(self.on_scale_changed)
        bottom_section.addWidget(self.sequencer_section, 1)  # Sequencer takes more space
        
        # Parameters section
        self.params_section = ParametersSection()
        self.params_section.parameter_changed.connect(self.on_parameter_changed)
        self.params_section.page_selected.connect(self.on_parameter_page_selected)
        bottom_section.addWidget(self.params_section)
        
        main_layout.addLayout(bottom_section)
        
        # Set the central widget
        self.setCentralWidget(central_widget)
        
    def apply_global_style(self):
        """Apply global stylesheet to the application"""
        self.setStyleSheet(f"""
            QMainWindow {{
                background-color: {Colors.BACKGROUND};
            }}
            QWidget {{
                color: {Colors.TEXT_PRIMARY};
            }}
            QFrame {{
                border-radius: 4px;
            }}
        """)
        
    def setup_timers(self):
        """Set up timers for UI updates and animations"""
        # UI update timer - 60fps (16ms)
        self.ui_timer = QTimer(self)
        self.ui_timer.setInterval(16)
        self.ui_timer.timeout.connect(self.update_ui)
        self.ui_timer.start()
        
        # Pad animation timer - 20fps (50ms)
        self.pad_animation_timer = QTimer(self)
        self.pad_animation_timer.setInterval(50)
        self.pad_animation_timer.timeout.connect(self.update_pad_animations)
        self.pad_animation_timer.start()
    
    # Event handlers
    def on_pad_pressed(self, track):
        """Handle drum pad press events"""
        self.current_track = track
        
        # Update pad visuals in the pad section
        self.pads_section.set_current_track(track)
        
        # Also update track in the modes section
        self.modes_section.set_current_track(track)
        
        # In a real app, we would play the sound here
        print(f"Pad pressed: {track.value}")
        
    def on_pad_triggered(self, track, velocity):
        """Handle pad trigger events from sequencer"""
        # In a real app, we would play the sound here with given velocity
        print(f"Pad triggered: {track.value} with velocity {velocity}")
        
    def on_step_toggled(self, step, is_active):
        """Handle step button press events"""
        # Set trigger for the step in the current track
        self.sequencer_section.set_step_trigger(step, is_active)
        
        # In a real app, we would update the pattern data
        print(f"Step {step + 1} toggled: {is_active}")
        
    def on_parameter_page_selected(self, page):
        """Handle parameter page button press"""
        self.current_parameter_page = page
        
        # Update the display to show the selected page
        self.display_section.set_page(page)
        
        print(f"Parameter page selected: {page}")
        
    def on_parameter_changed(self, param_name, value):
        """Handle parameter value changes"""
        # Update parameter value in the display
        self.display_section.set_parameter_value(param_name, value)
        
        # Highlight the parameter in the display
        self.display_section.highlight_parameter(param_name, True)
        
        print(f"Parameter {param_name} changed to: {value}")
        
    def on_display_page_changed(self, page):
        """Handle display page changes"""
        # Update parameter section to match
        self.params_section._on_page_selected(page)
        
    def on_master_volume_changed(self, volume):
        """Handle master volume changes"""
        # In a real app, we would update the audio engine volume
        print(f"Master volume: {volume}")
        
    def on_play_pressed(self):
        """Start pattern playback"""
        self.is_playing = True
        self.current_step = 0
        
        # Update transport controls to show playing state
        self.top_section.set_playing_state(True)
        
        print("Play pressed")
        
    def on_stop_pressed(self):
        """Stop pattern playback"""
        self.is_playing = False
        self.current_step = -1
        
        # Update transport controls to show stopped state
        self.top_section.set_playing_state(False)
        
        # Reset current step indicator
        self.sequencer_section.set_current_step(-1)
            
        print("Stop pressed")
        
    def on_record_pressed(self):
        """Toggle recording mode"""
        self.is_recording = not self.is_recording
        
        # Update transport controls to show recording state
        self.top_section.set_recording_state(self.is_recording)
        
        print(f"Record {'activated' if self.is_recording else 'deactivated'}")
        
    def on_mode_toggled(self, mode_name, checked):
        """Handle mode button toggle"""
        # In a real app, we would update application behavior based on mode
        print(f"Mode {mode_name} toggled: {checked}")
        
    def on_track_selected(self, track):
        """Handle track selection from modes section"""
        # Update current track and pads section
        self.on_pad_pressed(track)
        
    def on_page_changed(self, page_index):
        """Handle sequencer page change"""
        print(f"Sequencer page changed to: {page_index + 1}")
        
    def on_scale_changed(self, scale):
        """Handle sequencer scale changes"""
        print(f"Scale changed to: {scale}")
        
    def on_tap_tempo(self):
        """Handle tap tempo button press"""
        # In a real app, we would calculate tempo from taps
        print("Tap tempo pressed")
        
    # Animation and update methods
    def update_ui(self):
        """Update UI elements based on current state"""
        # Update sequencer position if playing
        if self.is_playing:
            # Advance current step every 4 timer ticks (adjust for actual tempo)
            self.update_counter = getattr(self, 'update_counter', 0) + 1
            if self.update_counter >= 15:  # About 250ms at 60fps
                self.update_counter = 0
                
                # Advance sequencer
                self.current_step = (self.current_step + 1) % 16
                
                # Update current step indicator
                self.sequencer_section.set_current_step(self.current_step)
                
                # Trigger pads that have steps
                # In a real implementation, we would check which tracks have triggers
                # For now, just trigger the current track
                if self.sequencer_section.step_buttons[self.current_step].has_trigger:
                    self.pads_section.trigger_pad(self.current_track, 100)
                    
    def update_pad_animations(self):
        """Update pad animations for visual feedback"""
        # Update pad animations in the pads section
        self.pads_section.update_animations()