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

/* Generate help messages based on keybinds set in keybinds.js */

const onePartKeybinds = [
  {
    key: fullScreenKeybind,
    description: "toggle fullscreen of the entire web page",
  },
  {
    key: scoresKeybind,
    description: "toggle live scores popup to see all games currently live",
  },
  {
    key: urlTypeKeybind,
    description:
      "toggle between embedded stream view and full page stream view",
  },
  {
    key: scrollKeybind,
    description: "scroll down past the header to the streams",
  },
  { key: helpKeybind, description: "toggle this help message" },
];

const twoPartKeybinds = {
  action_keys: [
    {
      key: reloadKeybind,
      description: "reload a frame. Useful for when streams buffer",
    },
    {
      key: toggleKeybind,
      description: "toggle a frame to take up the entire web page",
    },
    {
      key: rotateKeybind,
      description: "rotate the game that a frame is displaying",
    },
    {
      key: alternateKeybind,
      description: "change the mirror that a frame is displaying",
    },
  ],
  frame_keys: [
    {
      key: actionKeybinds[0],
      description: "perform the given action on frame 1 (top-left)",
    },
    {
      key: actionKeybinds[1],
      description: "perform the given action on frame 2 (top-right)",
    },
    {
      key: actionKeybinds[2],
      description: "perform the given action on frame 3 (bottom-left)",
    },
    {
      key: actionKeybinds[3],
      description: "perform the given action on frame 4 (bottom-right)",
    },
  ],
};

function makeUlFromArray(helpArray) {
  const unorderedList = document.createElement("ul");
  for (const keybind of helpArray) {
    const line = document.createElement("li");
    const boldKey = document.createElement("b");
    boldKey.textContent = keybind.key.toUpperCase();
    line.appendChild(boldKey);
    line.appendChild(document.createTextNode(`: ${keybind.description}`));
    unorderedList.appendChild(line);
  }
  return unorderedList;
}

export function showHelpMessage(popup, popupTitle) {
  popupTitle.textContent = "Keyboard Shortcuts:";
  popupTitle.className = "help-title";

  const onePartTitle = document.createElement("h3");
  onePartTitle.textContent = "One-Part Keybinds:";
  popup.appendChild(onePartTitle);
  popup.appendChild(makeUlFromArray(onePartKeybinds));

  const twoPartTitle = document.createElement("h3");
  twoPartTitle.textContent = "Two-Part Keybinds:";
  const twoPartDescription = document.createElement("p");
  twoPartDescription.textContent =
    "Press an action key, then press a frame key to perform an action on a frame";
  popup.appendChild(twoPartTitle);
  popup.appendChild(twoPartDescription);

  const actionTitle = document.createElement("h4");
  actionTitle.textContent = "Action Keys:";
  popup.appendChild(actionTitle);
  popup.appendChild(makeUlFromArray(twoPartKeybinds.action_keys));

  const frameTitle = document.createElement("h4");
  frameTitle.textContent = "Frame Keys:";
  popup.appendChild(frameTitle);
  popup.appendChild(makeUlFromArray(twoPartKeybinds.frame_keys));

  const errorHelp = document.createElement("p");
  const ghLink = document.createElement("a");
  ghLink.href = "https://github.com/plt3/NBARedZone#limitations";
  ghLink.textContent = "limitations section";
  ghLink.target = "_blank";
  errorHelp.appendChild(document.createTextNode("Streams not working? See "));
  errorHelp.appendChild(ghLink);
  errorHelp.appendChild(document.createTextNode(" on GitHub for information."));
  popup.appendChild(errorHelp);
}
