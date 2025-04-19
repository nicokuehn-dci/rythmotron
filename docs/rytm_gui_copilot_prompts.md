# ARythm-EMU GUI Copilot Prompts

This file contains GitHub Copilot prompts to generate a visually appealing hardware-inspired GUI for ARythm-EMU that resembles the Elektron Analog Rytm hardware.

## Prerequisite Prompt

```python
# Using PySide6, create a main application window class `AnalogRytmGUI` inheriting from QMainWindow.
# Include the standard boilerplate to initialize the Qt application and show the window.
# Set the window title to "ARythm-EMU: Analog Rytm Emulator".
# Set a default window size of 1200x800.
# Import necessary modules (sys, os, PySide6.QtWidgets, PySide6.QtCore, PySide6.QtGui).
# Allow the window to have a dark theme with hot orange (#FF5722) accent colors.
```

## Basic Layout & Styling

```python
# Inside the AnalogRytmGUI.__init__ method:
# Set up the main layout with a central widget and QVBoxLayout for the overall structure.
# Create distinct layout areas for:
# - top_bar: Project info, master controls, transport
# - center_section: Left for pads, right for main display
# - bottom_section: Mode buttons (left), sequencer (center), parameter knobs (right)
# Apply a global dark stylesheet to the main window with:
# - Base background: #212121
# - Darker background: #1A1A1A
# - Lighter panels: #2A2A2A
# - Control surfaces: #303030
# - Hot orange accent: #FF5722 / hover: #FF7043 / pressed: #E64A19
# - Text colors: primary #FFFFFF, secondary #B0B0B0, disabled #757575
```

## Creating Custom Controls

```python
# Create a VirtualPad class that inherits from QPushButton:
# - Custom paintEvent method to draw a rounded rectangle pad
# - Methods to set states: selected, active, triggered
# - Visual feedback based on velocity and aftertouch
# - Track color as a property (from TRACK_COLORS constant)
# - Flash visual effect when triggered by sequencer

# Create a VirtualKnob class that inherits from QDial:
# - Custom paintEvent to draw a knob with indicator line
# - Method to set active state for visual highlighting
# - Visual feedback showing the current value
# - Parameter name display underneath
```

## Top Bar Elements

```python
# Create a method setup_top_section() to configure the top bar:
# Project info area:
# - Add QLabel widgets for "PROJECT:", "KIT:", "PATTERN:"
# - Add corresponding value QLabels styled with bold text and accent color
# - Group these in a QFrame with dark background

# Tempo control area:
# - Add "TEMPO" QLabel
# - Add large font QLabel for tempo display (e.g., "120.0")
# - Add a "TAP" QPushButton styled with the accent color
# - Connect the tap button to a placeholder on_tap_tempo() method

# Master volume area:
# - Add "MASTER VOLUME" QLabel
# - Add a custom VirtualKnob for volume control
# - Add QLabel to display the current volume value
# - Connect the knob's valueChanged signal to on_master_volume_changed()

# Transport controls area:
# - Add round transport buttons for "PLAY", "STOP", "REC"
# - Style the buttons with icons and accent colors
# - Connect buttons to on_play_pressed(), on_stop_pressed(), on_record_pressed()
```

## Pad Grid

```python
# Create a method setup_pad_section() to configure the virtual pads:
# Create a QGridLayout with 4 rows and 3 columns for the 12 drum pads
# For each track in Track enum (excluding FX):
#   - Create a VirtualPad with track name and color
#   - Set fixed size of 70x70 pixels
#   - Connect clicked signal to on_pad_pressed(track)
#   - Store in self.pads dictionary
# Set the first pad (BD) as the selected track by default
# Add the grid to the left side of center_section layout
```

## Main Display Area

```python
# Create a method setup_display_section() to configure the main display:
# Create a custom DisplayArea widget inheriting from QFrame
# - Include a header label at the top to show the current page ("SYNTH PARAMETERS", etc.)
# - Create a content area with a QGridLayout for parameter values
# - Add methods to switch between different parameter pages
# - Add methods to show different browsing modes (kit browser, sample browser, etc.)
# Style with:
# - Dark background (#212121)
# - Orange accent for active values
# - White text for parameter names
# - Bold, larger text for values
```

## Parameter Controls

