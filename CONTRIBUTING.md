# Contributing to RythmoTron

Thank you for considering contributing to RythmoTron! This document outlines the process for contributing to the project.

## Development Setup

1. Fork the repository and clone your fork
2. Set up the development environment:
   ```bash
   ./scripts/dev_setup.sh
   ```
   This script will:
   - Create and activate a virtual environment
   - Install all dependencies
   - Set up pre-commit hooks
   - Install the package in development mode

## Development Workflow

1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following these guidelines:
   - Follow the existing code style (enforced by pre-commit hooks)
   - Add tests for new functionality
   - Update documentation as needed

3. Run tests locally:
   ```bash
   python -m pytest
   ```

4. Commit your changes following the [conventional commits](https://www.conventionalcommits.org/) style:
   ```
   feat: add new sample browser feature
   fix: resolve audio playback issue on Linux
   docs: improve installation instructions
   test: add tests for the rhythm pattern generator
   refactor: improve audio engine performance
   ```

5. Push your branch and create a pull request

## Code Style Guide

This project follows these style guidelines:
- Code formatting with [Black](https://black.readthedocs.io/)
- Import sorting with [isort](https://pycqa.github.io/isort/)
- Type hints according to [PEP 484](https://peps.python.org/pep-0484/)
- Docstrings following [Google style](https://google.github.io/styleguide/pyguide.html#38-comments-and-docstrings)

The pre-commit hooks will ensure your code follows these guidelines.

## Project Structure

```
rythmotron/
├── src/                    # Source code directory
│   └── rythmotron/         # Main Python package
│       ├── __init__.py     # Package initialization
│       ├── main.py         # Entry point
│       ├── audio_engine.py # Audio playback engine
│       ├── constants.py    # Constants and enumerations
│       ├── models.py       # Data models
│       ├── style.py        # Style definitions
│       ├── ui/             # UI components
│       │   ├── rytm_gui.py # Main GUI class
│       │   ├── controls/   # UI control components
│       │   └── sections/   # UI section components
│       └── utils/          # Utility modules
│
├── scripts/                # Utility scripts
├── tests/                  # Test directory
├── docs/                   # Documentation
└── data/                   # Sample data and presets
```

## Testing

Please include tests for new functionality. We use pytest for testing:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_audio_engine.py

# Run with coverage report
pytest --cov=src
```

## Documentation

Update documentation for any public API changes:
- Update docstrings for functions and classes
- Update the README.md if needed
- Add examples for new functionality

## Questions?

If you have any questions or need help, please open an issue on GitHub.

Thank you for contributing to RythmoTron!