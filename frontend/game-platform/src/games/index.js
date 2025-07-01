// src/games/index.js

import NumberKingdom from "./NumberKingdom";

export const gamesMap = {
  "number-kingdom": {
    name: "Number Kingdom",
    scene: NumberKingdom,
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
