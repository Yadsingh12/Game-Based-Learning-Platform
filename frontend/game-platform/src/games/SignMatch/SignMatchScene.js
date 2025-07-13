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
    this.load.video("broccoli_sign", "/assets/SignMatch/videos/broccoli.mp4", true );
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


    // Prepare card data
    let cardsData = [
      {
        id: 1,
        type: "image",
        value: "apple",
        textureKey: "apple_image",
        questions: [
          {
            question: "What color are most apples?",
            options: ["Red", "Blue", "Yellow", "Purple"],
            correct: "Red",
          },
          {
            question: "Apples grow on which type of plant?",
            options: ["Tree", "Bush", "Vine", "Ground"],
            correct: "Tree",
          },
          {
            question: "Which vitamin is abundant in apples?",
            options: ["Vitamin C", "Vitamin D", "Vitamin A", "Vitamin K"],
            correct: "Vitamin C",
          },
          {
            question: "Which part of an apple is often eaten last?",
            options: ["Stem", "Skin", "Core", "Seeds"],
            correct: "Core",
          },
        ],
      },
      {
        id: 2,
        type: "sign",
        value: "apple",
        videoKey: "apple_sign",
      },
      {
        id: 3,
        type: "image",
        value: "banana",
        textureKey: "banana_image",
        questions: [
          {
            question: "Bananas are high in which mineral?",
            options: ["Calcium", "Iron", "Potassium", "Sodium"],
            correct: "Potassium",
          },
          {
            question: "Bananas grow in what kind of clusters?",
            options: ["Hands", "Pods", "Nests", "Capsules"],
            correct: "Hands",
          },
          {
            question: "What color is a ripe banana?",
            options: ["Green", "Yellow", "Red", "Brown"],
            correct: "Yellow",
          },
          {
            question: "Bananas are originally native to which region?",
            options: ["North America", "Africa", "Southeast Asia", "Europe"],
            correct: "Southeast Asia",
          },
        ],
      },
      {
        id: 4,
        type: "sign",
        value: "banana",
        videoKey: "banana_sign",
      },
      {
        id: 5,
        type: "image",
        value: "broccoli",
        textureKey: "broccoli_image",
        questions: [
          {
            question: "Broccoli belongs to which vegetable family?",
            options: ["Root", "Brassica", "Leafy", "Nightshade"],
            correct: "Brassica",
          },
          {
            question: "Broccoli is mostly which color?",
            options: ["Red", "Green", "Orange", "Purple"],
            correct: "Green",
          },
          {
            question: "Which vitamin is abundant in broccoli?",
            options: ["Vitamin E", "Vitamin C", "Vitamin B12", "Vitamin D"],
            correct: "Vitamin C",
          },
          {
            question: "What part of broccoli do we eat?",
            options: ["Stem", "Roots", "Flowers", "Seeds"],
            correct: "Flowers",
          },
        ],
      },
      {
        id: 6,
        type: "sign",
        value: "broccoli",
        videoKey: "broccoli_sign",
      },
      {
        id: 7,
        type: "image",
        value: "cake",
        textureKey: "cake_image",
        questions: [
          {
            question: "Cake is usually made from which grain?",
            options: ["Wheat", "Rice", "Corn", "Barley"],
            correct: "Wheat",
          },
          {
            question: "What ingredient makes cakes rise?",
            options: ["Salt", "Sugar", "Baking powder", "Oil"],
            correct: "Baking powder",
          },
          {
            question: "Which occasion is cake most associated with?",
            options: ["Birthday", "Breakfast", "Lunch", "Picnic"],
            correct: "Birthday",
          },
          {
            question: "Which taste best describes most cakes?",
            options: ["Sour", "Sweet", "Bitter", "Spicy"],
            correct: "Sweet",
          },
        ],
      },
      {
        id: 8,
        type: "sign",
        value: "cake",
        videoKey: "cake_sign",
      },
      {
        id: 9,
        type: "image",
        value: "carrot",
        textureKey: "carrot_image",
        questions: [
          {
            question: "Carrots are typically which color?",
            options: ["Purple", "Yellow", "Orange", "Red"],
            correct: "Orange",
          },
          {
            question: "Carrots grow mostly where?",
            options: ["Above ground", "Under ground", "On trees", "On vines"],
            correct: "Under ground",
          },
          {
            question: "Carrots are high in which vitamin?",
            options: ["Vitamin A", "Vitamin D", "Vitamin B12", "Vitamin K"],
            correct: "Vitamin A",
          },
          {
            question: "Which part of carrot is eaten?",
            options: ["Leaves", "Stem", "Root", "Flower"],
            correct: "Root",
          },
        ],
      },
      {
        id: 10,
        type: "sign",
        value: "carrot",
        videoKey: "carrot_sign",
      },
      {
        id: 11,
        type: "image",
        value: "donut",
        textureKey: "donut_image",
        questions: [
          {
            question: "What shape is a typical donut?",
            options: ["Square", "Triangle", "Ring", "Oval"],
            correct: "Ring",
          },
          {
            question: "Donuts are often topped with what?",
            options: ["Salt", "Spices", "Glaze", "Vegetables"],
            correct: "Glaze",
          },
          {
            question: "Donuts are usually considered?",
            options: ["Breakfast", "Dessert", "Main course", "Salad"],
            correct: "Dessert",
          },
          {
            question: "Donuts originate from which cuisine?",
            options: ["Dutch", "Chinese", "Mexican", "Indian"],
            correct: "Dutch",
          },
        ],
      },
      {
        id: 12,
        type: "sign",
        value: "donut",
        videoKey: "donut_sign",
      },
      {
        id: 13,
        type: "image",
        value: "orange",
        textureKey: "orange_image",
        questions: [
          {
            question: "Oranges are high in which vitamin?",
            options: ["Vitamin D", "Vitamin E", "Vitamin C", "Vitamin B12"],
            correct: "Vitamin C",
          },
          {
            question: "Oranges are typically which color?",
            options: ["Yellow", "Orange", "Red", "Green"],
            correct: "Orange",
          },
          {
            question: "Oranges grow on what plant?",
            options: ["Tree", "Bush", "Vine", "Ground"],
            correct: "Tree",
          },
          {
            question: "Which citrus fruit is similar to orange?",
            options: ["Apple", "Lemon", "Banana", "Grapes"],
            correct: "Lemon",
          },
        ],
      },
      {
        id: 14,
        type: "sign",
        value: "orange",
        videoKey: "orange_sign",
      },
      {
        id: 15,
        type: "image",
        value: "pizza",
        textureKey: "pizza_image",
        questions: [
          {
            question: "Pizza originated from which country?",
            options: ["Germany", "Italy", "USA", "France"],
            correct: "Italy",
          },
          {
            question: "What is spread on pizza base first?",
            options: ["Sugar", "Cheese", "Tomato sauce", "Oil"],
            correct: "Tomato sauce",
          },
          {
            question: "Which topping is common on pizza?",
            options: ["Chocolate", "Fish", "Pepperoni", "Coconut"],
            correct: "Pepperoni",
          },
          {
            question: "Pizza is usually baked in?",
            options: ["Frying pan", "Microwave", "Oven", "Pot"],
            correct: "Oven",
          },
        ],
      },
      {
        id: 16,
        type: "sign",
        value: "pizza",
        videoKey: "pizza_sign",
      },
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
      this.score += 5;
      this.scoreText.setText(`Score: ${this.score}`);

      let imageCard =
        cardA.cardData.type === "image" ? cardA.cardData : cardB.cardData;

      cardA.setVisible(false);
      cardB.setVisible(false);

      // Show the question popup, and after it's closed, check for game end
      this.showQuestionPopup(imageCard, () => {
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

  showQuestionPopup(foodCardData, onClose = () => {}) {
    // Pick a random question
    const randomQuestion = Phaser.Utils.Array.GetRandom(foodCardData.questions);

    // Dark overlay
    this.popupBg = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        this.scale.width,
        this.scale.height,
        0x000000,
        0.6
      )
      .setDepth(1000);

    // Popup box
    const boxWidth = 800;
    const boxHeight = 600;

    // Draw fancy box with stroke and rounded corners
    this.popupBox = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        boxWidth,
        boxHeight,
        0xffffff
      )
      .setStrokeStyle(4, 0x333333)
      .setOrigin(0.5, 0.5)
      .setDepth(1001);

    // Question text
    this.popupQuestion = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - boxHeight / 2 + 60,
        randomQuestion.question,
        {
          fontSize: "28px",
          color: "#333",
          wordWrap: { width: boxWidth - 80 },
          align: "center",
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(1001);

    // Food image
    this.popupImage = this.add
      .image(
        this.scale.width / 2,
        this.popupQuestion.y + this.popupQuestion.height + 20,
        foodCardData.textureKey
      )
      .setOrigin(0.5, 0)
      .setDepth(1001);

    // Scale down big images
    const maxImageWidth = 400;
    const maxImageHeight = 200;
    if (this.popupImage.width > maxImageWidth) {
      this.popupImage.setDisplaySize(
        maxImageWidth,
        this.popupImage.height * (maxImageWidth / this.popupImage.width)
      );
    }
    if (this.popupImage.height > maxImageHeight) {
      this.popupImage.setDisplaySize(
        this.popupImage.width * (maxImageHeight / this.popupImage.height),
        maxImageHeight
      );
    }

    // Compute Y position for options
    let optionsStartY = this.popupImage.y + this.popupImage.displayHeight + 50;

    // Shuffle options
    const shuffledOptions = Phaser.Utils.Array.Shuffle([
      ...randomQuestion.options,
    ]);

    this.popupOptionTexts = [];

    // Dynamically space options
    const optionSpacing = 55;
    const optionFontSize = 28;

    shuffledOptions.forEach((optionText, index) => {
      const optionButton = this.add
        .text(
          this.scale.width / 2,
          optionsStartY + index * optionSpacing,
          optionText,
          {
            fontSize: `${optionFontSize}px`,
            backgroundColor: "#dddddd",
            color: "#333",
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            wordWrap: { width: boxWidth - 100 },
            align: "center",
          }
        )
        .setOrigin(0.5, 0.5)
        .setDepth(1001)
        .setInteractive({ useHandCursor: true });

      optionButton.on("pointerup", () => {
        if (optionText === randomQuestion.correct) {
          this.score += 5;
          this.scoreText.setText(`Score: ${this.score}`);
          optionButton.setBackgroundColor("#00ff00");
          this.time.delayedCall(1000, () => {
            this.hideQuestionPopup();
          });
          onClose();
        } else {
          optionButton.setBackgroundColor("#ff6666");
          this.time.delayedCall(1000, () => {
            optionButton.setBackgroundColor("#dddddd");
          });
          this.score -= 5;
          this.scoreText.setText(`Score: ${this.score}`);
        }
      });

      this.popupOptionTexts.push(optionButton);
    });
  }

  hideQuestionPopup() {
    this.popupBg.destroy();
    this.popupBox.destroy();
    this.popupQuestion.destroy();
    this.popupImage.destroy();
    this.popupOptionTexts.forEach((btn) => btn.destroy());
    this.popupOptionTexts = [];
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
    const stars = this.calculateStars();

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
    this.saveStars(stars.filter((s) => s).length);

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
  calculateStars() {
    const maxStars = 5;
    let stars = [false, false, false, false, false];
    let starsAchieved = 0;

    // Calculate stars based on mode
    if (this.mode === "matchAll") {
      const allMatched = this.cards.every((c) => !c.active);

      // Calculate bonus for speed and score
      const timeRatio = this.remainingTime / this.maxTime;

      // Adjust maxScore based on grid size
      let maxScore = 80; // default max score for matchAll mode
      if (this.gridRows === 2 && this.gridCols === 4) {
        maxScore = 40; // adjust for 2x4 grid
      } else if (this.gridRows === 2 && this.gridCols === 2) {
        maxScore = 20; // adjust for 2x2 grid
      }

      const scoreRatio = Math.min(this.score / maxScore, 1);

      if (timeRatio > 0.1 || scoreRatio > 0.5) starsAchieved++;
      if (timeRatio > 0.2 || scoreRatio > 0.7) starsAchieved++;
      if (timeRatio > 0.3 || scoreRatio > 0.9) starsAchieved++;
      if (timeRatio > 0.4 || scoreRatio >= 1) starsAchieved++;
      if (allMatched) starsAchieved++; // last star for completion
    } else if (this.mode === "cardRush") {
      // purely score-based
      if (this.score >= 50) starsAchieved++;
      if (this.score >= 75) starsAchieved++;
      if (this.score >= 100) starsAchieved++;
      if (this.score >= 125) starsAchieved++;
      if (this.score >= 150) starsAchieved++;
    }

    for (let i = 0; i < starsAchieved && i < maxStars; i++) {
      stars[i] = true;
    }
    return stars;
  }

  saveStars(starCount) {
    let storedStars = localStorage.getItem("SignMatchStars");
    let starsData = storedStars
      ? JSON.parse(storedStars)
      : {
          "2×2": 0,
          "2×4": 0,
          "4×4": 0,
          "Card\nRush": 0,
        };

    let modeLabel = "";

    if (this.mode === "matchAll") {
      modeLabel = `${this.gridRows}×${this.gridCols}`;
    } else if (this.mode === "cardRush") {
      modeLabel = "Card\nRush";
    }

    if (modeLabel) {
      if (!starsData[modeLabel] || starCount > starsData[modeLabel]) {
        starsData[modeLabel] = starCount;
        localStorage.setItem("SignMatchStars", JSON.stringify(starsData));
      }
    }
  }
}
