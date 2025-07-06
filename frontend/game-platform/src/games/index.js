// src/games/index.js

import NumberKingdom from "./NumberKingdom/NumberKingdom";
import MapScene from "./NumberKingdom/MapScene";
import DialogueScene from "./NumberKingdom/DialogueScene"; // Ensure levelScene is loaded
import recognitionScene from "./NumberKingdom/miniGames/recognitionScene";

export const gamesMap = {
  "number-kingdom": {
    name: "Number Kingdom",
    scene: [MapScene, DialogueScene, recognitionScene],//NumberKingdom,
    logoPath: "/assets/images/math-game-logo.png",
    alt: "Number Kingdom Game Logo",
    category: "Math Games"
  },
  "color-explorer": {
    name: "Color Explorer",
    scene: null, // replace with your ColorExplorer scene later
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Color Explorer Game Logo",
    category: "Color Games"
  }
};
