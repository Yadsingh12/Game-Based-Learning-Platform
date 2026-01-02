import Phaser from "phaser";

import {
  easyQuestions,
  mediumQuestions,
  hardQuestions,
} from "../data/questions.js";

const BOARD_SIZE = 10;
const TILE_SIZE = 64;
const BOARD_WIDTH = BOARD_SIZE * TILE_SIZE;
const BOARD_HEIGHT = BOARD_SIZE * TILE_SIZE;

// prettier colors: [tokenColors], [bgColors]
const colors = [
  [0xff0000, 0x00ff00, 0x0000ff, 0xffff00],
  [0xffcccc, 0xccffcc, 0xccccff, 0xffffcc],
];

let tilePositions = {};
let tokens = [];
let currentTile = [];
let currentPlayer = 0;
let numberOfPlayers;
let moving = false;

let diceSprites = [];
let isBot = [];
let tileQuestions = {}; // tile → question difficulty

export default class SignsAndLaddersScene extends Phaser.Scene {
  constructor() {
    super("SignsAndLaddersScene");
  }

  preload() {
    this.load.spritesheet(
      "dice",
      "/assets/SnakeAndLadders/DicePack/DiceSprSheetX64.png",
      { frameWidth: 64, frameHeight: 64 }
    );
  }

  create(data) {
    const { humans = 2, bots = 0 } = data;
    numberOfPlayers = humans + bots;

    isBot = Array.from({ length: numberOfPlayers }, (_, i) => i >= humans);

    this.assignQuestionTiles();
    this.createBoard();

    // Turn indicator above the board
    this.turnText = this.add
      .text(
        this.scale.width / 2,
        (this.scale.height - BOARD_HEIGHT) / 2 - 40,
        "",
        {
          font: "28px Arial",
          fontStyle: "bold",
          color: "#000",
          backgroundColor: "#fff",
          padding: { left: 12, right: 12, top: 6, bottom: 6 },
        }
      )
      .setOrigin(0.5);

    this.createPlayerTokens(numberOfPlayers);
    this.createPlayerAreas();

    this.updateTurnDisplay();
    this.checkBotTurn();
  }

  update() { }

  // Utility: returns a color-based label
  getPlayerLabel(i) {
    const colorNames = ["Red", "Green", "Blue", "Yellow"];
    const emoji = isBot[i] ? "🤖" : "👤";
    return `${emoji} ${colorNames[i]}`;
  }

