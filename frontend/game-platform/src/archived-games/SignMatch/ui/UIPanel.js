// /src/ui/UIPanel.js

export class UIPanel {
  constructor(scene, height) {
    this.scene = scene;
    this.height = height;
    this.create();
  }

  create() {
    this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.height / 2,
      this.scene.scale.width,
      this.height,
      0xeeeeee
    ).setOrigin(0.5, 0.5);
  }
}
