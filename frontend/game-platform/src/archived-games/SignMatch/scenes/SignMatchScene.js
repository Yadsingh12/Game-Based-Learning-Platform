import Phaser from "phaser";
import { cardsData } from "../data/cardsData.js";
import { images, spritesheets } from "../data/assetList.js";
import { createAnimations } from "../helpers/AnimationHelper.js";

import { UIPanel } from "../ui/UIPanel.js";
import { startCountdown } from "../helpers/TimerHelper.js";
import { QuestionPopup } from "../ui/QuestionPopup.js";
import { calculateCardLayout } from "../helpers/GridHelper.js";
import { createCardContainer } from "../helpers/CardHelper.js";
import { animateCardDistribution } from "../helpers/CardDistributionHelper.js";
import { showEndGamePopup } from "../helpers/EndGameHelper.js";

export default class SignMatchScene extends Phaser.Scene {
  constructor() {
    super({ key: "SignMatchScene" });
  }

  preload() {
    images.forEach((img) => {
      this.load.image(img.key, img.path);
    });

    spritesheets.forEach((sheet) => {
      this.load.atlas(sheet.key, sheet.texture, sheet.atlasJSON);
    });
  }

  create(data) {
    console.log("Received scene data:", data);

    this.mode = data.mode || "matchAll";
    this.gridCols = data.gridCol || 4;
    this.gridRows = data.gridRow || 4;

    createAnimations(this, spritesheets);

    this.uiPanelHeight = 100;

    this.uiPanel = new UIPanel(this, this.uiPanelHeight);
    this.questionPopup = new QuestionPopup(this);

    this.maxTime = 60;
    if (this.mode === "matchAll") {
      if (this.gridCols === 2 && this.gridRows === 2) {
        this.maxTime = 10;
      } else if (this.gridCols === 4 && this.gridRows === 2) {
        this.maxTime = 30;
      }
    }

    startCountdown(this, this.maxTime, () => {
      showEndGamePopup(this, this.score);
    });

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
    } else {
      this.cardsData = cardsData;
    }

    const shuffledCards = Phaser.Utils.Array.Shuffle(this.cardsData);
    console.log("Shuffled cards: ", shuffledCards);

    const availableHeight = this.scale.height - this.uiPanelHeight;

    const { cardWidth, cardHeight, spacingX, spacingY } = calculateCardLayout(
      this,
      this.gridCols,
      this.gridRows,
      this.scale.width,
      availableHeight,
      this.uiPanelHeight
    );

    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;

    const totalWidth =
      this.gridCols * this.cardWidth + (this.gridCols - 1) * spacingX;

    const totalHeight =
      this.gridRows * this.cardHeight + (this.gridRows - 1) * spacingY;

    const startX = (this.scale.width - totalWidth) / 2 + cardWidth / 2;

    const startY =
      this.uiPanelHeight + (availableHeight - totalHeight) / 2 + cardHeight / 2;

    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;

    let row = 0;
    let col = 0;

    const cardEntries = [];

    shuffledCards.forEach((cardData) => {
      const targetX = startX + col * (this.cardWidth + spacingX);
      const targetY = startY + row * (this.cardHeight + spacingY);

      const container = createCardContainer(
        this,
        this.scale.width / 2,
        this.uiPanelHeight + 50,
        cardData,
        this.cardWidth,
        this.cardHeight
      );

      container.setAlpha(0);
      container.setInteractive();
      container.on("pointerup", () => this.flipCard(container));

      this.cards.push(container);

      cardEntries.push({
        card: container,
        targetX: targetX,
        targetY: targetY,
      });

      col++;
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
    });

    animateCardDistribution(
      this,
      cardEntries,
      this.scale.width / 2,
      this.scale.height / 2
    );
  }

  flipCard(card) {
    if (card.isFlipped || this.secondCard) return;

    card.isFlipped = true;
    card.backImage.setVisible(false);

    const { type, textureKey } = card.cardData;

    if (type === "image") {
      const frontImage = this.add
        .image(0, 0, textureKey)
        .setDisplaySize(this.cardWidth, this.cardHeight);
      card.add(frontImage);
      card.frontImage = frontImage;
    } else if (type === "sign") {
      const sprite = this.add
        .sprite(0, 0, textureKey)
        .setDisplaySize(this.cardWidth, this.cardHeight);
      sprite.play({
        key: `${textureKey}_anim`,
      });
      card.add(sprite);
      card.frontSprite = sprite;
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

      this.questionPopup.showQuestion(imageCard, () => {
        cardA.destroy();
        cardB.destroy();

        this.firstCard = null;
        this.secondCard = null;

        const anyRemaining = this.cards.some((card) => card.active);
        if (!anyRemaining) {
          this.time.delayedCall(500, () => {
            showEndGamePopup(this, this.score);
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

    if (card.frontSprite) {
      card.frontSprite.destroy();
      card.frontSprite = null;
    }
  }
}
