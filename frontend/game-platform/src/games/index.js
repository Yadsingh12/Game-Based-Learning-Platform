// src/games/index.js

import MapScene from "./NumberKingdom/MapScene";
import DialogueScene from "./NumberKingdom/DialogueScene";
import recognitionScene from "./NumberKingdom/miniGames/recognitionScene";

import SignMatchScene from "./SignMatch/scenes/SignMatchScene";
import StartMenuScene from "./SignMatch/scenes/StartMenuScene"; 
import CardRushScene from "./SignMatch/scenes/CardRushScene";

import SetUpScene from "./SignsAndLadders/scenes/SetUpScene";
import SignsAndLaddersScene from "./SignsAndLadders/scenes/SignsAndLadders";

import FindStateReactGame from "./FindState/scenes/ReactIndiaMapGame.jsx";

import BreakoutGame from "./BreakoutGame/breakout.jsx";

import RecognizeQuiz from "./RecognizeSign/RecognizeQuiz.jsx";

import VideoOptionQuiz from "./RecognizeImage/VideoOptionQuiz.jsx";

import ColumnMatch from "./ColumnMatch/ColumnMatch.jsx";

import ISLClockGame from "./SetTime/ISLClockGame.jsx";

import WordSearchGame from "./FindWord/WordSearchGame.jsx";

export const gamesMap = {
  "number-kingdom": {
    name: "Number Kingdom",
    type: "phaser",
    orientation: "landscape",
    scene: [MapScene, DialogueScene, recognitionScene],
    logoPath: "/assets/images/math-game-logo.png",
    alt: "Game Logo",
    category: "Math Games"
  },
  "breakout-game": {
    name: "Breakout Game",
    type: "react", 
    orientation: "landscape",
    component: BreakoutGame,
    logoPath: "/assets/images/breakout-game-logo.png",
    alt: "Breakout Game Logo",
    category: "Math Games"
  },
  "sign-match": {
    name: "Sign Match",
    type: "phaser",
    orientation: "landscape",
    scene: [StartMenuScene, SignMatchScene, CardRushScene],
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    category: "Matching Games"
  },
  "Signs And ladders": {
    name: "Signs and Ladders",
    type: "phaser",
    orientation: "landscape",
    scene: [SetUpScene, SignsAndLaddersScene],
    logoPath: "/assets/images/color-game-logo.png",
    alt: "Game Logo",
    category: "Board Games"
  },
  "find-state": {
    name: "Find State",
    type: "react", 
    orientation: "landscape",
    component: FindStateReactGame, 
    logoPath: "/assets/images/find-state-logo.png",
    alt: "Game Logo",
    category: "Geography Games"
  },
  "recognize-sign": {
    name: "Recognize Sign",
    type: "react", 
    orientation: "portrait",
    component: RecognizeQuiz,
    logoPath: "/assets/images/recognize-sign-logo.png",
    alt: "Game Logo",
    category: "Quiz Games"
  },
  "video-option-quiz": {
    name: "Video Option Quiz",
    type: "react", 
    orientation: "portrait",
    component: VideoOptionQuiz, 
    logoPath: "/assets/images/video-option-quiz-logo.png",
    alt: "Game Logo",
    category: "Quiz Games"
  },
  "column-match": {
    name: "Column Match",
    type: "react", 
    orientation: "landscape",
    component: ColumnMatch, 
    logoPath: "/assets/images/column-match-logo.png",
    alt: "Game Logo",
    category: "Matching Games"
  },
  "isl-clock-game": {
    name: "ISL Clock Game",
    type: "react", 
    orientation: "portrait",
    component: ISLClockGame, 
    logoPath: "/assets/images/isl-clock-game-logo.png",
    alt: "ISL Clock Game Logo",
    category: "Time Games"
  },
  "word-search-game": {
    name: "Word Search Game",
    type: "react", 
    orientation: "landscape",
    component: WordSearchGame,
    logoPath: "/assets/images/word-search-game-logo.png",
    alt: "Word Search Game Logo",
    category: "Word Games"
  }
};
