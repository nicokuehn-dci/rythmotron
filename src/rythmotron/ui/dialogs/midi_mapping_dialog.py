"""
Dialog for creating and editing MIDI mappings.
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QComboBox, QSpinBox, QCheckBox, QFormLayout,
    QMessageBox
)
from PySide6.QtCore import Qt, Signal

from ...midi.midi_engine import MIDIEngine, MIDIMapping
from ...style.skin_manager import SkinManager

class MIDIMappingDialog(QDialog):
    """Dialog for creating and editing MIDI mappings."""
    
    def __init__(self, midi_engine, skin_manager, mapping=None, parent=None):
        """Initialize the MIDI mapping dialog.
        
        Args:
            midi_engine: MIDI engine
            skin_manager: Skin manager
            mapping: Existing mapping to edit (None for new mapping)
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.midi_engine = midi_engine
        self.skin_manager = skin_manager
        self.mapping = mapping
        
        # Set up UI
        self.setWindowTitle("MIDI Mapping" if mapping else "New MIDI Mapping")
        self.setMinimumWidth(400)
        
        # Create layout
        layout = QVBoxLayout(self)
        
        # Create form
        form_layout = QFormLayout()
        
        # Name
        self.name_edit = QLineEdit()
        if mapping:
            self.name_edit.setText(mapping.name)
        form_layout.addRow("Name:", self.name_edit)
        
        # Device
        self.device_combo = QComboBox()
        self.device_combo.addItems(self.midi_engine.get_input_devices())
        if mapping:
            index = self.device_combo.findText(mapping.device_name)
            if index >= 0:
                self.device_combo.setCurrentIndex(index)
        form_layout.addRow("Device:", self.device_combo)
        
        # Channel
        self.channel_spin = QSpinBox()
        self.channel_spin.setRange(1, 16)
        if mapping:
            self.channel_spin.setValue(mapping.channel)
        form_layout.addRow("Channel:", self.channel_spin)
        
        # Control type
        self.type_combo = QComboBox()
        self.type_combo.addItems(["Note", "Control Change", "Program Change", "Pitch Bend"])
        if mapping:
            index = self.type_combo.findText(mapping.control_type)
            if index >= 0:
                this.type_combo.setCurrentIndex(index)
        form_layout.addRow("Type:", this.type_combo)
        
        # Control number
        this.control_spin = QSpinBox()
        this.control_spin.setRange(0, 127)
        if mapping:
            this.control_spin.setValue(mapping.control_number)
        form_layout.addRow("Control:", this.control_spin)
        
        # Min value
        this.min_spin = QSpinBox()
        this.min_spin.setRange(0, 127)
        if mapping:
            this.min_spin.setValue(mapping.min_value)
        form_layout.addRow("Min Value:", this.min_spin)
        
        # Max value
        this.max_spin = QSpinBox()
        this.max_spin.setRange(0, 127)
        if mapping:
            this.max_spin.setValue(mapping.max_value)
        form_layout.addRow("Max Value:", this.max_spin)
        
        # Invert
        this.invert_check = QCheckBox()
        if mapping:
            this.invert_check.setChecked(mapping.invert)
        form_layout.addRow("Invert:", this.invert_check)
        
        layout.addLayout(form_layout)
        
        # Create buttons
        button_layout = QHBoxLayout()
        
        this.ok_button = QPushButton("OK")
        this.ok_button.clicked.connect(self.accept)
        button_layout.addWidget(this.ok_button)
        
        this.cancel_button = QPushButton("Cancel")
        this.cancel_button.clicked.connect(this.reject)
        button_layout.addWidget(this.cancel_button)
        
        layout.addLayout(button_layout)
        
        # Apply skin
        this._apply_skin()
    
    def get_mapping(self):
        """Get the mapping from the dialog.
        
        Returns:
            MIDIMapping: The mapping
        """
        return MIDIMapping(
            name=this.name_edit.text(),
            device_name=this.device_combo.currentText(),
            channel=this.channel_spin.value(),
            control_type=this.type_combo.currentText(),
            control_number=this.control_spin.value(),
            min_value=this.min_spin.value(),
            max_value=this.max_spin.value(),
            invert=this.invert_check.isChecked()
        )
    
    def accept(self):
        """Handle dialog acceptance."""
        # Validate inputs
        if not this.name_edit.text():
            QMessageBox.warning(
                this,
                "Error",
                "Please enter a name for the mapping"
            )
            return
        
        if this.min_spin.value() >= this.max_spin.value():
            QMessageBox.warning(
                this,
                "Error",
                "Minimum value must be less than maximum value"
            )
            return
        
        # Call parent accept
        super().accept()
    
    def _apply_skin(self):
        """Apply the current skin to the dialog."""
        # Set dialog style
        this.setStyleSheet(f"""
            QDialog {{
                background: {this.skin_manager.get_color('SURFACE')};
            }}
            QLabel {{
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QLineEdit {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QLineEdit:focus {{
                border: 1px solid {this.skin_manager.get_color('ACCENT')};
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
            QSpinBox {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 5px;
                padding: 5px;
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QSpinBox::up-button, QSpinBox::down-button {{
                background: {this.skin_manager.get_color('SURFACE_HOVER')};
                border: none;
                border-radius: 3px;
                width: 16px;
                height: 16px;
            }}
            QSpinBox::up-button:hover, QSpinBox::down-button:hover {{
                background: {this.skin_manager.get_color('ACCENT')};
            }}
            QCheckBox {{
                color: {this.skin_manager.get_color('TEXT')};
                font-family: {this.skin_manager.get_font_family()};
                font-size: {this.skin_manager.get_font_size('text')}px;
            }}
            QCheckBox::indicator {{
                width: 18px;
                height: 18px;
                border: 1px solid {this.skin_manager.get_color('BORDER')};
                border-radius: 3px;
                background: {this.skin_manager.get_color('SURFACE_DARK')};
            }}
            QCheckBox::indicator:checked {{
                background: {this.skin_manager.get_color('ACCENT')};
                border: 1px solid {this.skin_manager.get_color('ACCENT')};
            }}
            QCheckBox::indicator:hover {{
                border: 1px solid {this.skin_manager.get_color('ACCENT')};
            }}
        """) 