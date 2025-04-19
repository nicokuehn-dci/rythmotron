# RythmoTron

A software emulator inspired by the Elektron Analog Rytm drum machine.

![RythmoTron](https://via.placeholder.com/800x450.png?text=RythmoTron+Screenshot)

## Features

- Modern GUI-based drum machine interface
- Step sequencer with pattern editing
- Sound design with synthesizer controls and samples
- Audio engine with real-time playback
- Sample management and waveform visualization
- Project-based workflow for saving and loading your work

## Installation

### Prerequisites

- Python 3.9 or newer
- pip (Python package installer)

### Setup

1. Clone this repository or download the source code:

```bash
git clone https://github.com/nicokuehn-dci/rythmotron.git
cd rythmotron
```

2. Create and activate a virtual environment:

```bash
# Create a virtual environment
python3 -m venv .venv

# Activate the virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate
```

3. Install the package and its dependencies:

```bash
pip install -e .
```

## Usage

After installation, run the application with:

```bash
# Using the entry point
rythmotron

# Or using the start script
./start.sh
```

Alternatively, you can run the module directly:

```bash
python -m rythmotron.main
```

### Basic Workflow

1. Use the sequencer section to create drum patterns with the step sequencer
2. Select parameter pages (SYNTH, SAMPLE, FILTER, AMP, LFO) to customize sounds
3. Use the virtual pads to trigger sounds manually
4. Save your project for future sessions

## Project Structure

```
rythmotron/
├── src/                    # Source code directory
│   └── rythmotron/         # Main Python package
│       ├── __init__.py     # Package initialization
│       ├── main.py         # Entry point
│       ├── audio_engine.py # Audio playback and sequencer engine
│       ├── constants.py    # Constants and enumerations
│       ├── models.py       # Data models
│       ├── style.py        # Style definitions and theme
│       ├── layout_manager.py # Layout management utilities
│       ├── ui/             # UI components
│       │   ├── rytm_gui.py # Main GUI class
│       │   ├── controls/   # UI control components
│       │   └── sections/   # UI section components
│       └── utils/          # Utility modules
│
├── scripts/                # Utility scripts
│   ├── start.sh           # Main startup script
│   └── setup.sh           # Environment setup script
│
├── tests/                  # Test directory
├── docs/                   # Documentation
├── data/                   # Sample data and presets
│
├── pyproject.toml         # Project metadata (PEP 621)
├── setup.py              # Package installation (legacy)
├── requirements.txt      # Dependencies
├── README.md             # This documentation file
└── LICENSE               # License information
```

## Architecture Overview

RythmoTron uses a modular architecture with these key components:

1. **Main Application** (`ui/rytm_gui.py`): Coordinates all UI sections and handles event flow

2. **UI Controls** (in `ui/controls/`): Reusable UI components:
   - Virtual pads and drum triggers
   - Parameter knobs and dials
   - Specialized buttons for the interface

3. **UI Sections** (in `ui/sections/`): Logical groupings of controls:
   - Top section: Project info, tempo, transport controls
   - Pads section: Drum pad grid
   - Display section: Parameter visualization
   - Sequencer section: Step sequencer interface
   - Parameters section: Parameter knobs and pages
   - Modes section: Mode buttons and track selection

4. **Audio Engine** (`audio_engine.py`): Handles sound generation and playback

5. **Models** (`models.py`): Data structures for patterns, kits, and projects

## Dependencies

- PySide6 - Qt-based GUI framework
- NumPy - Numerical processing
- Librosa - Audio analysis
- Sounddevice - Audio playback
- SoundFile - Audio file I/O
- SciPy - Signal processing
- Matplotlib - Visualization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.