#!/bin/bash
source .venv/bin/activate
VENV_PIP=$(which pip)
echo "Using pip: $VENV_PIP"

# Install or update dependencies
echo "Installing dependencies..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    
    if [ $? -ne 0 ]; then
        echo "Error installing dependencies from requirements.txt."
        exit 1
    fi
else
    echo "requirements.txt not found, skipping..."
fi

# Install package in development mode
echo "Installing package in development mode..."
pip install -e .

if [ $? -ne 0 ]; then
    echo "Error installing package. Please check error messages above."
    exit 1
fi

# Run the application
echo "Starting ARythm-EMU..."
echo "----------------------------------------"
python -m arythm_emu.main
