"""
RythmoTron - Setup Script

Installation script for the RythmoTron application.
"""

from setuptools import setup, find_packages

setup(
    name="rythmotron",
    version="0.1.0",
    description="A software emulator inspired by the Elektron Analog Rytm drum machine",
    author="Nico Kuehn",
    author_email="nico.kuehn@example.com",
    url="https://github.com/nicokuehn-dci/rythmotron",
    package_dir={"": "src"},
    packages=find_packages(where="src"),
    include_package_data=True,
    install_requires=[
        "PySide6",
        "numpy",
        "librosa",
        "sounddevice",
        "soundfile",
        "scipy",
        "matplotlib",
    ],
    entry_points={
        "console_scripts": [
            "rythmotron=rythmotron.main:main",
        ],
    },
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: End Users/Desktop",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Topic :: Multimedia :: Sound/Audio",
        "Topic :: Multimedia :: Sound/Audio :: MIDI",
    ],
)