```python
# Create a method setup_parameter_section() to configure the bottom-right parameter area:
# Create a QVBoxLayout for the parameter controls section
# For parameter page buttons:
#   - Create a QHBoxLayout for the buttons
#   - Add buttons for "SYNTH", "SAMPLE", "FILTER", "AMP", "LFO"
#   - Style with dark background and highlight current page
#   - Connect clicked signals to on_parameter_page_selected(page_name)

# For parameter knobs:
#   - Create a QGridLayout with 2 rows and 4 columns
#   - Add 8 VirtualKnob instances named A through H
#   - Connect valueChanged signals to on_parameter_knob_changed(knob_index, value)
#   - Add labels under each knob for parameter names
```

## Sequencer Section

```python
# Create a method setup_sequencer_section() to configure the step sequencer:
# Create a QVBoxLayout for the sequencer section
# For step buttons:
#   - Create a QGridLayout with 2 rows and 8 columns
#   - Add 16 custom TrigButton instances with step numbers
#   - Style buttons with LEDs to indicate triggers and parameter locks
#   - Connect clicked signals to on_step_button_pressed(step)

# For sequencer controls:
#   - Add a QHBoxLayout for page indicators and scale control
#   - Add 4 small QFrame "LEDs" to indicate the current pattern page
#   - Add a QLabel for "SCALE:" and a QComboBox with time divisions
#   - Connect combo box to on_scale_changed(index)
```

## Mode & Track Buttons

```python
# Create a method setup_modes_section() to configure the mode and track selection:
# Create a QVBoxLayout for the modes section
# For mode buttons:
#   - Add two QHBoxLayouts for two rows of buttons
#   - Add buttons for "MUTE", "CHROM", "SCENE", "PERF"
#   - Set buttons to be checkable
#   - Connect toggled signal to on_mode_toggled(mode_name, checked)
#   - Style with dark background and orange highlight when active

# For track selection:
#   - Add a QLabel "TRACK SELECT"
#   - Add a QScrollArea with buttons for each track
#   - Style track buttons with their corresponding track colors
#   - Connect clicked signals to on_track_selected(track)
```

## Event Handlers

```python
# Create placeholder methods for all the event handlers:
# def on_pad_pressed(self, track):
#     """Handle drum pad press events."""
#     # Update current track selection
#     # Update pad visuals
#     # Play sound if in appropriate mode

# def on_step_button_pressed(self, step):
#     """Handle step button press events."""
#     # Toggle step for current track
#     # Update visual feedback
#     # Update pattern data

# def on_parameter_page_selected(self, page):
#     """Handle parameter page button press."""
#     # Update current parameter page
#     # Update display content
#     # Update button styles

# def on_parameter_knob_changed(self, knob_index, value):
#     """Handle parameter value changes."""
#     # Update parameter value in data model
#     # Update display

# def on_play_pressed(self):
#     """Start pattern playback."""
#     # Start audio playback
#     # Update transport button states
#     # Start sequencer animation

# def on_stop_pressed(self):
#     """Stop pattern playback."""
#     # Stop audio playback
#     # Reset current step indicator
#     # Update transport button states

# def on_mode_toggled(self, mode_name, checked):
#     """Handle mode button toggle."""
#     # Update application mode
#     # Update interface based on mode
#     # Update button styles
```

## Animation and Timers

```python
# Set up timers for UI updates and animations:
# Create a method setup_timers():
#     # Create a QTimer for UI updates at 60fps (16ms)
#     # Connect to update_ui() method
#     # Create a QTimer for pad animations at 20fps (50ms)
#     # Connect to update_pad_animations() method
#     # Start both timers

# Implementation for animation methods:
# def update_ui(self):
#     """Update UI elements based on current state."""
#     # Process audio thread notifications
#     # Update sequencer position indicator
#     # Update parameter values if needed

# def update_pad_animations(self):
#     """Update pad animations for visual feedback."""
#     # Update trigger visual effects
#     # Handle any pad state transitions
#     # Refresh pad visuals
```

## Complete Integration

```python
# Update the main.py file to use the new GUI:
# Change the MainWindow import to:
# from .rytm_gui import AnalogRytmGUI

# Modify the main function to:
# def main():
#     app = QApplication(sys.argv)
#     theme = apply_style(app)  # Keep this if you still want the style.py functionality
#     window = AnalogRytmGUI()
#     window.show()
#     sys.exit(app.exec())
```