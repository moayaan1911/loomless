# LoomLess - Project Guide

## Overview

LoomLess is a suite of screen recording tools: a Chrome extension (`studio-extension`), a desktop app (`desktop-app` via Tauri), and a landing page (`website`). 100% local, no cloud uploads. Built by Mohammad Ayaan Siddiqui (moayaan.eth).

## Current Focus

- Active development on `studio-extension` (Chrome) and `desktop-app` (Tauri).
- Desktop distribution note: The macOS desktop app stays on `desktop-app/` via Tauri. Tauri macOS signing is currently ad-hoc/pending Apple Developer ID, and the website download modal reflects this pending Apple ID state. The full temporary Apple signing and notarization flow is documented below and must stay intact.
- Mobile distribution note: Android publishing is planned with a Google Play account (license). iOS is not yet confirmed and can stay later. The mobile app is now planned as a separate `mobile/` Capacitor project that reuses the same LoomLess UI/flow as desktop and extension, with native Android recording logic added underneath as needed. Current mobile roadmap: Phase 1 = Capacitor setup + same LoomLess UI port, Phase 2 = native Android recording features and APK testing, Phase 3 = final Android release flow including update handling and AAB output.

## Latest Update

- On April 23, 2026, the rebuilt production DMG was tested from the WEBSITE download flow itself, not just from local bundles or the GitHub release page.
- That website-download test is now confirmed good end-to-end:
  - clean install from the website DMG worked
  - camera + microphone permission popups both appeared correctly
  - recording completed successfully
  - stop action immediately triggered the save/download flow
  - downloaded recording had correct audio and video quality
  - current recorder-only macOS alpha release can now be treated as website-tested / production-good for the intended alpha scope
- Immediate next step after this confirmation is simply keeping `main` pushed/live with the same final DMG link that passed the website test.
- On April 23, 2026, the buggy public `v0.0.1` desktop release was deleted and replaced with a freshly rebuilt public `v0.0.1` release on GitHub.
- Current confirmed public `v0.0.1` artifact state after the rebuild:
  - the updater tarball now contains a bundle where BOTH `LoomLess` and `camera-overlay` use `Identifier=com.loomless.desktop`
  - BOTH binaries inside that updater tarball now retain the camera + audio-input entitlements
  - the public DMG was rebuilt from the fixed app bundle, re-signed, notarized, stapled, and validated
  - the mounted app inside the final public DMG passed both `spctl -a -t exec -vv` and `syspolicy_check distribution`
  - helper script added for this release flow: `desktop-app/scripts/resign-macos-app-with-entitlements.sh`
- Immediate next step is no longer desktop release prep; it is now the `main` branch website download-link / localhost install verification flow against this rebuilt public `v0.0.1` release.
- On April 23, 2026, a clean website-download / install test surfaced a new post-release regression on the public `v0.0.1` desktop build:
  - the app opens successfully and the old Gatekeeper / "cannot verify" error is gone
  - but the camera permission popup does NOT appear during first-use camera flow
  - the app instead shows its own "Camera Permission Required" blocked modal
  - System Settings can show `LoomLess` as enabled for Camera, yet the app still behaves as if camera access is blocked
  - this means the public `v0.0.1` desktop release should NOT yet be treated as fully verified for camera-permission UX
  - root cause was confirmed to be the final shipped artifact losing the required same-identity + entitlement combination across the main binary and `camera-overlay` sidecar
- On April 23, 2026, the user approved the final local smoke test of the recorder-only macOS desktop alpha as `10/10`.
- Later on April 23, 2026, the user explicitly approved starting the sign / notarize / draft-release prep flow for the recorder-only macOS alpha.
- The recorder-only macOS desktop alpha version should be `0.0.1` for the next local build and release prep, not `1.0.2`.
- Signed + notarized + stapled + validated `v0.0.1` release artifacts are now ready locally:
  - `LoomLess (alpha).app`
  - `LoomLess (alpha).app.tar.gz`
  - `LoomLess (alpha).app.tar.gz.sig`
  - `LoomLess (alpha)_0.0.1_aarch64.dmg`
