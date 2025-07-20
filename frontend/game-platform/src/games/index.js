// src/games/index.js

import MapScene from "./NumberKingdom/MapScene";
import DialogueScene from "./NumberKingdom/DialogueScene"; // Ensure levelScene is loaded
import recognitionScene from "./NumberKingdom/miniGames/recognitionScene";


import SignMatchScene from "./SignMatch/scenes/SignMatchScene";
import StartMenuScene from "./SignMatch/scenes/StartMenuScene"; 
import CardRushScene from "./SignMatch/scenes/CardRushScene";

import SetupScene from "./SignsAndLadders/scenes/SetUpScene";
import SignsAndLaddersScene from "./SignsAndLadders/scenes/SignsAndLadders";

export const gamesMap = {
  "number-kingdom": {
    name: "Number Kingdom",
    scene: [MapScene, DialogueScene, recognitionScene],//NumberKingdom,
    logoPath: "/assets/images/math-game-logo.png",
    alt: "Game Logo",
    alt: "Game Logo",
    category: "Math Games"
  },
  "color-explorer": {
    name: "Color Explorer",
    scene: null, // replace with your ColorExplorer scene later
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    alt: "Game Logo",
    category: "Color Games"
  },
  "sign-match": {
    name: "Sign Match",
    scene: [StartMenuScene, SignMatchScene, CardRushScene], 
    scene: [StartMenuScene, SignMatchScene, CardRushScene], 
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    alt: "Game Logo",
    category: "Matching Games"
  },
  "Signs And ladders": {
    name: "Signs and Ladders",
    scene: [SetupScene, SignsAndLaddersScene],
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    category: "Board Games"
  }
};
