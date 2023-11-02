let zoomedFrame = null;
const toggleKeybinds = {
  KeyJ: "one",
  KeyK: "two",
  KeyL: "three",
  Semicolon: "four",
};

document.onkeydown = (e) => {
  switch (e.code) {
    case "Digit1":
      document.getElementById("one").src += "";
      break;
    case "Digit2":
      document.getElementById("two").src += "";
      break;
    case "Digit3":
      document.getElementById("three").src += "";
      break;
    case "Digit4":
      document.getElementById("four").src += "";
      break;
    case "KeyJ":
    case "KeyK":
    case "KeyL":
    case "Semicolon":
      toggleFullScreen(e.code);
      break;
    default:
      break;
  }
};

function toggleFullScreen(keyCode) {
  if (zoomedFrame === null) {
    // no frame is zoomed, so zoom chosen frame
    document.querySelector("main").className = "fsContainer";
    for (const [keybind, id] of Object.entries(toggleKeybinds)) {
      if (keybind !== keyCode) {
        document.getElementById(id).style.display = "none";
      } else {
        zoomedFrame = id;
      }
    }
  } else {
    const keyId = toggleKeybinds[keyCode];
    if (zoomedFrame === keyId) {
      // chosen frame is zoomed, so unzoom it
      document.querySelector("main").className = "fourContainer";
      for (const [keybind, id] of Object.entries(toggleKeybinds)) {
        if (keybind !== keyCode) {
          document.getElementById(id).style.display = "";
        }
      }
      zoomedFrame = null;
    } else {
      // different frame is zoomed, so unzoom it and zoom the chosen one
      document.getElementById(zoomedFrame).style.display = "none";
      document.getElementById(keyId).style.display = "";
      zoomedFrame = keyId;
    }
  }
}
