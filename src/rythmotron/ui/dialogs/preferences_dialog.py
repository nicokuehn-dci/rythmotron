"""
Preferences dialog for RythmoTron.
Provides configuration options for all application settings.
"""

from PySide6.QtWidgets import (
    QDialog, QTabWidget, QVBoxLayout, QHBoxLayout, QGroupBox,
    QLabel, QSpinBox, QComboBox, QCheckBox, QLineEdit,
    QPushButton, QFileDialog
)
from PySide6.QtCore import Qt, Signal
from pathlib import Path

from ...style.skin_manager import SkinManager
from ...audio.audio_engine import AudioEngine
from ...midi.midi_manager import MIDIManager
from ...utils.config import get_config_value, set_config_value

class PreferencesDialog(QDialog):
    """Dialog for configuring all application settings."""
    
    settings_changed = Signal()  # Emitted when settings are changed
    
    def __init__(self, skin_manager: SkinManager, audio_engine: AudioEngine = None, 
                 midi_manager: MIDIManager = None, parent=None):
        """Initialize the preferences dialog."""
        super().__init__(parent)
        
        self.skin_manager = skin_manager
        self.audio_engine = audio_engine
        self.midi_manager = midi_manager
        
        self.setWindowTitle("Preferences")
        self.setMinimumSize(600, 400)
        
        self._setup_ui()
        self._connect_signals()
        self._load_settings()
        self._apply_skin()
    
    def showEvent(self, event):
        """Handle dialog show event."""
        super().showEvent(event)
        if self.audio_engine:
            self._populate_audio_devices()
        if self.midi_manager:
            self._populate_midi_devices()
    
    def _setup_ui(self):
        """Set up the user interface."""
        layout = QVBoxLayout(self)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        layout.addWidget(self.tab_widget)
        
        # Add tabs
        self.tab_widget.addTab(self._create_audio_tab(), "Audio")
        self.tab_widget.addTab(self._create_midi_tab(), "MIDI")
        self.tab_widget.addTab(self._create_ui_tab(), "UI")
        self.tab_widget.addTab(self._create_paths_tab(), "Paths")
        self.tab_widget.addTab(self._create_performance_tab(), "Performance")
        
        # Add buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()
        
        ok_button = QPushButton("OK")
        ok_button.clicked.connect(self.accept)
        button_layout.addWidget(ok_button)
        
        cancel_button = QPushButton("Cancel")
        cancel_button.clicked.connect(self.reject)
        button_layout.addWidget(cancel_button)
        
        layout.addLayout(button_layout)
    
    def _create_audio_tab(self) -> QWidget:
        """Create the audio settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Device settings
        device_group = QGroupBox("Audio Devices")
        device_layout = QVBoxLayout(device_group)
        
        # Input device
        input_layout = QHBoxLayout()
        input_label = QLabel("Input Device:")
        self.audio_input_combo = QComboBox()
        input_layout.addWidget(input_label)
        input_layout.addWidget(self.audio_input_combo)
        device_layout.addLayout(input_layout)
        
        # Output device
        output_layout = QHBoxLayout()
        output_label = QLabel("Output Device:")
        self.audio_output_combo = QComboBox()
        output_layout.addWidget(output_label)
        output_layout.addWidget(self.audio_output_combo)
        device_layout.addLayout(output_layout)
        
        layout.addWidget(device_group)
        
        # Buffer settings
        buffer_group = QGroupBox("Buffer Settings")
        buffer_layout = QVBoxLayout(buffer_group)
        
        # Sample rate
        rate_layout = QHBoxLayout()
        rate_label = QLabel("Sample Rate:")
        self.sample_rate_combo = QComboBox()
        self.sample_rate_combo.addItems(["44100", "48000", "96000"])
        rate_layout.addWidget(rate_label)
        rate_layout.addWidget(self.sample_rate_combo)
        buffer_layout.addLayout(rate_layout)
        
        # Buffer size
        buffer_layout = QHBoxLayout()
        buffer_label = QLabel("Buffer Size:")
        self.buffer_size_combo = QComboBox()
        self.buffer_size_combo.addItems(["256", "512", "1024", "2048"])
        buffer_layout.addWidget(buffer_label)
        buffer_layout.addWidget(self.buffer_size_combo)
        buffer_layout.addLayout(buffer_layout)
        
        layout.addWidget(buffer_group)
        layout.addStretch()
        
        return tab
    
    def _create_midi_tab(self) -> QWidget:
        """Create the MIDI settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Device settings
        device_group = QGroupBox("MIDI Devices")
        device_layout = QVBoxLayout(device_group)
        
        # Input device
        input_layout = QHBoxLayout()
        input_label = QLabel("Input Device:")
        self.midi_input_combo = QComboBox()
        input_layout.addWidget(input_label)
        input_layout.addWidget(self.midi_input_combo)
        device_layout.addLayout(input_layout)
        
        # Output device
        output_layout = QHBoxLayout()
        output_label = QLabel("Output Device:")
        self.midi_output_combo = QComboBox()
        output_layout.addWidget(output_label)
        output_layout.addWidget(self.midi_output_combo)
        device_layout.addLayout(output_layout)
        
        layout.addWidget(device_group)
        
        # MIDI settings
        midi_group = QGroupBox("MIDI Settings")
        midi_layout = QVBoxLayout(midi_group)
        
        # MIDI channel
        channel_layout = QHBoxLayout()
        channel_label = QLabel("Default Channel:")
        self.midi_channel_spin = QSpinBox()
        self.midi_channel_spin.setRange(1, 16)
        channel_layout.addWidget(channel_label)
        channel_layout.addWidget(self.midi_channel_spin)
        midi_layout.addLayout(channel_layout)
        
        # MIDI clock sync
        self.midi_clock_check = QCheckBox("Enable MIDI Clock Sync")
        midi_layout.addWidget(self.midi_clock_check)
        
        layout.addWidget(midi_group)
        layout.addStretch()
        
        return tab
    
    def _create_ui_tab(self) -> QWidget:
        """Create the UI settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Theme settings
        theme_group = QGroupBox("Theme")
        theme_layout = QVBoxLayout(theme_group)
        
        # Theme selection
        theme_layout = QHBoxLayout()
        theme_label = QLabel("Theme:")
        self.theme_combo = QComboBox()
        theme_layout.addWidget(theme_label)
        theme_layout.addWidget(self.theme_combo)
        theme_layout.addLayout(theme_layout)
        
        # Font settings
        font_layout = QHBoxLayout()
        font_label = QLabel("Font Size:")
        self.font_size_spin = QSpinBox()
        self.font_size_spin.setRange(8, 24)
        font_layout.addWidget(font_label)
        font_layout.addWidget(self.font_size_spin)
        theme_layout.addLayout(font_layout)
        
        layout.addWidget(theme_group)
        
        # Display settings
        display_group = QGroupBox("Display")
        display_layout = QVBoxLayout(display_group)
        
        # Grid settings
        grid_layout = QHBoxLayout()
        grid_label = QLabel("Grid Size:")
        self.grid_size_spin = QSpinBox()
        self.grid_size_spin.setRange(4, 32)
        grid_layout.addWidget(grid_label)
        grid_layout.addWidget(self.grid_size_spin)
        display_layout.addLayout(grid_layout)
        
        # Show tooltips
        self.tooltips_check = QCheckBox("Show Tooltips")
        display_layout.addWidget(self.tooltips_check)
        
        layout.addWidget(display_group)
        layout.addStretch()
        
        return tab
    
    def _create_paths_tab(self) -> QWidget:
        """Create the paths settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Samples path
        samples_group = QGroupBox("Samples")
        samples_layout = QVBoxLayout(samples_group)
        
        samples_path_layout = QHBoxLayout()
        self.samples_path_edit = QLineEdit()
        self.samples_path_edit.setReadOnly(True)
        samples_browse_button = QPushButton("Browse...")
        samples_browse_button.clicked.connect(
            lambda: self._browse_directory("samples", self.samples_path_edit)
        )
        samples_path_layout.addWidget(self.samples_path_edit)
        samples_path_layout.addWidget(samples_browse_button)
        samples_layout.addLayout(samples_path_layout)
        
        layout.addWidget(samples_group)
        
        # Projects path
        projects_group = QGroupBox("Projects")
        projects_layout = QVBoxLayout(projects_group)
        
        projects_path_layout = QHBoxLayout()
        self.projects_path_edit = QLineEdit()
        self.projects_path_edit.setReadOnly(True)
        projects_browse_button = QPushButton("Browse...")
        projects_browse_button.clicked.connect(
            lambda: self._browse_directory("projects", self.projects_path_edit)
        )
        projects_path_layout.addWidget(self.projects_path_edit)
        projects_path_layout.addWidget(projects_browse_button)
        projects_layout.addLayout(projects_path_layout)
        
        layout.addWidget(projects_group)
        
        # Presets path
        presets_group = QGroupBox("Presets")
        presets_layout = QVBoxLayout(presets_group)
        
        presets_path_layout = QHBoxLayout()
        self.presets_path_edit = QLineEdit()
        self.presets_path_edit.setReadOnly(True)
        presets_browse_button = QPushButton("Browse...")
        presets_browse_button.clicked.connect(
            lambda: self._browse_directory("presets", self.presets_path_edit)
        )
        presets_path_layout.addWidget(self.presets_path_edit)
        presets_path_layout.addWidget(presets_browse_button)
        presets_layout.addLayout(presets_path_layout)
        
        layout.addWidget(presets_group)
        layout.addStretch()
        
        return tab
    
    def _create_performance_tab(self) -> QWidget:
        """Create the performance settings tab."""
        tab = QWidget()
        layout = QVBoxLayout(tab)
        
        # Autosave settings
        autosave_group = QGroupBox("Autosave")
        autosave_layout = QVBoxLayout(autosave_group)
        
        # Enable autosave
        self.autosave_check = QCheckBox("Enable Autosave")
        autosave_layout.addWidget(self.autosave_check)
        
        # Autosave interval
        interval_layout = QHBoxLayout()
        interval_label = QLabel("Interval (minutes):")
        self.autosave_interval_spin = QSpinBox()
        self.autosave_interval_spin.setRange(1, 60)
        interval_layout.addWidget(interval_label)
        interval_layout.addWidget(self.autosave_interval_spin)
        autosave_layout.addLayout(interval_layout)
        
        layout.addWidget(autosave_group)
        
        # Undo settings
        undo_group = QGroupBox("Undo/Redo")
        undo_layout = QVBoxLayout(undo_group)
        
        # Undo levels
        levels_layout = QHBoxLayout()
        levels_label = QLabel("Undo Levels:")
        self.undo_levels_spin = QSpinBox()
        self.undo_levels_spin.setRange(1, 100)
        levels_layout.addWidget(levels_label)
        levels_layout.addWidget(self.undo_levels_spin)
        undo_layout.addLayout(levels_layout)
        
        layout.addWidget(undo_group)
        layout.addStretch()
        
        return tab
    
    def _connect_signals(self):
        """Connect widget signals."""
        # Audio settings
        self.audio_input_combo.currentIndexChanged.connect(
            lambda: self._on_setting_changed("audio.device.input")
        )
        self.audio_output_combo.currentIndexChanged.connect(
            lambda: self._on_setting_changed("audio.device.output")
        )
        self.sample_rate_combo.currentTextChanged.connect(
            lambda: self._on_setting_changed("audio.sample_rate")
        )
        self.buffer_size_combo.currentTextChanged.connect(
            lambda: self._on_setting_changed("audio.buffer_size")
        )
        
        # MIDI settings
        self.midi_input_combo.currentIndexChanged.connect(
            lambda: self._on_setting_changed("midi.input_device")
        )
        self.midi_output_combo.currentIndexChanged.connect(
            lambda: self._on_setting_changed("midi.output_device")
        )
        self.midi_channel_spin.valueChanged.connect(
            lambda: self._on_setting_changed("midi.default_channel")
        )
        self.midi_clock_check.toggled.connect(
            lambda: self._on_setting_changed("midi.clock_sync")
        )
        
        # UI settings
        self.theme_combo.currentTextChanged.connect(
            lambda: self._on_setting_changed("ui.theme")
        )
        self.font_size_spin.valueChanged.connect(
            lambda: self._on_setting_changed("ui.font_size")
        )
        self.grid_size_spin.valueChanged.connect(
            lambda: self._on_setting_changed("ui.grid_size")
        )
        self.tooltips_check.toggled.connect(
            lambda: self._on_setting_changed("ui.show_tooltips")
        )
        
        # Performance settings
        self.autosave_check.toggled.connect(
            lambda: self._on_setting_changed("performance.autosave.enabled")
        )
        self.autosave_interval_spin.valueChanged.connect(
            lambda: self._on_setting_changed("performance.autosave.interval")
        )
        self.undo_levels_spin.valueChanged.connect(
            lambda: self._on_setting_changed("performance.undo_levels")
        )
    
    def _load_settings(self):
        """Load current settings into widgets."""
        # Audio settings
        self.sample_rate_combo.setCurrentText(str(get_config_value("audio.sample_rate")))
        self.buffer_size_combo.setCurrentText(str(get_config_value("audio.buffer_size")))
        
        # MIDI settings
        self.midi_channel_spin.setValue(get_config_value("midi.default_channel"))
        self.midi_clock_check.setChecked(get_config_value("midi.clock_sync"))
        
        # UI settings
        self.theme_combo.setCurrentText(get_config_value("ui.theme"))
        self.font_size_spin.setValue(get_config_value("ui.font_size"))
        self.grid_size_spin.setValue(get_config_value("ui.grid_size"))
        self.tooltips_check.setChecked(get_config_value("ui.show_tooltips"))
        
        # Paths
        self.samples_path_edit.setText(get_config_value("paths.samples"))
        self.projects_path_edit.setText(get_config_value("paths.projects"))
        self.presets_path_edit.setText(get_config_value("paths.presets"))
        
        # Performance settings
        self.autosave_check.setChecked(get_config_value("performance.autosave.enabled"))
        self.autosave_interval_spin.setValue(get_config_value("performance.autosave.interval"))
        self.undo_levels_spin.setValue(get_config_value("performance.undo_levels"))
    
    def _populate_audio_devices(self):
        """Populate audio device lists."""
        if not self.audio_engine:
            return
            
        # Get current devices
        current_input = get_config_value("audio.device.input")
        current_output = get_config_value("audio.device.output")
        
        # Clear and populate input devices
        self.audio_input_combo.clear()
        for device in self.audio_engine.get_input_devices():
            self.audio_input_combo.addItem(device.name, device.id)
        
        # Set current input device
        for i in range(self.audio_input_combo.count()):
            if self.audio_input_combo.itemData(i) == current_input:
                self.audio_input_combo.setCurrentIndex(i)
                break
        
        # Clear and populate output devices
        self.audio_output_combo.clear()
        for device in self.audio_engine.get_output_devices():
            self.audio_output_combo.addItem(device.name, device.id)
        
        # Set current output device
        for i in range(self.audio_output_combo.count()):
            if self.audio_output_combo.itemData(i) == current_output:
                self.audio_output_combo.setCurrentIndex(i)
                break
    
    def _populate_midi_devices(self):
        """Populate MIDI device lists."""
        if not self.midi_manager:
            return
            
        # Get current devices
        current_input = get_config_value("midi.input_device")
        current_output = get_config_value("midi.output_device")
        
        # Clear and populate input devices
        self.midi_input_combo.clear()
        for device in self.midi_manager.get_input_devices():
            self.midi_input_combo.addItem(device.name, device.id)
        
        # Set current input device
        for i in range(self.midi_input_combo.count()):
            if self.midi_input_combo.itemData(i) == current_input:
                self.midi_input_combo.setCurrentIndex(i)
                break
        
        # Clear and populate output devices
        self.midi_output_combo.clear()
        for device in self.midi_manager.get_output_devices():
            self.midi_output_combo.addItem(device.name, device.id)
        
        # Set current output device
        for i in range(self.midi_output_combo.count()):
            if self.midi_output_combo.itemData(i) == current_output:
                self.midi_output_combo.setCurrentIndex(i)
                break
    
    def _on_setting_changed(self, key_path: str):
        """Handle setting changes."""
        value = None
        
        # Get the new value based on the widget type
        widget = self.sender()
        if isinstance(widget, QSpinBox):
            value = widget.value()
        elif isinstance(widget, QComboBox):
            if key_path in ["audio.device.input", "audio.device.output", 
                           "midi.input_device", "midi.output_device"]:
                value = widget.currentData()
            else:
                value = widget.currentText()
        elif isinstance(widget, QCheckBox):
            value = widget.isChecked()
        elif isinstance(widget, QLineEdit):
            value = widget.text()
        
        if value is not None:
            set_config_value(key_path, value)
            self.settings_changed.emit()
    
    def _browse_directory(self, config_key: str, line_edit: QLineEdit):
        """Open a directory browser dialog."""
        current_path = get_config_value(f"paths.{config_key}")
        if not current_path:
            current_path = str(Path.home())
        
        directory = QFileDialog.getExistingDirectory(
            self,
            "Select Directory",
            current_path,
            QFileDialog.ShowDirsOnly
        )
        
        if directory:
            line_edit.setText(directory)
            set_config_value(f"paths.{config_key}", directory)
            self.settings_changed.emit()
    
    def _apply_skin(self):
        """Apply the current skin to the dialog."""
        # Set dialog style
        self.setStyleSheet(f"""
            QDialog {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QGroupBox {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                margin-top: 1em;
                padding-top: 0.5em;
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
                color: {self.skin_manager.get_color('TEXT')};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 3px 0 3px;
            }}
            QLabel {{
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QPushButton {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 10px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QPushButton:hover {{
                background: {self.skin_manager.get_color('ACCENT')};
            }}
            QPushButton:disabled {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                color: {self.skin_manager.get_color('TEXT_DISABLED')};
            }}
            QLineEdit {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QSpinBox {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QComboBox {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QComboBox::drop-down {{
                border: none;
                width: 20px;
            }}
            QComboBox::down-arrow {{
                image: url(resources/icons/dropdown.png);
                width: 12px;
                height: 12px;
            }}
            QTabWidget::pane {{
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QTabBar::tab {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {self.skin_manager.get_color('BORDER')};
                border-bottom: none;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 8px 16px;
                margin-right: 2px;
                color: {self.skin_manager.get_color('TEXT')};
                font-family: {self.skin_manager.get_font_family()};
                font-size: {self.skin_manager.get_font_size('text')}px;
            }}
            QTabBar::tab:selected {{
                background: {self.skin_manager.get_color('SURFACE')};
                border-bottom: 2px solid {self.skin_manager.get_color('ACCENT')};
            }}
            QTabBar::tab:hover:!selected {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
            }}
        """) 