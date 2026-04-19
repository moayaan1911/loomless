import Cocoa
import AVFoundation
import CoreMedia
import CoreVideo

enum OverlayState: String {
    case idle
    case recording
    case paused
}

final class ControlOverlayWindow: NSWindow {
    private let pauseResumeButton = NSButton()
    private let stopButton = NSButton()
    private(set) var overlayState: OverlayState = .idle

    init(origin: NSPoint) {
        super.init(
            contentRect: NSRect(x: origin.x + 23, y: origin.y - 52, width: 114, height: 42),
            styleMask: .borderless,
            backing: .buffered,
            defer: false
        )

        level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.statusWindow)))
        backgroundColor = .clear
        isOpaque = false
        hasShadow = false
        ignoresMouseEvents = false
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

        let visualView = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 114, height: 42))
        visualView.material = .hudWindow
        visualView.blendingMode = .withinWindow
        visualView.state = .active
        visualView.wantsLayer = true
        visualView.layer?.cornerRadius = 21
        visualView.layer?.masksToBounds = true
        visualView.layer?.borderWidth = 1
        visualView.layer?.borderColor = NSColor.white.withAlphaComponent(0.08).cgColor
        contentView = visualView

        configureButton(pauseResumeButton, frame: NSRect(x: 6, y: 5, width: 44, height: 32), action: #selector(handlePauseResume))
        configureButton(stopButton, frame: NSRect(x: 64, y: 5, width: 44, height: 32), action: #selector(handleStop))
        stopButton.image = NSImage(systemSymbolName: "stop.fill", accessibilityDescription: "Stop")

        visualView.addSubview(pauseResumeButton)
        visualView.addSubview(stopButton)
        applyState(.idle)
    }

    private func configureButton(_ button: NSButton, frame: NSRect, action: Selector) {
        button.frame = frame
        button.isBordered = false
        button.bezelStyle = .regularSquare
        button.imagePosition = .imageOnly
        button.imageScaling = .scaleProportionallyDown
        button.wantsLayer = true
        button.layer?.backgroundColor = NSColor.white.withAlphaComponent(0.08).cgColor
        button.layer?.cornerRadius = 16
        button.contentTintColor = NSColor.white.withAlphaComponent(0.94)
        button.target = self
        button.action = action
    }

    func applyState(_ state: OverlayState) {
        overlayState = state
        let symbolName = state == .paused ? "play.fill" : "pause.fill"
        pauseResumeButton.image = NSImage(systemSymbolName: symbolName, accessibilityDescription: state == .paused ? "Resume" : "Pause")

        let enabled = state != .idle
        pauseResumeButton.isEnabled = enabled
        stopButton.isEnabled = enabled
        let alpha: CGFloat = enabled ? 1 : 0.45
        pauseResumeButton.alphaValue = alpha
        stopButton.alphaValue = alpha
    }

    @objc private func handlePauseResume() {
        guard overlayState != .idle else { return }
        print("action:pause-resume")
        fflush(stdout)
    }

    @objc private func handleStop() {
        guard overlayState != .idle else { return }
        print("action:stop")
        fflush(stdout)
    }
}

class CameraOverlayWindow: NSWindow {
    var captureSession: AVCaptureSession?
    var previewLayer: AVCaptureVideoPreviewLayer?
    weak var controlsWindow: ControlOverlayWindow?

