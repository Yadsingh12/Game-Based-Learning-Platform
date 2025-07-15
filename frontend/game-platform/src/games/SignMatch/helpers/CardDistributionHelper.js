/**
 * Animates card containers flying outward to their positions.
 * @param {Phaser.Scene} scene
 * @param {Array} cardEntries
 * @param {number} originX
 * @param {number} originY
 * @param {number} delayStep
 */
export function animateCardDistribution(
  scene,
  cardEntries,
  originX,
  originY,
  delayStep = 100
) {
  cardEntries.forEach((entry, index) => {
    const { card, targetX, targetY } = entry;

    card.setPosition(originX, originY);
    card.setAlpha(0);

    scene.tweens.add({
      targets: card,
      x: targetX,
      y: targetY,
      alpha: 1,
      ease: "Back.Out",
      duration: 500,
      delay: index * delayStep,
    });
  });
}
