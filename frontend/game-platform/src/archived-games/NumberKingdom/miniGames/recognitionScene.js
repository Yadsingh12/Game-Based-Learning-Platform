import Phaser from "phaser";
import { levelData } from "../data/LevelData.js";

export default class recognitionScene extends Phaser.Scene {
  constructor() {
    super("recognitionScene");
  }

  init(data) {
    this.levelNumber = data.levelNumber || 1;
    this.level = levelData[this.levelNumber];
    this.currentQuestionIndex = 0;
    this.correctAnswers = 0;
  }

  preload() {
    this.load.image("meadow", "/assets/NumberKingdom/backgrounds/meadow.png");

    for (const q of this.level.questions) {
      if (q.media) {
        this.load.image(
          q.media,
          `/assets/NumberKingdom/questions/${q.media}`
        );
      }
    }
  }

  create() {
    // Show meadow background
    this.bgImage = this.add
      .image(this.scale.width / 2, this.scale.height / 2, "meadow")
      .setDisplaySize(this.scale.width, this.scale.height);

    this.showQuestion(this.currentQuestionIndex);
  }

  showQuestion(index) {
    const questionData = this.level.questions[index];

    if (this.dialogContainer) this.dialogContainer.destroy();

    // Create a container for all dialog elements
    this.dialogContainer = this.add.container(0, 0);

    // Panel dimensions
    const panelWidth = 700;
    const panelHeight = 800;

    // Brown panel in center of screen
    const panel = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      panelWidth,
      panelHeight,
      0x52391c,
      0.9
    ).setStrokeStyle(4, 0x000000);
    this.dialogContainer.add(panel);

    // Question text
    const questionText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - panelHeight / 2 + 30,
      questionData.question,
      {
        fontFamily: "Comic Sans MS",
        fontSize: "28px",
        color: "#ffffff",
        wordWrap: { width: panelWidth - 40 },
        align: "center"
      }
    ).setOrigin(0.5, 0);
    this.dialogContainer.add(questionText);

    // Media image
    const mediaImage = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2 - 100,
      questionData.media
    ).setOrigin(0.5);

    const targetHeight = 350;

    if (mediaImage.width > 0 && mediaImage.height > 0) {
      const scaleFactor = targetHeight / mediaImage.height;
      mediaImage.setScale(scaleFactor);
    } else {
      mediaImage.once("texturecomplete", () => {
        const scaleFactor = targetHeight / mediaImage.height;
        mediaImage.setScale(scaleFactor);
      });
    }

    this.dialogContainer.add(mediaImage);

    // Options
    this.optionButtons = [];
    const optionsStartY = this.scale.height / 2 + 150;
    const optionSpacing = 50;

    questionData.options.forEach((optText, i) => {
      const btnWidth = 600;
      const btnHeight = 50;

      const yPos = optionsStartY + i * optionSpacing;

      const rect = this.add.rectangle(
        this.scale.width / 2,
        yPos,
        btnWidth,
        btnHeight,
        0xfca949,
        1
      )
        .setStrokeStyle(3, 0x000000)
        .setOrigin(0.5);

      const text = this.add.text(
        this.scale.width / 2,
        yPos,
        optText,
        {
          fontFamily: "Comic Sans MS",
          fontSize: "24px",
          color: "#52391c"
        }
      ).setOrigin(0.5);

      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerup", () => {
        this.handleAnswer(i);
      });

      text.setInteractive({ useHandCursor: true });
      text.on("pointerup", () => {
        this.handleAnswer(i);
      });

      this.dialogContainer.add(rect);
      this.dialogContainer.add(text);

      this.optionButtons.push(rect);
      this.optionButtons.push(text);
    });
  }

  handleAnswer(selectedIndex) {
    const questionData = this.level.questions[this.currentQuestionIndex];
    const isCorrect = selectedIndex === questionData.correctIndex;

    if (isCorrect) {
      this.correctAnswers++;
      this.showFeedback(true);
    } else {
      this.showFeedback(false);
    }
  }

  showFeedback(isCorrect) {
    const message = isCorrect ? "Correct!" : "Try Again!";
    const color = isCorrect ? "#00ff00" : "#ff0000";

    const feedback = this.add.text(
      this.scale.width / 2,
      810,
      message,
      {
        fontFamily: "Comic Sans MS",
        fontSize: "40px",
        color: color
      }
    ).setOrigin(0.5);

    this.time.delayedCall(1000, () => {
      feedback.destroy();

      if (isCorrect) {
        if (this.currentQuestionIndex < this.level.questions.length - 1) {
          this.currentQuestionIndex++;
          this.showQuestion(this.currentQuestionIndex);
        } else {
          this.endMiniGame();
        }
      }
    });
  }

  endMiniGame() {
    const newMax = Math.max(
      this.levelNumber + 1,
      parseInt(localStorage.getItem("maxLevel") || "1")
    );
    localStorage.setItem("maxLevel", newMax);

    this.scene.start("MapScene");
  }
}
