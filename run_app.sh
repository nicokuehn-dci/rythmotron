#!/bin/bash

# Set the display environment variable
export DISPLAY=:0.0
echo "DISPLAY set to: $DISPLAY"

# Run the application
python rythmotron_app.py

# Alternatively, you can use:
# python -m rythmotron.main