  createBoard() {
    const offsetX = (this.scale.width - BOARD_WIDTH) / 2;
    const offsetY = (this.scale.height - BOARD_HEIGHT) / 2;

    let num = 1;
    for (let row = 0; row < BOARD_SIZE; row++) {
      let cols = [...Array(BOARD_SIZE).keys()];
      if (row % 2) cols.reverse();

      for (let col of cols) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + (BOARD_SIZE - row - 1) * TILE_SIZE + TILE_SIZE / 2;
        tilePositions[num] = { x, y };

        // tile colors
        const hasQ = tileQuestions[num];
        const tileColor = hasQ ? 0xffffff : 0xffb7ce;
        this.add
          .rectangle(x, y, TILE_SIZE, TILE_SIZE, tileColor)
          .setStrokeStyle(1, 0x999999);

        if (num === 100) {
          this.add
            .rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xffffff)
            .setStrokeStyle(2, 0x000000);
          this.add
            .text(x, y, "🏆", { font: "24px Arial", color: "#000" })
            .setOrigin(0.5);
        } else if (hasQ) {
          this.add
            .text(x, y, "✘", { font: "20px Arial", color: "#000" })
            .setOrigin(0.5);
        } else {
          this.add
            .text(x, y, `${num}`, { font: "20px Arial", color: "#000" })
            .setOrigin(0.5);
        }

        num++;
      }
    }
  }

  assignQuestionTiles() {
    // exclude 100 from question tiles
    const numbers = Phaser.Utils.Array.Shuffle(
      [...Array(99).keys()].map((i) => i + 1)
    );
    numbers.slice(0, 20).forEach((n) => {
      tileQuestions[n] = n <= 30 ? "easy" : n <= 70 ? "medium" : "hard";
    });
  }

  createPlayerTokens(count) {
    tokens = [];
    currentTile = Array(count).fill(1);
    for (let i = 0; i < count; i++) {
      const token = this.add.circle(0, 0, TILE_SIZE / 3, colors[0][i]);
      tokens.push(token);
      this.moveTokenToTile(i, 1);
    }
  }

  createPlayerAreas() {
    const positions = [
      { x: 70, y: 70 },
      { x: this.scale.width - 70, y: 70 },
      { x: 70, y: this.scale.height - 70 },
      { x: this.scale.width - 70, y: this.scale.height - 70 },
    ];

    diceSprites = [];
    positions.forEach((pos, i) => {
      if (i >= numberOfPlayers) return;

      this.add
        .rectangle(pos.x, pos.y, 140, 140, colors[0][i], 0.3)
        .setStrokeStyle(2, 0x777777);

      this.add
        .text(pos.x, pos.y - 55, this.getPlayerLabel(i), {
          font: "16px Arial",
          color: "#000",
        })
        .setOrigin(0.5);

      const dice = this.add
        .sprite(pos.x, pos.y + 10, "dice", 0)
        .setScale(1.2)
        .setInteractive();

      dice.on("pointerdown", () => {
        if (!moving && currentPlayer === i) {
          this.rollDiceAnimated(i, (roll) => this.handleMove(roll));
        }
      });

      diceSprites.push(dice);
    });
  }

  updateTurnDisplay() {
    const label = this.getPlayerLabel(currentPlayer) + "'s Turn";
    this.turnText.setText(label);
    this.cameras.main.setBackgroundColor(colors[1][currentPlayer]);

    diceSprites.forEach((d, i) => {
      const active = i === currentPlayer && !isBot[i];
      d.setAlpha(active ? 1 : 0.4);
      d.setInteractive(active);
    });
  }

  checkBotTurn() {
    if (isBot[currentPlayer]) {
      this.time.delayedCall(800, () => {
        this.rollDiceAnimated(currentPlayer, (roll) => this.handleMove(roll));
      });
    }
  }

  rollDiceAnimated(playerIndex, callback) {
    const sprite = diceSprites[playerIndex];
    const duration = 800;
    const interval = 80;
    const timer = this.time.addEvent({
      delay: interval,
      callback: () => sprite.setFrame(Phaser.Math.Between(0, 5)),
      repeat: duration / interval - 1,
    });

    this.time.delayedCall(duration, () => {
      const finalRoll = Phaser.Math.Between(1, 6);
      sprite.setFrame(finalRoll - 1);
      timer.remove(false);
      callback(finalRoll);
    });
  }

  moveTokenToTile(i, tile) {
    const p = tilePositions[tile];
    if (p) {
      tokens[i].x = p.x + i * 5;
      tokens[i].y = p.y + i * 5;
    }
  }

  handleMove(steps) {
    const idx = currentPlayer;
    const current = currentTile[idx];
    const target = current + steps;

    if (target > 100) {
      return this.endTurn(); // skip if roll overshoots
    }

    moving = true;
    this.tweenMoveToken(idx, current, target, () => {
      this.handleTileEffect(idx, target);
    });
  }

  handleTileEffect(playerIdx, tile) {
    currentTile[playerIdx] = tile;
    moving = false;

    if (tile === 100) {
      return this.showGameOver();
    }

    if (tileQuestions[tile]) {
      const diff = tileQuestions[tile];
      this.showQuestionPopup(diff, playerIdx, (correct) => {
        const offset = correct ? 3 : -2;
        const nextTile = Phaser.Math.Clamp(
          currentTile[playerIdx] + offset,
          1,
          100
        );

        moving = true;
        this.tweenMoveToken(playerIdx, tile, nextTile, () => {
          this.handleTileEffect(playerIdx, nextTile); // 🔁 Recursive check
        });
      });
    } else {
      this.endTurn();
    }
  }

  endTurn() {
    currentPlayer = (currentPlayer + 1) % numberOfPlayers;
    this.updateTurnDisplay();
    this.checkBotTurn();
  }

  tweenMoveToken(i, from, to, cb) {
    const step = from < to ? 1 : -1;
    const path = [];
    for (let t = from + step; step > 0 ? t <= to : t >= to; t += step) {
      path.push(t);
    }

    const moveNext = () => {
      if (!path.length) return cb && cb();
      const next = path.shift();
      this.tweens.add({
        targets: tokens[i],
        x: tilePositions[next].x + i * 5,
        y: tilePositions[next].y + i * 5,
        duration: 200,
        onComplete: moveNext,
      });
    };

    moveNext();
  }

  showQuestionPopup(d, playerIdx, cb) {
    const pool =
      d === "easy"
        ? easyQuestions
        : d === "medium"
          ? mediumQuestions
          : hardQuestions;
    const q = Phaser.Utils.Array.GetRandom(pool);

    const bg = this.add
      .rectangle(
        this.scale.width / 2,
        this.scale.height / 2,
        500,
        300,
        0xffffff,
        0.9
      )
      .setStrokeStyle(3, 0x000);

    const txt = this.add
      .text(
        this.scale.width / 2,
        this.scale.height / 2 - 100,
        `${q.index}. ${q.question}`,
        { font: "20px Arial", color: "#000", wordWrap: { width: 450 } }
      )
      .setOrigin(0.5);

    const buttons = [];
    q.options.forEach((opt, i) => {
      const btn = this.add
        .rectangle(
          this.scale.width / 2,
          this.scale.height / 2 - 40 + i * 50,
          400,
          40,
          0xeeeeee
        )
        .setStrokeStyle(2, 0x333)
        .setInteractive();

      const lbl = this.add
        .text(btn.x, btn.y, opt, { font: "18px Arial", color: "#000" })
        .setOrigin(0.5);

      btn.on("pointerdown", () => {
        bg.destroy();
        txt.destroy();
        buttons.forEach((b) => {
          b.btn.destroy();
          b.lbl.destroy();
        });

        cb && cb(i === q.answer);
      });

      buttons.push({ btn, lbl });
    });

    if (isBot[playerIdx]) {
      this.time.delayedCall(1500, () => {
        let choice;

        if (Math.random() < 0.5) {
          // 50% chance to choose the correct answer
          choice = q.answer;
        } else {
          // Choose a wrong answer (but not the correct one)
          const wrongOptions = q.options
            .map((_, idx) => idx)
            .filter(idx => idx !== q.answer);

          choice = Phaser.Utils.Array.GetRandom(wrongOptions);
        }

        buttons[choice].btn.emit("pointerdown");
      });
    }

  }

  showGameOver() {
    this.cameras.main.setBackgroundColor(0xffffff);

    const ranks = currentTile
      .map((pos, idx) => ({ idx, pos }))
      .sort((a, b) => b.pos - a.pos);

    let msg = "Game Over!\n\n🏆 Rankings:\n";
    ranks.forEach((p, i) => {
      msg += `${i + 1}. ${this.getPlayerLabel(p.idx)} (Tile ${p.pos})\n`;
    });

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .rectangle(centerX, centerY, 500, 300, 0xffffff, 0.9)
      .setStrokeStyle(3, 0x000);

    this.add
      .text(centerX, centerY - 80, msg, {
        font: "20px Arial",
        color: "#000",
        align: "center",
        wordWrap: { width: 460 },
      })
      .setOrigin(0.5);

    // Retake button
    const retakeBtn = this.add
      .rectangle(centerX - 100, centerY + 100, 120, 40, 0xcccccc)
      .setInteractive()
      .setStrokeStyle(2, 0x000);

    this.add
      .text(retakeBtn.x, retakeBtn.y, "🔄 Retake", {
        font: "18px Arial",
        color: "#000",
      })
      .setOrigin(0.5);

    retakeBtn.on("pointerdown", () => {
      this.scene.restart();
    });

    // Main Menu button
    const menuBtn = this.add
      .rectangle(centerX + 100, centerY + 100, 120, 40, 0xcccccc)
      .setInteractive()
      .setStrokeStyle(2, 0x000);

    this.add
      .text(menuBtn.x, menuBtn.y, "🏠 Menu", {
        font: "18px Arial",
        color: "#000",
      })
      .setOrigin(0.5);

    menuBtn.on("pointerdown", () => {
      this.scene.start("SetUpScene");
    });

    moving = true;
  }
}
