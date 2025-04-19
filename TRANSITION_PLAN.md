# RythmoTron Transition Plan

This document outlines the plan for transitioning from the old project structure to the new src-based structure.

## Current Status

The project is currently in a transitional state with files in both:
1. The root directory (old structure)
2. The src/rythmotron directory (new structure)

## Transition Steps

### 1. Code Migration (Completed)
- Core modules have been moved to `src/rythmotron/`
- UI components have been organized into `src/rythmotron/ui/`
- New utility modules have been added in `src/rythmotron/utils/`

### 2. Remaining Tasks

#### Remove duplicate files
Once all functionality has been tested in the new structure, remove these redundant files from the root:
- `__init__.py`
- `audio_engine.py`
- `constants.py`
- `main.py`
- `models.py`
- `rytm_gui.py`
- `style.py`
- `layout_manager.py`
- `main_window.py`
- Directories: `controls/`, `sections/`, `rythmotron/`

#### Update imports in all modules
Ensure all imports use the new structure:
- Instead of direct imports like `from constants import Track`
- Use package imports like `from rythmotron.constants import Track`

#### Update scripts
Make sure all scripts point to the new code structure.

### 3. Testing During Transition

During the transition period:
1. Use `rythmotron_app.py` or `start.sh` to run the application
2. These entry points use the new structure in src/
3. Run tests against the new structure using pytest

### 4. Benefits of New Structure

The new structure provides several advantages:
- Clear separation between source code and project files
- Proper Python packaging practices
- Better organization of UI components
- More modular and maintainable code
- Enhanced developer tooling
- Improved documentation