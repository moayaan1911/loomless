use std::fs;
use std::process::Command;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, RunEvent};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

// State to hold the sidecar process handle
struct OverlayState {
    child: Option<CommandChild>,
}

impl Drop for OverlayState {
    fn drop(&mut self) {
        if let Some(mut child) = self.child.take() {
            let _ = child.write("quit\n".as_bytes());
            let _ = child.kill();
        }
    }
}

fn emit_main_window_action(app: &AppHandle, action: &str) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.emit("tray-action", action);
    }
}

fn send_overlay_command(child: &mut CommandChild, command: &str) -> Result<(), String> {
    child.write(command.as_bytes())
        .map_err(|e| format!("Failed to write overlay command '{command}': {e}"))
}

fn shutdown_overlay(app: &AppHandle) {
    let state = app.state::<Mutex<OverlayState>>();
    let guard_result = state.lock();
    if let Ok(mut guard) = guard_result {
        if let Some(mut child) = guard.child.take() {
            let _ = child.write("quit\n".as_bytes());
            let _ = child.kill();
        }
    }
}

#[tauri::command]
fn open_system_preferences_panel(panel: &str) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let url = match panel {
            "screen" => {
                "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture"
            }
            "camera" => "x-apple.systempreferences:com.apple.preference.security?Privacy_Camera",
            "microphone" => {
                "x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone"
            }
            _ => return Err(format!("unsupported preferences panel: {panel}")),
        };

        let status = Command::new("open")
            .arg(url)
            .status()
            .map_err(|error| format!("failed to launch System Settings: {error}"))?;

        if status.success() {
            Ok(())
        } else {
            Err(format!(
                "System Settings exited unsuccessfully with status: {status}"
            ))
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = panel;
        Err("System Settings deep links are only supported on macOS".into())
    }
}

#[tauri::command]
fn open_dev_website() -> Result<(), String> {
    let status = Command::new("open")
        .arg("https://moayaan.com")
        .status()
        .map_err(|error| format!("failed to open website: {error}"))?;

    if status.success() {
        Ok(())
    } else {
        Err(format!(
            "open command exited unsuccessfully with status: {status}"
        ))
    }
}

#[tauri::command]
fn show_camera_overlay(app: AppHandle, show_controls: bool) -> Result<(), String> {
    let state = app.state::<Mutex<OverlayState>>();
    let mut guard = state.lock().map_err(|e| format!("Failed to lock state: {e}"))?;

    // If already running, just send show command
    if let Some(ref mut child) = guard.child {
        send_overlay_command(child, &format!("controls {}\n", if show_controls { 1 } else { 0 }))?;
        send_overlay_command(child, "state recording\n")?;
        send_overlay_command(child, "show\n")?;
        return Ok(());
    }

    // Spawn the sidecar
    let (mut rx, child) = app
        .shell()
        .sidecar("camera-overlay")
        .map_err(|e| format!("Failed to create sidecar command: {e}"))?
        .spawn()
        .map_err(|e| format!("Failed to spawn camera overlay sidecar: {e}"))?;

    let app_handle = app.clone();

    // Store the child process
    guard.child = Some(child);

    // Configure the overlay before showing it.
    if let Some(ref mut child) = guard.child {
        send_overlay_command(child, &format!("controls {}\n", if show_controls { 1 } else { 0 }))?;
        send_overlay_command(child, "state recording\n")?;
        send_overlay_command(child, "show\n")?;
    }

    // Read output in background to prevent blocking
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                tauri_plugin_shell::process::CommandEvent::Stdout(line) => {
                    let output = String::from_utf8_lossy(&line);
                    let trimmed = output.trim();
                    match trimmed {
                        "action:pause-resume" => emit_main_window_action(&app_handle, "pause-resume"),
                        "action:stop" => emit_main_window_action(&app_handle, "stop"),
                        _ if !trimmed.is_empty() => println!("Camera overlay: {trimmed}"),
                        _ => {}
                    }
                }
                tauri_plugin_shell::process::CommandEvent::Stderr(line) => {
                    let output = String::from_utf8_lossy(&line);
                    eprintln!("Camera overlay error: {}", output.trim());
                }
                tauri_plugin_shell::process::CommandEvent::Error(e) => {
                    eprintln!("Camera overlay process error: {}", e);
                }
                tauri_plugin_shell::process::CommandEvent::Terminated(payload) => {
                    println!("Camera overlay process terminated: {:?}", payload);
                }
                _ => {}
            }
        }
    });

    Ok(())
}

#[tauri::command]
fn set_camera_overlay_controls(app: AppHandle, show_controls: bool) -> Result<(), String> {
    let state = app.state::<Mutex<OverlayState>>();
    let mut guard = state.lock().map_err(|e| format!("Failed to lock state: {e}"))?;

    if let Some(ref mut child) = guard.child {
        send_overlay_command(child, &format!("controls {}\n", if show_controls { 1 } else { 0 }))?;
    }

    Ok(())
}

#[tauri::command]
fn set_camera_overlay_state(app: AppHandle, state: String) -> Result<(), String> {
    let overlay = app.state::<Mutex<OverlayState>>();
    let mut guard = overlay.lock().map_err(|e| format!("Failed to lock state: {e}"))?;

    if let Some(ref mut child) = guard.child {
        send_overlay_command(child, &format!("state {state}\n"))?;
    }

    Ok(())
}

