// helpers/GridHelper.js

export function calculateCardLayout(scene, gridCols, gridRows, originalWidth, originalHeight, uiPanelHeight) {
  const availableWidth = scene.scale.width;
  const availableHeight = scene.scale.height - uiPanelHeight;

  let spacingX = 20;
  let spacingY = 20;

  const idealTotalWidth =
    gridCols * originalWidth + (gridCols + 1) * spacingX;
  const idealTotalHeight =
    gridRows * originalHeight + (gridRows + 1) * spacingY;

  let scaleFactor = 1;

  if (
    idealTotalWidth > availableWidth ||
    idealTotalHeight > availableHeight
  ) {
    const scaleX = availableWidth / idealTotalWidth;
    const scaleY = availableHeight / idealTotalHeight;
    scaleFactor = Math.min(scaleX, scaleY);
  }

  const cardWidth = originalWidth * scaleFactor;
  const cardHeight = originalHeight * scaleFactor;
  spacingX *= scaleFactor;
  spacingY *= scaleFactor;

  return {
    cardWidth,
    cardHeight,
    spacingX,
    spacingY
  };
}
