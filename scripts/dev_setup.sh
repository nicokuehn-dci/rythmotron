#!/bin/bash

# RythmoTron Development Environment Setup Script
# This script sets up the development environment for RythmoTron.

set -e  # Exit immediately if a command exits with non-zero status

# Colors for better readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== RythmoTron Development Environment Setup ===${NC}"

# Get the directory of the script 
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
PROJECT_DIR=$( cd -- "$SCRIPT_DIR/.." &> /dev/null && pwd )

# Navigate to project directory
cd "$PROJECT_DIR"
echo -e "${BLUE}Working directory: ${PROJECT_DIR}${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.9 or later.${NC}"
    exit 1
fi

# Check Python version
PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo -e "${BLUE}Found Python ${PYTHON_VERSION}${NC}"

# Enforce Python 3.9 or later in the dev_setup.sh script
if [[ $(python3 -c 'import sys; print(sys.version_info[:2] >= (3, 9))') != "True" ]]; then
    echo -e "${RED}Python 3.9 or later is required. Please upgrade your Python version.${NC}"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv .venv
else
    echo -e "${YELLOW}Virtual environment already exists.${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source .venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install development dependencies
echo -e "${YELLOW}Installing development dependencies...${NC}"
pip install -r requirements.txt

# Install pre-commit hooks
if command -v pre-commit &> /dev/null; then
    echo -e "${YELLOW}Setting up pre-commit hooks...${NC}"
    pre-commit install
else
    echo -e "${YELLOW}Installing pre-commit...${NC}"
    pip install pre-commit
    pre-commit install
fi

# Install the package in development mode
echo -e "${YELLOW}Installing RythmoTron in development mode...${NC}"
pip install -e .

# Create necessary directories
echo -e "${YELLOW}Ensuring all necessary directories exist...${NC}"
mkdir -p data/samples data/presets data/projects logs tests/test_data/samples tests/test_data/presets

# Print success message
echo -e "${GREEN}Development environment setup complete!${NC}"
echo -e "${BLUE}You can now run the application with:${NC}"
echo -e "${YELLOW}  ./rythmotron_app.py${NC}"
echo -e "${BLUE}or:${NC}"
echo -e "${YELLOW}  ./start.sh${NC}"
echo -e "${BLUE}or via the Python module:${NC}"
echo -e "${YELLOW}  python -m rythmotron.main${NC}"