#[tauri::command]
fn hide_camera_overlay(app: AppHandle) -> Result<(), String> {
    let state = app.state::<Mutex<OverlayState>>();
    let mut guard = state.lock().map_err(|e| format!("Failed to lock state: {e}"))?;

    if let Some(ref mut child) = guard.child {
        child
            .write("hide\n".as_bytes())
            .map_err(|e| format!("Failed to send hide command: {e}"))?;
    }

    Ok(())
}

#[tauri::command]
fn quit_camera_overlay(app: AppHandle) -> Result<(), String> {
    shutdown_overlay(&app);
    Ok(())
}

#[tauri::command]
fn native_trim_export_video(
    app: tauri::AppHandle,
    temp_source_name: String,
    output_path: String,
    trim_start: f64,
    trim_end: f64,
) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        if trim_end <= trim_start {
            return Err("trim end must be greater than trim start".into());
        }

        let temp_dir = app
            .path()
            .temp_dir()
            .map_err(|error| format!("failed to resolve temp directory: {error}"))?;

        let source_path = temp_dir.join(&temp_source_name);
        if !source_path.exists() {
            return Err(format!(
                "temporary source recording was not found: {}",
                source_path.display()
            ));
        }
        let duration = trim_end - trim_start;
        let presets = ["PresetPassthrough", "PresetHighestQuality"];
        let mut last_error = String::from("native trim export failed");

        for preset in presets {
            let export_output = Command::new("/usr/bin/avconvert")
                .arg("--source")
                .arg(&source_path)
                .arg("--output")
                .arg(&output_path)
                .arg("--preset")
                .arg(preset)
                .arg("--start")
                .arg(trim_start.to_string())
                .arg("--duration")
                .arg(duration.to_string())
                .arg("--replace")
                .arg("--disableMetadataFilter")
                .output()
                .map_err(|error| format!("failed to start avconvert: {error}"))?;
            
            // Check if avconvert actually produced output or hung
            if export_output.status.code().is_none() {
                // Process was killed or didn't exit properly
                let _ = fs::remove_file(&source_path);
                return Err("avconvert process did not complete properly - possible hang".into());
            }

            if export_output.status.success() {
                let _ = fs::remove_file(&source_path);
                return Ok(());
            }

            let stderr = String::from_utf8_lossy(&export_output.stderr)
                .trim()
                .to_string();
            let stdout = String::from_utf8_lossy(&export_output.stdout)
                .trim()
                .to_string();
            last_error = if !stderr.is_empty() {
                stderr
            } else if !stdout.is_empty() {
                stdout
            } else {
                format!("avconvert failed with preset {preset}")
            };
        }

        let _ = fs::remove_file(&source_path);
        Err(last_error)
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
        let _ = temp_source_name;
        let _ = output_path;
        let _ = trim_start;
        let _ = trim_end;
        Err("native trim export is only implemented for macOS".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::default().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            open_system_preferences_panel,
            open_dev_website,
            show_camera_overlay,
            hide_camera_overlay,
            set_camera_overlay_controls,
            set_camera_overlay_state,
            quit_camera_overlay,
            native_trim_export_video
        ])
        .setup(|app| {
            #[cfg(desktop)]
            app.handle().plugin(tauri_plugin_updater::Builder::new().build())?;

            // Initialize overlay state
            app.manage(Mutex::new(OverlayState { child: None }));

            // Create system tray with recording controls
            use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
            use tauri::tray::TrayIconBuilder;

            let pause_i = MenuItem::with_id(
                app,
                "pause-resume",
                "Pause/Resume Recording",
                true,
                None::<&str>,
            )?;
            let stop_i = MenuItem::with_id(app, "stop", "Stop Recording", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit LoomLess", true, None::<&str>)?;

            let menu = Menu::with_items(app, &[&pause_i, &stop_i, &separator, &quit_i])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().cloned().expect("no app icon"))
                .menu(&menu)
                .show_menu_on_left_click(true)
                .tooltip("LoomLess")
                .on_menu_event(|app_handle, event| match event.id.as_ref() {
                    "pause-resume" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.emit("tray-action", "pause-resume");
                        }
                    }
                    "stop" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let _ = window.emit("tray-action", "stop");
                        }
                    }
                    "quit" => {
                        app_handle.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    use tauri::tray::{MouseButton, MouseButtonState, TrayIconEvent};
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            // Register global shortcuts
            use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut};

            let pause_shortcut =
                Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyP);
            let stop_shortcut =
                Shortcut::new(Some(Modifiers::SUPER | Modifiers::SHIFT), Code::KeyS);

            app.global_shortcut().on_shortcuts(
                [pause_shortcut, stop_shortcut],
                move |app_handle, shortcut, event| {
                    if event.state() == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        if let Some(window) = app_handle.get_webview_window("main") {
                            let mods = Modifiers::SUPER | Modifiers::SHIFT;
                            if shortcut.matches(mods, Code::KeyP) {
                                let _ = window.emit("tray-action", "pause-resume");
                            } else if shortcut.matches(mods, Code::KeyS) {
                                let _ = window.emit("tray-action", "stop");
                            }
                        }
                    }
                },
            )?;

            Ok(())
        });

    let app = builder
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(move |app_handle, event| {
        if matches!(event, RunEvent::Exit | RunEvent::ExitRequested { .. }) {
            shutdown_overlay(app_handle);
        }
    });
}
