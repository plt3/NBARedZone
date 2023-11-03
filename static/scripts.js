let zoomedFrame = null;
let streamsArr = null;
const timeouts = [];

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
  const frames = document.querySelectorAll(".frame iframe");

  for (let index = 0; index < Math.min(streamsArr.length, 4); index++) {
    frames[index].src = streamsArr[index][1];
    frames[index].dataset.index = index;
    const gameTitle = document.querySelectorAll(".frame h2");
    gameTitle[index].textContent = streamsArr[index][0];
    const timeout = setTimeout(() => {
      removeTitle(index);
    }, 3000);
    timeouts.push(timeout);
  }
  // now show the names of the games
  document.getElementById("loading-screen").style.display = "none";
  document.getElementById("frame-container").style.display = "grid";
}

window.onload = getStreams;

document.onkeydown = (e) => {
  switch (e.code) {
    case "Digit1":
      document.querySelector("#one iframe").src += "";
      break;
    case "Digit2":
      document.querySelector("#two iframe").src += "";
      break;
    case "Digit3":
      document.querySelector("#three iframe").src += "";
      break;
    case "Digit4":
      document.querySelector("#four iframe").src += "";
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

function removeTitle(index) {
  clearTimeout(timeouts[index]);
  const frame = document.querySelectorAll(".frame")[index];
  const title = frame.querySelector("h2");
  title.style.opacity = 0;
  // if (title !== null) {
  //   frame.removeChild(title);
  // }
}

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
  // TODO: change this. Should switch everything to be index-based,
  // not hardcoded id-based
  const bad = ["KeyA", "KeyS", "KeyD", "KeyF"];
  removeTitle(bad.indexOf(keyCode));
  const frame = document.querySelector(
    "#" + rotateKeybinds[keyCode] + " iframe"
  );
  frame.dataset.index = (Number(frame.dataset.index) + 1) % streamsArr.length;
  frame.src = streamsArr[frame.dataset.index][1];

  // TODO: this should also be a function. Duplicated logic with what
  // gets called on page load
  const gameTitle = document.querySelector(
    "#" + rotateKeybinds[keyCode] + " h2"
  );
  gameTitle.textContent = streamsArr[frame.dataset.index][0];
  gameTitle.style.opacity = 1;
  const timeout = setTimeout(() => {
    removeTitle(bad.indexOf(keyCode));
  }, 3000);
  timeouts[bad.indexOf(keyCode)] = timeout;
}
