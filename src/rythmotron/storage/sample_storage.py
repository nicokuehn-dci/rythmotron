"""
Sample storage management for RythmoTron.
"""

import os
import shutil
import json
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from PySide6.QtCore import QObject, Signal

@dataclass
class SampleMetadata:
    """Metadata for a sample file."""
    name: str
    path: str
    duration: float
    sample_rate: int
    bit_depth: int
    channels: int
    tags: List[str]
    category: str
    created_at: str
    modified_at: str

class SampleStorage(QObject):
    """Manages sample storage and metadata."""
    
    sample_added = Signal(str)  # Emitted when a new sample is added
    sample_removed = Signal(str)  # Emitted when a sample is removed
    sample_updated = Signal(str)  # Emitted when a sample is updated
    
    def __init__(self, base_path: str):
        """Initialize sample storage.
        
        Args:
            base_path: Base directory for sample storage
        """
        super().__init__()
        self.base_path = Path(base_path)
        self.samples_path = self.base_path / "samples"
        self.metadata_path = self.base_path / "metadata.json"
        
        # Create directories if they don't exist
        self.samples_path.mkdir(parents=True, exist_ok=True)
        
        # Load or create metadata
        self.metadata: Dict[str, SampleMetadata] = {}
        self._load_metadata()
    
    def _load_metadata(self):
        """Load sample metadata from file."""
        if self.metadata_path.exists():
            try:
                with open(self.metadata_path, 'r') as f:
                    data = json.load(f)
                    self.metadata = {
                        name: SampleMetadata(**meta)
                        for name, meta in data.items()
                    }
            except Exception as e:
                print(f"Error loading metadata: {e}")
                self.metadata = {}
    
    def _save_metadata(self):
        """Save sample metadata to file."""
        try:
            with open(self.metadata_path, 'w') as f:
                json.dump(
                    {name: asdict(meta) for name, meta in self.metadata.items()},
                    f,
                    indent=2
                )
        except Exception as e:
            print(f"Error saving metadata: {e}")
    
    def import_sample(self, file_path: str, category: str = "default") -> Optional[str]:
        """Import a sample file.
        
        Args:
            file_path: Path to the sample file
            category: Sample category
            
        Returns:
            Name of the imported sample or None if import failed
        """
        try:
            # Copy file to samples directory
            source_path = Path(file_path)
            dest_path = self.samples_path / source_path.name
            
            # Generate unique name if file already exists
            base_name = source_path.stem
            extension = source_path.suffix
            counter = 1
            while dest_path.exists():
                dest_path = self.samples_path / f"{base_name}_{counter}{extension}"
                counter += 1
            
            shutil.copy2(file_path, dest_path)
            
            # Create metadata
            from datetime import datetime
            now = datetime.now().isoformat()
            
            metadata = SampleMetadata(
                name=dest_path.stem,
                path=str(dest_path.relative_to(self.base_path)),
                duration=0.0,  # TODO: Get actual duration
                sample_rate=44100,  # TODO: Get actual sample rate
                bit_depth=16,  # TODO: Get actual bit depth
                channels=1,  # TODO: Get actual channel count
                tags=[],
                category=category,
                created_at=now,
                modified_at=now
            )
            
            self.metadata[metadata.name] = metadata
            self._save_metadata()
            
            self.sample_added.emit(metadata.name)
            return metadata.name
            
        except Exception as e:
            print(f"Error importing sample: {e}")
            return None
    
    def export_sample(self, name: str, dest_path: str) -> bool:
        """Export a sample file.
        
        Args:
            name: Name of the sample to export
            dest_path: Destination path
            
        Returns:
            True if export was successful
        """
        try:
            if name not in self.metadata:
                return False
                
            source_path = self.base_path / self.metadata[name].path
            shutil.copy2(source_path, dest_path)
            return True
            
        except Exception as e:
            print(f"Error exporting sample: {e}")
            return False
    
    def remove_sample(self, name: str) -> bool:
        """Remove a sample.
        
        Args:
            name: Name of the sample to remove
            
        Returns:
            True if removal was successful
        """
        try:
            if name not in self.metadata:
                return False
                
            # Remove file
            sample_path = self.base_path / self.metadata[name].path
            if sample_path.exists():
                sample_path.unlink()
            
            # Remove metadata
            del self.metadata[name]
            self._save_metadata()
            
            self.sample_removed.emit(name)
            return True
            
        except Exception as e:
            print(f"Error removing sample: {e}")
            return False
    
    def update_sample(self, name: str, **kwargs) -> bool:
        """Update sample metadata.
        
        Args:
            name: Name of the sample to update
            **kwargs: Metadata fields to update
            
        Returns:
            True if update was successful
        """
        try:
            if name not in self.metadata:
                return False
                
            metadata = self.metadata[name]
            for key, value in kwargs.items():
                if hasattr(metadata, key):
                    setattr(metadata, key, value)
            
            metadata.modified_at = datetime.now().isoformat()
            self._save_metadata()
            
            self.sample_updated.emit(name)
            return True
            
        except Exception as e:
            print(f"Error updating sample: {e}")
            return False
    
    def get_sample(self, name: str) -> Optional[SampleMetadata]:
        """Get sample metadata.
        
        Args:
            name: Name of the sample
            
        Returns:
            Sample metadata or None if not found
        """
        return self.metadata.get(name)
    
    def get_samples_by_category(self, category: str) -> List[SampleMetadata]:
        """Get all samples in a category.
        
        Args:
            category: Category name
            
        Returns:
            List of sample metadata
        """
        return [
            meta for meta in self.metadata.values()
            if meta.category == category
        ]
    
    def get_categories(self) -> List[str]:
        """Get all sample categories.
        
        Returns:
            List of category names
        """
        return list(set(meta.category for meta in self.metadata.values())) 