#!/usr/bin/env python3
"""
ARythm-EMU Setup Script
Creates a virtual environment, activates it, and installs all project dependencies.
"""

import os
import subprocess
import sys
import platform


def create_and_activate_venv():
    """Create a virtual environment and prepare activation commands."""
    print("Creating virtual environment...")
    
    # Check if venv already exists
    venv_dir = ".venv"
    if os.path.exists(venv_dir):
        print(f"Virtual environment '{venv_dir}' already exists.")
        return get_activation_commands(venv_dir)
        
    try:
        # Create virtual environment
        subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
        print(f"Virtual environment created successfully in '{venv_dir}'.")
        return get_activation_commands(venv_dir)
    except subprocess.CalledProcessError as e:
        print(f"Error creating virtual environment: {e}")
        sys.exit(1)


def get_activation_commands(venv_dir):
    """Get the appropriate activation commands based on the OS."""
    # Determine activation script based on the OS
    if platform.system() == "Windows":
        activate_script = os.path.join(venv_dir, "Scripts", "activate")
        activate_cmd = f"{activate_script}.bat"
        python_path = os.path.join(venv_dir, "Scripts", "python.exe")
        pip_path = os.path.join(venv_dir, "Scripts", "pip.exe")
    else:  # macOS and Linux
        activate_script = os.path.join(venv_dir, "bin", "activate")
        activate_cmd = f"source {activate_script}"
        python_path = os.path.join(venv_dir, "bin", "python")
        pip_path = os.path.join(venv_dir, "bin", "pip")
        
    return {
        "activate_script": activate_script,
        "activate_cmd": activate_cmd,
        "python_path": python_path,
        "pip_path": pip_path
    }


def install_dependencies(pip_path):
    """Install project dependencies."""
    print("\nInstalling dependencies...")

    # Install from requirements.txt if it exists
    if os.path.exists("requirements.txt"):
        print("Installing packages from requirements.txt...")
        try:
            subprocess.run([pip_path, "install", "-r", "requirements.txt"], check=True)
            print("Successfully installed packages from requirements.txt.")
        except subprocess.CalledProcessError as e:
            print(f"Error installing from requirements.txt: {e}")
            return False

    # Install the package in editable mode
    print("Installing project in development mode...")
    try:
        subprocess.run([pip_path, "install", "-e", "."], check=True)
        print("Successfully installed project in development mode.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error installing project: {e}")
        return False


def main():
    """Main setup function."""
    print("ARythm-EMU Setup")
    print("================")
    
    # Create and get activation information for the virtual environment
    venv_info = create_and_activate_venv()
    
    # On Windows, we can run the activation script directly
    if platform.system() == "Windows":
        # For Windows, we can activate the venv in the current process
        print("\nActivating virtual environment...")
        os.system(venv_info["activate_cmd"])
    else:
        # For Unix systems, we need to tell the user to activate it manually
        print(f"\nTo activate the virtual environment, run:\n{venv_info['activate_cmd']}")
    
    # Install dependencies using the venv's pip
    if install_dependencies(venv_info["pip_path"]):
        print("\nSetup completed successfully!")
        
        if platform.system() != "Windows":
            print(f"\nTo start using ARythm-EMU, first activate the virtual environment:")
            print(f"  {venv_info['activate_cmd']}")
            
        print("\nThen run the application:")
        print("  python -m arythm_emu.main")
    else:
        print("\nSetup encountered errors. Please check the output above.")


if __name__ == "__main__":
    main()