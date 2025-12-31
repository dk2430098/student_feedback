#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "Installing Node Dependencies..."
npm install

echo "Installing Python Dependencies..."
# Try pip3 first, then pip
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

echo "Build Complete!"
