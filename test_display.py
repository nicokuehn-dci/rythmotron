#!/usr/bin/env python3
"""
Display server diagnostic test for Rythmotron
"""

import os
import sys
import platform

print("==== Display Environment Diagnostic ====")
print(f"Python version: {sys.version}")
print(f"Platform: {platform.system()} {platform.release()}")
print(f"Display variable: DISPLAY={os.environ.get('DISPLAY', 'Not set')}")
print(f"XDG_SESSION_TYPE={os.environ.get('XDG_SESSION_TYPE', 'Not set')}")
print(f"QT_QPA_PLATFORM={os.environ.get('QT_QPA_PLATFORM', 'Not set')}")
print("======================================")

try:
    # Try with PySide6 (Qt)
    print("\nTesting PySide6 (Qt)...")
    from PySide6.QtWidgets import QApplication, QLabel, QWidget
    app = QApplication(sys.argv)
    window = QWidget()
    window.setWindowTitle("PySide6 Display Test")
    window.resize(300, 100)
    label = QLabel("If you can see this, PySide6 display is working!", window)
    label.move(50, 40)
    window.show()
    print("PySide6 window created successfully! Check if it's visible.")
    print("Close the window to continue...")
    app.exec()
    print("PySide6 test completed.")
except Exception as e:
    print(f"PySide6 test failed: {e}")

print("\nDiagnostic test completed.")