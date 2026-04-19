document.addEventListener("DOMContentLoaded", function () {
  const startRecordingBtn = document.getElementById("startRecordingBtn");
  const defaultLabel = startRecordingBtn.innerHTML;
  const openingLabel =
    '<span class="btn-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"></circle><circle cx="12" cy="12" r="4.5" fill="currentColor"></circle></svg></span><span>Opening Recorder...</span>';

  startRecordingBtn.addEventListener("click", function () {
    startRecordingBtn.disabled = true;
    startRecordingBtn.innerHTML = openingLabel;

    chrome.runtime.sendMessage(
      {
        action: "OPEN_RECORDER",
      },
      function () {
        window.close();
      }
    );

    window.setTimeout(() => {
      startRecordingBtn.disabled = false;
      startRecordingBtn.innerHTML = defaultLabel;
    }, 1600);
  });
});
