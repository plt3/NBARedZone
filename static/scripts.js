import {
  actionKeybinds,
  reloadKeybind,
  toggleKeybind,
  rotateKeybind,
  alternateKeybind,
  fullScreenKeybind,
  urlTypeKeybind,
  scoresKeybind,
  scrollKeybind,
  helpKeybind,
} from "./keybinds.js";
import { showHelpMessage } from "./help.js";

/* GLOBALS */

// map action keybind to function which should perform that action
const keybindFunctions = {
  [reloadKeybind]: reloadFrame,
  [toggleKeybind]: toggleStreamFullScreen,
  [rotateKeybind]: (index) => {
    rotateStream(index, false);
  },
  [alternateKeybind]: (index) => {
    rotateStream(index, true);
  },
};
// amount of milliseconds to display title of game in each frame
const titleTimeout = 3000;
let currentAction = null;
let zoomedFrameId = null;
let popupType = null;
let streamsArr = null;
let urlKey = "embedding_url";
const timeouts = [];
const frameContainer = document.getElementById("frame-container");
const popupFrame = document.getElementById("popup-frame");
const popup = document.getElementById("popup");
let frameContainerClass = null;
let frames = null;

document.onkeydown = async (e) => {
  // handle all keypresses
  const key = e.key;

  if (Object.keys(keybindFunctions).includes(key)) {
    currentAction = key;
  } else if (currentAction !== null && actionKeybinds.includes(key)) {
    const index = actionKeybinds.indexOf(key);
    if (index !== -1 && index < frames.length) {
      keybindFunctions[currentAction](index);
    }
  } else if (key === fullScreenKeybind) {
    toggleFullScreen();
  } else if (key === urlTypeKeybind) {
    toggleUrlType();
  } else if (key === scoresKeybind && frames.length > 0) {
    await togglePopup(true);
  } else if (key === helpKeybind) {
    await togglePopup(false);
  } else if (key === scrollKeybind) {
    scrollToStreams();
  }
};

function removeTitle(index) {
  // fade stream title out
  const title = frames[index].querySelector("h2");
  title.style.opacity = 0;
}

function reloadFrame(index) {
  // reload given frame, specified by reloadKeybinds
  const iframe = frames[index].querySelector("iframe");
  iframe.src += "";
}

function toggleStreamFullScreen(index) {
  // toggle given frame, specified by toggleKeybinds
  if (zoomedFrameId === null) {
    // no frame is zoomed, so zoom chosen frame
    frameContainer.className = "container-1";
    for (let i = 0; i < frames.length; i++) {
      if (i === index) {
        zoomedFrameId = i;
      } else {
        frames[i].style.display = "none";
      }
    }
  } else {
    if (zoomedFrameId === index) {
      // chosen frame is zoomed, so unzoom it
      frameContainer.className = frameContainerClass;

      for (let i = 0; i < frames.length; i++) {
        if (i !== index) {
          frames[i].style.display = "";
        }
      }
      zoomedFrameId = null;
    } else {
      // different frame is zoomed, so unzoom it and zoom the chosen one
      frames[zoomedFrameId].style.display = "none";
      frames[index].style.display = "";
      zoomedFrameId = index;
    }
  }
}

function rotateStream(index, alternate = false) {
  // rotate stream of given frame, specified by rotateKeybinds
  const frame = frames[index];

  if (alternate) {
    frame.dataset.mirrorIndex =
      (Number(frame.dataset.mirrorIndex) + 1) %
      streamsArr[frame.dataset.gameIndex].length;
  } else {
    frame.dataset.gameIndex =
      (Number(frame.dataset.gameIndex) + 1) % streamsArr.length;
    frame.dataset.mirrorIndex = 0;
  }
  let newGameIndex = frame.dataset.gameIndex;
  let newMirrorIndex = frame.dataset.mirrorIndex;

  frame.querySelector("iframe").src =
    streamsArr[newGameIndex][newMirrorIndex][urlKey];

  // change title of stream and display it
  clearTimeout(timeouts[index]);
  const title = frame.querySelector("h2");
  const gameTitle =
    streamsArr[frame.dataset.gameIndex][frame.dataset.mirrorIndex].title;
  const numMirrors = streamsArr[frame.dataset.gameIndex].length;
  title.textContent = `${gameTitle}:  mirror ${
    Number(frame.dataset.mirrorIndex) + 1
  }/${numMirrors}`;
  title.style.opacity = 1;
  const timeout = setTimeout(() => {
    removeTitle(index);
  }, titleTimeout);
  timeouts[index] = timeout;
}

