// helpers/AnimationHelper.js

export function createAnimations(scene, spritesheets) {
  spritesheets.forEach((sheet) => {
    const textureData = scene.textures.get(sheet.key);
    if (!textureData) {
      console.warn(`No texture data found for ${sheet.key}`);
      return;
    }

    const frameNames = Object.keys(textureData.frames);
    if (frameNames.length === 0) {
      console.warn(`No frames found in atlas for ${sheet.key}`);
      return;
    }

    scene.anims.create({
      key: `${sheet.key}_anim`,
      frames: frameNames.slice(1).map((name) => ({
        key: sheet.key,
        frame: name,
      })),
      repeat: -1,
      frameRate: 9,
    });

    console.log(`Created animation for ${sheet.key}:`, frameNames);
  });
}
