// Add message event listener to bestsolaris.com pages to mute/unmute streams.
// This allows NBARedZone webapp to programmatically mute/unmute frames
window.addEventListener("message", (event) => {
  if (event.data === "mute") {
    for (const element of document.querySelectorAll("video")) {
      element.muted = true;
    }
  } else if (event.data === "unmute") {
    for (const element of document.querySelectorAll("video")) {
      element.muted = false;
    }
  }
});