function toggleFullScreen() {
  if (document.fullscreenElement !== null) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
}

function toggleUrlType() {
  if (urlKey === "embedding_url") {
    urlKey = "stream_url";
  } else {
    urlKey = "embedding_url";
  }
  for (const frame of frames) {
    frame.querySelector("iframe").src =
      streamsArr[frame.dataset.gameIndex][frame.dataset.mirrorIndex][urlKey];
  }
}

async function togglePopup(showScores) {
  if (
    (popupType === "scores" && showScores) ||
    (popupType == "help" && !showScores)
  ) {
    popupFrame.style.display = "none";
    popupType = null;
  } else {
    popup.querySelectorAll("*").forEach((elem) => elem.remove());
    const popupTitle = document.createElement("h2");
    popup.appendChild(popupTitle);

    if (showScores) {
      const response = await fetch("/scores");
      const scoresArr = await response.json();

      popupTitle.textContent = `Live Games (${scoresArr.length}):`;

      for (const obj of scoresArr) {
        const text = `${obj.home} vs. ${obj.away}: ${obj.home_score}-${obj.away_score}, ${obj.time}`;
        const line = document.createElement("p");
        line.textContent = text;
        popup.appendChild(line);
      }
      popupType = "scores";
    } else {
      showHelpMessage(popup, popupTitle);

      popupType = "help";
    }

    popupFrame.style.display = "flex";
  }
}

function scrollToStreams() {
  if (frames !== null && frames.length > 0) {
    frameContainer.scrollIntoView({ behavior: "smooth" });
  } else {
    document
      .getElementById("loading-screen")
      .scrollIntoView({ behavior: "smooth" });
  }
}

function createFrame(gameIndex, mirrorIndex) {
  // create stream frames and add to DOM. To be called by getStreams on page load
  const stream = streamsArr[gameIndex][mirrorIndex];
  const frameDiv = document.createElement("div");
  frameDiv.className = "frame";
  frameDiv.dataset.gameIndex = gameIndex;
  frameDiv.dataset.mirrorIndex = mirrorIndex;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("src", stream[urlKey]);
  frameDiv.appendChild(iframe);

  const gameTitleh2 = document.createElement("h2");
  gameTitleh2.textContent = stream.title;
  const gameTitle =
    streamsArr[frameDiv.dataset.gameIndex][frameDiv.dataset.mirrorIndex].title;
  const numMirrors = streamsArr[frameDiv.dataset.gameIndex].length;
  gameTitleh2.textContent = `${gameTitle}:  mirror ${
    Number(frameDiv.dataset.mirrorIndex) + 1
  }/${numMirrors}`;
  frameDiv.appendChild(gameTitleh2);

  frameContainer.appendChild(frameDiv);
}

async function getStreams() {
  // get stream links and display them. To be called on page load
  const response = await fetch("/streams");
  streamsArr = await response.json();

  for (let index = 0; index < Math.min(streamsArr.length, 4); index++) {
    createFrame(index, 0);
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

window.onload = async () => {
  const scrollButton = document.getElementById("scroll-button");
  scrollButton.onclick = scrollToStreams;
  await getStreams();

  // bring focus back to main page after clicking inside iframe
  // (so that keybinds are registered again)
  window.onblur = () => {
    setTimeout(window.focus, 100);
  };
};
