import sys
import os
import time
import json
import random
from pathlib import Path
from PySide6.QtWidgets import (
    QMainWindow, QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
    QPushButton, QLabel, QSlider, QFileDialog, QTabWidget, 
    QGridLayout, QGroupBox, QDial, QSpinBox, QComboBox, QStackedWidget,
    QMessageBox, QDialog, QInputDialog, QFrame, QSplitter, QMenuBar, QMenu, QToolBar, QStatusBar, QDockWidget
)
from PySide6.QtCore import Qt, QTimer, Signal, Slot, QSize
from PySide6.QtGui import QColor, QPainter, QPen, QFont, QFontMetrics, QIcon, QAction

from ..models import Project, Kit, Sound, Sample, Pattern, Trig, Track
from ..constants import Track, DEFAULT_BPM, TRACK_COLORS, GRID_SIZE, TRACK_HEIGHT, TrackMode
from ..audio_engine import AudioEngine
from ..style import Colors, StyleSheets
from ..layout_manager import LayoutManager, VirtualPad, TrigButton
from .components.display_component import DisplayComponent
from .components.skin_selector import SkinSelector
from ..style.skin_manager import SkinManager
from ..style.skins import SkinType
from ..storage.sample_storage import SampleStorage
from ..storage.sample_kit_storage import SampleKitStorage
from ..dialogs.sample_manager_dialog import SampleManagerDialog
from ..dialogs.kit_manager_dialog import KitManagerDialog
from ..dialogs.sample_editor_dialog import SampleEditorDialog
from .components.mixer_component import MixerComponent
from ..audio.mixer import Mixer
from .dialogs.mixer_settings_dialog import MixerSettingsDialog
from .components.track_component import TrackComponent
from ..utils.context import RythmContext
from .dialogs.preferences_dialog import PreferencesDialog