- Important release fix is confirmed locally: both the main app binary and `camera-overlay` sidecar now use the same `Identifier=com.loomless.desktop`, and the final app + DMG passed local validation checks.
- New signing lesson from the post-release regression: for the final Developer ID build, it is NOT enough to preserve identifier + runtime only. The final signed main executable and the `camera-overlay` sidecar must also both retain the camera + audio-input entitlements, or camera permission flow can still fail even when the app opens successfully.
- `desktop-app/src-tauri/target/release/bundle/macos/latest.json` was updated for `v0.0.1`, uploaded to GitHub Releases, and the updater `releases/latest/download/latest.json` path is now live.
- The public GitHub desktop release is now published as `v0.0.1` with all 4 final assets uploaded.
- Current confirmed local desktop alpha state:
  - camera overlay issue is solved
  - camera + microphone permission popup issue is solved
  - floating-controls issue is solved
  - raw / no-edit recording flow is working in the tested local alpha build
  - edited export flow (`trim`, `crop`, `speed`, or combinations) is still unreliable / broken and remains out of scope for this alpha
- Current product direction:
  - ship a recorder-only mac desktop `alpha`
  - app bundle / branding should be `LoomLess (alpha)`
  - the public GitHub desktop release is now already published as `v0.0.1`; next focus is the website download path and clean first-user install test
- Remaining next steps before public release work:
  - remove both `LoomLess.app` and `LoomLess (alpha).app` from `/Applications` on the user's Mac, and remove their stale camera / microphone / screen-recording permissions too, so website-install testing behaves like a real first-time user flow
  - debug and fix the missing camera-permission popup / false-blocked state in the public desktop build before treating the website install flow as final-good
  - switch to the `main` branch, update the website download link/modal to the exact final public DMG filename if needed, and run the website build there
  - only after the website is updated and live, download and install the app from the website and run one clean "new user" smoke test of the full public install path

## Branch-Scoped Work Rules (STRICT)

This repo uses separate branches for each product surface. The branch you are currently on **dictates which product surface folders you are allowed to modify**. Shared folders such as `assets/`, repo-root support files, and other non-product-specific files are allowed across branches unless they clearly belong to another protected product surface. If the user asks for a change inside another product surface folder, **politely refuse** and ask them to switch to the correct branch first. Never modify out-of-scope product files just because the user asked — always enforce the branch boundary and explain which branch they should switch to.

**Run `git branch --show-current` once at the start of a work session, and only re-run it if the branch changes before making edits.**

| Branch | Protected product folder | Notes |
| --- | --- | --- |
| `main` | `website/` | Next.js landing page work. Refuse changes inside `desktop-app/`, `studio-extension/`, or `mobile/` on this branch, but shared folders like `assets/` and normal repo-root files are still allowed. |
| `tauri-desktop-app` | `desktop-app/` | Tauri desktop app work. Refuse changes inside `website/`, `studio-extension/`, or `mobile/` on this branch, but shared folders like `assets/` and normal repo-root files are still allowed. |
| `extension` (not yet created) | `studio-extension/` | Chrome extension work. Refuse changes inside `website/`, `desktop-app/`, or `mobile/` on this branch, but shared folders like `assets/` and normal repo-root files are still allowed. |
| `mobile` (not yet created) | `mobile/` (folder will also be created later) | Mobile app work. Refuse changes inside `website/`, `desktop-app/`, or `studio-extension/` on this branch, but shared folders like `assets/` and normal repo-root files are still allowed. |

**How to refuse politely (example):**
> "We're currently on the `tauri-desktop-app` branch — per the branch-scoping rules in CLAUDE.md, this branch only touches `desktop-app/`. The change you're asking for lives in `website/`, which belongs on the `main` branch. Please switch with `git checkout main` and I'll pick it up there."

Exception: edits to repo-level files that apply to all branches (`CLAUDE.md`, `AGENTS.md`, root `.gitignore`, memory files), shared folders like `assets/`, and other non-product-specific root files are allowed regardless of branch.

## Project Structure

```
desktop-app/            # Tauri desktop app (src/ = frontend)
  src-tauri/           # Tauri Rust backend config
  src/                 # Frontend files (recorder, editor, camera overlay)
studio-extension/      # Chrome MV3 extension
  manifest.json
  background.js
  popup/               # Extension popup
  recorder/            # Main recording + editing app
website/               # Next.js landing page
```

## Desktop App Commands

- `npm run tauri dev` — Run desktop app in development mode
- `npm run tauri build` — Build desktop app for production

## Key Architecture Decisions

### Recording Modes

Four modes: `screen`, `screen-mic`, `screen-cam`, `screen-cam-mic`. Mode is stored in `recordingMode` variable in recorder.js.

