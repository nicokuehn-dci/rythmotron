#!/bin/bash

# Redirect all errors to a log file with timestamps
LOG_FILE="error.log"
exec 2>> >(while read line; do echo "$(date +'%Y-%m-%d %H:%M:%S') $line" >> $LOG_FILE; done)

# Exit immediately if a command exits with a non-zero status
set -e

# --- Configuration ---
SCRIPT_NAME="ARytm GUI Startup"
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

# --- Get Script Directory ---
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd "$SCRIPT_DIR" || error_exit "Could not change to script directory: $SCRIPT_DIR"
info "Running in project directory: $PWD"

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

# --- Run the Application ---
info "Starting $SCRIPT_NAME..."
python3 -m arythm_emu.main
RUN_EXIT_CODE=$?

if [ $RUN_EXIT_CODE -ne 0 ]; then
    warn "Application exited with status code $RUN_EXIT_CODE."
fi

info "$SCRIPT_NAME finished."
exit $RUN_EXIT_CODE