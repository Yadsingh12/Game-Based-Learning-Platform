import Phaser from "phaser";
import { levelData } from "./data/LevelData.js";

export default class MapScene extends Phaser.Scene {
  constructor() {
    super("MapScene");
  }

  preload() {
    this.load.image("meadow", "/assets/NumberKingdom/backgrounds/meadow.png");
  }

  create() {
    // -- Settings --
    const numLevels = 20;
    const verticalSpacing = 300;
    const pathX = this.scale.width / 2;
    const pathWidth = 160;
    const mapHeight = numLevels * verticalSpacing;

    this.maxLevel =
      parseInt(localStorage.getItem("NumberKigdom_maxLevel")) || 1;

    this.cameras.main.setBounds(0, 0, this.scale.width, mapHeight);

    // -- Background --
    const bg = this.add.tileSprite(
      this.scale.width / 2,
      mapHeight / 2,
      this.scale.width,
      mapHeight,
      "meadow"
    );
    bg.setDepth(-10);

    // -- Vertical path --
    const path = this.add.graphics();
    path.fillStyle(0xc2a878, 1);
    path.fillRect(pathX - pathWidth / 2, 0, pathWidth, mapHeight);
    path.setDepth(-5);

    // -- Generate fancy level node textures --
    this.createFancyNodeTextures();

    // -- Place level nodes --
    for (let i = 0; i < numLevels; i++) {
      const y = mapHeight - i * verticalSpacing - 150;

      let textureKey;
      if (i + 1 <= this.maxLevel) {
        textureKey = "nodeUnlocked";
      } else {
        textureKey = "nodeLocked";
      }

      const outerRadius = 120;

      const levelNode = this.add
        .image(pathX, y, textureKey)
        .setDisplaySize(outerRadius * 2, outerRadius * 2)
        .setDepth(2)
        .setInteractive();

      const label = this.add
        .text(pathX, y, (i + 1).toString(), {
          fontSize: "36px",
          fontFamily: "Comic Sans MS",
          color: "#222222",
          stroke: "#ffffff",
          strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(3);

      levelNode.on("pointerup", () => {
        if (i + 1 <= this.maxLevel) {
          this.scene.start("DialogueScene", {
            dialogues: levelData[i + 1].scenes.map((scene) => ({
              background: scene.background,
              text: scene.text,
            })),
            nextScene: "MiniGameScene",
            levelNumber: i + 1,
          });
        }
      });
    }

    // -- Scroll to bottom initially --
    this.cameras.main.scrollY = mapHeight - this.scale.height;

    // -- Scrolling controls --
    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.cameras.main.scrollY -= pointer.velocity.y / 5;
        this.limitScroll(mapHeight);
      }
    });

    this.game.canvas.addEventListener(
      "wheel",
      (e) => {
        this.cameras.main.scrollY += e.deltaY * 2;
        this.limitScroll(mapHeight);
        e.preventDefault();
      },
      { passive: false }
    );

    this.input.keyboard.on("keydown-UP", () => {
      this.cameras.main.scrollY -= 50;
      this.limitScroll(mapHeight);
    });

    this.input.keyboard.on("keydown-DOWN", () => {
      this.cameras.main.scrollY += 50;
      this.limitScroll(mapHeight);
    });
  }

  createFancyNodeTextures() {
    const innerRadius = 80;
    const outerRadius = 120;

    // -------- UNLOCKED NODE ---------
    const canvas1 = document.createElement("canvas");
    canvas1.width = outerRadius * 2;
    canvas1.height = outerRadius * 2;
    const ctx1 = canvas1.getContext("2d");

    // Outer glow gradient
    const glowGradient = ctx1.createRadialGradient(
      outerRadius,
      outerRadius,
      innerRadius,
      outerRadius,
      outerRadius,
      outerRadius
    );
    glowGradient.addColorStop(0, "rgba(255, 217, 61, 0.4)");
    glowGradient.addColorStop(1, "rgba(255, 217, 61, 0)");

    ctx1.fillStyle = glowGradient;
    ctx1.beginPath();
    ctx1.arc(outerRadius, outerRadius, outerRadius, 0, Math.PI * 2);
    ctx1.fill();

    // Inner circle gradient
    const gradient1 = ctx1.createRadialGradient(
      outerRadius,
      outerRadius,
      innerRadius * 0.2,
      outerRadius,
      outerRadius,
      innerRadius
    );
    gradient1.addColorStop(0, "#ffff99");
    gradient1.addColorStop(1, "#ffaa00");

    ctx1.fillStyle = gradient1;
    ctx1.beginPath();
    ctx1.arc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2);
    ctx1.fill();

    // Gloss highlight
    ctx1.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx1.beginPath();
    ctx1.ellipse(
      outerRadius,
      outerRadius - 20,
      innerRadius * 1.2,
      innerRadius * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx1.fill();

    // Stroke
    ctx1.lineWidth = 10;
    ctx1.strokeStyle = "#8b5a2b";
    ctx1.beginPath();
    ctx1.arc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2);
    ctx1.stroke();

    this.textures.addCanvas("nodeUnlocked", canvas1);

    // -------- LOCKED NODE ---------
    const canvas2 = document.createElement("canvas");
    canvas2.width = outerRadius * 2;
    canvas2.height = outerRadius * 2;
    const ctx2 = canvas2.getContext("2d");

    // Outer glow gradient
    const glowGradient2 = ctx2.createRadialGradient(
      outerRadius,
      outerRadius,
      innerRadius,
      outerRadius,
      outerRadius,
      outerRadius
    );
    glowGradient2.addColorStop(0, "rgba(136, 136, 136, 0.3)");
    glowGradient2.addColorStop(1, "rgba(136, 136, 136, 0)");

    ctx2.fillStyle = glowGradient2;
    ctx2.beginPath();
    ctx2.arc(outerRadius, outerRadius, outerRadius, 0, Math.PI * 2);
    ctx2.fill();

    // Inner circle gradient
    const gradient2 = ctx2.createRadialGradient(
      outerRadius,
      outerRadius,
      innerRadius * 0.2,
      outerRadius,
      outerRadius,
      innerRadius
    );
    gradient2.addColorStop(0, "#cccccc");
    gradient2.addColorStop(1, "#666666");

    ctx2.fillStyle = gradient2;
    ctx2.beginPath();
    ctx2.arc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2);
    ctx2.fill();

    ctx2.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx2.beginPath();
    ctx2.ellipse(
      outerRadius,
      outerRadius - 20,
      innerRadius * 1.2,
      innerRadius * 0.6,
      0,
      0,
      Math.PI * 2
    );
    ctx2.fill();

    ctx2.lineWidth = 10;
    ctx2.strokeStyle = "#333333";
    ctx2.beginPath();
    ctx2.arc(outerRadius, outerRadius, innerRadius, 0, Math.PI * 2);
    ctx2.stroke();

    this.textures.addCanvas("nodeLocked", canvas2);
  }

  // Limit camera scroll to prevent going out of bounds
  limitScroll(mapHeight) {
    const cam = this.cameras.main;
    cam.scrollY = Phaser.Math.Clamp(
      cam.scrollY,
      0,
      mapHeight - this.scale.height
    );
  }
}
