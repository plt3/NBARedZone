let zoomedFrame = null;
let streamsArr = null;

const toggleKeybinds = {
  KeyJ: "one",
  KeyK: "two",
  KeyL: "three",
  Semicolon: "four",
};
const rotateKeybinds = {
  KeyA: "one",
  KeyS: "two",
  KeyD: "three",
  KeyF: "four",
};

async function getStreams() {
  const response = await fetch("/games");
  streamsArr = await response.json();
  console.log(streamsArr);
  const frames = document.getElementsByClassName("frame");

  if (streamsArr.length >= 4) {
    for (let index = 0; index < 4; index++) {
      frames[index].src = streamsArr[index][1];
      frames[index].dataset.index = index;
    }
  }
  // now show the names of the games
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("frame-container").style.display = "grid";
}

window.onload = getStreams;

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
    case "KeyA":
    case "KeyS":
    case "KeyD":
    case "KeyF":
      rotateStream(e.code);
      break;
    default:
      break;
  }
};

function toggleFullScreen(keyCode) {
  if (zoomedFrame === null) {
    // no frame is zoomed, so zoom chosen frame
    document.getElementById("frame-container").className = "fs-container";
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
      document.getElementById("frame-container").className = "four-container";
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

function rotateStream(keyCode) {
  const frame = document.getElementById(rotateKeybinds[keyCode]);
  frame.dataset.index = (Number(frame.dataset.index) + 1) % streamsArr.length;
  frame.src = streamsArr[frame.dataset.index][1];
}
