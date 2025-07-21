import Phaser from "phaser";

export default class IndiaMapScene extends Phaser.Scene {
  constructor() {
    super({ key: "IndiaMapScene" });
  }

  preload() {
    this.load.svg("india", "assetsRecognizeState/india.svg"); // place india.svg in public/assets
  }

  create() {
    // Add SVG
    this.add.svg(this.cameras.main.centerX, this.cameras.main.centerY, "india")
      .setOrigin(0.5)
      .setInteractive()
      .setScale(1.5) // scale to fit your canvas
      .eachPath((path) => {
        const id = path.node.getAttribute("id");
        const title = path.node.getElementsByTagName("title")[0]?.textContent;

        if (stateData[id]) {
          const color = stateData[id].color;

          path.setFillStyle(Phaser.Display.Color.HexStringToColor(color).color);
          path.setInteractive();

          path.on("pointerover", () => {
            path.setAlpha(0.8);
          });
          path.on("pointerout", () => {
            path.setAlpha(1);
          });

          path.on("pointerdown", () => {
            this.showStateClicked(id, title || stateData[id].name);
          });
        }
      });
  }

  showStateClicked(id, name) {
    console.log("Clicked:", id, name);
    this.add.text(20, 20, `You clicked: ${name}`, {
      font: "24px Arial",
      fill: "#000",
      backgroundColor: "#fff"
    }).setDepth(100);
  }
}
