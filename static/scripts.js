import {
  actionKeybinds,
  reloadKeybind,
  toggleKeybind,
  rotateKeybind,
  alternateKeybind,
  muteKeybind,
  fullScreenKeybind,
  urlTypeKeybind,
  scoresKeybind,
  titleKeybind,
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
  [muteKeybind]: toggleFrameMute,
};
// amount of milliseconds to display title of game in each frame
const titleTimeout = 3000;
// amount of milliseconds to wait after action that change's iframe's URL to send
// mute message to stream (muting won't work if message is sent immediately)
const muteMessageTimeout = 1000;
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
  } else if (
    currentAction !== null &&
    actionKeybinds.includes(key) &&
    frames !== null
  ) {
    const index = actionKeybinds.indexOf(key);
    if (index !== -1 && index < frames.length) {
      keybindFunctions[currentAction](index);
    }
  } else if (key === fullScreenKeybind) {
    toggleFullScreen();
  } else if (key === scrollKeybind) {
    scrollToStreams();
  } else if (key === helpKeybind) {
    await togglePopup("help");
  } else if (frames !== null && frames.length > 0) {
    if (key === urlTypeKeybind) {
      toggleUrlType();
    } else if (key === scoresKeybind) {
      await togglePopup("scores");
    } else if (key === titleKeybind) {
      for (let index = 0; index < frames.length; index++) {
        changeTitle(index, "");
      }
    }
  }
};

function removeTitle(index) {
  // fade stream title out
  const title = frames[index].querySelector("h2");
  title.style.opacity = 0;
}

function changeTitle(index, newTitle) {
  const frame = frames[index];
  clearTimeout(timeouts[index]);
  const title = frame.querySelector("h2");
  // call with newTitle as empty string to just show title instead of changing it
  if (newTitle !== "") {
    title.textContent = newTitle;
  }
  title.style.opacity = 1;

  const timeout = setTimeout(() => {
    const title = frames[index].querySelector("h2");
    title.style.opacity = 0;
  }, titleTimeout);
  timeouts[index] = timeout;
}

function reloadFrame(index) {
  // reload given frame, specified by reloadKeybind
  const iframe = frames[index].querySelector("iframe");
  iframe.src += "";
  if (frames[index].dataset.muted === "mute") {
    setTimeout(() => {
      toggleFrameMute(index, "mute");
    }, muteMessageTimeout);
  }
}

function toggleFrameMute(index, force = null) {
  // mute/unmute given frame, specified by muteKeybind
  // NOTE: this requires custom browser extension to add message handler to
  // bestsolaris.com page
  const currentFrame = frames[index];
  let message;
  if (
    force !== "unmute" &&
    (force === "mute" || currentFrame.dataset.muted === "unmute")
  ) {
    message = "mute";
  } else if (force === "unmute" || currentFrame.dataset.muted === "mute") {
    // mute all other frames if unmuting one
    for (let i = 0; i < frames.length; i++) {
      if (i !== index) {
        toggleFrameMute(i, "mute");
      }
    }
    message = "unmute";
  }
  currentFrame
    .querySelector("iframe")
    .contentWindow.postMessage(message, "https://bestsolaris.com");
  currentFrame.dataset.muted = message;
}

function toggleStreamFullScreen(index) {
  // toggle given frame, specified by toggleKeybind
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
  if (zoomedFrameId !== null) {
    toggleFrameMute(zoomedFrameId, "unmute");
  }
}

function rotateStream(index, alternate = false) {
  // rotate stream of given frame, specified by rotateKeybind
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
  const gameTitle =
    streamsArr[frame.dataset.gameIndex][frame.dataset.mirrorIndex].title;
  const numMirrors = streamsArr[frame.dataset.gameIndex].length;
  const newTitle = `${gameTitle}:  mirror ${
    Number(frame.dataset.mirrorIndex) + 1
  }/${numMirrors}`;
  changeTitle(index, newTitle);
  if (frame.dataset.muted === "mute") {
    setTimeout(() => {
      toggleFrameMute(index, "mute");
    }, muteMessageTimeout);
  }
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
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    frame.querySelector("iframe").src =
      streamsArr[frame.dataset.gameIndex][frame.dataset.mirrorIndex][urlKey];
    if (frame.dataset.muted === "mute") {
      setTimeout(() => {
        toggleFrameMute(i, "mute");
      }, muteMessageTimeout);
    }
  }
}

