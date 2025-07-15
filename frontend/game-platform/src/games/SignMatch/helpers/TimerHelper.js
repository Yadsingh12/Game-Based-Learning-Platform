// helpers/TimerHelper.js

export function startCountdown(scene, initialTime, onEnd) {
  scene.remainingTime = initialTime;

  scene.timerText = scene.add
    .text(20, 20, `Time: ${scene.remainingTime}`, {
      fontSize: "48px",
      color: "#333",
    })
    .setOrigin(0, 0);

  scene.time.addEvent({
    delay: 1000,
    callback: () => {
      scene.remainingTime--;
      scene.timerText.setText(`Time: ${scene.remainingTime}`);
      if (scene.remainingTime <= 0) {
        onEnd();
      }
    },
    repeat: -1,
  });
}
