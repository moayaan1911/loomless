import AVFoundation
import CoreGraphics
import Darwin
import Foundation

enum ExportError: Error, CustomStringConvertible {
    case missingArgument(String)
    case invalidArgument(String)
    case noVideoTrack
    case cannotCreateCompositionTrack(String)
    case cannotCreateExporter
    case unsupportedMp4Output
    case exportFailed(String)

    var description: String {
        switch self {
        case .missingArgument(let name):
            return "Missing required argument: \(name)"
        case .invalidArgument(let message):
            return message
        case .noVideoTrack:
            return "Source file has no video track"
        case .cannotCreateCompositionTrack(let mediaType):
            return "Could not create \(mediaType) composition track"
        case .cannotCreateExporter:
            return "Could not create AVAssetExportSession"
        case .unsupportedMp4Output:
            return "Native exporter does not support MP4 output for this source"
        case .exportFailed(let message):
            return message
        }
    }
}

func argument(_ name: String) -> String? {
    let args = CommandLine.arguments
    guard let index = args.firstIndex(of: name), index + 1 < args.count else {
        return nil
    }
    return args[index + 1]
}

func requiredArgument(_ name: String) throws -> String {
    guard let value = argument(name), !value.isEmpty else {
        throw ExportError.missingArgument(name)
    }
    return value
}

func doubleArgument(_ name: String, default defaultValue: Double) throws -> Double {
    guard let value = argument(name) else {
        return defaultValue
    }
    guard let number = Double(value), number.isFinite else {
        throw ExportError.invalidArgument("Invalid numeric value for \(name): \(value)")
    }
    return number
}

func loadAsset(_ asset: AVURLAsset) throws {
    let keys = ["tracks", "duration", "playable"]
    let semaphore = DispatchSemaphore(value: 0)
    asset.loadValuesAsynchronously(forKeys: keys) {
        semaphore.signal()
    }
    semaphore.wait()

    for key in keys {
        var error: NSError?
        let status = asset.statusOfValue(forKey: key, error: &error)
        if status == .failed || status == .cancelled {
            throw ExportError.exportFailed(error?.localizedDescription ?? "Failed to load source asset key: \(key)")
        }
    }
}

func roundedEven(_ value: CGFloat) -> Int {
    let rounded = max(2, Int(value.rounded()))
    return rounded % 2 == 0 ? rounded : rounded + 1
}

