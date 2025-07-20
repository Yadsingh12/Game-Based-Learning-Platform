class IndiaMapScene extends Phaser.Scene {
  preload() {
    this.load.image('indiaMap', 'assets/india_map.png');
    this.load.image('hitmap', 'assets/india_hitmap.png');
  }

  create() {
    this.add.image(0, 0, 'indiaMap').setOrigin(0);
    const hitSrc = this.textures.get('hitmap').getSourceImage();
    const hitCanvas = this.textures.createCanvas('hitmapCanvas', hitSrc.width, hitSrc.height);
    hitCanvas.draw(0, 0, hitSrc);

    // Map of hitmap hex colors → state names
    const stateColorMap = {
      '#010101': 'Andhra Pradesh',
      '#020202': 'Arunachal Pradesh',
      // ...each state
    };

    this.input.on('pointerdown', pointer => {
      const x = Phaser.Math.Clamp(pointer.x, 0, hitCanvas.width - 1);
      const y = Phaser.Math.Clamp(pointer.y, 0, hitCanvas.height - 1);
      const px = hitCanvas.getPixel(x, y);
      const hex = Phaser.Display.Color.RGBToString(px.r, px.g, px.b, 0, '#');
      const st = stateColorMap[hex];
      if (st) {
        console.log('Clicked state:', st);
        // TODO: trigger state-specific logic here
      } else {
        console.log('Clicked outside any state');
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 900,
  scene: [IndiaMapScene]
};

new Phaser.Game(config);
