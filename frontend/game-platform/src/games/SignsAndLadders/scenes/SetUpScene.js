import Phaser from "phaser";

export default class SetUpScene extends Phaser.Scene {
  constructor() {
    super("SetUpScene");
  }

  init() {
    this.humans = 2;
    this.bots = 0;
  }

  preload() {
    this.cameras.main.setBackgroundColor("#fce4ec"); // Light pink background
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    const spacing = 120; // spacing between elements
    let currentY = centerY - spacing * 2; // Start from a bit above the center

    this.add.text(centerX, currentY, "🎲 Signs & Ladders Setup 🎲", {
      font: "48px Comic Sans MS",
      color: "#880e4f"
    }).setOrigin(0.5);

    currentY += spacing;

    // Human player controls
    this.humansText = this.add.text(centerX, currentY, `👤 Human Players: ${this.humans}`, {
      font: "32px Comic Sans MS",
      color: "#4a148c"
    }).setOrigin(0.5);

    this.createButton(centerX - 180, currentY, "-", () => {
      if (this.humans > 0) {
        this.humans--;
        this.refreshTexts();
      }
    });

    this.createButton(centerX + 180, currentY, "+", () => {
      if (this.humans + this.bots < 4) {
        this.humans++;
        this.refreshTexts();
      }
    });

    currentY += spacing;

    // Bot player controls
    this.botsText = this.add.text(centerX, currentY, `🤖 Bot Players: ${this.bots}`, {
      font: "32px Comic Sans MS",
      color: "#4a148c",
    }).setOrigin(0.5);

    this.createButton(centerX - 180, currentY, "-", () => {
      if (this.bots > 0) {
        this.bots--;
        this.refreshTexts();
      }
    });

    this.createButton(centerX + 180, currentY, "+", () => {
      if (this.humans + this.bots < 4) {
        this.bots++;
        this.refreshTexts();
      }
    });

    currentY += spacing;

    // Start button
    const startBtn = this.add.rectangle(centerX, currentY, 260, 80, 0x4caf50, 1)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    startBtn.setStrokeStyle(4, 0x1b5e20);

    this.add.text(centerX, currentY, "Start Game!", {
      font: "34px Comic Sans MS",
      color: "#fff"
    }).setOrigin(0.5);

    startBtn.on("pointerdown", () => {
      this.scene.start("SignsAndLaddersScene", {
        humans: this.humans,
        bots: this.bots
      });
    });

    currentY += spacing;

    // Footer
    this.add.text(centerX, currentY, "Max 4 players total", {
      font: "24px Comic Sans MS",
      color: "#6a1b9a"
    }).setOrigin(0.5);

    this.refreshTexts();
  }


  createButton(x, y, label, onClick) {
    const rect = this.add.rectangle(x, y, 40, 40, 0xffcdd2)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xd32f2f)
      .setInteractive({ useHandCursor: true });

    this.add.text(x, y, label, {
      font: "28px Comic Sans MS",
      color: "#000"
    }).setOrigin(0.5);

    rect.on("pointerdown", onClick);
  }

  refreshTexts() {
    this.humansText.setText(`👤 Human Players: ${this.humans}`);
    this.botsText.setText(`🤖 Bot Players: ${this.bots}`);
  }
}
