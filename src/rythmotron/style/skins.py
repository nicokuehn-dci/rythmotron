"""
Skin system for RythmoTron.
Provides different color themes and visual styles.
"""

from dataclasses import dataclass
from typing import Dict
from enum import Enum, auto

@dataclass
class Skin:
    """Represents a complete visual theme for RythmoTron."""
    name: str
    description: str
    colors: Dict[str, str]
    font_family: str = "Segoe UI"
    font_sizes: Dict[str, int] = None
    
    def __post_init__(self):
        if self.font_sizes is None:
            self.font_sizes = {
                "title": 24,
                "header": 18,
                "value": 14,
                "text": 12
            }

class SkinType(Enum):
    """Available skin types."""
    DEFAULT = auto()
    DARK = auto()
    LIGHT = auto()
    RETRO = auto()
    NEON = auto()
    MINIMAL = auto()

# Define available skins
SKINS = {
    SkinType.DEFAULT: Skin(
        name="Default",
        description="Modern dark theme with accent colors",
        colors={
            "SURFACE": "#1E1E1E",
            "SURFACE_DARK": "#121212",
            "SURFACE_DARKER": "#0A0A0A",
            "SURFACE_HOVER": "#2D2D2D",
            "ACCENT": "#007AFF",
            "ACCENT_DARK": "#0055B3",
            "TEXT": "#FFFFFF",
            "TEXT_SECONDARY": "#B0B0B0",
            "GRID": "#2D2D2D",
            "GRID_LINES": "#3D3D3D",
            "KICK": "#FF3B30",
            "SNARE": "#FF9500",
            "HIHAT": "#FFCC00",
            "CLAP": "#34C759",
            "CRASH": "#5856D6",
            "RIDE": "#AF52DE",
            "TOM": "#FF2D55",
            "PERC": "#5AC8FA"
        }
    ),
    SkinType.DARK: Skin(
        name="Dark",
        description="Deep dark theme with subtle accents",
        colors={
            "SURFACE": "#000000",
            "SURFACE_DARK": "#0A0A0A",
            "SURFACE_DARKER": "#050505",
            "SURFACE_HOVER": "#1A1A1A",
            "ACCENT": "#00FF9F",
            "ACCENT_DARK": "#00CC7F",
            "TEXT": "#FFFFFF",
            "TEXT_SECONDARY": "#808080",
            "GRID": "#1A1A1A",
            "GRID_LINES": "#2A2A2A",
            "KICK": "#FF0000",
            "SNARE": "#FF00FF",
            "HIHAT": "#00FFFF",
            "CLAP": "#FFFF00",
            "CRASH": "#FF00FF",
            "RIDE": "#00FFFF",
            "TOM": "#FF0000",
            "PERC": "#FFFF00"
        }
    ),
    SkinType.LIGHT: Skin(
        name="Light",
        description="Clean light theme with vibrant accents",
        colors={
            "SURFACE": "#FFFFFF",
            "SURFACE_DARK": "#F5F5F5",
            "SURFACE_DARKER": "#EEEEEE",
            "SURFACE_HOVER": "#E0E0E0",
            "ACCENT": "#007AFF",
            "ACCENT_DARK": "#0055B3",
            "TEXT": "#000000",
            "TEXT_SECONDARY": "#666666",
            "GRID": "#E0E0E0",
            "GRID_LINES": "#CCCCCC",
            "KICK": "#FF3B30",
            "SNARE": "#FF9500",
            "HIHAT": "#FFCC00",
            "CLAP": "#34C759",
            "CRASH": "#5856D6",
            "RIDE": "#AF52DE",
            "TOM": "#FF2D55",
            "PERC": "#5AC8FA"
        }
    ),
    SkinType.RETRO: Skin(
        name="Retro",
        description="Classic synthesizer look with warm colors",
        colors={
            "SURFACE": "#2C1810",
            "SURFACE_DARK": "#1A0F0A",
            "SURFACE_DARKER": "#0A0500",
            "SURFACE_HOVER": "#3C2820",
            "ACCENT": "#FFB000",
            "ACCENT_DARK": "#CC8C00",
            "TEXT": "#FFE0B0",
            "TEXT_SECONDARY": "#CCB090",
            "GRID": "#3C2820",
            "GRID_LINES": "#4C3830",
            "KICK": "#FF4000",
            "SNARE": "#FF8000",
            "HIHAT": "#FFC000",
            "CLAP": "#00FF00",
            "CRASH": "#00FFFF",
            "RIDE": "#FF00FF",
            "TOM": "#FF0000",
            "PERC": "#FFFF00"
        }
    ),
    SkinType.NEON: Skin(
        name="Neon",
        description="Vibrant neon theme with glowing effects",
        colors={
            "SURFACE": "#000033",
            "SURFACE_DARK": "#000022",
            "SURFACE_DARKER": "#000011",
            "SURFACE_HOVER": "#000044",
            "ACCENT": "#00FFFF",
            "ACCENT_DARK": "#00CCCC",
            "TEXT": "#FFFFFF",
            "TEXT_SECONDARY": "#00FFFF",
            "GRID": "#000044",
            "GRID_LINES": "#000066",
            "KICK": "#FF00FF",
            "SNARE": "#00FFFF",
            "HIHAT": "#FFFF00",
            "CLAP": "#00FF00",
            "CRASH": "#FF0000",
            "RIDE": "#0000FF",
            "TOM": "#FF00FF",
            "PERC": "#00FFFF"
        }
    ),
    SkinType.MINIMAL: Skin(
        name="Minimal",
        description="Minimalist theme with monochromatic colors",
        colors={
            "SURFACE": "#FFFFFF",
            "SURFACE_DARK": "#F0F0F0",
            "SURFACE_DARKER": "#E0E0E0",
            "SURFACE_HOVER": "#EEEEEE",
            "ACCENT": "#000000",
            "ACCENT_DARK": "#333333",
            "TEXT": "#000000",
            "TEXT_SECONDARY": "#666666",
            "GRID": "#EEEEEE",
            "GRID_LINES": "#DDDDDD",
            "KICK": "#000000",
            "SNARE": "#333333",
            "HIHAT": "#666666",
            "CLAP": "#999999",
            "CRASH": "#CCCCCC",
            "RIDE": "#DDDDDD",
            "TOM": "#EEEEEE",
            "PERC": "#FFFFFF"
        }
    )
} 