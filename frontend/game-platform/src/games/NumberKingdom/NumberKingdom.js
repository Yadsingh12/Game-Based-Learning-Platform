// src/games/NumberKingdom.js

import Phaser from "phaser";

export default class NumberKingdom extends Phaser.Scene {
  constructor() {
    super("NumberKingdom");
  }

  preload() {
    this.load.video("sign4", "assets/videos/4-sign.mp4");
  }

  create() {
    const width = this.sys.game.config.width;
    const height = this.sys.game.config.height;

    // Add title
    this.add.text(width / 2, 50, "Number Kingdom - Level 1", {
      fontSize: "28px",
      color: "#000",
    }).setOrigin(0.5);

    // Play video
    const video = this.add.video(width / 2, height / 2 - 50, "sign4");
    video.setScale(0.5);
    video.play(true);

    // Buttons
    const options = [2, 4, 6];
    options.forEach((num, index) => {
      const btn = this.add.text(width / 2, 350 + index * 50, num.toString(), {
        fontSize: "32px",
        backgroundColor: "#ddd",
        color: "#000",
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5).setInteractive();

      btn.on("pointerdown", () => {
        if (num === 4) {
          this.showMessage("Correct! 🎉");
        } else {
          this.showMessage("Try Again!");
        }
      });
    });
  }

  showMessage(msg) {
    this.add.text(
      this.sys.game.config.width / 2,
      this.sys.game.config.height - 50,
      msg,
      {
        fontSize: "24px",
        color: "#ff0000",
      }
    ).setOrigin(0.5);
  }
}
