#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <app-path> <signing-identity> [entitlements-plist]"
  exit 1
fi

APP_PATH="$1"
SIGNING_IDENTITY="$2"
ENTITLEMENTS_PATH="${3:-$(cd "$(dirname "$0")/../src-tauri" && pwd)/Entitlements.plist}"

MAIN_BINARY="$APP_PATH/Contents/MacOS/LoomLess"
SIDECAR_BINARY="$APP_PATH/Contents/MacOS/camera-overlay"

if [[ ! -d "$APP_PATH" ]]; then
  echo "App not found: $APP_PATH"
  exit 1
fi

if [[ ! -f "$MAIN_BINARY" ]]; then
  echo "Main binary not found: $MAIN_BINARY"
  exit 1
fi

if [[ ! -f "$SIDECAR_BINARY" ]]; then
  echo "Sidecar binary not found: $SIDECAR_BINARY"
  exit 1
fi

if [[ ! -f "$ENTITLEMENTS_PATH" ]]; then
  echo "Entitlements file not found: $ENTITLEMENTS_PATH"
  exit 1
fi

echo "Signing sidecar with entitlements..."
codesign \
  --force \
  --sign "$SIGNING_IDENTITY" \
  --options runtime \
  --timestamp \
  --entitlements "$ENTITLEMENTS_PATH" \
  --identifier com.loomless.desktop \
  "$SIDECAR_BINARY"

echo "Signing app bundle with entitlements..."
codesign \
  --force \
  --sign "$SIGNING_IDENTITY" \
  --options runtime \
  --timestamp \
  --entitlements "$ENTITLEMENTS_PATH" \
  "$APP_PATH"

echo
echo "Main binary entitlements:"
codesign -d --entitlements :- "$MAIN_BINARY" 2>/dev/null
echo
echo "Sidecar entitlements:"
codesign -d --entitlements :- "$SIDECAR_BINARY" 2>/dev/null
echo
echo "Identifier / team check:"
codesign -dv "$MAIN_BINARY" 2>&1 | rg 'Identifier=|TeamIdentifier=|flags='
codesign -dv "$SIDECAR_BINARY" 2>&1 | rg 'Identifier=|TeamIdentifier=|flags='
