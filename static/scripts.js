// config values
const titleTimeout = 3000;
const reloadKeybinds = ["Digit1", "Digit2", "Digit3", "Digit4"];
const toggleKeybinds = ["KeyJ", "KeyK", "KeyL", "Semicolon"];
const rotateKeybinds = ["KeyA", "KeyS", "KeyD", "KeyF"];
const fullScreenKeybind = "KeyY";
const urlTypeKeybind = "KeyO";

// globals
let zoomedFrameId = null;
let streamsArr = null;
let urlKey = "embedding_url";
const timeouts = [];
const frameContainer = document.getElementById("frame-container");
let frameContainerClass = null;
let frames = null;

document.onkeydown = (e) => {
  // handle all keypresses
  const code = e.code;

  if (reloadKeybinds.includes(code)) {
    reloadFrame(code);
  } else if (toggleKeybinds.includes(code)) {
    toggleFullScreen(code);
  } else if (rotateKeybinds.includes(code)) {
    rotateStream(code);
  } else if (code === fullScreenKeybind) {
    document.documentElement.requestFullscreen();
  } else if (code === urlTypeKeybind) {
    toggleUrlType();
  }
};

function removeTitle(index) {
  // fade stream title out
  const title = frames[index].querySelector("h2");
  title.style.opacity = 0;
}

function reloadFrame(keyCode) {
  // reload given frame, specified by reloadKeybinds
  const index = reloadKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  const iframe = frames[index].querySelector("iframe");
  iframe.src += "";
}

function toggleFullScreen(keyCode) {
  // toggle given frame, specified by toggleKeybinds
  const index = toggleKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  if (zoomedFrameId === null) {
    // no frame is zoomed, so zoom chosen frame
    frameContainer.className = "container-1";
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
      frameContainer.className = frameContainerClass;

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
  // rotate stream of given frame, specified by rotateKeybinds
  const index = rotateKeybinds.indexOf(keyCode);
  if (index === -1 || index >= frames.length) {
    return;
  }
  const frame = frames[index];

  frame.dataset.gameIndex =
    (Number(frame.dataset.gameIndex) + 1) % streamsArr.length;
  frame.querySelector("iframe").src =
    streamsArr[frame.dataset.gameIndex][urlKey];

  // change title of stream and display it
  clearTimeout(timeouts[index]);
  const title = frame.querySelector("h2");
  title.textContent = streamsArr[frame.dataset.gameIndex].title;
  title.style.opacity = 1;
  const timeout = setTimeout(() => {
    removeTitle(index);
  }, titleTimeout);
  timeouts[index] = timeout;
}

function toggleUrlType() {
  if (urlKey === "embedding_url") {
    urlKey = "stream_url";
  } else {
    urlKey = "embedding_url";
  }
  for (const frame of frames) {
    frame.querySelector("iframe").src =
      streamsArr[frame.dataset.gameIndex][urlKey];
  }
}

function createFrame(url, gameIndex, title) {
  // create stream frames and add to DOM. To be called by getStreams on page load
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
  // get stream links and display them. To be called on page load
  const response = await fetch("/games");
  streamsArr = await response.json();

  for (let index = 0; index < Math.min(streamsArr.length, 4); index++) {
    const stream = streamsArr[index];
    createFrame(stream[urlKey], index, stream.title);
    const timeout = setTimeout(() => {
      removeTitle(index);
    }, titleTimeout);
    timeouts.push(timeout);
  }

  frames = document.getElementsByClassName("frame");

  if (streamsArr.length === 0) {
    document.getElementById("loading-text").textContent = "No games found.";
    return;
  }

  document.getElementById("loading-screen").style.display = "none";
  frameContainerClass =
    "container-" + Math.min(streamsArr.length, 4).toString();
  frameContainer.style.display = "grid";
  frameContainer.className = frameContainerClass;

  if (streamsArr.length === 3) {
    frames[2].id = "third-stream";
  }
}

window.onload = getStreams;
