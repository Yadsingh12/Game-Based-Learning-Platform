import Phaser from "phaser";

export default class SignMatchScene extends Phaser.Scene {
  constructor() {
    super({ key: "SignMatchScene" });
  }

  preload() {
    // preload images
    this.load.image("card_back", "/assets/SignMatch/card_back.png");

    this.load.image("apple_image", "/assets/SignMatch/images/apple.jpg");
    this.load.image("banana_image", "/assets/SignMatch/images/banana.jpg");
    this.load.image("broccoli_image", "/assets/SignMatch/images/broccoli.jpg");
    this.load.image("cake_image", "/assets/SignMatch/images/cake.jpg");
    this.load.image("carrot_image", "/assets/SignMatch/images/carrot.jpg");
    this.load.image("donut_image", "/assets/SignMatch/images/donut.jpg");
    this.load.image("orange_image", "/assets/SignMatch/images/orange.jpg");
    this.load.image("pizza_image", "/assets/SignMatch/images/pizza.jpg");

    // preload videos
    this.load.video("apple_sign", "/assets/SignMatch/videos/apple.mp4", true);
    this.load.video("banana_sign", "/assets/SignMatch/videos/banana.mp4", true);
    this.load.video(
      "broccoli_sign",
      "/assets/SignMatch/videos/broccoli.mp4",
      true
    );
    this.load.video("cake_sign", "/assets/SignMatch/videos/cake.mp4", true);
    this.load.video("carrot_sign", "/assets/SignMatch/videos/carrot.mp4", true);
    this.load.video("donut_sign", "/assets/SignMatch/videos/donut.mp4", true);
    this.load.video("orange_sign", "/assets/SignMatch/videos/orange.mp4", true);
    this.load.video("pizza_sign", "/assets/SignMatch/videos/pizza.mp4", true);
  }

  create(data) {
    console.log("Received scene data:", data);

    this.mode = data.mode || "matchAll";
    this.gridCols = data.gridCol || 4;
    this.gridRows = data.gridRow || 4;

    this.uiPanelHeight = 100;

    // UI Panel
    const uiBg = this.add.rectangle(
      this.scale.width / 2,
      this.uiPanelHeight / 2,
      this.scale.width,
      this.uiPanelHeight,
      0xeeeeee
    );
    uiBg.setOrigin(0.5, 0.5);

    this.timerText = this.add
      .text(20, 20, "Time: 60", { fontSize: "48px", color: "#333" })
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
      this.scene.stop();
      window.location.href = "/";
    });

    this.score = 0;
    this.scoreText = this.add
      .text(this.scale.width / 2, 20, "Score: 0", {
        fontSize: "48px",
        color: "#333",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0);

    this.remainingTime = 60;
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.remainingTime--;
        this.timerText.setText(`Time: ${this.remainingTime}`);
        if (this.remainingTime <= 0) {
          this.scene.restart();
        }
      },
      repeat: -1,
    });

    // Prepare card data
    let cardsData = [
      { id: 1, type: "image", value: "apple", textureKey: "apple_image" },
      { id: 2, type: "sign", value: "apple", videoKey: "apple_sign" },
      { id: 3, type: "image", value: "banana", textureKey: "banana_image" },
      { id: 4, type: "sign", value: "banana", videoKey: "banana_sign" },
      { id: 5, type: "image", value: "broccoli", textureKey: "broccoli_image" },
      { id: 6, type: "sign", value: "broccoli", videoKey: "broccoli_sign" },
      { id: 7, type: "image", value: "cake", textureKey: "cake_image" },
      { id: 8, type: "sign", value: "cake", videoKey: "cake_sign" },
      { id: 9, type: "image", value: "carrot", textureKey: "carrot_image" },
      { id: 10, type: "sign", value: "carrot", videoKey: "carrot_sign" },
      { id: 11, type: "image", value: "donut", textureKey: "donut_image" },
      { id: 12, type: "sign", value: "donut", videoKey: "donut_sign" },
      { id: 13, type: "image", value: "orange", textureKey: "orange_image" },
      { id: 14, type: "sign", value: "orange", videoKey: "orange_sign" },
      { id: 15, type: "image", value: "pizza", textureKey: "pizza_image" },
      { id: 16, type: "sign", value: "pizza", videoKey: "pizza_sign" },
    ];

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

    const totalWidth = this.gridCols * this.cardWidth + (this.gridCols - 1) * spacingX;
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

      const container = this.createCardContainer(x, y, cardData);
      this.cards.push(container);

      col++;
      if (col >= this.gridCols) {
        col = 0;
        row++;
      }
    });
  }

  createCardContainer(x, y, cardData) {
    const container = this.add.container(x, y + this.cardHeight / 2);
    console.log(x, " ", y, " ", this.cardWidth, " ", this.cardHeight);
    container.setSize(this.cardWidth, this.cardHeight);

    container.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.cardWidth, this.cardHeight),
      Phaser.Geom.Rectangle.Contains
    );

    const back = this.add
      .image(0, 0, "card_back")
      .setDisplaySize(this.cardWidth, this.cardHeight);

    container.add(back);

    container.backImage = back;
    container.cardData = cardData;
    container.isFlipped = false;

    container.on("pointerup", () => {
      this.flipCard(container);
    });

    return container;
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
      cardA.destroy();
      cardB.destroy();
      this.score += 10;
      this.scoreText.setText(`Score: ${this.score}`);
      this.firstCard = null;
      this.secondCard = null;
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
}
