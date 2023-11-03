// config values
const titleTimeout = 3000;
const reloadKeybinds = ["Digit1", "Digit2", "Digit3", "Digit4"];
const toggleKeybinds = ["KeyJ", "KeyK", "KeyL", "Semicolon"];
const rotateKeybinds = ["KeyA", "KeyS", "KeyD", "KeyF"];

// globals
let zoomedFrameId = null;
let streamsArr = null;
const timeouts = [];
const frameContainer = document.getElementById("frame-container");
let frames = null;

function createFrame(url, gameIndex, title) {
  const frameDiv = document.createElement("div");
  frameDiv.className = "frame";
  frameDiv.dataset.gameIndex = gameIndex;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("src", url);
  frameDiv.appendChild(iframe);

  const gameTitle = document.createElement("h2");
  gameTitle.textContent = title;
  frameDiv.appendChild(gameTitle);

  frameContainer.appendChild(frameDiv);
}

async function getStreams() {
  const response = await fetch("/games");
  streamsArr = await response.json();

  for (let index = 0; index < Math.min(streamsArr.length, 4); index++) {
    const stream = streamsArr[index];
    createFrame(stream[1], index, stream[0]);
    const timeout = setTimeout(() => {
      removeTitle(index);
    }, titleTimeout);
    timeouts.push(timeout);
  }

  frames = document.getElementsByClassName("frame");

  document.getElementById("loading-screen").style.display = "none";
  frameContainer.style.display = "grid";
}

window.onload = getStreams;

document.onkeydown = (e) => {
  const code = e.code;

  if (reloadKeybinds.includes(code)) {
    reloadFrame(code);
  } else if (toggleKeybinds.includes(code)) {
    toggleFullScreen(code);
  } else if (rotateKeybinds.includes(code)) {
    rotateStream(code);
  }
};

function removeTitle(index) {
  const title = frames[index].querySelector("h2");
  title.style.opacity = 0;
}

function reloadFrame(keyCode) {
  const index = reloadKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  const iframe = frames[index].querySelector("iframe");
  iframe.src += "";
}

function toggleFullScreen(keyCode) {
  const index = toggleKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  if (zoomedFrameId === null) {
    // no frame is zoomed, so zoom chosen frame
    frameContainer.className = "fs-container";
    for (let index = 0; index < frames.length; index++) {
      if (toggleKeybinds[index] === keyCode) {
        zoomedFrameId = index;
      } else {
        frames[index].style.display = "none";
      }
    }
  } else {
    const keyId = toggleKeybinds.indexOf(keyCode);
    if (zoomedFrameId === keyId) {
      // chosen frame is zoomed, so unzoom it
      frameContainer.className = "four-container";

      for (let index = 0; index < frames.length; index++) {
        if (index !== keyId) {
          frames[index].style.display = "";
        }
      }
      zoomedFrameId = null;
    } else {
      // different frame is zoomed, so unzoom it and zoom the chosen one
      frames[zoomedFrameId].style.display = "none";
      frames[keyId].style.display = "";
      zoomedFrameId = keyId;
    }
  }
}

function rotateStream(keyCode) {
  const index = rotateKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  const frame = frames[index];

  frame.dataset.gameIndex =
    (Number(frame.dataset.gameIndex) + 1) % streamsArr.length;
  frame.querySelector("iframe").src = streamsArr[frame.dataset.gameIndex][1];

  // change title of stream and display it
  clearTimeout(timeouts[index]);
  const title = frame.querySelector("h2");
  title.textContent = streamsArr[frame.dataset.gameIndex][0];
  title.style.opacity = 1;
  const timeout = setTimeout(() => {
    removeTitle(index);
  }, titleTimeout);
  timeouts[index] = timeout;
}
