// /src/helpers/StarHelper.js

export function calculateStars(scene) {
  const maxStars = 5;
  let stars = [false, false, false, false, false];
  let starsAchieved = 0;

  if (scene.mode === "matchAll") {
    const allMatched = scene.cards.every((c) => !c.active);
    const timeRatio = scene.remainingTime / scene.maxTime;

    let maxScore = 80;
    if (scene.gridRows === 2 && scene.gridCols === 4) maxScore = 40;
    if (scene.gridRows === 2 && scene.gridCols === 2) maxScore = 20;

    const scoreRatio = Math.min(scene.score / maxScore, 1);

    if (timeRatio > 0.1 || scoreRatio > 0.5) starsAchieved++;
    if (timeRatio > 0.2 || scoreRatio > 0.7) starsAchieved++;
    if (timeRatio > 0.3 || scoreRatio > 0.9) starsAchieved++;
    if (timeRatio > 0.4 || scoreRatio >= 1) starsAchieved++;
    if (allMatched) starsAchieved++;
  } else if (scene.mode === "cardRush") {
    if (scene.score >= 50) starsAchieved++;
    if (scene.score >= 75) starsAchieved++;
    if (scene.score >= 100) starsAchieved++;
    if (scene.score >= 125) starsAchieved++;
    if (scene.score >= 150) starsAchieved++;
  }

  for (let i = 0; i < starsAchieved && i < maxStars; i++) {
    stars[i] = true;
  }
  return stars;
}

export function saveStars(scene, starCount) {
  let storedStars = localStorage.getItem("SignMatchStars");
  let starsData = storedStars
    ? JSON.parse(storedStars)
    : { "2×2": 0, "2×4": 0, "4×4": 0, "Card\nRush": 0 };

  let modeLabel = "";

  if (scene.mode === "matchAll") {
    modeLabel = `${scene.gridRows}×${scene.gridCols}`;
  } else if (scene.mode === "cardRush") {
    modeLabel = "Card\nRush";
  }

  if (modeLabel) {
    if (!starsData[modeLabel] || starCount > starsData[modeLabel]) {
      starsData[modeLabel] = starCount;
      localStorage.setItem("SignMatchStars", JSON.stringify(starsData));
    }
  }
}
