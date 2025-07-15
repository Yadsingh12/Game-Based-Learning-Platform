import Phaser from "phaser";
import { cardsData } from "../data/cardsData.js";
import { images, spritesheets } from "../data/assetList.js";
import { createAnimations } from "../helpers/AnimationHelper.js";
import { UIPanel } from "../ui/UIPanel.js";
import { startCountdown } from "../helpers/TimerHelper.js";
import { calculateCardLayout } from "../helpers/GridHelper.js";
import { createCardContainer } from "../helpers/CardHelper.js";
import { animateCardDistribution } from "../helpers/CardDistributionHelper.js";
import { showEndGamePopup } from "../helpers/EndGameHelper.js";

export default class CardRushScene extends Phaser.Scene {
  constructor() {
    super({ key: "CardRushScene" });
  }

  preload() {
    images.forEach((img) => {
      this.load.image(img.key, img.path);
    });

    spritesheets.forEach((sheet) => {
      this.load.atlas(sheet.key, sheet.texture, sheet.atlasJSON);
    });
  }

  create() {
    createAnimations(this, spritesheets);

    this.uiPanelHeight = 100;
    this.maxTime = 60;
    this.score = 0;

    this.uiPanel = new UIPanel(this, this.uiPanelHeight);

    this.scoreText = this.add
      .text(this.scale.width / 2, 20, "Score: 0", {
        fontSize: "48px",
        color: "#333",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

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
      .setPadding(10)
      .setInteractive();

    exitButton.on("pointerup", () => {
      this.scene.start("StartMenuScene");
    });

    this.levelConfigs = [
      { rows: 2, cols: 2, pairs: 2, requiredMatches: 2 },
      { rows: 2, cols: 3, pairs: 3, requiredMatches: 3 },
      { rows: 2, cols: 4, pairs: 4, requiredMatches: 4 },
      { rows: 4, cols: 4, pairs: 8, requiredMatches: 8 },
      { rows: 4, cols: 4, pairs: 8, requiredMatches: 8 },
    ];

    this.levelCounter = 0;
    this.availableCards = Phaser.Utils.Array.Shuffle([...cardsData]);
    this.cards = [];
    this.firstCard = null;
    this.secondCard = null;

    this.buildNextLevel();
  }

  buildNextLevel() {
    const config = this.levelConfigs[this.levelCounter];

    if (!config) {
      showEndGamePopup(this, this.score);
      return;
    }

    this.currentLevelConfig = config;
    this.matchedPairs = 0;

    this.gridRows = config.rows;
    this.gridCols = config.cols;
    const pairCount = config.pairs;

    const selectedCards = [];

    let attempts = 0;
    while (selectedCards.length < pairCount * 2 && attempts < 100) {
      attempts++;

      if (this.availableCards.length < 2) {
        showEndGamePopup(this, this.score);
        return;
      }

      const base = this.availableCards.shift();
      const matchIndex = this.availableCards.findIndex(
        (c) => c.value === base.value && c.type !== base.type
      );

      if (matchIndex !== -1) {
        const match = this.availableCards.splice(matchIndex, 1)[0];
        selectedCards.push(base, match);

        this.availableCards.push(base, match);
      } else {
        this.availableCards.push(base);
      }
    }

    if (selectedCards.length < pairCount * 2) {
      showEndGamePopup(this, this.score);
      return;
    }

    const shuffled = Phaser.Utils.Array.Shuffle(selectedCards);

    // ✅ NEW: calculate height dynamically from canvas size
    const availableHeight = this.scale.height - this.uiPanelHeight;

    const { cardWidth, cardHeight, spacingX, spacingY } = calculateCardLayout(
      this,
      this.gridCols,
      this.gridRows,
      this.scale.width,
      availableHeight,
      this.uiPanelHeight
    );

    const totalWidth =
      this.gridCols * cardWidth + (this.gridCols - 1) * spacingX;

    const totalHeight =
      this.gridRows * cardHeight + (this.gridRows - 1) * spacingY;

    const startX = (this.scale.width - totalWidth) / 2 + cardWidth / 2;

    const startY =
      this.uiPanelHeight + (availableHeight - totalHeight) / 2 + cardHeight / 2;

    this.cards = [];
    let row = 0;
    let col = 0;

    const cardEntries = [];

    shuffled.forEach((cardData) => {
      const x = startX + col * (cardWidth + spacingX);
      const y = startY + row * (cardHeight + spacingY);

      const container = createCardContainer(
        this,
        this.scale.width / 2,
        this.uiPanelHeight + 50,
        cardData,
        cardWidth,
        cardHeight
      );

      container.setAlpha(0);
      container.setInteractive();
      container.on("pointerup", () => this.flipCard(container));

      this.cards.push(container);

      cardEntries.push({
        card: container,
        targetX: x,
        targetY: y,
      });

      col++;
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
    });

    this.cardWidth = cardWidth;
    this.cardHeight = cardHeight;

    animateCardDistribution(
      this,
      cardEntries,
      this.scale.width / 2,
      this.scale.height / 2
    );

    this.showLevelLabel(this.levelCounter + 1);
  }

  flipCard(card) {
    if (card.isFlipped || this.secondCard) return;

    card.isFlipped = true;
    card.backImage.setVisible(false);

    const { type, textureKey } = card.cardData;

    if (type === "image") {
      const img = this.add
        .image(0, 0, textureKey)
        .setDisplaySize(this.cardWidth, this.cardHeight);
      card.add(img);
      card.frontImage = img;
    } else if (type === "sign") {
      const sprite = this.add
        .sprite(0, 0, textureKey)
        .setDisplaySize(this.cardWidth, this.cardHeight);
      sprite.play({ key: `${textureKey}_anim` });
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
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);

      this.matchedPairs++;

      this.tweens.add({
        targets: [cardA, cardB],
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          cardA.destroy();
          cardB.destroy();

          this.firstCard = null;
          this.secondCard = null;

          if (this.matchedPairs >= this.currentLevelConfig.requiredMatches) {
            this.input.enabled = false;
            this.animateCollectAll(() => {
              this.input.enabled = true;
              this.levelCounter++;
              this.buildNextLevel();
            });
          }
        },
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

  animateCollectAll(callback) {
    let completeCount = 0;
    const toAnimate = this.cards.slice();

    if (toAnimate.length === 0) {
      callback && callback();
      return;
    }

    toAnimate.forEach((card, i) => {
      this.tweens.add({
        targets: card,
        x: this.scale.width / 2,
        y: this.scale.height / 2,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 400,
        delay: i * 50,
        onComplete: () => {
          card.destroy();
          completeCount++;
          if (completeCount === toAnimate.length) {
            callback && callback();
          }
        },
      });
    });
  }

  showLevelLabel(level) {
    const text = this.add
      .text(this.scale.width / 2, this.scale.height / 2, `Level ${level}`, {
        fontSize: "64px",
        color: "#ffaa00",
        fontStyle: "bold",
        backgroundColor: "#000000aa",
        padding: { left: 20, right: 20, top: 10, bottom: 10 },
      })
      .setOrigin(0.5)
      .setScale(0.1)
      .setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: "Back.Out",
      yoyo: true,
      hold: 1000,
      onComplete: () => {
        text.destroy();
      },
    });
  }
}
