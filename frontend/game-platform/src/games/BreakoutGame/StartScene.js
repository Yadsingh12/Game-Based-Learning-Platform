// src/games/StartScene.js
import Phaser from 'phaser';

// Base dimensions for scaling UI elements in this scene
const BASE_GAME_WIDTH = 1600;
const BASE_GAME_HEIGHT = 900;

export default class StartScene extends Phaser.Scene {
    constructor() {
        super('StartScene');
        this.selectedDifficulty = 'medium'; // Default difficulty
        this.highScore = 0; // Will be loaded from local storage
        this.difficultyButtons = {}; // To store references to our custom buttons
    }

    preload() {
        // No plugins to preload as rexUI is removed
    }

    create(data) {
        // Retrieve high score passed from GamePlay.jsx
        this.highScore = data.highScore || 0;

        // Set background color
        this.cameras.main.setBackgroundColor('#1a202c');

        // Game Title
        this.add.text(this.game.config.width / 2, this.game.config.height * 0.2, 'Breakout Game', {
            fontFamily: 'Inter',
            fontSize: `${BASE_GAME_HEIGHT * 0.08}px`, // Scaled font size
            fill: '#63b3ed'
        }).setOrigin(0.5).setShadow(2, 2, 'rgba(0,0,0,0.3)', 0);

        // Welcome Message
        this.add.text(this.game.config.width / 2, this.game.config.height * 0.3, 'Break the bricks, catch the correct ISL number!', {
            fontFamily: 'Inter',
            fontSize: `${BASE_GAME_HEIGHT * 0.03}px`,
            fill: '#e2e8f0'
        }).setOrigin(0.5);

        // Difficulty Selection Label
        this.add.text(this.game.config.width / 2, this.game.config.height * 0.45, 'Select Difficulty:', {
            fontFamily: 'Inter',
            fontSize: `${BASE_GAME_HEIGHT * 0.035}px`,
            fill: '#a0aec0'
        }).setOrigin(0.5);

        // --- Custom Button Creation Function ---
        // Added a 'type' parameter to differentiate between difficulty and action buttons
        const createButton = (x, y, text, buttonType = 'difficulty', initialActive = false) => {
            const buttonWidth = this.game.config.width * 0.12; // Scaled width
            const buttonHeight = BASE_GAME_HEIGHT * 0.05; // Scaled height
            const borderRadius = 8;

            const bgColor = 0x4A5568; // Default background
            const activeColor = 0x9F7AEA; // Active background
            const hoverColor = 0x5A67D8; // Hover background

            const graphics = this.add.graphics();
            graphics.fillStyle(initialActive ? activeColor : bgColor, 1);
            graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);

            const buttonText = this.add.text(buttonWidth / 2, buttonHeight / 2, text, {
                fontFamily: 'Inter',
                fontSize: `${BASE_GAME_HEIGHT * 0.025}px`,
                fill: '#e2e8f0'
            }).setOrigin(0.5);

            const button = this.add.container(x - buttonWidth / 2, y - buttonHeight / 2, [graphics, buttonText]);
            button.setSize(buttonWidth, buttonHeight);
            button.setInteractive({ useHandCursor: true });

            button.on('pointerover', () => {
                if (buttonType === 'difficulty' && this.selectedDifficulty !== text.toLowerCase()) {
                    graphics.clear();
                    graphics.fillStyle(hoverColor, 1);
                    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
                } else if (buttonType === 'action') { // Hover for action buttons
                    graphics.clear();
                    graphics.fillStyle(hoverColor, 1);
                    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
                }
                button.setScale(1.05);
            });

            button.on('pointerout', () => {
                if (buttonType === 'difficulty') {
                    if (this.selectedDifficulty !== text.toLowerCase()) {
                        graphics.clear();
                        graphics.fillStyle(bgColor, 1);
                        graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
                    }
                } else if (buttonType === 'action') { // Revert color for action buttons
                    graphics.clear();
                    graphics.fillStyle(0x5A67D8, 1); // Revert to Start Game button's specific color
                    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
                }
                button.setScale(1);
            });

            button.on('pointerdown', () => {
                if (buttonType === 'difficulty') {
                    this.selectedDifficulty = text.toLowerCase();
                    updateButtonColors();
                }
                // Add a slight visual feedback for click
                graphics.clear();
                graphics.fillStyle(0x6B46C1, 1); // Darker purple for active click
                graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
            });

            button.on('pointerup', () => {
                // Revert to active color if selected, or default if not
                if (buttonType === 'difficulty') {
                    updateButtonColors();
                } else if (buttonType === 'action') {
                    graphics.clear();
                    graphics.fillStyle(0x5A67D8, 1); // Revert to Start Game button's specific color
                    graphics.fillRoundedRect(0, 0, buttonWidth, buttonHeight, borderRadius);
                }
            });

            return { graphics, text: buttonText, container: button };
        };

        // Difficulty Buttons
        this.difficultyButtons.easy = createButton(this.game.config.width / 2 - this.game.config.width * 0.15, this.game.config.height * 0.55, 'Easy', 'difficulty', false);
        this.difficultyButtons.medium = createButton(this.game.config.width / 2, this.game.config.height * 0.55, 'Medium', 'difficulty', true); // Default active
        this.difficultyButtons.hard = createButton(this.game.config.width / 2 + this.game.config.width * 0.15, this.game.config.height * 0.55, 'Hard', 'difficulty', false);

        const updateButtonColors = () => {
            const bgColor = 0x4A5568;
            const activeColor = 0x9F7AEA;

            for (const key in this.difficultyButtons) {
                const button = this.difficultyButtons[key];
                button.graphics.clear();
                if (this.selectedDifficulty === key) {
                    button.graphics.fillStyle(activeColor, 1);
                } else {
                    button.graphics.fillStyle(bgColor, 1);
                }
                button.graphics.fillRoundedRect(0, 0, button.container.width, button.container.height, 8);
            }
        };
        updateButtonColors(); // Set initial button colors

        // Start Game Button - now explicitly an 'action' type button
        const startGameButton = createButton(this.game.config.width / 2, this.game.config.height * 0.7, 'Start Game', 'action');
        startGameButton.graphics.fillStyle(0x5A67D8, 1); // Specific color for Start button
        startGameButton.graphics.fillRoundedRect(0, 0, startGameButton.container.width, startGameButton.container.height, 8);

        startGameButton.container.on('pointerdown', () => {
            console.log(`Starting game with difficulty: ${this.selectedDifficulty}`);
            this.scene.start('BreakoutScene', {
                difficulty: this.selectedDifficulty, // This will now correctly reflect the chosen difficulty
                highScore: this.highScore // Pass current high score to game scene
            });
        });

        // High Score Display
        this.highScoreText = this.add.text(this.game.config.width / 2, this.game.config.height * 0.85, `Highest Score: ${this.highScore}`, {
            fontFamily: 'Inter',
            fontSize: `${BASE_GAME_HEIGHT * 0.035}px`,
            fill: '#f6ad55'
        }).setOrigin(0.5);
    }
}
