#!/bin/bash
set -e

# Create directories
mkdir -p storage/bin
mkdir -p storage/data/voices

PIPER_VERSION="2023.11.14-2"
MODEL_NAME="en_US-ljspeech-medium"
MODEL_BASE_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/medium"

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

echo "Setting up Piper TTS (OS: $OS, ARCH: $ARCH)..."

# 1. macOS Specific Python Setup
if [ "$OS" = "darwin" ]; then
    echo "Checking for python3 and piper-tts package..."
    if python3 -m piper --help >/dev/null 2>&1; then
        echo "python3 -m piper is already available."
    else
        echo "piper-tts not found. Attempting to install via pip3..."
        if pip3 install piper-tts; then
            echo "piper-tts installed successfully via pip3."
        else
            echo "Warning: Failed to install piper-tts via pip3. Will attempt downloading standalone binary."
        fi
    fi
fi

# 2. Determine if Standalone Binary is needed
NEED_STANDALONE=false
if [ "$OS" = "linux" ]; then
    NEED_STANDALONE=true
elif [ "$OS" = "darwin" ]; then
    if ! python3 -m piper --help >/dev/null 2>&1; then
        NEED_STANDALONE=true
    fi
fi

if [ "$NEED_STANDALONE" = true ]; then
    if [ ! -f "storage/bin/piper/piper" ]; then
        echo "Determining standalone binary package..."
        if [ "$OS" = "darwin" ]; then
            if [ "$ARCH" = "arm64" ]; then
                TAR_FILE="piper_macos_aarch64.tar.gz"
            else
                TAR_FILE="piper_macos_x64.tar.gz"
            fi
        elif [ "$OS" = "linux" ]; then
            if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
                TAR_FILE="piper_linux_aarch64.tar.gz"
            else
                TAR_FILE="piper_linux_x86_64.tar.gz"
            fi
        else
            echo "Unsupported OS: $OS"
            exit 1
        fi

        URL="https://github.com/rhasspy/piper/releases/download/${PIPER_VERSION}/${TAR_FILE}"
        echo "Downloading Piper standalone binary from ${URL}..."
        curl -L -o storage/bin/piper.tar.gz "${URL}"

        echo "Extracting Piper binary..."
        tar -xzf storage/bin/piper.tar.gz -C storage/bin/
        rm storage/bin/piper.tar.gz

        if [ -f "storage/bin/piper/piper" ]; then
            chmod +x storage/bin/piper/piper
            echo "Piper standalone binary configured at storage/bin/piper/piper"
        else
            echo "Error: Extraction failed, storage/bin/piper/piper not found."
            exit 1
        fi
    else
        echo "Piper standalone binary already exists at storage/bin/piper/piper"
    fi
fi

# 3. Download Voice Model and Config
if [ ! -f "storage/data/voices/${MODEL_NAME}.onnx" ]; then
    echo "Downloading voice model from Hugging Face..."
    curl -L -o "storage/data/voices/${MODEL_NAME}.onnx" "${MODEL_BASE_URL}/${MODEL_NAME}.onnx"
else
    echo "Voice model already exists."
fi

if [ ! -f "storage/data/voices/${MODEL_NAME}.onnx.json" ]; then
    echo "Downloading voice config from Hugging Face..."
    curl -L -o "storage/data/voices/${MODEL_NAME}.onnx.json" "${MODEL_BASE_URL}/${MODEL_NAME}.onnx.json"
else
    echo "Voice config already exists."
fi

echo "setup-piper.sh: Done! Piper TTS setup complete."
