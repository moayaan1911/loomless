document.addEventListener("DOMContentLoaded", function () {
  const startRecordingBtn = document.getElementById("startRecordingBtn");

  startRecordingBtn.addEventListener("click", function () {
    // Disable button to prevent multiple clicks
    startRecordingBtn.disabled = true;
    startRecordingBtn.textContent = "Opening Recorder...";

    // Send message to background script to open recorder tab
    chrome.runtime.sendMessage(
      {
        action: "OPEN_RECORDER",
      },
      function (response) {
        // Close the popup after opening recorder
        window.close();
      }
    );
  });
});