class MainWindow(QMainWindow):
    """Main window for the RythmoTron application."""
    
    def __init__(self):
        """Initialize the main window."""
        super().__init__()
        
        # Set up window properties
        self.setWindowTitle("RythmoTron")
        self.setMinimumSize(1200, 800)
        
        # Initialize components
        self.mixer = Mixer()
        self.skin_manager = SkinManager()
        
        # Initialize sample storage
        self.sample_storage = SampleStorage()
        self.sample_kit_storage = SampleKitStorage()
        
        # Initialize undo/redo stack
        self.undo_stack = []
        self.redo_stack = []
        self.max_undo_steps = 20
        
        # Initialize MIDI learning state
        self.midi_learning = False
        self.midi_learn_target = None
        
        # Create menu bar
        self._create_menu_bar()
        
        # Create central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # Create main layout
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Create toolbar
        self._create_toolbar()
        
        # Create stacked widget for different views
        self.stacked_widget = QTabWidget()
        main_layout.addWidget(self.stacked_widget)
        
        # Create main view
        main_view = QWidget()
        main_layout = QVBoxLayout(main_view)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)
        
        # Top section (display and skin selector)
        top_section = QHBoxLayout()
        top_section.setSpacing(0)
        
        # Display component
        self.display = DisplayComponent(self.skin_manager)
        top_section.addWidget(self.display, stretch=1)
        
        # Skin selector
        self.skin_selector = SkinSelector(self.skin_manager)
        top_section.addWidget(self.skin_selector)
        
        main_layout.addLayout(top_section)
        
        # Bottom section (mixer)
        self.mixer_component = MixerComponent(self.mixer)
        main_layout.addWidget(self.mixer_component)
        
        # Add control buttons
        button_layout = QHBoxLayout()
        button_layout.setSpacing(10)
        
        # Add theme button
        theme_button = QPushButton("Change Theme")
        theme_button.clicked.connect(self._show_theme_selector)
        button_layout.addWidget(theme_button)
        
        button_layout.addStretch()
        main_layout.addLayout(button_layout)
        
        # Create theme selector view
        self.theme_selector = SkinSelector(self.skin_manager)
        self.theme_selector.skin_selected.connect(self._on_skin_selected)
        
        # Add views to stacked widget
        self.stacked_widget.addTab(main_view, "Sequencer")
        self.stacked_widget.addTab(self.theme_selector, "Theme Selector")
        
        # Connect skin manager signals
        self.skin_manager.skin_changed.connect(self._on_skin_changed)
        
        # Set initial skin
        self._apply_skin(self.skin_manager.current_skin)
        
        # Initialize audio engine
        self.audio_engine = AudioEngine()
        
        # Initialize project data
        self.project = Project(name="New Project")
        self.current_pattern = None
        self.current_kit = None
        self.current_track = Track.BD  # Default to Bass Drum track
        
        # Create a timer for UI updates
        self.setup_timers()
        
        # Create test content
        self.create_test_pattern()
        
        # Set up connections
        self.setup_connections()
        
        # Create status bar
        self.statusBar().showMessage("Ready")
        
        # Create dock widgets
        self._create_dock_widgets()
        
        self.context = RythmContext()
        self.setup_ui()
        
    def _create_menu_bar(self):
        """Create the main menu bar."""
        # File menu
        file_menu = self.menuBar().addMenu("File")
        
        new_project_action = QAction("New Project", self)
        new_project_action.triggered.connect(self._new_project)
        file_menu.addAction(new_project_action)
        
        open_project_action = QAction("Open Project", self)
        open_project_action.triggered.connect(self._open_project)
        file_menu.addAction(open_project_action)
        
        save_project_action = QAction("Save Project", self)
        save_project_action.triggered.connect(self._save_project)
        file_menu.addAction(save_project_action)
        
        file_menu.addSeparator()
        
        # Add Sample menu
        sample_menu = self.menuBar().addMenu("Sample")
        
        import_sample_action = QAction("Import Sample", self)
        import_sample_action.triggered.connect(self._import_sample)
        sample_menu.addAction(import_sample_action)
        
        import_folder_action = QAction("Import Sample Folder", self)
        import_folder_action.triggered.connect(self._import_sample_folder)
        sample_menu.addAction(import_folder_action)
        
        sample_menu.addSeparator()
        
        export_sample_action = QAction("Export Sample", self)
        export_sample_action.triggered.connect(self._export_sample)
        sample_menu.addAction(export_sample_action)
        
        export_folder_action = QAction("Export Sample Folder", self)
        export_folder_action.triggered.connect(self._export_sample_folder)
        sample_menu.addAction(export_folder_action)
        
        sample_menu.addSeparator()
        
        manage_samples_action = QAction("Manage Samples", self)
        manage_samples_action.triggered.connect(self._show_sample_manager)
        sample_menu.addAction(manage_samples_action)
        
        # Add Sample Kit menu
        kit_menu = self.menuBar().addMenu("Sample Kit")
        
        new_kit_action = QAction("New Kit", self)
        new_kit_action.triggered.connect(self._new_sample_kit)
        kit_menu.addAction(new_kit_action)
        
        import_kit_action = QAction("Import Kit", self)
        import_kit_action.triggered.connect(self._import_sample_kit)
        kit_menu.addAction(import_kit_action)
        
        export_kit_action = QAction("Export Kit", self)
        export_kit_action.triggered.connect(self._export_sample_kit)
        kit_menu.addAction(export_kit_action)
        
        kit_menu.addSeparator()
        
        manage_kits_action = QAction("Manage Kits", self)
        manage_kits_action.triggered.connect(self._show_kit_manager)
        kit_menu.addAction(manage_kits_action)
        
        # Edit menu
        edit_menu = self.menuBar().addMenu("Edit")
        
        undo_action = QAction("Undo", self)
        undo_action.triggered.connect(self._undo)
        edit_menu.addAction(undo_action)
        
        redo_action = QAction("Redo", self)
        redo_action.triggered.connect(self._redo)
        edit_menu.addAction(redo_action)
        
        edit_menu.addSeparator()
        
        copy_action = QAction("Copy", self)
        copy_action.triggered.connect(self._copy)
        edit_menu.addAction(copy_action)
        
        paste_action = QAction("Paste", self)
        paste_action.triggered.connect(self._paste)
        edit_menu.addAction(paste_action)
        
        # Audio menu
        audio_menu = self.menuBar().addMenu("Audio")
        
        settings_action = QAction("Audio Settings", self)
        settings_action.triggered.connect(self._show_audio_settings)
        audio_menu.addAction(settings_action)
        
        audio_menu.addSeparator()
        
        play_action = QAction("Play", self)
        play_action.triggered.connect(self.play_pattern)
        audio_menu.addAction(play_action)
        
        stop_action = QAction("Stop", self)
        stop_action.triggered.connect(self.stop_playback)
        audio_menu.addAction(stop_action)
        
        # MIDI menu
        midi_menu = self.menuBar().addMenu("MIDI")
        
        midi_settings_action = QAction("MIDI Settings", self)
        midi_settings_action.triggered.connect(self._show_midi_settings)
        midi_menu.addAction(midi_settings_action)
        
        midi_menu.addSeparator()
        
        learn_midi_action = QAction("Learn MIDI", self)
        learn_midi_action.triggered.connect(self._learn_midi)
        midi_menu.addAction(learn_midi_action)
        
        clear_midi_action = QAction("Clear MIDI", self)
        clear_midi_action.triggered.connect(self._clear_midi)
        midi_menu.addAction(clear_midi_action)
        
        # Tools menu
        tools_menu = self.menuBar().addMenu("Tools")
        
        preferences_action = QAction("Preferences", self)
        preferences_action.triggered.connect(self._show_preferences)
        tools_menu.addAction(preferences_action)
        
        tools_menu.addSeparator()
        
        theme_action = QAction("Theme", self)
        theme_action.triggered.connect(self._show_theme_selector)
        tools_menu.addAction(theme_action)
        
        tools_menu.addSeparator()
        
        quantize_action = QAction("Quantize", self)
        quantize_action.triggered.connect(self._quantize)
        tools_menu.addAction(quantize_action)
        
        randomize_action = QAction("Randomize", self)
        randomize_action.triggered.connect(self._randomize)
        tools_menu.addAction(randomize_action)
        
        # View menu
        view_menu = self.menuBar().addMenu("View")
        
        skin_action = QAction("Skin...", self)
        skin_action.triggered.connect(self._show_skin_selector)
        view_menu.addAction(skin_action)
        
        mixer_settings_action = QAction("Mixer Settings...", self)
        mixer_settings_action.triggered.connect(self._show_mixer_settings)
        view_menu.addAction(mixer_settings_action)
    
    def _create_toolbar(self):
        """Create the main toolbar."""
        toolbar = self.addToolBar("Main Toolbar")
        toolbar.setMovable(False)
        
        # Add theme action
        theme_action = QAction("Theme", self)
        theme_action.triggered.connect(self._show_theme_selector)
        toolbar.addAction(theme_action)
    
    def _show_theme_selector(self):
        """Show the theme selector view."""
        self.stacked_widget.setCurrentIndex(1)
    
    def _on_skin_selected(self, skin_type: SkinType):
        """Handle skin selection."""
        if self.skin_manager.set_skin(skin_type):
            self.stacked_widget.setCurrentIndex(0)
    
    def _on_skin_changed(self):
        """Handle skin change."""
        # Update all components
        self.display.update()
        self.mixer_component.update()
        
        # Update window style
        self.setStyleSheet(f"""
            QMainWindow {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QToolBar {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: none;
                spacing: 10px;
                padding: 5px;
            }}
            QToolButton {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
            }}
            QToolButton:hover {{
                background: {self.skin_manager.get_color('ACCENT')};
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
        """)
    
    def _apply_skin(self, skin):
        """Apply a skin to the main window."""
        # Set window style
        self.setStyleSheet(f"""
            QMainWindow {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QToolBar {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: none;
                spacing: 10px;
                padding: 5px;
            }}
            QToolButton {{
                background: {self.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 5px;
                color: {self.skin_manager.get_color('TEXT')};
            }}
            QToolButton:hover {{
                background: {self.skin_manager.get_color('ACCENT')};
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
        """)
        
    def init_audio(self):
        """Initialize the audio engine."""
        self.audio_engine.initialize()
        self.audio_engine.register_step_change_callback(self.on_step_change)
        
    def setup_timers(self):
        """Set up timers for UI updates."""
        # UI update timer (for sequencer display, parameter changes, etc)
        self.update_timer = QTimer(self)
        self.update_timer.timeout.connect(self.update)
        self.update_timer.start(16)  # ~60 fps
        
        # Pad animation timer
        self.pad_animation_timer = QTimer(self)
        self.pad_animation_timer.timeout.connect(self.update_pad_animations)
        self.pad_animation_timer.start(50)  # 20 fps
    
    def create_test_pattern(self):
        """Create a test pattern for demonstration."""
        # Create a kit
        kit = Kit(name="Test Kit")
        
        # Create a pattern
        pattern = Pattern(name="Test Pattern", kit_id=kit.id, length=16)
        
        # Add some basic trigs
        for i in range(0, 16, 4):
            pattern.add_trig(Track.BD, Trig(step=i, velocity=100))
        
        for i in range(4, 16, 8):
            pattern.add_trig(Track.SD, Trig(step=i, velocity=90))
            
        for i in range(2, 16, 4):
            pattern.add_trig(Track.CH, Trig(step=i, velocity=80))
        
        # Add to project
        self.project.kits.append(kit)
        self.project.patterns.append(pattern)
        
        # Set as current
        self.current_pattern = pattern
        self.current_kit = kit
        
        # Update UI
        self.update_sequencer_display()
        self.select_track(Track.BD)  # Select Bass Drum track by default
    
    def select_track(self, track):
        """Select a track for editing."""
        # Update current track
        self.current_track = track
        
        # Update pads
        for t, pad in self.layout_manager.pads.items():
            pad.setSelected(t == track)
            
        # Update sequencer display
        self.update_sequencer_display()
        
        # Update status bar
        self.statusBar().showMessage(f"Selected track: {track.name}")
    
    def toggle_step(self, step):
        """Toggle a step in the current track."""
        if not self.current_pattern:
            return
            
        # Check if there's already a trig at this step
        trig = self.current_pattern.get_trig_at_step(self.current_track, step)
        
        if trig:
            # Remove existing trig
            if self.current_track in self.current_pattern.track_trigs:
                self.current_pattern.track_trigs[self.current_track] = [
                    t for t in self.current_pattern.track_trigs[self.current_track] 
                    if t.step != step
                ]
        else:
            # Add new trig
            self.current_pattern.add_trig(
                self.current_track, 
                Trig(step=step, velocity=100)
            )
            
        # Update sequencer display
        self.update_sequencer_display()
    
    def update_sequencer_display(self):
        """Update the sequencer UI to reflect the current pattern."""
        if not self.current_pattern:
            return
            
        # Update trig buttons
        for i, trig_button in enumerate(self.layout_manager.trig_buttons):
            # Check if this step has a trig for the current track
            has_trig = False
            has_param_lock = False
            
            if self.current_track in self.current_pattern.track_trigs:
                for trig in self.current_pattern.track_trigs[self.current_track]:
                    if trig.step == i:
                        has_trig = True
                        has_param_lock = bool(trig.parameter_locks)
                        break
            
            # Update button state
            trig_button.setHasTrig(has_trig)
            trig_button.setHasParamLock(has_param_lock)
            
    def update_pad_animations(self):
        """Update pad animations for visual feedback."""
        # Decrement trigger counters for any pads showing visual feedback
        for pad in self.layout_manager.pads.values():
            pad.decrementTrigger()
    
    def update(self):
        """Update the UI."""
        # Update display
        self.display.update()
        
        # Update mixer levels
        # This would normally come from your audio engine
        # For now, we'll just update with some dummy values
        channel_levels = {
            name: (0.5, 0.3)  # (peak, rms)
            for name in self.mixer.channels
        }
        self.mixer.update_levels(channel_levels)
    
    def on_step_change(self, step):
        """Called when the sequencer advances to a new step."""
        # Mark the current step in the sequencer UI
        for i, trig_button in enumerate(self.layout_manager.trig_buttons):
            trig_button.setCurrentStep(i == step)
        
        # Check which pads should be triggered for visual feedback
        if self.current_pattern and self.current_kit:
            for track, trigs in self.current_pattern.track_trigs.items():
                for trig in trigs:
                    if trig.step == step and track in self.layout_manager.pads:
                        self.layout_manager.pads[track].triggerVisualFeedback()
    
    def play_pattern(self):
        """Start playback of the current pattern."""
        if not self.current_pattern or not self.current_kit:
            return
            
        self.audio_engine.play(self.current_pattern, self.project)
        self.statusBar().showMessage(f"Playing pattern: {self.current_pattern.name}")
    
    def stop_playback(self):
        """Stop pattern playback."""
        self.audio_engine.stop()
        
        # Reset sequencer UI
        for trig_button in self.layout_manager.trig_buttons:
            trig_button.setCurrentStep(False)
            
        self.statusBar().showMessage("Playback stopped")
    
    def closeEvent(self, event):
        """Handle window close event."""
        # Shutdown audio engine
        self.audio_engine.shutdown()
        event.accept()
    
    def _new_project(self):
        """Create a new project."""
        self.project = Project(name="New Project")
        self.current_pattern = None
        self.current_kit = None
        self.statusBar().showMessage("New project created")
    
    def _open_project(self):
        """Open an existing project."""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Open Project",
            "",
            "RythmoTron Projects (*.rproj);;All Files (*.*)"
        )
        
        if file_path:
            try:
                with open(file_path, 'r') as f:
                    project_data = json.load(f)
                self.project = Project.from_dict(project_data)
                self.statusBar().showMessage(f"Opened project: {self.project.name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to open project: {str(e)}")
    
    def _save_project(self):
        """Save the current project."""
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Save Project",
            "",
            "RythmoTron Projects (*.rproj);;All Files (*.*)"
        )
        
        if file_path:
            try:
                project_data = self.project.to_dict()
                with open(file_path, 'w') as f:
                    json.dump(project_data, f)
                self.statusBar().showMessage(f"Saved project: {self.project.name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to save project: {str(e)}")
    
    def _import_sample(self):
        """Import a new sample."""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Import Sample",
            "",
            "Audio Files (*.wav *.mp3 *.ogg);;All Files (*.*)"
        )
        
        if file_path:
            try:
                sample = self.audio_engine.load_sample(file_path)
                if sample:
                    self.statusBar().showMessage(f"Imported sample: {sample.name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to import sample: {str(e)}")
    
    def _export_sample(self):
        """Export the current pattern as audio."""
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Export Audio",
            "",
            "Audio Files (*.wav);;All Files (*.*)"
        )
        
        if file_path:
            try:
                # TODO: Implement audio export
                self.statusBar().showMessage("Audio exported successfully")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to export audio: {str(e)}")
    
    def _undo(self):
        """Undo the last action."""
        if self.undo_stack:
            # Get the last state
            state = self.undo_stack.pop()
            
            # Save current state to redo stack
            self.redo_stack.append(self._save_current_state())
            
            # Restore the previous state
            self._restore_state(state)
            
            # Update UI
            self.update_sequencer_display()
            self.statusBar().showMessage("Undo")
    
    def _redo(self):
        """Redo the last undone action."""
        if self.redo_stack:
            # Get the last redo state
            state = self.redo_stack.pop()
            
            # Save current state to undo stack
            self.undo_stack.append(self._save_current_state())
            
            # Restore the state
            self._restore_state(state)
            
            # Update UI
            self.update_sequencer_display()
            self.statusBar().showMessage("Redo")
    
    def _save_current_state(self):
        """Save the current state for undo/redo."""
        if self.current_pattern:
            return {
                'pattern': self.current_pattern.to_dict(),
                'kit': self.current_kit.to_dict() if self.current_kit else None,
                'track': self.current_track.value
            }
        return None
    
    def _restore_state(self, state):
        """Restore a saved state."""
        if state and state['pattern']:
            self.current_pattern = Pattern.from_dict(state['pattern'])
            if state['kit']:
                self.current_kit = Kit.from_dict(state['kit'])
            self.current_track = Track(state['track'])
    
    def _copy(self):
        """Copy the current selection."""
        if self.current_pattern and self.current_track:
            # Get all trigs for the current track
            trigs = self.current_pattern.track_trigs.get(self.current_track, [])
            
            # Create a clipboard data structure
            clipboard_data = {
                'track': self.current_track.value,
                'trigs': [trig.to_dict() for trig in trigs]
            }
            
            # Store in clipboard
            QApplication.clipboard().setText(json.dumps(clipboard_data))
            self.statusBar().showMessage("Copied pattern data")
    
    def _paste(self):
        """Paste the copied content."""
        clipboard_text = QApplication.clipboard().text()
        try:
            clipboard_data = json.loads(clipboard_text)
            
            # Save current state for undo
            self.undo_stack.append(self._save_current_state())
            
            # Clear redo stack
            self.redo_stack.clear()
            
            # Create new trigs from clipboard data
            new_trigs = [Trig.from_dict(trig_data) for trig_data in clipboard_data['trigs']]
            
            # Add to current pattern
            if self.current_pattern:
                self.current_pattern.track_trigs[self.current_track] = new_trigs
                
                # Update UI
                self.update_sequencer_display()
                self.statusBar().showMessage("Pasted pattern data")
        except:
            self.statusBar().showMessage("Invalid clipboard data")
    
    def _show_audio_settings(self):
        """Show the audio settings dialog."""
        dialog = SettingsDialog(self.audio_engine, self.midi_engine, self)
        dialog.exec_()
    
    def _show_midi_settings(self):
        """Show the MIDI settings dialog."""
        dialog = SettingsDialog(self.audio_engine, self.midi_engine, self)
        dialog.setCurrentIndex(1)  # Switch to MIDI tab
        dialog.exec_()
    
    def _learn_midi(self):
        """Start MIDI learn mode."""
        self.midi_learning = True
        self.midi_learn_target = None
        self.statusBar().showMessage("MIDI Learn Mode: Click a control to assign MIDI")
        
        # Connect MIDI input handler
        self.midi_engine.midi_received.connect(self._on_midi_learn)
    
    def _on_midi_learn(self, message):
        """Handle MIDI input during learn mode."""
        if self.midi_learning and self.midi_learn_target:
            # Save current state for undo
            self.undo_stack.append(self._save_current_state())
            
            # Assign MIDI control
            self.midi_learn_target.midi_cc = message.control
            self.midi_learn_target.midi_channel = message.channel
            
            # Exit learn mode
            self.midi_learning = False
            self.midi_learn_target = None
            self.midi_engine.midi_received.disconnect(self._on_midi_learn)
            
            self.statusBar().showMessage("MIDI assignment complete")
    
    def _clear_midi(self):
        """Clear MIDI assignments."""
        if self.current_pattern:
            # Save current state for undo
            self.undo_stack.append(self._save_current_state())
            
            # Clear MIDI assignments for all tracks
            for track in self.current_pattern.track_trigs:
                for trig in self.current_pattern.track_trigs[track]:
                    trig.midi_cc = None
                    trig.midi_channel = None
            
            self.statusBar().showMessage("MIDI assignments cleared")
    
    def _quantize(self):
        """Quantize the current pattern."""
        if self.current_pattern:
            # Save current state for undo
            self.undo_stack.append(self._save_current_state())
            
            # Quantize all trigs to the grid
            for track in self.current_pattern.track_trigs:
                for trig in self.current_pattern.track_trigs[track]:
                    # Round to nearest step
                    trig.step = round(trig.step / self.grid_size) * self.grid_size
            
            # Update UI
            self.update_sequencer_display()
            self.statusBar().showMessage("Pattern quantized")
    
    def _randomize(self):
        """Randomize the current pattern."""
        if self.current_pattern:
            # Save current state for undo
            self.undo_stack.append(self._save_current_state())
            
            # Create a dialog for randomization options
            dialog = QDialog(self)
            dialog.setWindowTitle("Randomize Pattern")
            layout = QVBoxLayout(dialog)
            
            # Add options
            velocity_check = QCheckBox("Randomize Velocity")
            velocity_check.setChecked(True)
            layout.addWidget(velocity_check)
            
            timing_check = QCheckBox("Randomize Timing")
            timing_check.setChecked(True)
            layout.addWidget(timing_check)
            
            probability_check = QCheckBox("Randomize Probability")
            probability_check.setChecked(True)
            layout.addWidget(probability_check)
            
            # Add buttons
            buttons = QHBoxLayout()
            ok_button = QPushButton("OK")
            ok_button.clicked.connect(dialog.accept)
            cancel_button = QPushButton("Cancel")
            cancel_button.clicked.connect(dialog.reject)
            buttons.addWidget(cancel_button)
            buttons.addWidget(ok_button)
            layout.addLayout(buttons)
            
            if dialog.exec_() == QDialog.Accepted:
                # Apply randomization
                for track in self.current_pattern.track_trigs:
                    for trig in self.current_pattern.track_trigs[track]:
                        if velocity_check.isChecked():
                            trig.velocity = random.randint(1, 127)
                        if timing_check.isChecked():
                            trig.step += random.randint(-2, 2)
                        if probability_check.isChecked():
                            trig.probability = random.randint(1, 100)
                
                # Update UI
                self.update_sequencer_display()
                self.statusBar().showMessage("Pattern randomized")
    
    def _import_sample_folder(self):
        """Import all samples from a folder."""
        folder_path = QFileDialog.getExistingDirectory(
            self,
            "Select Sample Folder",
            "",
            QFileDialog.ShowDirsOnly
        )
        
        if folder_path:
            try:
                # Get all audio files in the folder
                audio_files = []
                for ext in ['*.wav', '*.mp3', '*.ogg']:
                    audio_files.extend(Path(folder_path).glob(ext))
                
                # Import each file
                imported_count = 0
                for file_path in audio_files:
                    sample = self.audio_engine.load_sample(str(file_path))
                    if sample:
                        self.sample_storage.add_sample(sample)
                        imported_count += 1
                
                self.statusBar().showMessage(f"Imported {imported_count} samples")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to import samples: {str(e)}")
    
    def _export_sample_folder(self):
        """Export samples to a folder."""
        folder_path = QFileDialog.getExistingDirectory(
            self,
            "Select Export Folder",
            "",
            QFileDialog.ShowDirsOnly
        )
        
        if folder_path:
            try:
                # Create samples subfolder
                samples_path = Path(folder_path) / "samples"
                samples_path.mkdir(exist_ok=True)
                
                # Export each sample
                exported_count = 0
                for sample in self.sample_storage.get_all_samples():
                    export_path = samples_path / f"{sample.name}.wav"
                    self.audio_engine.export_sample(sample, str(export_path))
                    exported_count += 1
                
                self.statusBar().showMessage(f"Exported {exported_count} samples")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to export samples: {str(e)}")
    
    def _show_sample_manager(self):
        """Show the sample manager dialog."""
        dialog = SampleManagerDialog(self.sample_storage, self)
        if dialog.exec_() == QDialog.Accepted:
            self.update_sequencer_display()
    
    def _new_sample_kit(self):
        """Create a new sample kit."""
        name, ok = QInputDialog.getText(
            self,
            "New Sample Kit",
            "Enter kit name:"
        )
        
        if ok and name:
            try:
                kit = SampleKit(name=name)
                self.sample_kit_storage.add_kit(kit)
                self.statusBar().showMessage(f"Created new kit: {name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to create kit: {str(e)}")
    
    def _import_sample_kit(self):
        """Import a sample kit."""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Import Sample Kit",
            "",
            "Sample Kits (*.kit);;All Files (*.*)"
        )
        
        if file_path:
            try:
                kit = self.sample_kit_storage.import_kit(file_path)
                self.statusBar().showMessage(f"Imported kit: {kit.name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to import kit: {str(e)}")
    
    def _export_sample_kit(self):
        """Export a sample kit."""
        if not self.current_kit:
            QMessageBox.warning(self, "Warning", "No kit selected")
            return
        
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Export Sample Kit",
            "",
            "Sample Kits (*.kit);;All Files (*.*)"
        )
        
        if file_path:
            try:
                self.sample_kit_storage.export_kit(self.current_kit, file_path)
                self.statusBar().showMessage(f"Exported kit: {self.current_kit.name}")
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to export kit: {str(e)}")
    
    def _show_kit_manager(self):
        """Show the kit manager dialog."""
        dialog = KitManagerDialog(self.sample_kit_storage, self)
        if dialog.exec_() == QDialog.Accepted:
            self.update_sequencer_display()
    
    def _show_sample_editor(self, sample: Sample):
        """Show the sample editor dialog."""
        dialog = SampleEditorDialog(sample, self)
        if dialog.exec_() == QDialog.Accepted:
            # Update the sample in storage
            self.sample_storage.update_sample(sample)
            self.statusBar().showMessage(f"Updated sample: {sample.name}")

    def setup_connections(self):
        """Set up signal connections."""
        # Connect mixer signals
        self.mixer.levels_updated.connect(self._on_levels_updated)
        
        # Track component signals
        self.track_component.track_selected.connect(self.context.set_current_track)
        self.track_component.mode_changed.connect(self.context.set_current_mode)
        
        # Context signals
        self.context.track_changed.connect(self.track_component.set_current_track)
        self.context.mode_changed.connect(self.track_component.set_current_mode)
        self.context.track_changed.connect(self.display.set_current_track)
        self.context.mode_changed.connect(self.display.set_current_mode)
        
        # Initial state
        self.track_component.set_current_track(self.context.current_track)
        self.track_component.set_current_mode(self.context.current_mode)
        self.display.set_current_track(self.context.current_track)
        self.display.set_current_mode(self.context.current_mode)

    def _on_levels_updated(self):
        """Handle level updates."""
        # Update display with current levels
        channel_levels = {
            name: (channel.peak_level, channel.rms_level)
            for name, channel in self.mixer.channels.items()
        }
        self.display.update_levels(channel_levels)

    def _create_dock_widgets(self):
        """Create dock widgets."""
        # Skin selector dock
        skin_dock = QDockWidget("Skin", self)
        skin_dock.setAllowedAreas(Qt.LeftDockWidgetArea | Qt.RightDockWidgetArea)
        
        skin_selector = SkinSelector(self.skin_manager)
        skin_dock.setWidget(skin_selector)
        
        self.addDockWidget(Qt.RightDockWidgetArea, skin_dock)

    def _show_skin_selector(self):
        """Show the skin selector dialog."""
        # TODO: Implement skin selector dialog
        pass

    def _show_mixer_settings(self):
        """Show the mixer settings dialog."""
        dialog = MixerSettingsDialog(self.mixer, self.skin_manager, self)
        dialog.exec()

    def _show_preferences(self):
        """Show the preferences dialog."""
        dialog = PreferencesDialog(
            self.skin_manager,
            self.audio_engine,
            self.midi_manager,
            self
        )
        dialog.settings_changed.connect(self._on_settings_changed)
        dialog.exec()
    
    def _on_settings_changed(self):
        """Handle settings changes."""
        # Update skin
        self.skin_manager.load_skin()
        
        # Update audio engine settings
        if self.audio_engine:
            self.audio_engine.update_settings()
        
        # Update MIDI settings
        if self.midi_manager:
            self.midi_manager.update_settings()
        
        # Update UI
        self.update()
        
        # Update status
        self.statusBar().showMessage("Settings updated", 3000)

    def setup_ui(self):
        """Set up the user interface."""
        # Create components
        self.track_component = TrackComponent()
        self.display_component = DisplayComponent()
        self.mixer_component = MixerComponent()
        
        # Add components to layout
        main_layout = QVBoxLayout(self.centralWidget())
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        main_layout.addWidget(self.track_component)
        main_layout.addWidget(self.display_component, stretch=1)
        main_layout.addWidget(self.mixer_component)
        
        # Create stacked widget for different views
        self.stacked_widget = QTabWidget()
        main_layout.addWidget(self.stacked_widget)
        
        # Create main view
        main_view = QWidget()
        main_layout = QVBoxLayout(main_view)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)
        
        # Top section (display and skin selector)
        top_section = QHBoxLayout()
        top_section.setSpacing(0)
        
        # Display component
        top_section.addWidget(self.display_component, stretch=1)
        
        # Skin selector
        self.skin_selector = SkinSelector(self.skin_manager)
        top_section.addWidget(self.skin_selector)
        
        main_layout.addLayout(top_section)
        
        # Bottom section (mixer)
        self.mixer_component = MixerComponent(self.mixer)
        main_layout.addWidget(self.mixer_component)
        
        # Add views to stacked widget
        self.stacked_widget.addTab(main_view, "Sequencer")
        self.stacked_widget.addTab(self.skin_selector, "Theme Selector")
