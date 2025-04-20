"""
Dialog for configuring mixer settings.
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit,
    QPushButton, QComboBox, QSpinBox, QCheckBox, QFormLayout,
    QMessageBox, QTabWidget, QWidget, QListWidget, QListWidgetItem,
    QGroupBox, QSplitter, QFrame
)
from PySide6.QtCore import Qt, Signal, Slot

from ...audio.mixer import Mixer, ChannelStrip
from ...style.skin_manager import SkinManager

class MixerSettingsDialog(QDialog):
    """Dialog for configuring mixer settings."""
    
    def __init__(self, mixer: Mixer, skin_manager: SkinManager, parent=None):
        """Initialize the mixer settings dialog.
        
        Args:
            mixer: Mixer
            skin_manager: Skin manager
            parent: Parent widget
        """
        super().__init__(parent)
        
        # Store references
        self.mixer = mixer
        self.skin_manager = skin_manager
        
        # Set up UI
        self.setWindowTitle("Mixer Settings")
        self.setMinimumSize(800, 600)
        
        # Create layout
        layout = QVBoxLayout(self)
        
        # Create tab widget
        self.tab_widget = QTabWidget()
        layout.addWidget(self.tab_widget)
        
        # Create tabs
        self.channels_tab = QWidget()
        self.master_tab = QWidget()
        
        self.tab_widget.addTab(self.channels_tab, "Channels")
        self.tab_widget.addTab(self.master_tab, "Master")
        
        # Set up channels tab
        self._setup_channels_tab()
        
        # Set up master tab
        self._setup_master_tab()
        
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
        self.mixer.channel_added.connect(self._on_channel_added)
        self.mixer.channel_removed.connect(self._on_channel_removed)
        self.mixer.channel_updated.connect(self._on_channel_updated)
        self.mixer.master_updated.connect(self._on_master_updated)
        
        # Apply skin
        self._apply_skin()
    
    def _setup_channels_tab(self):
        """Set up the channels tab."""
        layout = QVBoxLayout(self.channels_tab)
        
        # Create splitter
        splitter = QSplitter(Qt.Horizontal)
        layout.addWidget(splitter)
        
        # Channels list
        channels_group = QGroupBox("Channels")
        channels_layout = QVBoxLayout(channels_group)
        
        self.channels_list = QListWidget()
        self.channels_list.currentItemChanged.connect(self._on_channel_selected)
        channels_layout.addWidget(self.channels_list)
        
        # Add/remove buttons
        button_layout = QHBoxLayout()
        
        self.add_channel_button = QPushButton("Add")
        self.add_channel_button.clicked.connect(self._add_channel)
        button_layout.addWidget(self.add_channel_button)
        
        self.remove_channel_button = QPushButton("Remove")
        self.remove_channel_button.clicked.connect(self._remove_channel)
        button_layout.addWidget(self.remove_channel_button)
        
        channels_layout.addLayout(button_layout)
        
        # Channel details
        details_group = QGroupBox("Channel Details")
        details_layout = QFormLayout(details_group)
        
        self.channel_name_edit = QLineEdit()
        details_layout.addRow("Name:", self.channel_name_edit)
        
        self.channel_volume_spin = QSpinBox()
        self.channel_volume_spin.setRange(0, 100)
        self.channel_volume_spin.setSuffix("%")
        self.channel_volume_spin.valueChanged.connect(self._on_channel_volume_changed)
        details_layout.addRow("Volume:", self.channel_volume_spin)
        
        self.channel_pan_spin = QSpinBox()
        self.channel_pan_spin.setRange(-100, 100)
        self.channel_pan_spin.setSuffix("%")
        self.channel_pan_spin.valueChanged.connect(self._on_channel_pan_changed)
        details_layout.addRow("Pan:", self.channel_pan_spin)
        
        self.channel_mute_check = QCheckBox()
        self.channel_mute_check.toggled.connect(self._on_channel_mute_toggled)
        details_layout.addRow("Mute:", self.channel_mute_check)
        
        self.channel_solo_check = QCheckBox()
        self.channel_solo_check.toggled.connect(self._on_channel_solo_toggled)
        details_layout.addRow("Solo:", self.channel_solo_check)
        
        # Add to splitter
        splitter.addWidget(channels_group)
        splitter.addWidget(details_group)
        
        # Set initial sizes
        splitter.setSizes([300, 500])
        
        # Populate channels list
        self._update_channels_list()
    
    def _setup_master_tab(self):
        """Set up the master tab."""
        layout = QVBoxLayout(self.master_tab)
        
        # Master settings
        settings_group = QGroupBox("Master Settings")
        settings_layout = QFormLayout(settings_group)
        
        self.master_volume_spin = QSpinBox()
        self.master_volume_spin.setRange(0, 100)
        self.master_volume_spin.setSuffix("%")
        self.master_volume_spin.setValue(int(self.mixer.master_volume * 100))
        self.master_volume_spin.valueChanged.connect(self._on_master_volume_changed)
        settings_layout.addRow("Volume:", self.master_volume_spin)
        
        self.master_mute_check = QCheckBox()
        self.master_mute_check.setChecked(self.mixer.master_mute)
        self.master_mute_check.toggled.connect(self._on_master_mute_toggled)
        settings_layout.addRow("Mute:", self.master_mute_check)
        
        layout.addWidget(settings_group)
        
        # Add stretch
        layout.addStretch()
    
    def _update_channels_list(self):
        """Update the channels list."""
        # Clear list
        self.channels_list.clear()
        
        # Add channels
        for name in self.mixer.get_channels():
            item = QListWidgetItem(name)
            self.channels_list.addItem(item)
    
    def _on_channel_added(self, name: str):
        """Handle channel added signal.
        
        Args:
            name: Channel name
        """
        self._update_channels_list()
    
    def _on_channel_removed(self, name: str):
        """Handle channel removed signal.
        
        Args:
            name: Channel name
        """
        self._update_channels_list()
    
    def _on_channel_updated(self, name: str):
        """Handle channel updated signal.
        
        Args:
            name: Channel name
        """
        # Update selected channel
        current_item = self.channels_list.currentItem()
        if current_item and current_item.text() == name:
            self._update_channel_details(name)
    
    def _on_master_updated(self):
        """Handle master updated signal."""
        # Update master settings
        self.master_volume_spin.setValue(int(self.mixer.master_volume * 100))
        self.master_mute_check.setChecked(self.mixer.master_mute)
    
    def _on_channel_selected(self, current, previous):
        """Handle channel selection change.
        
        Args:
            current: Current item
            previous: Previous item
        """
        if not current:
            return
        
        # Get channel name
        name = current.text()
        
        # Update details
        self._update_channel_details(name)
    
    def _update_channel_details(self, name: str):
        """Update channel details.
        
        Args:
            name: Channel name
        """
        # Get channel
        channel = self.mixer.get_channel(name)
        if not channel:
            return
        
        # Update details
        self.channel_name_edit.setText(channel.name)
        self.channel_volume_spin.setValue(int(channel.volume * 100))
        self.channel_pan_spin.setValue(int(channel.pan * 100))
        self.channel_mute_check.setChecked(channel.mute)
        self.channel_solo_check.setChecked(channel.solo)
    
    def _on_channel_volume_changed(self, value: int):
        """Handle channel volume change.
        
        Args:
            value: Volume value (0-100)
        """
        # Get selected channel
        current_item = self.channels_list.currentItem()
        if not current_item:
            return
        
        # Get channel name
        name = current_item.text()
        
        # Update volume
        self.mixer.set_channel_volume(name, value / 100.0)
    
    def _on_channel_pan_changed(self, value: int):
        """Handle channel pan change.
        
        Args:
            value: Pan value (-100 to 100)
        """
        # Get selected channel
        current_item = self.channels_list.currentItem()
        if not current_item:
            return
        
        # Get channel name
        name = current_item.text()
        
        # Update pan
        self.mixer.set_channel_pan(name, value / 100.0)
    
    def _on_channel_mute_toggled(self, checked: bool):
        """Handle channel mute toggle.
        
        Args:
            checked: Mute state
        """
        # Get selected channel
        current_item = self.channels_list.currentItem()
        if not current_item:
            return
        
        # Get channel name
        name = current_item.text()
        
        # Update mute
        self.mixer.set_channel_mute(name, checked)
    
    def _on_channel_solo_toggled(self, checked: bool):
        """Handle channel solo toggle.
        
        Args:
            checked: Solo state
        """
        # Get selected channel
        current_item = self.channels_list.currentItem()
        if not current_item:
            return
        
        # Get channel name
        name = current_item.text()
        
        # Update solo
        self.mixer.set_channel_solo(name, checked)
    
    def _add_channel(self):
        """Add a new channel."""
        # Get name
        name = self.channel_name_edit.text()
        if not name:
            QMessageBox.warning(
                self,
                "Error",
                "Please enter a name for the channel"
            )
            return
        
        # Add channel
        if self.mixer.add_channel(name):
            # Select new channel
            for i in range(self.channels_list.count()):
                item = self.channels_list.item(i)
                if item.text() == name:
                    self.channels_list.setCurrentItem(item)
                    break
        else:
            QMessageBox.warning(
                self,
                "Error",
                f"Channel '{name}' already exists"
            )
    
    def _remove_channel(self):
        """Remove the selected channel."""
        # Get selected item
        item = this.channels_list.currentItem()
        if not item:
            return
        
        # Get channel name
        name = item.text()
        
        # Confirm removal
        reply = QMessageBox.question(
            this,
            "Remove Channel",
            f"Are you sure you want to remove the channel '{name}'?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # Remove channel
            this.mixer.remove_channel(name)
    
    def _on_master_volume_changed(self, value: int):
        """Handle master volume change.
        
        Args:
            value: Volume value (0-100)
        """
        this.mixer.set_master_volume(value / 100.0)
    
    def _on_master_mute_toggled(self, checked: bool):
        """Handle master mute toggle.
        
        Args:
            checked: Mute state
        """
        this.mixer.set_master_mute(checked)
    
    def _apply_skin(self):
        """Apply the current skin to the dialog."""
        # Set dialog style
        this.setStyleSheet(f"""
            QDialog {{
                background: {this.skin_manager.get_color('SURFACE')};
            }}
            QGroupBox {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
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