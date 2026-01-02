import Phaser from "phaser";
import { levelData } from "./data/LevelData.js";

export default class DialogueScene extends Phaser.Scene {
  constructor() {
    super("DialogueScene");
  }

  init(data) {
    this.levelNumber = data.levelNumber || 1;
  }

  preload() {
    const level = levelData[this.levelNumber];

    // Preload all background images for scenes
    for (const scene of level.scenes) {
      if (scene.background) {
        this.load.image(
          scene.background,
          `/assets/NumberKingdom/backgrounds/${scene.background}`
        );
      }
    }

    // Preload mini-game media
    if (level.questions) {
      for (const q of level.questions) {
        if (q.media) {
          this.load.image(
            q.media,
            `/assets/NumberKingdom/questions/${q.media}`
          );
        }
      }
    }
  }

  create() {
    const level = levelData[this.levelNumber];
    this.scenesData = level.scenes;
    this.currentSceneIndex = 0;

    this.showScene(this.currentSceneIndex);
  }

  showScene(index) {
    // Clean up previous scene objects
    if (this.bgImage) this.bgImage.destroy();
    if (this.dialogBox) this.dialogBox.destroy();
    if (this.dialogText) this.dialogText.destroy();
    if (this.promptText) this.promptText?.destroy();

    const sceneData = this.scenesData[index];

    // Background image
    this.bgImage = this.add
      .image(this.scale.width / 2, this.scale.height / 2, sceneData.background)
      .setDisplaySize(this.scale.width, this.scale.height);

    // Dialogue box rectangle
    this.dialogBox = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height - 150,
      this.scale.width - 100,
      200,
      0xfca949,
      0.7
    ).setOrigin(0.5);

    // Dialogue text
    this.dialogText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 150,
      sceneData.text,
      {
        fontFamily: "Comic Sans MS",
        fontSize: "24px",
        color: "#52391c",
        wordWrap: { width: this.scale.width - 120 },
        align: "center",
      }
    ).setOrigin(0.5);

    // Prompt text
    this.promptText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 30,
      "Click or press Enter to continue",
      {
        fontFamily: "Comic Sans MS",
        fontSize: "25px",
        color: "#dddddd",
        alpha: 0.8,
      }
    ).setOrigin(0.5);

    // Listen for pointer or keyboard input to advance
    this.input.once("pointerdown", () => {
      this.advanceScene();
    });

    this.input.keyboard.once("keydown-SPACE", () => {
      this.advanceScene();
    });

    this.input.keyboard.once("keydown-ENTER", () => {
      this.advanceScene();
    });
  }

  advanceScene() {
    if (this.currentSceneIndex < this.scenesData.length - 1) {
      this.currentSceneIndex++;
      this.showScene(this.currentSceneIndex);
    } else {
      this.launchMiniGame(levelData[this.levelNumber].miniGame);
    }
  }

  launchMiniGame(miniGameType) {
    this.scene.start(miniGameType, {
      levelNumber: this.levelNumber
    });
  }

}
