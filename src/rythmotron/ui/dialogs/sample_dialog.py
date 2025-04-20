"""
Sample management dialog for RythmoTron.
"""

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QListWidget, QListWidgetItem, QFileDialog,
    QComboBox, QLineEdit, QMessageBox
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QIcon

from ..style.colors import Colors
from ...storage.sample_storage import SampleStorage, SampleMetadata

class SampleDialog(QDialog):
    """Dialog for managing samples."""
    
    sample_selected = Signal(str)  # Emitted when a sample is selected
    
    def __init__(self, storage: SampleStorage, parent=None):
        """Initialize sample dialog.
        
        Args:
            storage: Sample storage instance
            parent: Parent widget
        """
        super().__init__(parent)
        self.storage = storage
        
        self.setWindowTitle("Sample Manager")
        self.setMinimumSize(600, 400)
        
        self.setup_ui()
        self.setup_connections()
        self.load_samples()
    
    def setup_ui(self):
        """Set up the user interface."""
        # Main layout
        layout = QVBoxLayout(self)
        layout.setSpacing(10)
        layout.setContentsMargins(20, 20, 20, 20)
        
        # Toolbar
        toolbar = QHBoxLayout()
        
        # Import button
        self.import_btn = QPushButton("Import")
        self.import_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background-color: {Colors.ACCENT};
            }}
        """)
        toolbar.addWidget(self.import_btn)
        
        # Export button
        self.export_btn = QPushButton("Export")
        self.export_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background-color: {Colors.ACCENT};
            }}
        """)
        toolbar.addWidget(self.export_btn)
        
        # Remove button
        self.remove_btn = QPushButton("Remove")
        self.remove_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background-color: {Colors.ACCENT};
            }}
        """)
        toolbar.addWidget(self.remove_btn)
        
        toolbar.addStretch()
        
        # Category filter
        self.category_combo = QComboBox()
        self.category_combo.setStyleSheet(f"""
            QComboBox {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px;
                font-size: 14px;
            }}
            QComboBox::drop-down {{
                border: none;
            }}
            QComboBox::down-arrow {{
                image: url(resources/icons/dropdown.png);
                width: 12px;
                height: 12px;
            }}
        """)
        toolbar.addWidget(self.category_combo)
        
        layout.addLayout(toolbar)
        
        # Sample list
        self.sample_list = QListWidget()
        self.sample_list.setStyleSheet(f"""
            QListWidget {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                font-size: 14px;
            }}
            QListWidget::item {{
                padding: 8px;
                border-bottom: 1px solid {Colors.GRID};
            }}
            QListWidget::item:selected {{
                background-color: {Colors.ACCENT};
            }}
        """)
        layout.addWidget(self.sample_list)
        
        # Sample info
        info_layout = QHBoxLayout()
        
        # Name
        name_layout = QVBoxLayout()
        name_label = QLabel("Name:")
        name_label.setStyleSheet(f"color: {Colors.TEXT}; font-size: 12px;")
        self.name_edit = QLineEdit()
        self.name_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px;
                font-size: 14px;
            }}
        """)
        name_layout.addWidget(name_label)
        name_layout.addWidget(self.name_edit)
        info_layout.addLayout(name_layout)
        
        # Category
        category_layout = QVBoxLayout()
        category_label = QLabel("Category:")
        category_label.setStyleSheet(f"color: {Colors.TEXT}; font-size: 12px;")
        self.category_edit = QLineEdit()
        self.category_edit.setStyleSheet(f"""
            QLineEdit {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px;
                font-size: 14px;
            }}
        """)
        category_layout.addWidget(category_label)
        category_layout.addWidget(self.category_edit)
        info_layout.addLayout(category_layout)
        
        layout.addLayout(info_layout)
        
        # Buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()
        
        # Cancel button
        self.cancel_btn = QPushButton("Cancel")
        self.cancel_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.SURFACE};
                color: {Colors.TEXT};
                border: 1px solid {Colors.ACCENT};
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background-color: {Colors.ACCENT};
            }}
        """)
        button_layout.addWidget(self.cancel_btn)
        
        # Select button
        self.select_btn = QPushButton("Select")
        self.select_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {Colors.ACCENT};
                color: {Colors.TEXT};
                border: none;
                border-radius: 4px;
                padding: 8px 16px;
                font-size: 14px;
            }}
            QPushButton:hover {{
                background-color: {Colors.ACCENT_HOVER};
            }}
        """)
        button_layout.addWidget(self.select_btn)
        
        layout.addLayout(button_layout)
    
    def setup_connections(self):
        """Set up signal connections."""
        self.import_btn.clicked.connect(self._on_import_clicked)
        self.export_btn.clicked.connect(self._on_export_clicked)
        self.remove_btn.clicked.connect(self._on_remove_clicked)
        self.category_combo.currentTextChanged.connect(self._on_category_changed)
        self.sample_list.currentItemChanged.connect(self._on_sample_selected)
        self.name_edit.textChanged.connect(self._on_name_changed)
        self.category_edit.textChanged.connect(self._on_category_edited)
        self.cancel_btn.clicked.connect(self.reject)
        self.select_btn.clicked.connect(self._on_select_clicked)
    
    def load_samples(self):
        """Load samples into the list."""
        self.sample_list.clear()
        
        # Load categories
        categories = ["All"] + self.storage.get_categories()
        self.category_combo.clear()
        self.category_combo.addItems(categories)
        
        # Load samples
        category = self.category_combo.currentText()
        if category == "All":
            samples = list(self.storage.metadata.values())
        else:
            samples = self.storage.get_samples_by_category(category)
        
        for sample in samples:
            item = QListWidgetItem(sample.name)
            item.setData(Qt.UserRole, sample.name)
            self.sample_list.addItem(item)
    
    def _on_import_clicked(self):
        """Handle import button click."""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Import Sample",
            "",
            "Audio Files (*.wav *.mp3 *.ogg *.flac)"
        )
        
        if file_path:
            category = self.category_combo.currentText()
            if category == "All":
                category = "default"
                
            name = self.storage.import_sample(file_path, category)
            if name:
                self.load_samples()
                # Select the new sample
                for i in range(self.sample_list.count()):
                    item = self.sample_list.item(i)
                    if item.data(Qt.UserRole) == name:
                        self.sample_list.setCurrentItem(item)
                        break
            else:
                QMessageBox.warning(
                    self,
                    "Import Error",
                    "Failed to import sample file."
                )
    
    def _on_export_clicked(self):
        """Handle export button click."""
        current_item = self.sample_list.currentItem()
        if not current_item:
            return
            
        name = current_item.data(Qt.UserRole)
        sample = self.storage.get_sample(name)
        if not sample:
            return
            
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Export Sample",
            sample.name,
            "Audio Files (*.wav)"
        )
        
        if file_path:
            if not self.storage.export_sample(name, file_path):
                QMessageBox.warning(
                    self,
                    "Export Error",
                    "Failed to export sample file."
                )
    
    def _on_remove_clicked(self):
        """Handle remove button click."""
        current_item = self.sample_list.currentItem()
        if not current_item:
            return
            
        name = current_item.data(Qt.UserRole)
        
        reply = QMessageBox.question(
            self,
            "Remove Sample",
            f"Are you sure you want to remove '{name}'?",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            if self.storage.remove_sample(name):
                self.load_samples()
            else:
                QMessageBox.warning(
                    self,
                    "Remove Error",
                    "Failed to remove sample."
                )
    
    def _on_category_changed(self, category: str):
        """Handle category selection change."""
        self.load_samples()
    
    def _on_sample_selected(self, current: QListWidgetItem, previous: QListWidgetItem):
        """Handle sample selection change."""
        if not current:
            self.name_edit.clear()
            self.category_edit.clear()
            return
            
        name = current.data(Qt.UserRole)
        sample = self.storage.get_sample(name)
        if sample:
            self.name_edit.setText(sample.name)
            self.category_edit.setText(sample.category)
    
    def _on_name_changed(self, name: str):
        """Handle name edit change."""
        current_item = self.sample_list.currentItem()
        if not current_item:
            return
            
        old_name = current_item.data(Qt.UserRole)
        if self.storage.update_sample(old_name, name=name):
            self.load_samples()
            # Select the renamed sample
            for i in range(self.sample_list.count()):
                item = self.sample_list.item(i)
                if item.data(Qt.UserRole) == name:
                    self.sample_list.setCurrentItem(item)
                    break
    
    def _on_category_edited(self, category: str):
        """Handle category edit change."""
        current_item = self.sample_list.currentItem()
        if not current_item:
            return
            
        name = current_item.data(Qt.UserRole)
        if self.storage.update_sample(name, category=category):
            self.load_samples()
            # Select the recategorized sample
            for i in range(self.sample_list.count()):
                item = self.sample_list.item(i)
                if item.data(Qt.UserRole) == name:
                    self.sample_list.setCurrentItem(item)
                    break
    
    def _on_select_clicked(self):
        """Handle select button click."""
        current_item = self.sample_list.currentItem()
        if not current_item:
            return
            
        name = current_item.data(Qt.UserRole)
        self.sample_selected.emit(name)
        self.accept() 