### System Audio Toggle

System audio capture for the macOS desktop app is intentionally NOT shipped in the current settings UI. The old `Record System Audio` toggle is hidden for now because the current `WKWebView` / `getDisplayMedia()` path does not reliably expose system-audio tracks on macOS.

Future desktop update plan:
- Re-introduce this feature only after implementing a native macOS capture path, most likely via `ScreenCaptureKit`
- Keep system audio separate from microphone capture so users do not accidentally record notifications or other desktop sounds
- Until that native path exists, do NOT unhide or market a system-audio recording toggle in the desktop app

### Camera Overlay Strategy (IMPORTANT)

When camera is enabled, the system must handle three capture scenarios differently to avoid duplicate camera circles:

1. **Self-tab capture** (recording the recorder tab itself): Detected by `isLikelySelfTabCapture()`. The on-page camera preview IS the overlay. No compositing needed.
2. **Entire screen capture** (`displaySurface === "monitor"`): The recorder tab is visible on screen, so the on-page preview is already captured. No compositing needed.
3. **Different window/tab capture**: The recorder tab is NOT in the capture. Must use `createCompositeStream()` to draw camera overlay onto the video via canvas compositing.

The camera preview element (`cameraPreviewContainer`) stays visible and draggable in ALL cases. Position is tracked via `cameraOverlayPosition` (normalized 0-1 coordinates).

### Desktop App Camera Overlay (Sidecar)

The desktop app uses a Swift-based sidecar binary (source: `desktop-app/sidecar/camera-overlay/main.swift`) that provides a floating, always-on-top camera window which persists when the user switches to other apps.

**Key Implementation Details:**
- Sidecar is a raw Swift Mach-O binary, NOT a nested `.app` bundle
- Built via `sidecar/build.sh` which outputs directly to `src-tauri/binaries/camera-overlay-aarch64-apple-darwin` (and an x86_64 variant on Intel hosts)
- Tauri's `externalBin` config copies the binary into `LoomLess (alpha).app/Contents/MacOS/camera-overlay` at bundle time
- Sidecar spawns when the user selects a camera mode (not during recording) so camera permission is requested early
- Communicates with the main app via stdin/stdout: `show`, `hide`, `move`, `controls`, `state`, `quit`
- The Swift code calls `setActivationPolicy(.accessory)` at runtime so the sidecar has no Dock icon (no `LSUIElement` plist entry needed)

