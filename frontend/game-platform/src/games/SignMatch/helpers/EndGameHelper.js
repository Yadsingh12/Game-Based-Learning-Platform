// helpers/EndGameHelper.js

import { calculateStars, saveStars } from "./StarHelper.js";

export function showEndGamePopup(scene, score) {
  // overlay
  scene.endBg = scene.add
    .rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      0.6
    )
    .setDepth(2000);

  const boxWidth = 800;
  const boxHeight = 500;

  scene.endBox = scene.add
    .rectangle(
      scene.scale.width / 2,
      scene.scale.height / 2,
      boxWidth,
      boxHeight,
      0xffffff
    )
    .setStrokeStyle(4, 0x333333)
    .setOrigin(0.5, 0.5)
    .setDepth(2001);

  scene.add
    .text(
      scene.scale.width / 2,
      scene.scale.height / 2 - boxHeight / 2 + 50,
      "Game Over",
      {
        fontSize: "48px",
        color: "#333",
        fontStyle: "bold",
      }
    )
    .setOrigin(0.5, 0.5)
    .setDepth(2001);

  scene.add
    .text(
      scene.scale.width / 2,
      scene.scale.height / 2 - 50,
      `Your Score: ${score}`,
      {
        fontSize: "36px",
        color: "#333",
      }
    )
    .setOrigin(0.5, 0.5)
    .setDepth(2001);

  const stars = calculateStars(scene);
  const starSpacing = 80;
  const startX =
    scene.scale.width / 2 - (starSpacing * (stars.length - 1)) / 2;

  stars.forEach((isFilled, index) => {
    const starColor = isFilled ? 0xffd700 : 0xcccccc;
    scene.add
      .star(
        startX + index * starSpacing,
        scene.scale.height / 2 + 50,
        5,
        20,
        40,
        starColor
      )
      .setDepth(2001);
  });

  saveStars(scene, stars.filter((s) => s).length);

  const buttonY = scene.scale.height / 2 + 150;

  const menuButton = scene.add
    .text(scene.scale.width / 2 - 150, buttonY, "Main Menu", {
      fontSize: "32px",
      backgroundColor: "#dddddd",
      color: "#333",
      padding: { left: 30, right: 30, top: 15, bottom: 15 },
    })
    .setOrigin(0.5, 0.5)
    .setDepth(2001)
    .setInteractive({ useHandCursor: true });

  menuButton.on("pointerup", () => {
    scene.scene.start("StartMenuScene");
  });

  const restartButton = scene.add
    .text(scene.scale.width / 2 + 150, buttonY, "Restart", {
      fontSize: "32px",
      backgroundColor: "#dddddd",
      color: "#333",
      padding: { left: 30, right: 30, top: 15, bottom: 15 },
    })
    .setOrigin(0.5, 0.5)
    .setDepth(2001)
    .setInteractive({ useHandCursor: true });

  restartButton.on("pointerup", () => {
    scene.scene.restart();
  });
}
