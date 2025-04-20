from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QComboBox,
    QSlider, QPushButton, QGroupBox, QSpinBox, QCheckBox
)
from PySide6.QtCore import Qt, Signal
from ...constants import Track, TrackMode, DEFAULT_MIDI_CHANNEL
from ...tracks.track_manager import TrackManager

class TrackSettingsDialog(QDialog):
    """Dialog for configuring track settings."""
    
    settings_changed = Signal(Track)  # Emitted when settings are changed
    
    def __init__(self, track_manager: TrackManager, parent=None):
        super().__init__(parent)
        self.track_manager = track_manager
        self.current_track = track_manager.current_track
        
        self.setWindowTitle("Track Settings")
        self.setMinimumWidth(400)
        
        self._setup_ui()
        self._connect_signals()
        self._update_ui()
    
    def _setup_ui(self):
        """Set up the user interface."""
        layout = QVBoxLayout(self)
        
        # Mode selection
        mode_group = QGroupBox("Mode")
        mode_layout = QVBoxLayout(mode_group)
        self.mode_combo = QComboBox()
        for mode in TrackMode:
            self.mode_combo.addItem(mode.name, mode)
        mode_layout.addWidget(self.mode_combo)
        layout.addWidget(mode_group)
        
        # Volume and pan
        mixer_group = QGroupBox("Mixer")
        mixer_layout = QVBoxLayout(mixer_group)
        
        # Volume
        volume_layout = QHBoxLayout()
        volume_layout.addWidget(QLabel("Volume:"))
        self.volume_slider = QSlider(Qt.Horizontal)
        self.volume_slider.setRange(0, 100)
        volume_layout.addWidget(self.volume_slider)
        self.volume_label = QLabel("100%")
        volume_layout.addWidget(self.volume_label)
        mixer_layout.addLayout(volume_layout)
        
        # Pan
        pan_layout = QHBoxLayout()
        pan_layout.addWidget(QLabel("Pan:"))
        self.pan_slider = QSlider(Qt.Horizontal)
        self.pan_slider.setRange(-100, 100)
        pan_layout.addWidget(self.pan_slider)
        self.pan_label = QLabel("Center")
        pan_layout.addWidget(self.pan_label)
        mixer_layout.addLayout(pan_layout)
        
        # Mute and solo
        mute_solo_layout = QHBoxLayout()
        self.mute_check = QCheckBox("Mute")
        self.solo_check = QCheckBox("Solo")
        mute_solo_layout.addWidget(self.mute_check)
        mute_solo_layout.addWidget(self.solo_check)
        mute_solo_layout.addStretch()
        mixer_layout.addLayout(mute_solo_layout)
        
        layout.addWidget(mixer_group)
        
        # MIDI settings
        midi_group = QGroupBox("MIDI Settings")
        midi_layout = QVBoxLayout(midi_group)
        
        # MIDI note
        note_layout = QHBoxLayout()
        note_layout.addWidget(QLabel("Note:"))
        self.note_spin = QSpinBox()
        self.note_spin.setRange(0, 127)
        note_layout.addWidget(self.note_spin)
        note_layout.addStretch()
        midi_layout.addLayout(note_layout)
        
        # MIDI channel
        channel_layout = QHBoxLayout()
        channel_layout.addWidget(QLabel("Channel:"))
        self.channel_spin = QSpinBox()
        self.channel_spin.setRange(1, 16)
        self.channel_spin.setValue(DEFAULT_MIDI_CHANNEL)
        channel_layout.addWidget(self.channel_spin)
        channel_layout.addStretch()
        midi_layout.addLayout(channel_layout)
        
        layout.addWidget(midi_group)
        
        # Buttons
        button_layout = QHBoxLayout()
        self.ok_button = QPushButton("OK")
        self.cancel_button = QPushButton("Cancel")
        button_layout.addWidget(self.ok_button)
        button_layout.addWidget(self.cancel_button)
        layout.addLayout(button_layout)
    
    def _connect_signals(self):
        """Connect signals to slots."""
        self.mode_combo.currentIndexChanged.connect(self._on_mode_changed)
        self.volume_slider.valueChanged.connect(self._on_volume_changed)
        self.pan_slider.valueChanged.connect(self._on_pan_changed)
        self.mute_check.toggled.connect(self._on_mute_changed)
        self.solo_check.toggled.connect(self._on_solo_changed)
        self.note_spin.valueChanged.connect(self._on_note_changed)
        self.channel_spin.valueChanged.connect(self._on_channel_changed)
        self.ok_button.clicked.connect(self.accept)
        self.cancel_button.clicked.connect(self.reject)
    
    def _update_ui(self):
        """Update UI elements with current track state."""
        state = self.track_manager.get_track_state(self.current_track)
        
        # Set mode
        index = self.mode_combo.findData(state.mode)
        if index >= 0:
            self.mode_combo.setCurrentIndex(index)
        
        # Set volume
        volume = int(state.volume * 100)
        self.volume_slider.setValue(volume)
        self.volume_label.setText(f"{volume}%")
        
        # Set pan
        pan = int(state.pan * 100)
        self.pan_slider.setValue(pan)
        self.pan_label.setText("Left" if pan < 0 else "Right" if pan > 0 else "Center")
        
        # Set mute and solo
        self.mute_check.setChecked(state.mute)
        self.solo_check.setChecked(state.solo)
        
        # Set MIDI settings
        self.note_spin.setValue(state.midi_note)
        self.channel_spin.setValue(state.midi_channel)
    
    def _on_mode_changed(self, index):
        """Handle mode change."""
        mode = self.mode_combo.itemData(index)
        self.track_manager.set_track_mode(self.current_track, mode)
        self.settings_changed.emit(self.current_track)
    
    def _on_volume_changed(self, value):
        """Handle volume change."""
        volume = value / 100.0
        self.volume_label.setText(f"{value}%")
        self.track_manager.set_track_volume(self.current_track, volume)
        self.settings_changed.emit(self.current_track)
    
    def _on_pan_changed(self, value):
        """Handle pan change."""
        pan = value / 100.0
        self.pan_label.setText("Left" if value < 0 else "Right" if value > 0 else "Center")
        self.track_manager.set_track_pan(self.current_track, pan)
        self.settings_changed.emit(self.current_track)
    
    def _on_mute_changed(self, checked):
        """Handle mute change."""
        self.track_manager.set_track_mute(self.current_track, checked)
        self.settings_changed.emit(self.current_track)
    
    def _on_solo_changed(self, checked):
        """Handle solo change."""
        self.track_manager.set_track_solo(self.current_track, checked)
        self.settings_changed.emit(self.current_track)
    
    def _on_note_changed(self, value):
        """Handle MIDI note change."""
        self.track_manager.set_track_midi_note(self.current_track, value)
        self.settings_changed.emit(self.current_track)
    
    def _on_channel_changed(self, value):
        """Handle MIDI channel change."""
        self.track_manager.set_track_midi_channel(self.current_track, value)
        self.settings_changed.emit(self.current_track) 