import Phaser from "phaser";

const BOARD_SIZE = 10;
const TILE_SIZE = 64;
const BOARD_WIDTH = BOARD_SIZE * TILE_SIZE;
const BOARD_HEIGHT = BOARD_SIZE * TILE_SIZE;

let tilePositions = {};
let tokens = [];
let currentTile = [];
let currentPlayer = 0;
let numberOfPlayers = 0;
let moving = false;

let diceSprites = [];
let turnText;
let isBot = [];

export default class SignsAndLaddersScene extends Phaser.Scene {
  constructor() {
    super("SignsAndLaddersScene");
  }

  preload() {
    this.load.spritesheet(
      "dice",
      "/assets/SnakeAndLadders/DicePack/DiceSprSheetX64.png",
      {
        frameWidth: 64,
        frameHeight: 64
      }
    );
  }

  create(data) {
    const { humans, bots } = data;
    const numHumans = humans ?? 4;
    const numBots = bots ?? 0;

    numberOfPlayers = numHumans + numBots;

    isBot = [];
    for (let i = 0; i < numberOfPlayers; i++) {
      isBot.push(i >= numHumans);
    }

    this.add.text(
      this.scale.width / 2,
      20,
      "Signs & Ladders",
      {
        font: "32px Arial",
        color: "#333"
      }
    ).setOrigin(0.5, 0);

    this.createBoard();

    this.createPlayerTokens(numberOfPlayers);

    this.createPlayerAreas();

    this.updateTurnDisplay();

    this.checkBotTurn();
  }

  update() {}

  createBoard() {
    const offsetX = (this.scale.width - BOARD_WIDTH) / 2;
    const offsetY = (this.scale.height - BOARD_HEIGHT) / 2;

    let tileNumber = 1;

    for (let row = 0; row < BOARD_SIZE; row++) {
      let cols = [...Array(BOARD_SIZE).keys()];
      if (row % 2 === 1) cols.reverse();

      for (let col of cols) {
        const x = offsetX + col * TILE_SIZE + TILE_SIZE / 2;
        const y = offsetY + (BOARD_SIZE - row - 1) * TILE_SIZE + TILE_SIZE / 2;

        tilePositions[tileNumber] = { x, y };

        this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, 0xf8f8f8)
          .setStrokeStyle(1, 0xaaaaaa);

        this.add.text(x - 20, y - 10, `${tileNumber}`, {
          font: "14px Arial",
          color: "#555"
        });

        tileNumber++;
      }
    }
  }

  createPlayerTokens(count) {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
    tokens = [];
    currentTile = [];

    for (let i = 0; i < count; i++) {
      const token = this.add.circle(0, 0, TILE_SIZE / 3, colors[i]);
      tokens.push(token);
      currentTile.push(1);
      this.moveTokenToTile(i, 1);
    }
  }

  createPlayerAreas() {
    const corners = [
      { x: 70, y: 70, color: 0xffcccc, label: "Player 1" },
      { x: this.scale.width - 70, y: 70, color: 0xccffcc, label: "Player 2" },
      { x: 70, y: this.scale.height - 70, color: 0xccccff, label: "Player 3" },
      { x: this.scale.width - 70, y: this.scale.height - 70, color: 0xffffcc, label: "Player 4" }
    ];

    diceSprites = [];

    corners.forEach((corner, index) => {
      if (index >= numberOfPlayers) return;

      const area = this.add.rectangle(corner.x, corner.y, 140, 140, corner.color, 0.3)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x888888);

      let label = isBot[index] ? `🤖 Bot ${index + 1}` : `🧑 Player ${index + 1}`;

      this.add.text(corner.x, corner.y - 55, label, {
        font: "16px Arial",
        color: "#000"
      }).setOrigin(0.5);

      // Dice sprite (clickable)
      const diceSprite = this.add.sprite(corner.x, corner.y + 10, "dice", 0)
        .setScale(1.2)
        .setInteractive();

      diceSprite.on("pointerdown", () => {
        if (moving) return;
        if (currentPlayer !== index) return;

        this.rollDiceAnimated(index, (roll) => {
          this.handleMove(roll);
        });
      });

      diceSprites.push(diceSprite);
    });

    turnText = this.add.text(
      this.scale.width / 2,
      this.scale.height - 30,
      "",
      {
        font: "20px Arial",
        color: "#333",
        backgroundColor: "#eee",
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }
    ).setOrigin(0.5);
  }

  updateTurnDisplay() {
    let label = isBot[currentPlayer]
      ? `🤖 Bot ${currentPlayer + 1}'s Turn`
      : `🎯 Player ${currentPlayer + 1}'s Turn`;

    turnText.setText(label);

    diceSprites.forEach((diceSprite, i) => {
      const active = i === currentPlayer && !isBot[i];
      diceSprite.setAlpha(active ? 1 : 0.4);
      diceSprite.setInteractive(active);
    });
  }

  checkBotTurn() {
    if (isBot[currentPlayer]) {
      this.time.delayedCall(1000, () => {
        this.rollDiceAnimated(currentPlayer, (roll) => {
          this.handleMove(roll);
        });
      });
    }
  }

  rollDiceAnimated(playerIndex, callback) {
    const diceSprite = diceSprites[playerIndex];

    const duration = 1000;
    const interval = 80;

    const diceInterval = this.time.addEvent({
      delay: interval,
      callback: () => {
        const tempRoll = Phaser.Math.Between(0, 5);
        diceSprite.setFrame(tempRoll);
      },
      repeat: Math.floor(duration / interval) - 1
    });

    this.time.delayedCall(duration, () => {
      const finalRoll = Phaser.Math.Between(1, 6);
      diceSprite.setFrame(finalRoll - 1);
      diceInterval.remove(false);

      if (callback) callback(finalRoll);
    });
  }

  moveTokenToTile(playerIndex, tile) {
    const pos = tilePositions[tile];
    if (!pos) return;

    tokens[playerIndex].x = pos.x + (playerIndex * 5);
    tokens[playerIndex].y = pos.y + (playerIndex * 5);
  }

  handleMove(steps) {
    const playerIndex = currentPlayer;
    let targetTile = currentTile[playerIndex] + steps;
    if (targetTile > 100) targetTile = 100;

    moving = true;

    this.tweenMoveToken(playerIndex, currentTile[playerIndex], targetTile, () => {
      currentTile[playerIndex] = targetTile;
      moving = false;

      currentPlayer = (currentPlayer + 1) % numberOfPlayers;
      this.updateTurnDisplay();

      this.checkBotTurn();
    });
  }

  tweenMoveToken(playerIndex, startTile, endTile, onComplete) {
    let tilePath = [];
    for (let i = startTile + 1; i <= endTile; i++) {
      tilePath.push(i);
    }

    const nextMove = () => {
      if (tilePath.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      const nextTile = tilePath.shift();
      const pos = tilePositions[nextTile];

      this.tweens.add({
        targets: tokens[playerIndex],
        x: pos.x + (playerIndex * 5),
        y: pos.y + (playerIndex * 5),
        duration: 300,
        onComplete: nextMove
      });
    };

    nextMove();
  }
}
