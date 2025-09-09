// src/games/index.js

import MapScene from "./NumberKingdom/MapScene";
import DialogueScene from "./NumberKingdom/DialogueScene";
import recognitionScene from "./NumberKingdom/miniGames/recognitionScene";

import SignMatchScene from "./SignMatch/scenes/SignMatchScene";
import StartMenuScene from "./SignMatch/scenes/StartMenuScene"; 
import CardRushScene from "./SignMatch/scenes/CardRushScene";

import SetUpScene from "./SignsAndLadders/scenes/SetUpScene";
import SignsAndLaddersScene from "./SignsAndLadders/scenes/SignsAndLadders";

import FindStateReactGame from "./FindState/ReactIndiaMapGame.jsx";

import BreakoutGame from "./BreakoutGame/breakout.jsx";

import RecognizeQuiz from "./RecognizeSign/RecognizeQuiz.jsx";

import VideoOptionQuiz from "./RecognizeImage/VideoOptionQuiz.jsx";

import ColumnMatch from "./ColumnMatch/ColumnMatch.jsx";

import ISLClockGame from "./SetTime/ISLClockGame.jsx";

import WordSearchGame from "./FindWord/WordSearchGame.jsx";

import CrosswordGame from "./CrossWordGame/CrosswordGame.jsx";

import StateCapitalMatch from "./StatesAndCapitals/StateCapitalMatch.jsx";

import VideoOptionQuizNumbers from "./FindNumberOFObjects/VideoOptionQuizNumbers.jsx";

import AlphabetVideoMatch from "./AlphabetVideoMatch/AlphabetVideoMatch.jsx";

import VideoOptionQuizColors from "./GuessColor/VideoOptionQuizColors.jsx";

import WordScrambleGame from "./WordScramble/WordScramble.jsx";

import FruitGame from "./FindFruit/FindFruit.jsx";

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
  "video-option-quiz-numbers": {
    name: "Find Number of Objects",
    type: "react",
    orientation: "landscape",
    component: VideoOptionQuizNumbers,
    logoPath: "/assets/images/video-option-quiz-numbers-logo.png",
    alt: "Find Number of Objects Logo",
    category: "Quiz Games"
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
  "column-match": {
    name: "Column Match",
    type: "react", 
    orientation: "landscape",
    component: ColumnMatch, 
    logoPath: "/assets/images/column-match-logo.png",
    alt: "Game Logo",
    category: "Matching Games"
  },
  "alphabet-video-match": {
    name: "Alphabet Video Match",
    type: "react",
    orientation: "landscape",
    component: AlphabetVideoMatch,
    logoPath: "/assets/images/alphabet-video-match-logo.png",
    alt: "Alphabet Match Logo",
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
  "state-capital-match": {
    name: "State-Capital Match",
    type: "react",
    orientation: "landscape",
    component: StateCapitalMatch,
    logoPath: "/assets/images/state-capital-match-logo.png",
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
  },
  "crossword-game": {
    name: "Crossword Game",
    type: "react", 
    orientation: "portrait",
    component: CrosswordGame,
    logoPath: "/assets/images/crossword-game-logo.png",
    alt: "Crossword Game Logo",
    category: "Word Games"
  },
  "word-scramble-game": {
    name: "Word Scramble Game",
    type: "react",
    orientation: "portrait",
    component: WordScrambleGame,
    logoPath: "/assets/images/word-scramble-game-logo.png",
    alt: "Word Scramble Game Logo",
    category: "Word Games"
  },
  "video-option-quiz-colors": {
    name: "Guess the Color",
    type: "react",
    orientation: "portrait",
    component: VideoOptionQuizColors,
    logoPath: "/assets/images/video-option-quiz-colors-logo.png",
    alt: "Guess the Color Logo",
    category: "Color Games"
  },
  "find-fruit": {
    name: "Find the Fruit",
    type: "react",
    orientation: "landscape",
    component: FruitGame,
    logoPath: "/assets/images/find-fruit-logo.png",
    alt: "Find the Fruit Logo",
    category: "Searching Games"
  }
};
