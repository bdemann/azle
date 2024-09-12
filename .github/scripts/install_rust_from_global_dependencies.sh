#!/bin/bash

# File path for the global dependencies
GLOBAL_DEPENDENCIES_FILE="$PWD/global_dependencies"

# Extract the rustc version from the file
RUST_VERSION=$(grep 'rustc version:' "$GLOBAL_DEPENDENCIES_FILE" | awk '{print $4}' | cut -d' ' -f1)

if [[ -z "$RUST_VERSION" ]]; then
  echo "Rust version not found in $GLOBAL_DEPENDENCIES_FILE"
  exit 1
fi

# Install Rust using rustup with the extracted version
echo "Installing Rust version $RUST_VERSION"
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain "$RUST_VERSION"
source $HOME/.cargo/env

rustup target add wasm32-wasi

# Extract the wasi2ic version and repository URL
WASI2IC_LINE=$(grep 'wasi2ic version:' "$GLOBAL_DEPENDENCIES_FILE")
WASI2IC_VERSION=$(echo "$WASI2IC_LINE" | awk -F' ' '{print $4}')
WASI2IC_URL=$(echo "$WASI2IC_LINE" | grep -oP '(?<=\().+?(?=\))')

if [[ -z "$WASI2IC_VERSION" || -z "$WASI2IC_URL" ]]; then
  echo "wasi2ic version or URL not found in $GLOBAL_DEPENDENCIES_FILE"
  exit 1
fi

# Install wasi2ic
echo "Installing wasi2ic version $WASI2IC_VERSION from $WASI2IC_URL"
cargo install --git "$WASI2IC_URL"

# Confirm installation
echo "\nThe following global dependencies were installed"
rustc --version
cargo --version

rustup target list --installed | grep wasm32-wasi

cargo install --list | grep wasi2ic
