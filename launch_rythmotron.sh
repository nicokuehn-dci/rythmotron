#!/bin/bash

# RythmoTron Launcher Script
# This script attempts multiple display server configurations to ensure
# the GUI application works in both X11 and Wayland environments.

echo "===== RythmoTron Launcher ====="
echo "Detecting environment..."
SESSION_TYPE=$(echo $XDG_SESSION_TYPE)
CURRENT_DISPLAY=$(echo $DISPLAY)

echo "Current session type: $SESSION_TYPE"
echo "Current DISPLAY: $CURRENT_DISPLAY"

# Function to run the app with specific settings
run_with_settings() {
    local name=$1
    local platform=$2
    local display=$3
    
    echo ""
    echo "Trying method: $name"
    echo "  Platform: $platform"
    echo "  Display: $display"
    
    # Set environment variables
    export QT_QPA_PLATFORM=$platform
    export DISPLAY=$display
    
    # Run the application
    python rythmotron_app.py
    
    # Check exit status
    if [ $? -eq 0 ]; then
        echo "Success! Application closed normally."
        return 0
    else
        echo "Method failed."
        return 1
    fi
}

# Try different methods in order of preference
echo "Attempting to launch RythmoTron with optimal settings..."

# Method 1: Native for current session type
if [ "$SESSION_TYPE" = "wayland" ]; then
    run_with_settings "Wayland Native" "wayland" "$CURRENT_DISPLAY" && exit 0
else
    run_with_settings "X11 Native" "xcb" "$CURRENT_DISPLAY" && exit 0
fi

# Method 2: Try alternative platform
if [ "$SESSION_TYPE" = "wayland" ]; then
    run_with_settings "Wayland with XWayland" "xcb" "$CURRENT_DISPLAY" && exit 0
else
    run_with_settings "X11 with Wayland compatibility" "wayland" "$CURRENT_DISPLAY" && exit 0
fi

# Method 3: Try explicitly setting display and platform for X11
run_with_settings "Explicit X11" "xcb" ":0.0" && exit 0

# Method 4: Try with eglfs platform (might work on some systems)
run_with_settings "EGLFS" "eglfs" "$CURRENT_DISPLAY" && exit 0

# If we got here, all methods failed
echo ""
echo "=========== ERROR ==========="
echo "Failed to launch RythmoTron with any display method."
echo "Please try the following:"
echo "1. Run the diagnostic script: python test_display.py"
echo "2. Check the error log: cat error.log"
echo "3. Try logging into an X11 session instead of Wayland"
echo "4. Make sure you have installed all dependencies: pip install -r requirements.txt"
echo "============================"
exit 1