**TCC and code signing — the honest truth:**
- Apple's TCC was designed around Developer ID signing ($99/yr). With Developer ID, the Team Identifier stays stable across rebuilds, so TCC recognises v2 as the same app as v1 and never re-prompts. Without Developer ID we are stuck with ad-hoc signing; every rebuild gets a new CDHash and TCC may re-prompt. This is an Apple constraint, not a Tauri bug — Electron and native C++ apps behave the same without Developer ID. OBS/Slack/VSCode don't see this only because they're signed with paid Developer IDs
- End users downloading a release DMG still see ONE prompt on first launch (they don't rebuild). The double-prompt churn mostly hits DEV rebuilds where CDHash changes frequently
- For shipping: buy Apple Developer ID, sign + notarize — this also removes the Gatekeeper "cannot be opened" warning

**mainBinaryName (prompt label):**
- Tauri v2 does NOT auto-rename the binary from `productName`; you must set `mainBinaryName` explicitly. Otherwise the binary is the Cargo package name (`desktop-app`) and ad-hoc-signed apps show that filename in TCC prompts. `tauri.conf.json` sets `mainBinaryName: "LoomLess"` so the prompt reads "LoomLess would like to access the Camera"

**Permission Handling (single prompt):**
- The sidecar binary lives inside `LoomLess (alpha).app/Contents/MacOS/`, so macOS resolves its main `Bundle` to LoomLess (alpha).app and uses that bundle's `NSCameraUsageDescription` and TCC entry
- For TCC to treat the WebView and the sidecar as the SAME app, both binaries must share one code-signing identity. By default, `swiftc` and `rustc` emit per-binary "linker-signed" ad-hoc signatures with DIFFERENT identifiers (e.g. `desktop_app-<hash>` vs `camera-overlay-aarch64-apple-darwin`). Different identifiers = two TCC entities = two camera prompts, with the prompt showing "desktop-app" instead of "LoomLess"
- Fix: the bundle is re-signed as one coherent ad-hoc bundle after Tauri builds it (see Build Process below). After re-signing, both binaries share the bundle identifier `com.loomless.desktop`, so the WebView's `getUserMedia` and the sidecar's `AVCaptureDevice.requestAccess` share a single TCC identity and the user sees ONE prompt saying "LoomLess wants camera access"
- Do NOT wrap the sidecar in its own nested `.app` bundle with a separate `CFBundleIdentifier` — that also splits the TCC identity and causes a second prompt

**Build Process (ALWAYS run all three steps in order):**
1. Run `bash sidecar/build.sh` to compile the sidecar binary
2. Run `npm run tauri build` to build the main app. Tauri's `externalBin` takes care of copying the sidecar into the final `.app` bundle — no manual copy step is needed. `tauri.conf.json` sets `bundle.macOS.signingIdentity = "-"` so Tauri ad-hoc signs the bundle
3. **Mandatory post-build re-sign** — order matters. `codesign --deep` does NOT re-sign standalone Mach-O binaries next to the main exec inside `Contents/MacOS/`, and if you sign the sidecar first then `--deep` the bundle, `--deep` reverts the sidecar back to its linker-signed identifier. So run in this exact order:
   ```bash
   # (a) re-sign the bundle first
   codesign --force --deep --sign - "desktop-app/src-tauri/target/release/bundle/macos/LoomLess (alpha).app"
   # (b) THEN explicitly re-sign the sidecar with the bundle identifier
   codesign --force --sign - --identifier com.loomless.desktop \
     "desktop-app/src-tauri/target/release/bundle/macos/LoomLess (alpha).app/Contents/MacOS/camera-overlay"
   ```
   Verify afterwards — BOTH must print `Identifier=com.loomless.desktop`:
   ```bash
   codesign -dv "desktop-app/src-tauri/target/release/bundle/macos/LoomLess (alpha).app/Contents/MacOS/LoomLess" 2>&1 | grep Identifier
   codesign -dv "desktop-app/src-tauri/target/release/bundle/macos/LoomLess (alpha).app/Contents/MacOS/camera-overlay" 2>&1 | grep Identifier
   ```

### Video Storage

Uses IndexedDB (`LoomLessDB`) to pass recorded video blobs from the recorder tab to the editor tab. Recordings are cleaned up after export.

### Editor Features

- Trim (in/out points)
- Speed control (0.5x - 2x)
- Free crop with handles
- Export as WebM or MP4 (with fallback)
- WebM duration metadata patching for correct playback length

## Common Pitfalls

- WebM files from MediaRecorder often have `Infinity` duration. The editor uses `getFiniteDuration()` to resolve this by seeking to MAX_SAFE_INTEGER.
- MP4 export via MediaRecorder is only available in newer Chromium versions. Falls back to WebM with a warning.
- The `content_security_policy` in manifest restricts to `script-src 'self'` - no inline scripts or eval.

### Camera/Mic Access Cleanup

When recording stops, the camera overlay window must properly quit (not just hide) to release camera resources. The `closeCameraOverlayWindow()` function calls `quit_camera_overlay` which:
1. Sends "quit" command to the sidecar
2. Kills the child process
3. Actually turns OFF the camera (green light goes off)

**Two preview-time camera bugs and their fixes (desktop app):**

1. **Duplicate camera circle when switching between camera modes** (e.g. `screen-cam` then `screen-cam-mic`). The old `setupCameraPreview()` unhid the in-app `cameraPreviewContainer` and then relied on `createCameraOverlayWindow()` to re-hide it after the sidecar spawned. But that hide path was gated on `!cameraOverlayVisible`, so on the second mode switch the hide never ran and the user saw both the in-app preview AND the floating sidecar. Fix: in the Tauri branch of `setupCameraPreview()`, never show the in-app preview at all — the sidecar IS the preview. Also skip opening the WebView's `getUserMedia` stream at preview time; it is opened lazily at recording start in the existing `needsCamera && !cameraStream` block, so compositing still works.
2. **Camera green light stays on after switching from a camera mode back to `screen`.** `setRecordingMode()` called `hideCameraPreview()` which only tears down the WebView stream; it never told the sidecar to quit. The sidecar kept its `AVCaptureDevice` open, so the OS camera indicator stayed on. Fix: in `setRecordingMode()`, after `hideCameraPreview()`, also call `closeCameraOverlayWindow()` when `window.__TAURI__ && cameraOverlayVisible && !isRecording`. The `!isRecording` guard is important — during recording the sidecar must stay alive so the floating overlay keeps rendering.

### Export Stability

- If desktop export suddenly hangs, first check for stale UI refs in `editor.js` (the removed `speedSlider` broke export once).
- Native macOS trim export is currently disabled; the reliable fallback is the existing canvas/media-recorder export path.

**If two prompts reappear after a rebuild:**
- Confirm step 3 of Build Process ran successfully. Run `codesign -dv .../Contents/MacOS/camera-overlay 2>&1 | grep Identifier` and `codesign -dv .../Contents/MacOS/LoomLess 2>&1 | grep Identifier` — they MUST print the same identifier
- Reset stale macOS TCC records with `tccutil reset Camera com.loomless.desktop` and `tccutil reset Microphone com.loomless.desktop`, then relaunch
- Verify `src-tauri/binaries/camera-overlay-aarch64-apple-darwin` is a Mach-O binary (not a shell script) and that no `CameraOverlay.app` directory exists under `src-tauri/binaries/`

**Temporary signed release flow (using Pritam's individual Apple Developer account on Ayaan's Mac):**

This is a temporary macOS-only release workaround. Pritam does NOT need to own a Mac; the signing, notarization, and release work can be done on Ayaan's Mac using Pritam's paid Apple Developer account. Do NOT log out of the local macOS/iCloud Apple ID just to do this; only the Apple Developer and notarization tooling needs Pritam's account details.

**Step 1 — One-time Apple setup**
1. Sign in to `developer.apple.com` with Pritam's Apple Developer account to confirm the membership is active, find the `Team ID`, and create/download/install a `Developer ID Application` certificate into the local Keychain on Ayaan's Mac.
2. Sign in to `account.apple.com` with the same Apple ID and generate an app-specific password for notarization.

**Step 2 — Bump the app version**
1. Increase the desktop app version before building a signed release (for example `1.0.0` -> `1.0.1`).
2. Do NOT try to re-sign and re-upload the same `1.0.0` release and expect the updater to detect it as new.

**Step 3 — Build, sign, and notarize**
1. Build the macOS desktop app.
2. Sign the final build with the `Developer ID Application` certificate.
3. Notarize the release using Pritam's Apple ID, the app-specific password from `account.apple.com`, and the `Team ID`.
4. Staple the notarization ticket to the final app/archive before upload.

**Step 4 — Keep updater artifacts**
1. The desktop app updater is configured to read `latest.json` from GitHub Releases.
2. Keep the signed updater artifacts (`latest.json` and the signed downloadable archive/DMG/zip generated for the release). These files are required for automatic update detection.

**Step 5 — Create a new GitHub release**
1. Upload the newly signed/notarized release artifacts to a NEW GitHub release (for example `v1.0.1`).
2. Do NOT overwrite the old `v1.0.0` release.
3. Prefer creating the GitHub release as a draft first so it can be reviewed before going live.

**Step 6 — Publish the release**
1. Once the draft GitHub release is published publicly, the app's updater can detect the new version from the GitHub `latest` endpoint.
2. The website download button does NOT automatically change when the GitHub release is published. If the website still points to `v1.0.0`, it must be updated separately on the `main` branch.

**CRITICAL command-prep rule for EVERY future macOS signing / notarization / release command:**
Before running EACH command in the signed release flow, do ALL THREE checks first:
1. Web search for the latest relevant docs / known issues.
2. Context7 MCP search for the latest Tauri docs / examples.
3. Apple docs search (and Apple Developer Forums if needed) for the exact signing, notarization, Gatekeeper, TCC, or `spctl` / `syspolicy_check` behavior.

Do NOT skip this. Do NOT assume the previous command is still correct just because it worked once. Re-check before EACH important command, especially:
- `npm run tauri build`
- any `codesign` command
- any `xcrun notarytool` command
- any `xcrun stapler` command
- any `spctl` / `syspolicy_check` validation command
- any GitHub release asset decision (`DMG` only vs all 4 assets)

**CRITICAL 1.0.1 release postmortem (MUST remember for next time):**

What happened:
- The first public `v1.0.1` release was BROKEN for real users.
- The originally uploaded `DMG` looked okay from the repo/release flow, but the downloaded app failed Gatekeeper with the `Move to Trash` style error.
- Later terminal validation on the downloaded `DMG` / installed app showed the distributed app was effectively still wrong for distribution:
  - `Adhoc Signed App`
  - `Notary Ticket Missing`
- A later rebuilt + separately notarized/stapled `DMG` DID open correctly, which proved the original release asset was bad.
- But after that, another bug still remained: the app opened, yet camera/mic permission prompts did NOT appear correctly, and LoomLess did not show up in macOS Privacy settings as expected.

Real root cause of the permission bug:
- In the Developer ID signed build, the main app binary was signed as `com.loomless.desktop`, but the sidecar helper inside `Contents/MacOS/camera-overlay` kept a DIFFERENT identifier such as `camera-overlay`.
- That means TCC/Gatekeeper/privacy identity was split again.
- Result: the app could open, but camera/mic permission flow was unreliable/broken even though the app itself was now notarized.
- Therefore: for proper public release, it is NOT enough to only fix the `DMG`. The sidecar helper identity must ALSO match the main app identity.

Important conclusion:
- `tccutil reset Camera com.loomless.desktop` and `tccutil reset Microphone com.loomless.desktop` were NOT the real cause of the broken permission popup. Those commands only clear old grants. They do not permanently break the app.
- The real issue was the build/signing identity mismatch inside the shipped app bundle.

**MANDATORY next release plan (use NEW version, do NOT recycle 1.0.1):**
- Ship the alpha as `v0.0.1`, not by endlessly mutating `v1.0.1`.
- Rebuild and redistribute ALL FOUR release artifacts again:
  1. `latest.json`
  2. `LoomLess (alpha).app.tar.gz`
  3. `LoomLess (alpha).app.tar.gz.sig`
  4. final public `DMG`
- Do NOT assume `DMG`-only replacement is enough for the final permanent fix, because the app bundle itself changed.

**MANDATORY 0.0.1 build/sign/notarize checklist:**
1. Set version to `0.0.1`.
2. Build the app with Developer ID signing env vars.
3. After build, explicitly inspect BOTH binaries:
   - `Contents/MacOS/LoomLess`
   - `Contents/MacOS/camera-overlay`
4. BOTH binaries MUST report:
   - the SAME signing identity
   - the SAME Team Identifier
   - the SAME `Identifier=com.loomless.desktop`
5. If the sidecar still says `Identifier=camera-overlay`, STOP. Do NOT upload anything. Re-sign/fix first.
6. Validate the built app BEFORE packaging/release:
   - `spctl -a -t exec -vv "<LoomLess (alpha).app>"`
   - `syspolicy_check distribution "<LoomLess (alpha).app>"`
7. Notarize and staple correctly.
8. Validate the final `DMG` itself:
   - `spctl -a -t open --context context:primary-signature -vv <DMG>`
   - `xcrun stapler validate <DMG>`
9. Mount the `DMG`, then validate the app INSIDE the mounted volume too:
   - `spctl -a -t exec -vv "/Volumes/.../LoomLess (alpha).app"`
   - `syspolicy_check distribution "/Volumes/.../LoomLess (alpha).app"`
10. Only after ALL of the above pass, upload the 4 artifacts to GitHub release.
11. If the `DMG` filename changes, the `website` direct download link on `main` MUST be updated to that exact filename too.

**Extra code-level note for next time:**
- Audit the camera/mic permission UX in `desktop-app/src/recorder.js`.
- At recording start, a failed `getUserMedia({ video: ... })` path currently only showed a red toast in at least one path (`Could not access camera. Recording without camera overlay.`).
- Even after the signing/TCC identity fix, confirm that denied/missing camera or mic permissions trigger the correct permission modal / guidance path, not just a silent fallback toast.

**CURRENT HANDOFF SNAPSHOT (added after the morning context compact):**
- Repo path: `/Users/moayaan.eth/loomless-extension`
- Last known active desktop branch during debugging: `tauri-desktop-app`
- Last known desktop branch state at compaction time was clean (no uncommitted changes there)
- A first public `v1.0.1` release was published, but its original `DMG` was broken for real users
- The broken `DMG` produced Gatekeeper / `Move to Trash` style failures and later terminal checks proved it behaved like a bad distribution artifact
- A later local rebuild + notarization + stapling produced a FIXED `DMG` that DID open successfully for the user when downloaded directly from the GitHub release page
- The fixed `DMG` was renamed for clarity to:
  - `LoomLess_1.0.1_notarized_aarch64.dmg`
- Fixed `DMG` local path:
  - `desktop-app/src-tauri/target/release/bundle/dmg/LoomLess_1.0.1_notarized_aarch64.dmg`
- Fixed `DMG` hash:
  - `ea5962d11a0e4c28532aae5e0bd217b975ddf5debf0d01dc7c803e6d6e14ca70`
- The user manually uploaded that renamed fixed `DMG` to the GitHub `v1.0.1` release
- Important: the release page direct-download test succeeded, but website download may still point to the OLD filename unless `main` is explicitly updated to the renamed `DMG`
- Therefore, until the website link is confirmed, do NOT assume the website is serving the same fixed artifact as the release page

**What was confirmed about updater assets at handoff time:**
- Existing local updater assets were checked:
  - `desktop-app/src-tauri/target/release/bundle/macos/latest.json`
  - `desktop-app/src-tauri/target/release/bundle/macos/LoomLess.app.tar.gz`
  - `desktop-app/src-tauri/target/release/bundle/macos/LoomLess.app.tar.gz.sig`
- The extracted app from `LoomLess.app.tar.gz` passed distribution checks locally
- So at that moment, the website direct-download failure looked like a `DMG` problem first, not necessarily a tarball/updater artifact problem
- HOWEVER, because the later camera/mic permission bug showed the shipped bundle identity was still wrong, the final clean fix should still be treated as a NEW `v0.0.1` alpha release with ALL FOUR artifacts rebuilt and replaced

**What was confirmed about the current permission bug:**
- After the fixed `DMG` finally opened, a NEW problem remained:
  - no camera permission popup
  - no microphone permission popup
  - LoomLess did not reliably appear in macOS Privacy settings for camera/mic
  - the app could still show a red toast like `Could not access camera. Recording without camera overlay.`
- This means:
  - Gatekeeper/notarization issue and TCC/permission identity issue are TWO separate layers
  - opening successfully does NOT mean permission flow is correct
- `Info.plist` already contains:
  - `NSCameraUsageDescription`
  - `NSMicrophoneUsageDescription`
- Therefore, the missing popup is NOT simply because plist permission strings were absent

**Most likely real technical cause of the remaining permission issue:**
- Main executable was signed as `Identifier=com.loomless.desktop`
- Sidecar helper inside `Contents/MacOS/camera-overlay` was still signed with a different identifier such as `camera-overlay`
- With Developer ID signing, that identity mismatch likely breaks TCC privacy behavior even when the app is otherwise notarized and opens correctly
- So next time, the sidecar must NOT just be signed; it must be signed with the SAME identifier as the main app bundle

**Secrets / account assumptions at handoff time:**
- Assume the following are already available locally from the prior session:
  - Apple Developer certificate installed in local Keychain
  - Apple ID email
  - Team ID `TAPQSCS388`
  - app-specific password already provided in prior session
- Do NOT ask the user for those again unless Apple itself forces a fresh auth, rejects the session, or requires new 2FA confirmation

**Recommended exact next-time order:**
1. Stay on / switch to `tauri-desktop-app`
2. Do the 3-doc-search ritual before EACH significant command
3. Fix sidecar signing identity so BOTH binaries become `com.loomless.desktop`
4. Rebuild as `0.0.1`
5. Re-validate app + DMG + mounted app thoroughly
6. Rebuild all 4 release artifacts
7. Publish `v0.0.1`
8. Update website on `main` if the public DMG filename changes

## Permissions

- `tabs` + `activeTab`: Opening/focusing recorder tab
- Camera/mic: Requested at runtime via `getUserMedia` (no manifest permission needed for extension pages)
- Screen capture: Via `getDisplayMedia` (no manifest permission needed)

## Build & Deploy

No build step. The `studio-extension/` folder IS the extension. Load unpacked in chrome://extensions or zip for Chrome Web Store submission.

NEVER RUN ANY GIT COMMAND YOURSELF, INFACT ALWAYS ASK ME BEFORE RUNNING ANY COMMAND
WHEN WORKING IN STUDIO EXTENSION, NO NEED TO RUN NPM RUN BUILD OR OTHER COMMANDS SINCE ITS IN PLAIN JS
FOR WEBSITE AFTER EVERY FEATURE IMPLEMENTATION RUN NPM RUN BUILD COMMAND
AFTER EVERY PROMPT READ AGENTS MD AND CLAUDE MD FOR ANY INSTRUCTIONS