    init() {
        let windowSize = CGSize(width: 160, height: 160)

        guard let screen = NSScreen.main else {
            super.init(contentRect: NSRect(x: 100, y: 100, width: 160, height: 160),
                      styleMask: .borderless,
                      backing: .buffered,
                      defer: false)
            return
        }

        let screenRect = screen.visibleFrame
        let initialX = screenRect.maxX - windowSize.width - 20
        let initialY = screenRect.minY + 20

        super.init(contentRect: NSRect(x: initialX, y: initialY, width: 160, height: 160),
                   styleMask: .borderless,
                   backing: .buffered,
                   defer: false)

        self.level = NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.statusWindow)))
        self.backgroundColor = .clear
        self.isOpaque = false
        self.hasShadow = false
        self.ignoresMouseEvents = false
        self.isMovableByWindowBackground = true
        self.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]

        setupCameraView()
    }

    func setupCameraView() {
        let contentView = NSView(frame: NSRect(x: 0, y: 0, width: 160, height: 160))
        contentView.wantsLayer = true
        contentView.layer?.backgroundColor = NSColor.black.cgColor
        contentView.layer?.cornerRadius = 80
        contentView.layer?.masksToBounds = true
        contentView.layer?.borderWidth = 3
        contentView.layer?.borderColor = NSColor(red: 0.388, green: 0.400, blue: 0.945, alpha: 0.9).cgColor
        self.contentView = contentView
        contentView.layer?.shadowColor = NSColor.black.cgColor
        contentView.layer?.shadowOpacity = 0.3
        contentView.layer?.shadowOffset = CGSize(width: 0, height: 4)
        contentView.layer?.shadowRadius = 8
    }

    func startCamera() {
        guard captureSession == nil else { return }
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        if status == .notDetermined {
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted { DispatchQueue.main.async { self.startCameraCapture() } }
            }
            return
        }
        guard status == .authorized else { return }
        startCameraCapture()
    }

    func startCameraCapture() {
        captureSession = AVCaptureSession()
        captureSession?.sessionPreset = .vga640x480

        guard let session = captureSession else { return }
        guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else {
            print("Failed to get front camera")
            return
        }

        do {
            let input = try AVCaptureDeviceInput(device: device)
            if session.canAddInput(input) {
                session.addInput(input)
            }

            previewLayer = AVCaptureVideoPreviewLayer(session: session)
            previewLayer?.videoGravity = .resizeAspectFill
            previewLayer?.frame = NSRect(x: 0, y: 0, width: 160, height: 160)
            previewLayer?.connection?.automaticallyAdjustsVideoMirroring = false
            previewLayer?.connection?.isVideoMirrored = true

            if let layer = previewLayer {
                contentView?.layer?.insertSublayer(layer, at: 0)
            }

            DispatchQueue.global(qos: .userInitiated).async { [weak self] in
                self?.captureSession?.startRunning()
            }
        } catch {
            print("Error setting up camera: \(error)")
        }
    }

    func stopCamera() {
        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.captureSession?.stopRunning()
        }
        captureSession = nil
        previewLayer?.removeFromSuperlayer()
        previewLayer = nil
    }

    func showOverlay() {
        startCamera()
        orderFrontRegardless()
        syncControlsPosition()
    }

    func hideOverlay() {
        stopCamera()
        orderOut(nil)
    }

    func syncControlsPosition() {
        guard let controlsWindow = controlsWindow else { return }
        var controlsFrame = controlsWindow.frame
        controlsFrame.origin.x = frame.origin.x + 23
        controlsFrame.origin.y = frame.origin.y - 52
        controlsWindow.setFrame(controlsFrame, display: true)
    }
}

class AppDelegate: NSObject, NSApplicationDelegate, NSWindowDelegate {
    var window: CameraOverlayWindow?
    var controlsWindow: ControlOverlayWindow?
    var shouldShowControls = false

    func applicationDidFinishLaunching(_ notification: Notification) {
        let cameraWindow = CameraOverlayWindow()
        let controlsWindow = ControlOverlayWindow(origin: cameraWindow.frame.origin)
        cameraWindow.controlsWindow = controlsWindow
        cameraWindow.delegate = self
        self.window = cameraWindow
        self.controlsWindow = controlsWindow

        cameraWindow.showOverlay()

        print("ready")
        fflush(stdout)

        DispatchQueue.global(qos: .background).async { [weak self] in
            self?.readCommands()
        }
    }

    func applicationWillTerminate(_ notification: Notification) {
        window?.hideOverlay()
        controlsWindow?.orderOut(nil)
    }

    func windowDidMove(_ notification: Notification) {
        window?.syncControlsPosition()
    }

    func readCommands() {
        while let line = readLine() {
            let command = line.trimmingCharacters(in: .whitespacesAndNewlines)

            DispatchQueue.main.async { [weak self] in
                self?.handleCommand(command)
            }
        }
    }

    func handleCommand(_ command: String) {
        let parts = command.split(separator: " ", omittingEmptySubsequences: true)
        guard let action = parts.first else { return }

        switch action {
        case "show":
            window?.showOverlay()
            if shouldShowControls {
                controlsWindow?.orderFrontRegardless()
                window?.syncControlsPosition()
            }
        case "hide":
            window?.hideOverlay()
            controlsWindow?.orderOut(nil)
        case "move":
            guard parts.count >= 3,
                  let x = Double(parts[1]),
                  let y = Double(parts[2]) else { break }
            window?.setFrameOrigin(NSPoint(x: x, y: y))
            window?.syncControlsPosition()
        case "controls":
            guard parts.count >= 2 else { break }
            shouldShowControls = parts[1] == "1"
            if shouldShowControls {
                controlsWindow?.orderFrontRegardless()
                window?.syncControlsPosition()
            } else {
                controlsWindow?.orderOut(nil)
            }
        case "state":
            guard parts.count >= 2,
                  let state = OverlayState(rawValue: String(parts[1])) else { break }
            controlsWindow?.applyState(state)
        case "quit":
            NSApplication.shared.terminate(nil)
        default:
            break
        }
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.accessory)

let delegate = AppDelegate()
app.delegate = delegate
app.run()
