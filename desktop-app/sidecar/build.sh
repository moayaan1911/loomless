#!/bin/bash

# Build script for Swift sidecar binaries.
# Produces a raw Swift binary (NOT a nested .app bundle) so that when
# Tauri bundles it into LoomLess.app/Contents/MacOS/, macOS attributes
# its camera/mic access to LoomLess.app itself. This unifies TCC
# permissions between the WebView and the overlay, so the user only
# sees a single camera permission prompt.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/src-tauri/binaries"

mkdir -p "$OUTPUT_DIR"

echo "Building Swift sidecar binaries..."

# Clean up legacy nested-bundle artifacts from previous build strategy.
rm -rf "$OUTPUT_DIR/CameraOverlay.app"
rm -rf "$OUTPUT_DIR/build_temp"

BINARY_ARM64="$OUTPUT_DIR/camera-overlay-aarch64-apple-darwin"

echo "  -> Building arm64 binary..."
swiftc "$SCRIPT_DIR/camera-overlay/main.swift" \
    -o "$BINARY_ARM64" \
    -target arm64-apple-macos12 \
    -framework Cocoa \
    -framework AVFoundation \
    -framework CoreMedia \
    -framework CoreVideo

VIDEO_EXPORTER_ARM64="$OUTPUT_DIR/video-exporter-aarch64-apple-darwin"

echo "  -> Building arm64 video exporter..."
swiftc "$SCRIPT_DIR/video-exporter/main.swift" \
    -o "$VIDEO_EXPORTER_ARM64" \
    -target arm64-apple-macos12 \
    -framework Foundation \
    -framework AVFoundation \
    -framework CoreGraphics \
    -framework CoreMedia

chmod +x "$BINARY_ARM64"
chmod +x "$VIDEO_EXPORTER_ARM64"

if [[ $(uname -m) == "x86_64" ]]; then
    BINARY_X86="$OUTPUT_DIR/camera-overlay-x86_64-apple-darwin"
    echo "  -> Building x86_64 binary..."
    swiftc "$SCRIPT_DIR/camera-overlay/main.swift" \
        -o "$BINARY_X86" \
        -target x86_64-apple-macos12 \
        -framework Cocoa \
        -framework AVFoundation \
        -framework CoreMedia \
        -framework CoreVideo
    chmod +x "$BINARY_X86"

    VIDEO_EXPORTER_X86="$OUTPUT_DIR/video-exporter-x86_64-apple-darwin"
    echo "  -> Building x86_64 video exporter..."
    swiftc "$SCRIPT_DIR/video-exporter/main.swift" \
        -o "$VIDEO_EXPORTER_X86" \
        -target x86_64-apple-macos12 \
        -framework Foundation \
        -framework AVFoundation \
        -framework CoreGraphics \
        -framework CoreMedia
    chmod +x "$VIDEO_EXPORTER_X86"
fi

echo "Sidecar binary built at: $BINARY_ARM64"
file "$BINARY_ARM64"
echo "Video exporter built at: $VIDEO_EXPORTER_ARM64"
file "$VIDEO_EXPORTER_ARM64"
