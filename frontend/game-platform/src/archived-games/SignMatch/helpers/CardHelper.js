// /src/helpers/CardHelper.js

export function createCardContainer(scene, x, y, cardData, width, height) {
  const container = scene.add.container(x, y + height / 2);
  container.setSize(width, height);

  container.setInteractive(
    new Phaser.Geom.Rectangle(0, 0, width, height),
    Phaser.Geom.Rectangle.Contains
  );

  const back = scene.add.image(0, 0, "card_back").setDisplaySize(width, height);
  container.add(back);

  container.backImage = back;
  container.cardData = cardData;
  container.isFlipped = false;

  container.on("pointerup", () => {
    scene.flipCard(container);
  });

  return container;
}
