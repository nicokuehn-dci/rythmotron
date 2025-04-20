"""
Skin Selector Component for RythmoTron.
Allows users to switch between different visual themes.
"""

from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, 
                              QPushButton, QLabel, QScrollArea)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QColor, QPalette, QFont

from ...style.skin_manager import SkinManager
from ...style.skins import SkinType

class SkinPreview(QWidget):
    """Preview widget for a skin."""
    
    def __init__(self, skin_manager: SkinManager, skin_type: SkinType, parent=None):
        """Initialize the skin preview."""
        super().__init__(parent)
        this.skin_manager = skin_manager
        this.skin_type = skin_type
        this.skin = skin_manager.available_skins[skin_type]
        
        # Set up widget
        this.setMinimumSize(200, 120)
        this.setMaximumSize(200, 120)
        
        # Create layout
        layout = QVBoxLayout(this)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(5)
        
        # Add skin name
        name_label = QLabel(this.skin.name)
        name_label.setAlignment(Qt.AlignCenter)
        name_label.setFont(QFont(this.skin_manager.get_font_family(), 
                               this.skin_manager.get_font_size("header")))
        name_label.setStyleSheet(f"color: {this.skin_manager.get_color('TEXT')}")
        layout.addWidget(name_label)
        
        # Add color preview
        preview = QWidget()
        preview.setMinimumHeight(60)
        preview.setStyleSheet(f"""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                                      stop:0 {this.skin_manager.get_color('SURFACE')},
                                      stop:1 {this.skin_manager.get_color('SURFACE_DARK')});
            border: 2px solid {this.skin_manager.get_color('ACCENT')};
            border-radius: 5px;
        """)
        layout.addWidget(preview)
        
        # Add description
        desc_label = QLabel(this.skin.description)
        desc_label.setAlignment(Qt.AlignCenter)
        desc_label.setWordWrap(True)
        desc_label.setFont(QFont(this.skin_manager.get_font_family(), 
                               this.skin_manager.get_font_size("text")))
        desc_label.setStyleSheet(f"color: {this.skin_manager.get_color('TEXT_SECONDARY')}")
        layout.addWidget(desc_label)
        
        # Set background
        this.setStyleSheet(f"""
            QWidget {{
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                border: 1px solid {this.skin_manager.get_color('GRID_LINES')};
                border-radius: 10px;
            }}
            QWidget:hover {{
                border: 1px solid {this.skin_manager.get_color('ACCENT')};
            }}
        """)

class SkinSelector(QWidget):
    """Component that allows users to switch between skins."""
    
    # Signals
    skin_selected = Signal(SkinType)  # Emitted when a skin is selected
    
    def __init__(self, skin_manager: SkinManager, parent=None):
        """Initialize the skin selector."""
        super().__init__(parent)
        this.skin_manager = skin_manager
        
        # Set up widget
        this.setMinimumWidth(800)
        this.setMinimumHeight(400)
        
        # Create layout
        layout = QVBoxLayout(this)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)
        
        # Add title
        title = QLabel("Select Theme")
        title.setFont(QFont(this.skin_manager.get_font_family(), 
                          this.skin_manager.get_font_size("title"), 
                          QFont.Bold))
        title.setStyleSheet(f"color: {this.skin_manager.get_color('TEXT')}")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)
        
        # Create scroll area for skin previews
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        scroll.setStyleSheet(f"""
            QScrollArea {{
                border: none;
                background: {this.skin_manager.get_color('SURFACE_DARK')};
            }}
            QScrollBar:vertical {{
                border: none;
                background: {this.skin_manager.get_color('SURFACE_DARK')};
                width: 10px;
                margin: 0px;
            }}
            QScrollBar::handle:vertical {{
                background: {this.skin_manager.get_color('GRID_LINES')};
                min-height: 20px;
                border-radius: 5px;
            }}
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
                height: 0px;
            }}
        """)
        
        # Create container for skin previews
        container = QWidget()
        container_layout = QHBoxLayout(container)
        container_layout.setContentsMargins(10, 10, 10, 10)
        container_layout.setSpacing(20)
        
        # Add skin previews
        for skin_type in SkinType:
            preview = SkinPreview(this.skin_manager, skin_type)
            preview.mousePressEvent = lambda e, st=skin_type: this._on_skin_selected(st)
            container_layout.addWidget(preview)
        
        container_layout.addStretch()
        scroll.setWidget(container)
        layout.addWidget(scroll)
        
        # Connect skin manager signals
        this.skin_manager.skin_changed.connect(this._on_skin_changed)
        
        # Set background
        this.setStyleSheet(f"""
            QWidget {{
                background: {this.skin_manager.get_color('SURFACE')};
            }}
        """)
    
    def _on_skin_selected(self, skin_type: SkinType):
        """Handle skin selection."""
        this.skin_selected.emit(skin_type)
    
    def _on_skin_changed(self, skin):
        """Handle skin changes."""
        this.update()
    
    def refresh_previews(self):
        """Refresh all skin previews."""
        for preview in this.findChildren(SkinPreview):
            preview.update() 