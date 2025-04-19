# RythmoTron Emulator

RythmoTron is a software emulator inspired by the Elektron Analog Rytm drum machine. It provides a virtual environment for creating and manipulating rhythm patterns, audio samples, and more.

![RythmoTron](https://via.placeholder.com/800x450.png?text=RythmoTron+Screenshot)

## Features

- **Audio Engine**: High-performance audio playback and manipulation.
- **Graphical User Interface (GUI)**: Intuitive interface for controlling rhythm patterns and audio parameters.
- **Modular Design**: Easily extendable with custom components and sections.
- **Logging**: Comprehensive logging for debugging and monitoring.
- Step sequencer with pattern editing
- Sound design with synthesizer controls and samples
- Sample management and waveform visualization
- Project-based workflow for saving and loading your work

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nicokuehn-dci/rythmotron.git
   cd rythmotron
   ```

2. Set up the virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install the package in development mode:
   ```bash
   python setup.py develop
   ```

## Running the Application

1. Activate the virtual environment (if not already activated):
   ```bash
   source .venv/bin/activate
   ```

2. Start the application:
   ```bash
   ./start.sh
   ```

Alternatively, you can run the module directly:

```bash
python -m rythmotron.main
```

- Launch the application and explore the GUI to create rhythm patterns.
- Use the `data/` directory to manage your presets, projects, and samples.

### Basic Workflow

1. Use the sequencer section to create drum patterns with the step sequencer
2. Select parameter pages (SYNTH, SAMPLE, FILTER, AMP, LFO) to customize sounds
3. Use the virtual pads to trigger sounds manually
4. Save your project for future sessions

## API Reference

### Audio Engine

- `AudioEngine.set_bpm(bpm: float)`: Set the beats per minute.
- `AudioEngine.play_sample(sample: Sample, volume: float)`: Play an audio sample.

### GUI

- `RytmGui.render()`: Render the graphical user interface.

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

Contributions are welcome! Please feel free to submit a Pull Request. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.