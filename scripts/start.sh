#!/bin/bash

# Redirect all errors to a log file with timestamps
LOG_FILE="error.log"
exec 2>> >(while read line; do echo "$(date +'%Y-%m-%d %H:%M:%S') $line" >> $LOG_FILE; done)

# Exit immediately if a command exits with a non-zero status
set -e

# --- Configuration ---
SCRIPT_NAME="RythmoTron Startup"
VENV_DIR=".venv"
PYTHON_MIN_VERSION_MAJOR=3
PYTHON_MIN_VERSION_MINOR=9

# --- Helper Functions ---
info() {
    echo "[INFO] $1"
}

warn() {
    echo "[WARN] $1" >&2
}

error_exit() {
    echo "[ERROR] $1" >&2
    exit 1
}

# --- Get Project Directory (absolute path) ---
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR" || error_exit "Could not change to project directory: $PROJECT_DIR"
info "Running in directory: $PROJECT_DIR"

# --- Step 1: Set DISPLAY Environment Variable --- 
info "Step 1: Setting DISPLAY environment variable to :0.0"
export DISPLAY=":0.0"
info "DISPLAY environment variable is set to: $DISPLAY"

# --- Step 2: Allow X11 Connections ---
info "Step 2: Allowing X11 connections"
xhost +local: >/dev/null 2>&1 || warn "Failed to run xhost +local: (This is okay if not running in a graphical environment)"

echo ""
echo "🖥️  GUI will be shown on display server: $DISPLAY"
echo ""

# --- Check Python Version ---
info "Checking Python version..."
PYTHON_CMD=python3
if ! command -v $PYTHON_CMD &> /dev/null ; then
    PYTHON_CMD=python
    if ! command -v $PYTHON_CMD &> /dev/null ; then
        error_exit "Could not find 'python3' or 'python'. Please install Python ${PYTHON_MIN_VERSION_MAJOR}.${PYTHON_MIN_VERSION_MINOR}+."
    fi
fi
info "Using Python command: $PYTHON_CMD"

PY_VERSION_MAJOR=$($PYTHON_CMD -c 'import sys; print(sys.version_info.major)')
PY_VERSION_MINOR=$($PYTHON_CMD -c 'import sys; print(sys.version_info.minor)')

if [ "$PY_VERSION_MAJOR" -lt "$PYTHON_MIN_VERSION_MAJOR" ] || { [ "$PY_VERSION_MAJOR" -eq "$PYTHON_MIN_VERSION_MAJOR" ] && [ "$PY_VERSION_MINOR" -lt "$PYTHON_MIN_VERSION_MINOR" ]; }; then
    error_exit "Python version $PY_VERSION_MAJOR.$PY_VERSION_MINOR found, but $PYTHON_MIN_VERSION_MAJOR.$PYTHON_MIN_VERSION_MINOR or later is required."
fi
info "Python version $PY_VERSION_MAJOR.$PY_VERSION_MINOR is sufficient."

# --- Check/Repair Virtual Environment ---
info "Checking virtual environment ('$VENV_DIR')..."
VENV_BROKEN=false
ACTIVATE_SCRIPT="$VENV_DIR/bin/activate"

if [ ! -d "$VENV_DIR" ]; then
    info "Virtual environment not found."
    VENV_BROKEN=true
elif [ ! -f "$ACTIVATE_SCRIPT" ]; then
    warn "Virtual environment found, but activate script '$ACTIVATE_SCRIPT' is missing."
    VENV_BROKEN=true
else
    if ! "$VENV_DIR/bin/python" -m pip --version &> /dev/null; then
         warn "Virtual environment found, but internal pip command failed or is missing."
         VENV_BROKEN=true
    else
        info "Virtual environment appears valid."
    fi
fi

if [ "$VENV_BROKEN" = true ]; then
    warn "Attempting to repair virtual environment..."
    if [ -d "$VENV_DIR" ]; then
        info "Removing existing broken virtual environment: $VENV_DIR"
        rm -rf "$VENV_DIR"
        if [ $? -ne 0 ]; then
            error_exit "Failed to remove broken virtual environment. Check permissions."
        fi
    fi
    info "Creating new virtual environment..."
    "$PYTHON_CMD" -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        error_exit "Failed to create virtual environment."
    fi
    info "New virtual environment created."
fi

# --- Activate Virtual Environment ---
info "Activating virtual environment..."
source "$ACTIVATE_SCRIPT"
if [ $? -ne 0 ]; then
    error_exit "Failed to activate virtual environment even after repair attempt."
fi
info "Virtual environment activated."

# --- Upgrade Pip ---
info "Ensuring pip is up-to-date..."
pip install --upgrade pip
if [ $? -ne 0 ]; then
    warn "Failed to upgrade pip, continuing anyway..."
fi

# --- Clean Build Artifacts ---
info "Cleaning potential build artifacts..."
rm -rf build dist *.egg-info */*.egg-info
info "Cleanup finished."

# --- Install/Update Dependencies ---
info "Installing/updating project dependencies from requirements.txt..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        error_exit "Failed to install project dependencies. Check requirements.txt and network connection."
    fi
else
    warn "requirements.txt not found. Skipping dependency installation."
fi
info "Dependencies installed successfully."

# --- Install in Development Mode ---
info "Installing package in development mode..."
pip install -e .
if [ $? -ne 0 ]; then
    error_exit "Failed to install package in development mode."
fi

# --- Step 3: Run the Python App ---
info "Step 3: Starting $SCRIPT_NAME with GUI on $DISPLAY"

# Set additional environment variables to help Qt find the X server
export QT_DEBUG_PLUGINS=1
export QT_QPA_PLATFORM=xcb
export XDG_SESSION_TYPE=x11

# --- Step 4: Troubleshooting checks ---
info "Step 4: Performing troubleshooting checks"

# Check if X server is running
echo "Checking if X server is running on $DISPLAY..."
if xdpyinfo -display $DISPLAY >/dev/null 2>&1; then
    info "✓ X server is running on $DISPLAY"
else
    warn "⚠ Could not connect to X server on $DISPLAY (This is expected if not in a graphical environment)"
fi

# Check $DISPLAY
echo "Confirming DISPLAY environment variable..."
CURRENT_DISPLAY=$(echo $DISPLAY)
info "✓ DISPLAY is set to: $CURRENT_DISPLAY"

# Check if we're in a remote session
if [ -n "$SSH_CONNECTION" ] || [ -n "$SSH_CLIENT" ] || [ -n "$SSH_TTY" ]; then
    warn "⚠ Running in SSH session. Make sure X11 forwarding is enabled (ssh -X or ssh -Y)"
fi

# Try to run the application
info "Running the application..."
PYTHONPATH="$PROJECT_DIR:$PYTHONPATH" python -m rythmotron.main
RUN_EXIT_CODE=$?

if [ $RUN_EXIT_CODE -ne 0 ]; then
    warn "Application exited with status code $RUN_EXIT_CODE."
    cat error.log
    echo ""
    warn "For troubleshooting, try these steps:"
    echo "1. Check if X server is running: echo \$DISPLAY (should show :0.0)"
    echo "2. Allow X connections: xhost +local:"
    echo "3. If using SSH, reconnect using: ssh -X user@host"
    echo ""
fi

info "$SCRIPT_NAME finished."
exit $RUN_EXIT_CODE