func runExport() throws {
    let sourcePath = try requiredArgument("--source")
    let outputPath = try requiredArgument("--output")
    let trimStartSeconds = max(0, try doubleArgument("--trim-start", default: 0))
    let requestedTrimEnd = try doubleArgument("--trim-end", default: 0)
    let playbackSpeed = max(0.1, min(4.0, try doubleArgument("--speed", default: 1)))
    let cropX = max(0, try doubleArgument("--crop-x", default: 0))
    let cropY = max(0, try doubleArgument("--crop-y", default: 0))
    let cropWidth = max(0, try doubleArgument("--crop-width", default: 0))
    let cropHeight = max(0, try doubleArgument("--crop-height", default: 0))

    let sourceURL = URL(fileURLWithPath: sourcePath)
    let outputURL = URL(fileURLWithPath: outputPath)
    try? FileManager.default.removeItem(at: outputURL)

    let asset = AVURLAsset(url: sourceURL)
    try loadAsset(asset)

    guard let sourceVideoTrack = asset.tracks(withMediaType: .video).first else {
        throw ExportError.noVideoTrack
    }

    let assetDuration = CMTimeGetSeconds(asset.duration)
    guard assetDuration.isFinite, assetDuration > 0 else {
        throw ExportError.invalidArgument("Source duration is invalid")
    }

    let trimStart = min(trimStartSeconds, assetDuration)
    let trimEnd = requestedTrimEnd > trimStart ? min(requestedTrimEnd, assetDuration) : assetDuration
    guard trimEnd > trimStart else {
        throw ExportError.invalidArgument("Trim end must be greater than trim start")
    }

    let timescale = CMTimeScale(600)
    let sourceRange = CMTimeRange(
        start: CMTime(seconds: trimStart, preferredTimescale: timescale),
        duration: CMTime(seconds: trimEnd - trimStart, preferredTimescale: timescale)
    )
    let outputDuration = CMTimeMultiplyByFloat64(sourceRange.duration, multiplier: 1.0 / playbackSpeed)

    let composition = AVMutableComposition()
    guard let compositionVideoTrack = composition.addMutableTrack(
        withMediaType: .video,
        preferredTrackID: kCMPersistentTrackID_Invalid
    ) else {
        throw ExportError.cannotCreateCompositionTrack("video")
    }

    try compositionVideoTrack.insertTimeRange(sourceRange, of: sourceVideoTrack, at: .zero)
    compositionVideoTrack.preferredTransform = sourceVideoTrack.preferredTransform
    if abs(playbackSpeed - 1) > 0.001 {
        compositionVideoTrack.scaleTimeRange(
            CMTimeRange(start: .zero, duration: sourceRange.duration),
            toDuration: outputDuration
        )
    }

    if let sourceAudioTrack = asset.tracks(withMediaType: .audio).first,
       let compositionAudioTrack = composition.addMutableTrack(
           withMediaType: .audio,
           preferredTrackID: kCMPersistentTrackID_Invalid
       ) {
        try compositionAudioTrack.insertTimeRange(sourceRange, of: sourceAudioTrack, at: .zero)
        if abs(playbackSpeed - 1) > 0.001 {
            compositionAudioTrack.scaleTimeRange(
                CMTimeRange(start: .zero, duration: sourceRange.duration),
                toDuration: outputDuration
            )
        }
    }

    let transformedSize = sourceVideoTrack.naturalSize.applying(sourceVideoTrack.preferredTransform)
    let videoWidth = abs(transformedSize.width)
    let videoHeight = abs(transformedSize.height)
    guard videoWidth > 0, videoHeight > 0 else {
        throw ExportError.invalidArgument("Source video dimensions are invalid")
    }

    let hasCrop = cropWidth > 0 && cropHeight > 0
    let cropRect = CGRect(
        x: min(CGFloat(cropX), max(0, videoWidth - 2)),
        y: min(CGFloat(cropY), max(0, videoHeight - 2)),
        width: min(CGFloat(cropWidth), max(2, videoWidth - CGFloat(cropX))),
        height: min(CGFloat(cropHeight), max(2, videoHeight - CGFloat(cropY)))
    )

    let renderWidth = hasCrop ? roundedEven(cropRect.width) : roundedEven(videoWidth)
    let renderHeight = hasCrop ? roundedEven(cropRect.height) : roundedEven(videoHeight)
    let renderSize = CGSize(width: renderWidth, height: renderHeight)

    let videoComposition = AVMutableVideoComposition()
    videoComposition.renderSize = renderSize
    videoComposition.frameDuration = CMTime(value: 1, timescale: 30)

    let instruction = AVMutableVideoCompositionInstruction()
    instruction.timeRange = CMTimeRange(start: .zero, duration: outputDuration)

    let layerInstruction = AVMutableVideoCompositionLayerInstruction(assetTrack: compositionVideoTrack)
    var transform = sourceVideoTrack.preferredTransform
    if hasCrop {
        transform = transform.concatenating(CGAffineTransform(translationX: -cropRect.minX, y: -cropRect.minY))
    }
    layerInstruction.setTransform(transform, at: .zero)

    instruction.layerInstructions = [layerInstruction]
    videoComposition.instructions = [instruction]

    guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
        throw ExportError.cannotCreateExporter
    }
    guard exporter.supportedFileTypes.contains(.mp4) else {
        throw ExportError.unsupportedMp4Output
    }

    exporter.outputURL = outputURL
    exporter.outputFileType = .mp4
    exporter.shouldOptimizeForNetworkUse = true
    exporter.videoComposition = videoComposition
    exporter.timeRange = CMTimeRange(start: .zero, duration: outputDuration)

    let semaphore = DispatchSemaphore(value: 0)
    exporter.exportAsynchronously {
        semaphore.signal()
    }
    semaphore.wait()

    switch exporter.status {
    case .completed:
        print("export:completed")
    case .failed, .cancelled:
        throw ExportError.exportFailed(exporter.error?.localizedDescription ?? "Native MP4 export failed")
    default:
        throw ExportError.exportFailed("Native MP4 export ended with unexpected status: \(exporter.status.rawValue)")
    }
}

do {
    try runExport()
    exit(0)
} catch {
    fputs("\(error)\n", stderr)
    exit(1)
}
