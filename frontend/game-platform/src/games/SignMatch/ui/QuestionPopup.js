// /src/ui/Popup.js

export class QuestionPopup {
  constructor(scene) {
    this.scene = scene;
  }

  showQuestion(foodCardData, onClose = () => {}) {
    const randomQuestion = Phaser.Utils.Array.GetRandom(foodCardData.questions);

    this.popupBg = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      this.scene.scale.width,
      this.scene.scale.height,
      0x000000,
      0.6
    ).setDepth(1000);

    const boxWidth = 800;
    const boxHeight = 600;

    this.popupBox = this.scene.add.rectangle(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2,
      boxWidth,
      boxHeight,
      0xffffff
    )
    .setStrokeStyle(4, 0x333333)
    .setOrigin(0.5, 0.5)
    .setDepth(1001);

    this.popupQuestion = this.scene.add.text(
      this.scene.scale.width / 2,
      this.scene.scale.height / 2 - boxHeight / 2 + 60,
      randomQuestion.question,
      {
        fontSize: "28px",
        color: "#333",
        wordWrap: { width: boxWidth - 80 },
        align: "center",
      }
    )
    .setOrigin(0.5, 0.5)
    .setDepth(1001);

    this.popupImage = this.scene.add.image(
      this.scene.scale.width / 2,
      this.popupQuestion.y + this.popupQuestion.height + 20,
      foodCardData.textureKey
    )
    .setOrigin(0.5, 0)
    .setDepth(1001);

    const maxImageWidth = 400;
    const maxImageHeight = 200;

    if (this.popupImage.width > maxImageWidth) {
      this.popupImage.setDisplaySize(
        maxImageWidth,
        this.popupImage.height * (maxImageWidth / this.popupImage.width)
      );
    }
    if (this.popupImage.height > maxImageHeight) {
      this.popupImage.setDisplaySize(
        this.popupImage.width * (maxImageHeight / this.popupImage.height),
        maxImageHeight
      );
    }

    let optionsStartY = this.popupImage.y + this.popupImage.displayHeight + 50;
    const shuffledOptions = Phaser.Utils.Array.Shuffle([...randomQuestion.options]);

    this.optionTexts = [];

    shuffledOptions.forEach((optionText, index) => {
      const optionButton = this.scene.add.text(
        this.scene.scale.width / 2,
        optionsStartY + index * 55,
        optionText,
        {
          fontSize: "28px",
          backgroundColor: "#dddddd",
          color: "#333",
          padding: { left: 20, right: 20, top: 10, bottom: 10 },
          align: "center",
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(1001)
      .setInteractive({ useHandCursor: true });

      optionButton.on("pointerup", () => {
        if (optionText === randomQuestion.correct) {
          this.scene.score += 5;
          this.scene.scoreText.setText(`Score: ${this.scene.score}`);
          optionButton.setBackgroundColor("#00ff00");
          this.scene.time.delayedCall(1000, () => {
            this.hideQuestionPopup();
            onClose();
          });
        } else {
          optionButton.setBackgroundColor("#ff6666");
          this.scene.time.delayedCall(1000, () => {
            optionButton.setBackgroundColor("#dddddd");
          });
          this.scene.score -= 5;
          this.scene.scoreText.setText(`Score: ${this.scene.score}`);
        }
      });

      this.optionTexts.push(optionButton);
    });
  }

  hideQuestionPopup() {
    this.popupBg.destroy();
    this.popupBox.destroy();
    this.popupQuestion.destroy();
    this.popupImage.destroy();
    this.optionTexts.forEach(btn => btn.destroy());
    this.optionTexts = [];
  }
}
