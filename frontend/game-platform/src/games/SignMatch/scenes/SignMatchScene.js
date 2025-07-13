import Phaser from "phaser";
import { cardsData } from "../data/cardsData.js";
import { images, videos } from "../data/assetList.js";

import { UIPanel } from "../ui/UIPanel.js";
import { QuestionPopup } from "../ui/QuestionPopup.js";
import { createCardContainer } from "../helpers/CardHelper.js";
import { calculateStars, saveStars } from "../helpers/StarHelper.js";

export default class SignMatchScene extends Phaser.Scene {
  constructor() {
    super({ key: "SignMatchScene" });
  }

  preload() {
    images.forEach(img => {
      this.load.image(img.key, img.path);
    });
    videos.forEach(vid => {
      this.load.video(vid.key, vid.path, true);
    });
  }

  create(data) {
    console.log("Received scene data:", data);

    this.mode = data.mode || "matchAll";
    this.gridCols = data.gridCol || 4;
    this.gridRows = data.gridRow || 4;

    this.uiPanelHeight = 100;

    // UI Panel
    this.uiPanel = new UIPanel(this, this.uiPanelHeight);
    this.questionPopup = new QuestionPopup(this);

    // Timer setup
    this.maxTime = 60; // default max time for matchAll mode
    if (this.mode === "matchAll") {
      // Adjust maxTime based on grid size
      if (this.gridCols === 2 && this.gridRows === 2) {
        this.maxTime = 10;
      } else if (this.gridCols === 4 && this.gridRows === 2) {
        this.maxTime = 30;
      }
    }
    this.remainingTime = this.maxTime;
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.remainingTime--;
        this.timerText.setText(`Time: ${this.remainingTime}`);
        if (this.remainingTime <= 0) {
          this.showEndGamePopup();
        }
      },
      repeat: -1,
    });
    this.timerText = this.add
      .text(20, 20, `Time: ${this.remainingTime}`, { fontSize: "48px", color: "#333" })
      .setOrigin(0, 0);

    const exitButton = this.add
      .text(this.scale.width - 20, 20, "Exit", {
        fontSize: "48px",
        color: "#ff0000",
        backgroundColor: "#ffffff",
      })
      .setOrigin(1, 0)
      .setPadding(10);

    exitButton.setInteractive();
    exitButton.on("pointerup", () => {
      this.scene.start("StartMenuScene");
    });

    // Score setup
    this.score = 0;
    this.scoreText = this.add
      .text(this.scale.width / 2, 20, "Score: 0", {
        fontSize: "48px",
        color: "#333",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);


    if (this.mode === "matchAll") {
      const pairCount = (this.gridCols * this.gridRows) / 2;
      console.log("Pair count for matchAll mode: ", pairCount);
      const selectedValues = Phaser.Utils.Array.Shuffle([
        ...new Set(cardsData.map((c) => c.value)),
      ]).slice(0, pairCount);
      console.log("Selected values for matchAll mode: ", selectedValues);

      this.cardsData = selectedValues.flatMap((value) =>
        cardsData.filter((c) => c.value === value)
      );
    } else if (this.mode === "cardRush") {
      this.cardsData = Phaser.Utils.Array.Shuffle(cardsData).slice(0, 8);
    } else {
      this.cardsData = cardsData;
    }

    const shuffledCards = Phaser.Utils.Array.Shuffle(this.cardsData);
    console.log("Shuffled cards: ", shuffledCards);

    const availableWidth = this.scale.width;
    const availableHeight = this.scale.height - this.uiPanelHeight;

    let spacingX = 20;
    let spacingY = 20;

    this.cardOriginalWidth = 640;
    this.cardOriginalHeight = 360;

    const idealTotalWidth =
      this.gridCols * this.cardOriginalWidth + (this.gridCols + 1) * spacingX;
    const idealTotalHeight =
      this.gridRows * this.cardOriginalHeight + (this.gridRows + 1) * spacingY;

    let scaleFactor = 1;

    if (
      idealTotalWidth > availableWidth ||
      idealTotalHeight > availableHeight
    ) {
      const scaleX = availableWidth / idealTotalWidth;
      const scaleY = availableHeight / idealTotalHeight;
      scaleFactor = Math.min(scaleX, scaleY);
    }
    console.log("Scale factor: ", scaleFactor);

    this.cardWidth = this.cardOriginalWidth * scaleFactor;
    this.cardHeight = this.cardOriginalHeight * scaleFactor;
    spacingX *= scaleFactor;
    spacingY *= scaleFactor;

    const totalWidth =
      this.gridCols * this.cardWidth + (this.gridCols - 1) * spacingX;
    const startX = (availableWidth - totalWidth) / 2 + this.cardWidth / 2;
    console.log(this.uiPanelHeight);
    const startY = this.uiPanelHeight + spacingY;

    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;

    let row = 0;
    let col = 0;

    shuffledCards.forEach((cardData) => {
      const x = startX + col * (this.cardWidth + spacingX);
      const y = startY + row * (this.cardHeight + spacingY);

      const container = createCardContainer(
        this, x, y, cardData,
        this.cardWidth, this.cardHeight
      );

      this.cards.push(container);

      col++;
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
    });
  }

  flipCard(card) {
    if (card.isFlipped || this.secondCard) {
      return;
    }

    card.isFlipped = true;
    card.backImage.setVisible(false);

    const { type, textureKey, videoKey } = card.cardData;

    if (type === "image") {
      const frontImage = this.add
        .image(0, 0, textureKey)
        .setDisplaySize(this.cardWidth, this.cardHeight);
      card.add(frontImage);
      card.frontImage = frontImage;
    } else if (type === "sign") {
      const video = this.add.video(0, 0, videoKey);
      video.setDisplaySize(this.cardWidth, this.cardHeight);
      video.once("play", () => {
        video.setDisplaySize(this.cardWidth, this.cardHeight);
      });
      video.play(true);
      card.add(video);
      card.frontVideo = video;
    }

    if (!this.firstCard) {
      this.firstCard = card;
    } else {
      this.secondCard = card;
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const cardA = this.firstCard;
    const cardB = this.secondCard;

    if (
      cardA.cardData.value === cardB.cardData.value &&
      cardA.cardData.type !== cardB.cardData.type
    ) {
      this.score += 5;
      this.scoreText.setText(`Score: ${this.score}`);

      let imageCard =
        cardA.cardData.type === "image" ? cardA.cardData : cardB.cardData;

      cardA.setVisible(false);
      cardB.setVisible(false);

      // Show the question popup, and after it's closed, check for game end
      this.questionPopup.showQuestion(imageCard, () => {
        cardA.destroy();
        cardB.destroy();

        this.firstCard = null;
        this.secondCard = null;

        // Check if all cards are matched
        const anyRemaining = this.cards.some((card) => card.active);
        if (!anyRemaining) {
          this.time.delayedCall(500, () => {
            this.showEndGamePopup(); // you must already have this method from earlier
          });
        }
      });
    } else {
      this.time.delayedCall(1000, () => {
        this.hideCard(cardA);
        this.hideCard(cardB);
        this.firstCard = null;
        this.secondCard = null;
      });
    }
  }

  hideCard(card) {
    card.isFlipped = false;
    card.backImage.setVisible(true);

    if (card.frontImage) {
      card.frontImage.destroy();
      card.frontImage = null;
    }

    if (card.frontVideo) {
      card.frontVideo.destroy();
      card.frontVideo = null;
    }
  }

  showEndGamePopup() {
    // Dark background overlay
    this.endBg = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.6
      )
      .setDepth(2000);

    // Popup box
    const boxWidth = 800;
    const boxHeight = 500;

    this.endBox = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        boxWidth,
        boxHeight,
        0xffffff
      )
      .setStrokeStyle(4, 0x333333)
      .setOrigin(0.5, 0.5)
      .setDepth(2001);

    // Title text
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - boxHeight / 2 + 50,
        "Game Over",
        {
          fontSize: "48px",
          color: "#333",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(2001);

    // Display score
    this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 50,
        `Your Score: ${this.score}`,
        {
          fontSize: "36px",
          color: "#333",
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(2001);

    // Calculate stars
    const stars = calculateStars(this);

    // Draw stars
    const starSpacing = 80;
    const startX =
      this.scale.width / 2 - (starSpacing * (stars.length - 1)) / 2;
    stars.forEach((isFilled, index) => {
      const starColor = isFilled ? 0xffd700 : 0xcccccc;
      this.add
        .star(
          startX + index * starSpacing,
          this.scale.height / 2 + 50,
          5,
          20,
          40,
          starColor
        )
        .setDepth(2001);
    });

    // Save stars to localStorage if better
    saveStars(this, stars.filter((s) => s).length);

    // Buttons
    const buttonY = this.scale.height / 2 + 150;

    const menuButton = this.add
      .text(this.scale.width / 2 - 150, buttonY, "Main Menu", {
        fontSize: "32px",
        backgroundColor: "#dddddd",
        color: "#333",
        padding: { left: 30, right: 30, top: 15, bottom: 15 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2001)
      .setInteractive({ useHandCursor: true });

    menuButton.on("pointerup", () => {
      this.scene.start("StartMenuScene");
    });

    const restartButton = this.add
      .text(this.scale.width / 2 + 150, buttonY, "Restart", {
        fontSize: "32px",
        backgroundColor: "#dddddd",
        color: "#333",
        padding: { left: 30, right: 30, top: 15, bottom: 15 },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2001)
      .setInteractive({ useHandCursor: true });

    restartButton.on("pointerup", () => {
      this.scene.restart();
    });
  }
}