async function togglePopup(typeRequested) {
  if (
    (popupType === "scores" && typeRequested === "scores") ||
    (popupType == "help" && typeRequested === "help") ||
    (popupType == "choose stream" && typeRequested === "choose stream")
  ) {
    popupFrame.style.display = "none";
    popupType = null;
  } else {
    popup.querySelectorAll("*").forEach((elem) => elem.remove());
    const popupTitle = document.createElement("h2");
    popupTitle.id = "popup-title";
    popup.appendChild(popupTitle);
    popupType = typeRequested;

    if (popupType === "scores") {
      const response = await fetch("/scores");
      const scoresArr = await response.json();

      popupTitle.textContent = `Live Games (${scoresArr.length}):`;

      for (const obj of scoresArr) {
        const text = `${obj.home} vs. ${obj.away}: ${obj.home_score}-${obj.away_score}, ${obj.time}`;
        const line = document.createElement("p");
        line.textContent = text;
        popup.appendChild(line);
      }
    } else if (popupType === "help") {
      showHelpMessage(popup, popupTitle);
    } else if (popupType === "choose stream") {
      popupTitle.textContent =
        "Watching multiple streams not supported on mobile. Choose a stream:";

      const displayStreamFunc = (index) => {
        streamsArr = [streamsArr[index]];
        getStreams(true);
        togglePopup("choose stream");
      };

      for (let i = 0; i < streamsArr.length; i++) {
        const stream = streamsArr[i];
        const streamButton = document.createElement("button");
        streamButton.textContent = stream[0].title;
        streamButton.className = "stream-button";
        streamButton.dataset.gameIndex = i.toString();
        streamButton.onclick = () => {
          displayStreamFunc(i);
        };
        popup.appendChild(streamButton);
      }
    }

    popupFrame.style.display = "flex";
  }
}

function scrollToStreams() {
  if (frames !== null && frames.length > 0) {
    frameContainer.scrollIntoView({ behavior: "smooth" });
  } else if (popupType === "choose stream") {
    popupFrame.scrollIntoView({ behavior: "smooth" });
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
  frameDiv.dataset.muted = "unmute";

  const iframe = document.createElement("iframe");
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute("src", stream[urlKey]);
  frameDiv.appendChild(iframe);

  const gameTitleh2 = document.createElement("h2");
  const gameTitle =
    streamsArr[frameDiv.dataset.gameIndex][frameDiv.dataset.mirrorIndex].title;
  const numMirrors = streamsArr[frameDiv.dataset.gameIndex].length;
  gameTitleh2.textContent = `${gameTitle}:  mirror ${
    Number(frameDiv.dataset.mirrorIndex) + 1
  }/${numMirrors}`;
  frameDiv.appendChild(gameTitleh2);

  frameContainer.appendChild(frameDiv);
}

function isMobile() {
  // determine if on mobile by checking if touchscreen and if screen height/width
  // is < 600px, because mobile automatically fullscreens video, thus not making
  // it possible to watch multiple streams at once. Admittedly not the most robust
  // way to check, but works well enough
  return (
    window.matchMedia("(pointer: coarse)").matches &&
    (window.innerWidth < 600 || window.innerHeight < 600)
  );
}

async function getStreams(pickMobileStream = false) {
  if (!pickMobileStream) {
    // get stream links and display them. To be called on page load
    const response = await fetch("/streams");
    streamsArr = await response.json();

    if (streamsArr.length === 0) {
      document.getElementById("loading-text").textContent = "No games found.";
      return;
    }

    document.getElementById("loading-screen").style.display = "none";
  }

  if (isMobile() && !pickMobileStream) {
    await togglePopup("choose stream");
  } else {
    for (let index = 0; index < Math.min(streamsArr.length, 4); index++) {
      createFrame(index, 0);
      const timeout = setTimeout(() => {
        removeTitle(index);
      }, titleTimeout);
      timeouts.push(timeout);
    }

    frames = document.getElementsByClassName("frame");

    // wait for frames to load, then mute all but first stream
    setTimeout(() => {
      for (let i = 0; i < frames.length; i++) {
        if (i > 0) {
          toggleFrameMute(i, "mute");
        }
      }
    }, muteMessageTimeout);

    frameContainerClass =
      "container-" + Math.min(streamsArr.length, 4).toString();
    frameContainer.style.display = "grid";
    frameContainer.className = frameContainerClass;

    if (streamsArr.length === 3) {
      frames[2].id = "third-stream";
    }
  }
}

window.onload = async () => {
  document.getElementById("scroll-button").onclick = scrollToStreams;
  document.getElementById("help-instructions").onclick = async () => {
    await togglePopup("help");
  };
  await getStreams();

  // bring focus back to main page after clicking inside iframe
  // (so that keybinds are registered again)
  window.onblur = () => {
    setTimeout(window.focus, 100);
  };
};
