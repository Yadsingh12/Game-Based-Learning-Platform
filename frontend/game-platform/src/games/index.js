// src/games/index.js

import MapScene from "./NumberKingdom/MapScene";
import DialogueScene from "./NumberKingdom/DialogueScene";
import recognitionScene from "./NumberKingdom/miniGames/recognitionScene";

import SignMatchScene from "./SignMatch/scenes/SignMatchScene";
import StartMenuScene from "./SignMatch/scenes/StartMenuScene"; 
import CardRushScene from "./SignMatch/scenes/CardRushScene";

import SetUpScene from "./SignsAndLadders/scenes/SetUpScene";
import SignsAndLaddersScene from "./SignsAndLadders/scenes/SignsAndLadders";

import FindStateReactGame from "./FindState/scenes/ReactIndiaMapGame"; // React based game

export const gamesMap = {
  "number-kingdom": {
    name: "Number Kingdom",
    scene: [MapScene, DialogueScene, recognitionScene],
    type: "phaser",
    logoPath: "/assets/images/math-game-logo.png",
    alt: "Game Logo",
    category: "Math Games"
  },
  "sign-match": {
    name: "Sign Match",
    scene: [StartMenuScene, SignMatchScene, CardRushScene],
    type: "phaser",
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    category: "Matching Games"
  },
  "Signs And ladders": {
    name: "Signs and Ladders",
    scene: [SetUpScene, SignsAndLaddersScene],
    type: "phaser",
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    category: "Board Games"
  },
  "find-state": {
    name: "Find State",
    type: "react", // 👈 mark this as React-based
    component: FindStateReactGame, // 👈 point to the React component
    logoPath: "/assets/images/find-state-logo.png",
    alt: "Game Logo",
    category: "Geography Games"
  },
};
