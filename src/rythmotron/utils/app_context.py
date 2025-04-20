from dataclasses import dataclass
from ..style.skin_manager import SkinManager
from ..audio.mixer import Mixer
from ..storage.sample_storage import SampleStorage

@dataclass
class AppContext:
    """Class for managing application-wide resources and state."""
    skin_manager: SkinManager
    mixer: Mixer
    sample_storage: SampleStorage
    
    @classmethod
    def create(cls) -> 'AppContext':
        """Create a new AppContext instance with initialized components."""
        skin_manager = SkinManager()
        mixer = Mixer()
        sample_storage = SampleStorage()
        
        return cls(
            skin_manager=skin_manager,
            mixer=mixer,
            sample_storage=sample_storage
        ) 