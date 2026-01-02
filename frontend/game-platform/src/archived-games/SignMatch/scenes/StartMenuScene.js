import Phaser from "phaser";

export default class StartMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "StartMenuScene" });
  }

  preload() {
    // Preload a star icon PNG
    this.load.image("star", "/assets/SignMatch/star.png");
  }

  create() {
    this.cameras.main.setBackgroundColor("#ffffff");

    const centerX = this.scale.width / 2;
    const title = this.add
      .text(centerX, 80, "Sign & Match", {
        fontFamily: "Arial",
        fontSize: "64px",
        color: "#333333",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const modeLabel = this.add
      .text(centerX, 160, "Choose Game Mode", {
        fontFamily: "Arial",
        fontSize: "32px",
        color: "#555555",
      })
      .setOrigin(0.5);

    const circleRadius = 120;
    const spacingX = 600;
    const spacingY = 300;

    const startX = centerX - spacingX / 2;
    const startY = 300 + circleRadius / 2;

    const storedStars =
      JSON.parse(localStorage.getItem("SignMatchStars")) || {};

    const defaultLabels = ["2×2", "2×4", "4×4", "Card\nRush"];
    const savedStars = {};

    defaultLabels.forEach((label) => {
      savedStars[label] = storedStars[label] || 0;
    });

    const buttonsData = [
      {
        label: "2×2",
        mode: "matchAll",
        gridRow: 2,
        gridCol: 2,
        col: 0,
        row: 0,
      },
      {
        label: "2×4",
        mode: "matchAll",
        gridRow: 2,
        gridCol: 4,
        col: 1,
        row: 0,
      },
      {
        label: "4×4",
        mode: "matchAll",
        gridRow: 4,
        gridCol: 4,
        col: 0,
        row: 1,
      },
      {
        label: "Card\nRush",
        mode: "cardRush",
        col: 1,
        row: 1,
      },
    ];

    buttonsData.forEach((data) => {
      const x = startX + data.col * spacingX;
      const y = startY + data.row * spacingY;

      const circle = this.add
        .circle(x, y, circleRadius, 0xffd700, 0.8)
        .setStrokeStyle(10, 0x333333);

      circle.setInteractive({ useHandCursor: true });

      const text = this.add
        .text(x, y, data.label, {
          fontFamily: "Arial",
          fontSize: "36px",
          color: "#333333",
          align: "center",
          fontStyle: "bold",
          wordWrap: { width: circleRadius * 1.5 },
        })
        .setOrigin(0.5);

      // Add stars under the button
      const maxStars = 5;
      const starsEarned = savedStars[data.label] || 0;
      const starSpacing = 0;
      const starSize = 80;

      const totalStarsWidth =
        maxStars * starSize + (maxStars - 1) * starSpacing;
      const starsStartX = x - totalStarsWidth / 2;

      for (let i = 0; i < maxStars; i++) {
        const starX = starsStartX + i * (starSize + starSpacing);
        const starY = y + circleRadius;

        const star = this.add
          .image(starX, starY, "star")
          .setDisplaySize(starSize, starSize)
          .setOrigin(0, 0.5);

        if (i < starsEarned) {
          star.setTint(0xffd700);
        } else {
          star.setTint(0xcccccc);
        }
      }

      circle.on("pointerover", () => {
        circle.setFillStyle(0xffc300, 1);
        circle.setScale(1.1);
      });

      circle.on("pointerout", () => {
        circle.setFillStyle(0xffd700, 0.8);
        circle.setScale(1);
      });

      circle.on("pointerup", () => {
        if (data.mode === "cardRush") {
          this.scene.start("CardRushScene");
        } else {
          this.scene.start("SignMatchScene", {
            mode: "matchAll",
            gridRow: data.gridRow,
            gridCol: data.gridCol,
          });
        }
      });
    });
  }
}
