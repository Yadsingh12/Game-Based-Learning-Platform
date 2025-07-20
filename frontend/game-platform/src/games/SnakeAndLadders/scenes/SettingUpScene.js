import Phaser from "phaser";

export default class SetupScene extends Phaser.Scene {
  constructor() {
    super("SetupScene");
  }

  init() {
    this.humans = 4;
    this.bots = 0;
  }

  preload() {}

  create() {
    this.add.text(200, 50, "Signs & Ladders Setup", {
      font: "28px Arial",
      color: "#333"
    });

    this.humansText = this.add.text(200, 150, `Human Players: ${this.humans}`, {
      font: "22px Arial",
      color: "#000"
    });

    this.botsText = this.add.text(200, 200, `Bot Players: ${this.bots}`, {
      font: "22px Arial",
      color: "#000"
    });

    // Human + button
    this.createButton(420, 150, "+", () => {
      if (this.humans + this.bots < 4) {
        this.humans++;
        this.refreshTexts();
      }
    });

    // Human - button
    this.createButton(160, 150, "-", () => {
      if (this.humans > 1) {
        this.humans--;
        this.refreshTexts();
      }
    });

    // Bot + button
    this.createButton(420, 200, "+", () => {
      if (this.humans + this.bots < 4) {
        this.bots++;
        this.refreshTexts();
      }
    });

    // Bot - button
    this.createButton(160, 200, "-", () => {
      if (this.bots > 0) {
        this.bots--;
        this.refreshTexts();
      }
    });

    // Start button
    const startBtn = this.add.rectangle(300, 350, 180, 60, 0x00cc00)
      .setOrigin(0.5)
      .setInteractive();

    this.add.text(245, 340, "Start Game", {
      font: "20px Arial",
      color: "#fff"
    });

    startBtn.on("pointerdown", () => {
      this.scene.start("SignsAndLaddersScene", {
        humans: this.humans,
        bots: this.bots
      });
    });

    this.refreshTexts();
  }

  createButton(x, y, label, onClick) {
    const rect = this.add.rectangle(x, y, 40, 40, 0xcccccc)
      .setOrigin(0.5)
      .setInteractive();

    this.add.text(x - 8, y - 12, label, {
      font: "24px Arial",
      color: "#000"
    });

    rect.on("pointerdown", onClick);
  }

  refreshTexts() {
    this.humansText.setText(`Human Players: ${this.humans}`);
    this.botsText.setText(`Bot Players: ${this.bots}`);
  }
}
