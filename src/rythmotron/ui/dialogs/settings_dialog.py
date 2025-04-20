"""
Settings dialog for RythmoTron.
Provides configuration options for audio and MIDI devices.
"""

from PySide6.QtWidgets import (QDialog, QVBoxLayout, QHBoxLayout, QLabel,
                              QComboBox, QPushButton, QTabWidget, QWidget,
                              QSpinBox, QGroupBox, QFormLayout)
from PySide6.QtCore import Qt

from ...audio.engine import AudioEngine
from ...midi.engine import MIDIEngine
from ...style import Colors

class SettingsDialog(QDialog):
    """Dialog for configuring audio and MIDI settings."""
    
    def __init__(self, audio_engine: AudioEngine, midi_engine: MIDIEngine, parent=None):
        super().__init__(parent)
        self.audio_engine = audio_engine
        self.midi_engine = midi_engine
        
        self.setWindowTitle("Settings")
        self.setMinimumWidth(400)
        self.setup_ui()
    
    def setup_ui(self):
        """Set up the user interface."""
        layout = QVBoxLayout(self)
        
        # Create tab widget
        tabs = QTabWidget()
        tabs.setStyleSheet(f"""
            QTabWidget::pane {{
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
            }}
            QTabBar::tab {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                padding: 8px 16px;
                border: 1px solid {Colors.GRID_LINES};
                border-bottom: none;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }}
            QTabBar::tab:selected {{
                background-color: {Colors.SURFACE_HOVER};
                border-bottom: 2px solid {Colors.ACCENT};
            }}
        """)
        
        # Audio tab
        audio_tab = QWidget()
        audio_layout = QVBoxLayout(audio_tab)
        
        # Audio device selection
        audio_devices = QGroupBox("Audio Devices")
        audio_devices.setStyleSheet(f"""
            QGroupBox {{
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 4px;
                margin-top: 16px;
                padding-top: 16px;
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                subcontrol-position: top left;
                padding: 0 8px;
                color: {Colors.TEXT_PRIMARY};
            }}
        """)
        audio_devices_layout = QFormLayout(audio_devices)
        
        # Input device
        self.input_device_combo = QComboBox()
        self.input_device_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 4px;
            }}
        """)
        self._populate_input_devices()
        audio_devices_layout.addRow("Input Device:", self.input_device_combo)
        
        # Output device
        self.output_device_combo = QComboBox()
        self.output_device_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 4px;
            }}
        """)
        self._populate_output_devices()
        audio_devices_layout.addRow("Output Device:", self.output_device_combo)
        
        audio_layout.addWidget(audio_devices)
        
        # Audio settings
        audio_settings = QGroupBox("Audio Settings")
        audio_settings.setStyleSheet(audio_devices.styleSheet())
        audio_settings_layout = QFormLayout(audio_settings)
        
        # Sample rate
        self.sample_rate_spin = QSpinBox()
        self.sample_rate_spin.setRange(8000, 192000)
        self.sample_rate_spin.setSingleStep(1000)
        self.sample_rate_spin.setValue(int(self.audio_engine.sample_rate))
        self.sample_rate_spin.setStyleSheet(f"""
            QSpinBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 4px;
            }}
        """)
        audio_settings_layout.addRow("Sample Rate:", self.sample_rate_spin)
        
        # Block size
        self.block_size_spin = QSpinBox()
        self.block_size_spin.setRange(64, 4096)
        self.block_size_spin.setSingleStep(64)
        self.block_size_spin.setValue(self.audio_engine.block_size)
        self.block_size_spin.setStyleSheet(self.sample_rate_spin.styleSheet())
        audio_settings_layout.addRow("Block Size:", self.block_size_spin)
        
        audio_layout.addWidget(audio_settings)
        audio_layout.addStretch()
        
        # MIDI tab
        midi_tab = QWidget()
        midi_layout = QVBoxLayout(midi_tab)
        
        # MIDI input devices
        midi_inputs = QGroupBox("MIDI Input Devices")
        midi_inputs.setStyleSheet(audio_devices.styleSheet())
        midi_inputs_layout = QVBoxLayout(midi_inputs)
        
        self.midi_input_list = []
        for device in self.midi_engine.get_input_devices():
            checkbox = QPushButton(device.name)
            checkbox.setCheckable(True)
            checkbox.setChecked(device.id in self.midi_engine.active_inputs)
            checkbox.setStyleSheet(f"""
                QPushButton {{
                    background-color: {Colors.SURFACE};
                    color: {Colors.TEXT_PRIMARY};
                    border: 1px solid {Colors.GRID_LINES};
                    border-radius: 3px;
                    padding: 4px;
                    text-align: left;
                }}
                QPushButton:checked {{
                    background-color: {Colors.ACCENT};
                    color: {Colors.SURFACE};
                }}
            """)
            checkbox.clicked.connect(lambda checked, d=device: self._toggle_midi_input(d, checked))
            self.midi_input_list.append(checkbox)
            midi_inputs_layout.addWidget(checkbox)
        
        midi_layout.addWidget(midi_inputs)
        
        # MIDI output devices
        midi_outputs = QGroupBox("MIDI Output Devices")
        midi_outputs.setStyleSheet(audio_devices.styleSheet())
        midi_outputs_layout = QVBoxLayout(midi_outputs)
        
        self.midi_output_list = []
        for device in self.midi_engine.get_output_devices():
            checkbox = QPushButton(device.name)
            checkbox.setCheckable(True)
            checkbox.setChecked(device.id in self.midi_engine.active_outputs)
            checkbox.setStyleSheet(self.midi_input_list[0].styleSheet())
            checkbox.clicked.connect(lambda checked, d=device: self._toggle_midi_output(d, checked))
            self.midi_output_list.append(checkbox)
            midi_outputs_layout.addWidget(checkbox)
        
        midi_layout.addWidget(midi_outputs)
        midi_layout.addStretch()
        
        # Add tabs
        tabs.addTab(audio_tab, "Audio")
        tabs.addTab(midi_tab, "MIDI")
        layout.addWidget(tabs)
        
        # Buttons
        buttons = QHBoxLayout()
        buttons.addStretch()
        
        ok_button = QPushButton("OK")
        ok_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.ACCENT};
                color: {Colors.SURFACE};
                border: none;
                border-radius: 3px;
                padding: 8px 16px;
                min-width: 80px;
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
        """)
        ok_button.clicked.connect(self.accept)
        
        cancel_button = QPushButton("Cancel")
        cancel_button.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT_PRIMARY};
                border: 1px solid {Colors.GRID_LINES};
                border-radius: 3px;
                padding: 8px 16px;
                min-width: 80px;
            }}
            QPushButton:hover {{
                background-color: {Colors.SURFACE_HOVER};
            }}
        """)
        cancel_button.clicked.connect(self.reject)
        
        buttons.addWidget(cancel_button)
        buttons.addWidget(ok_button)
        layout.addLayout(buttons)
    
    def _populate_input_devices(self):
        """Populate the input device combo box."""
        self.input_device_combo.clear()
        for device in self.audio_engine.get_input_devices():
            self.input_device_combo.addItem(device.name, device.id)
        
        # Select current device if any
        if self.audio_engine.input_device:
            index = self.input_device_combo.findData(self.audio_engine.input_device.id)
            if index >= 0:
                self.input_device_combo.setCurrentIndex(index)
    
    def _populate_output_devices(self):
        """Populate the output device combo box."""
        self.output_device_combo.clear()
        for device in self.audio_engine.get_output_devices():
            self.output_device_combo.addItem(device.name, device.id)
        
        # Select current device if any
        if self.audio_engine.output_device:
            index = self.output_device_combo.findData(self.audio_engine.output_device.id)
            if index >= 0:
                self.output_device_combo.setCurrentIndex(index)
    
    def _toggle_midi_input(self, device, checked):
        """Toggle MIDI input device."""
        if checked:
            self.midi_engine.open_input(device.id)
        else:
            self.midi_engine.close_input(device.id)
    
    def _toggle_midi_output(self, device, checked):
        """Toggle MIDI output device."""
        if checked:
            self.midi_engine.open_output(device.id)
        else:
            self.midi_engine.close_output(device.id)
    
    def accept(self):
        """Apply settings when OK is clicked."""
        # Audio settings
        input_id = self.input_device_combo.currentData()
        if input_id is not None:
            self.audio_engine.set_input_device(input_id)
        
        output_id = self.output_device_combo.currentData()
        if output_id is not None:
            self.audio_engine.set_output_device(output_id)
        
        self.audio_engine.set_sample_rate(self.sample_rate_spin.value())
        self.audio_engine.set_block_size(self.block_size_spin.value())
        
        super().accept() 