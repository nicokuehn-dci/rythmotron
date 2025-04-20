"""
MIDI settings dialog for RythmoTron.
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QComboBox, 
    QPushButton, QListWidget, QListWidgetItem, QGroupBox,
    QFormLayout, QCheckBox, QSpinBox, QTabWidget, QWidget,
    QMessageBox, QSplitter, QFrame
)
from PySide6.QtCore import Qt, Signal, Slot
from PySide6.QtGui import QColor, QFont

from ...midi.midi_engine import MIDIEngine, MIDIMapping
from ...style.skin_manager import SkinManager

class MIDISettingsDialog(QDialog):
    """Dialog for configuring MIDI settings."""
    
    def __init__(self, midi_engine, skin_manager, parent=None):
        """Initialize the MIDI settings dialog.
        
        Args:
            midi_engine: MIDI engine
            skin_manager: Skin manager
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.midi_engine = midi_engine
        self.skin_manager = skin_manager
        
        # Set up UI
        self.setWindowTitle("MIDI Settings")
        self.setMinimumSize(800, 600)
        
        # Create layout
        layout = QVBoxLayout(self)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        layout.addWidget(self.tab_widget)
        
        # Create tabs
        self.devices_tab = QWidget()
        self.mappings_tab = QWidget()
        self.learning_tab = QWidget()
        
        self.tab_widget.addTab(self.devices_tab, "Devices")
        self.tab_widget.addTab(self.mappings_tab, "Mappings")
        self.tab_widget.addTab(self.learning_tab, "MIDI Learn")
        
        # Set up devices tab
        self._setup_devices_tab()
        
        # Set up mappings tab
        self._setup_mappings_tab()
        
        # Set up learning tab
        self._setup_learning_tab()
        
        # Create buttons
        button_layout = QHBoxLayout()
        
        self.ok_button = QPushButton("OK")
        self.ok_button.clicked.connect(self.accept)
        button_layout.addWidget(self.ok_button)
        
        self.cancel_button = QPushButton("Cancel")
        self.cancel_button.clicked.connect(self.reject)
        button_layout.addWidget(self.cancel_button)
        
        layout.addLayout(button_layout)
        
        # Connect signals
        self.midi_engine.device_connected.connect(self._on_device_connected)
        self.midi_engine.device_disconnected.connect(self._on_device_disconnected)
        self.midi_engine.mapping_added.connect(self._on_mapping_added)
        self.midi_engine.mapping_removed.connect(self._on_mapping_removed)
        
        # Apply skin
        self._apply_skin()
    
    def _setup_devices_tab(self):
        """Set up the devices tab."""
        layout = QVBoxLayout(self.devices_tab)
        
        # Input devices
        input_group = QGroupBox("Input Devices")
        input_layout = QVBoxLayout(input_group)
        
        self.input_list = QListWidget()
        input_layout.addWidget(self.input_list)
        
        # Output devices
        output_group = QGroupBox("Output Devices")
        output_layout = QVBoxLayout(output_group)
        
        self.output_list = QListWidget()
        output_layout.addWidget(self.output_list)
        
        # Add to layout
        layout.addWidget(input_group)
        layout.addWidget(output_group)
        
        # Populate lists
        self._update_device_lists()
    
    def _setup_mappings_tab(self):
        """Set up the mappings tab."""
        layout = QVBoxLayout(self.mappings_tab)
        
        # Create splitter
        splitter = QSplitter(Qt.Horizontal)
        layout.addWidget(splitter)
        
        # Mappings list
        mappings_group = QGroupBox("Mappings")
        mappings_layout = QVBoxLayout(mappings_group)
        
        self.mappings_list = QListWidget()
        self.mappings_list.currentItemChanged.connect(self._on_mapping_selected)
        mappings_layout.addWidget(self.mappings_list)
        
        # Add/remove buttons
        button_layout = QHBoxLayout()
        
        self.add_mapping_button = QPushButton("Add")
        self.add_mapping_button.clicked.connect(self._add_mapping)
        button_layout.addWidget(self.add_mapping_button)
        
        self.remove_mapping_button = QPushButton("Remove")
        self.remove_mapping_button.clicked.connect(self._remove_mapping)
        button_layout.addWidget(self.remove_mapping_button)
        
        mappings_layout.addLayout(button_layout)
        
        # Mapping details
        details_group = QGroupBox("Mapping Details")
        details_layout = QFormLayout(details_group)
        
        self.mapping_name_edit = QLabel()
        details_layout.addRow("Name:", self.mapping_name_edit)
        
        self.mapping_device_edit = QLabel()
        details_layout.addRow("Device:", self.mapping_device_edit)
        
        self.mapping_channel_edit = QLabel()
        details_layout.addRow("Channel:", self.mapping_channel_edit)
        
        self.mapping_type_edit = QLabel()
        details_layout.addRow("Type:", self.mapping_type_edit)
        
        self.mapping_control_edit = QLabel()
        details_layout.addRow("Control:", self.mapping_control_edit)
        
        self.mapping_min_edit = QLabel()
        details_layout.addRow("Min Value:", self.mapping_min_edit)
        
        self.mapping_max_edit = QLabel()
        details_layout.addRow("Max Value:", self.mapping_max_edit)
        
        self.mapping_invert_edit = QLabel()
        details_layout.addRow("Invert:", self.mapping_invert_edit)
        
        # Add to splitter
        splitter.addWidget(mappings_group)
        splitter.addWidget(details_group)
        
        # Set initial sizes
        splitter.setSizes([300, 500])
        
        # Populate mappings list
        self._update_mappings_list()
    
    def _setup_learning_tab(self):
        """Set up the learning tab."""
        layout = QVBoxLayout(self.learning_tab)
        
        # Instructions
        instructions = QLabel(
            "To learn a MIDI mapping:\n"
            "1. Select the control you want to map\n"
            "2. Click 'Start Learning'\n"
            "3. Press the button or move the control on your MIDI device\n"
            "4. The mapping will be created automatically"
        )
        instructions.setWordWrap(True)
        layout.addWidget(instructions)
        
        # Control selection
        control_group = QGroupBox("Control Selection")
        control_layout = QFormLayout(control_group)
        
        self.control_type_combo = QComboBox()
        self.control_type_combo.addItems(["Button", "Slider", "Knob", "Pad"])
        control_layout.addRow("Control Type:", self.control_type_combo)
        
        self.control_name_edit = QLabel()
        control_layout.addRow("Control Name:", self.control_name_edit)
        
        layout.addWidget(control_group)
        
        # Learning controls
        learning_group = QGroupBox("MIDI Learning")
        learning_layout = QVBoxLayout(learning_group)
        
        self.learning_status = QLabel("Not learning")
        learning_layout.addWidget(self.learning_status)
        
        button_layout = QHBoxLayout()
        
        self.start_learning_button = QPushButton("Start Learning")
        self.start_learning_button.clicked.connect(self._start_learning)
        button_layout.addWidget(self.start_learning_button)
        
        self.stop_learning_button = QPushButton("Stop Learning")
        self.stop_learning_button.clicked.connect(self._stop_learning)
        self.stop_learning_button.setEnabled(False)
        button_layout.addWidget(self.stop_learning_button)
        
        learning_layout.addLayout(button_layout)
        
        layout.addWidget(learning_group)
        
        # Add stretch
        layout.addStretch()
    
    def _update_device_lists(self):
        """Update the device lists."""
        # Clear lists
        self.input_list.clear()
        self.output_list.clear()
        
        # Add input devices
        for device in self.midi_engine.get_input_devices():
            item = QListWidgetItem(device)
            self.input_list.addItem(item)
        
        # Add output devices
        for device in self.midi_engine.get_output_devices():
            item = QListWidgetItem(device)
            self.output_list.addItem(item)
    
    def _update_mappings_list(self):
        """Update the mappings list."""
        # Clear list
        self.mappings_list.clear()
        
        # Add mappings
        for name, mapping in self.midi_engine.get_mappings().items():
            item = QListWidgetItem(name)
            item.setData(Qt.UserRole, mapping)
            self.mappings_list.addItem(item)
    
    def _on_device_connected(self, device_name):
        """Handle device connected signal."""
        self._update_device_lists()
    
    def _on_device_disconnected(self, device_name):
        """Handle device disconnected signal."""
        self._update_device_lists()
    
    def _on_mapping_added(self, name):
        """Handle mapping added signal."""
        self._update_mappings_list()
    
    def _on_mapping_removed(self, name):
        """Handle mapping removed signal."""
        self._update_mappings_list()
    
    def _on_mapping_selected(self, current, previous):
        """Handle mapping selection change."""
        if not current:
            return
        
        # Get mapping
        mapping = current.data(Qt.UserRole)
        
        # Update details
        self.mapping_name_edit.setText(mapping.name)
        self.mapping_device_edit.setText(mapping.device_name)
        self.mapping_channel_edit.setText(str(mapping.channel))
        self.mapping_type_edit.setText(mapping.control_type)
        self.mapping_control_edit.setText(str(mapping.control_number))
        self.mapping_min_edit.setText(str(mapping.min_value))
        self.mapping_max_edit.setText(str(mapping.max_value))
        self.mapping_invert_edit.setText("Yes" if mapping.invert else "No")
    
    def _add_mapping(self):
        """Add a new mapping."""
        # TODO: Implement mapping creation dialog
        pass
    
    def _remove_mapping(self):
        """Remove the selected mapping."""
        # Get selected item
        item = self.mappings_list.currentItem()
        if not item:
            return
        
        # Get mapping name
        name = item.text()
        
        # Confirm removal
        reply = QMessageBox.question(
            self,
            "Remove Mapping",
            f"Are you sure you want to remove the mapping '{name}'?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # Remove mapping
            self.midi_engine.remove_mapping(name)
    
    def _start_learning(self):
        """Start MIDI learning mode."""
        # Get control name
        control_name = self.control_name_edit.text()
        if not control_name:
            QMessageBox.warning(
                self,
                "Error",
                "Please enter a control name"
            )
            return
        
        # Start learning
        self.midi_engine.start_learning(control_name)
        
        # Update UI
        self.learning_status.setText("Learning... Press a button or move a control on your MIDI device")
        self.start_learning_button.setEnabled(False)
        self.stop_learning_button.setEnabled(True)
    
    def _stop_learning(self):
        """Stop MIDI learning mode."""
        # Stop learning
        self.midi_engine.stop_learning()
        
        # Update UI
        self.learning_status.setText("Not learning")
        this.start_learning_button.setEnabled(True)
        this.stop_learning_button.setEnabled(False)
    
    def _apply_skin(self):
        """Apply the current skin to the dialog."""
        # Set dialog style
        self.setStyleSheet(f"""
            QDialog {{
                background: {self.skin_manager.get_color('SURFACE')};
            }}
            QGroupBox {{
                background: {self.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                margin-top: 1em;
                padding-top: 0.5em;
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
                color: {this.skin_manager.get_color('TEXT')};
            }}
            QGroupBox::title {{
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 3px 0 3px;
            }}
            QLabel {{
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QPushButton {{
                background: {this.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 5px;
                padding: 10px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QPushButton:hover {{
                background: {this.skin_manager.get_color('ACCENT')};
            }}
            QPushButton:disabled {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                color: {this.skin_manager.get_color('TEXT_DISABLED')};
            }}
            QListWidget {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QListWidget::item {{
                padding: 5px;
            }}
            QListWidget::item:selected {{
                background: {this.skin_manager.get_color('ACCENT')};
                color: {this.skin_manager.get_color('TEXT_INVERSE')};
            }}
            QComboBox {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
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
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                background: {this.skin_manager.get_color('SURFACE')};
            }}
            QTabBar::tab {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-bottom: none;
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 8px 16px;
                margin-right: 2px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QTabBar::tab:selected {{
                background: {this.skin_manager.get_color('SURFACE')};
                border-bottom: none;
                margin-top: -2px;
            }}
            QTabBar::tab:!selected {{
                margin-top: 1px;
            }}
        """) 