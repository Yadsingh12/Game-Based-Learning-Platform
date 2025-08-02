// src/games/BreakoutScene.js
import Phaser from 'phaser';

// Base dimensions for scaling game elements
const BASE_GAME_WIDTH = 1600; // Matches Phaser config width
const BASE_GAME_HEIGHT = 900; // Matches Phaser config height

// Ratios for scaling game elements based on base dimensions
const BALL_RADIUS_RATIO = 10 / BASE_GAME_WIDTH;
const PADDLE_HEIGHT_RATIO = 10 / BASE_GAME_HEIGHT;
const PADDLE_WIDTH_RATIO = 75 / BASE_GAME_WIDTH;
const BRICK_HEIGHT_RATIO = 20 / BASE_GAME_HEIGHT;
const BRICK_PADDING_RATIO = 10 / BASE_GAME_WIDTH; // Padding between bricks
const BRICK_OFFSET_TOP_RATIO = 30 / BASE_GAME_HEIGHT;
const FALLING_NUMBER_RADIUS_RATIO = 15 / BASE_GAME_WIDTH;
const NUM_FALLING_ITEMS_PER_BRICK = 3;

// UI Layout Ratios
const PLAY_AREA_WIDTH_RATIO = 0.75; // 75% for game, 25% for UI
const UI_AREA_WIDTH_RATIO = 1 - PLAY_AREA_WIDTH_RATIO;


// Difficulty settings for speed (relative to base speed)
const DIFFICULTY_SPEED_MULTIPLIERS = {
    easy: { ball: 0.8, fallingNumber: 0.7 },
    medium: { ball: 1.0, fallingNumber: 1.0 },
    hard: { ball: 1.5, fallingNumber: 1.3 }
};

// ISL Sign SVGs for numbers 1-5 (abstracted finger counts)
const ISL_SVG_NUMBERS = {
    1: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
            <path d="M50 80 V20" />
        </svg>`,
    2: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
            <path d="M40 80 V30 M60 80 V30" />
        </svg>`,
    3: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
            <path d="M30 80 V40 M50 80 V20 M70 80 V40" />
        </svg>`,
    4: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
            <path d="M25 80 V45 M40 80 V25 M60 80 V25 M75 80 V45" />
        </svg>`,
    5: `<svg viewBox="0 0 100 100" fill="none" stroke="#63b3ed" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 80 V30 M35 80 V20 M50 80 V10 M65 80 V20 M80 80 V30" />
        </svg>`
};


export default class BreakoutScene extends Phaser.Scene {
    constructor() {
        super('BreakoutScene'); // Unique key for the scene
        // Game state variables
        this.score = 0;
        this.lives = 3;
        this.highScore = 0; // Will be loaded from local storage
        this.currentISLTargetNumber = 0;
        this.difficulty = 'medium'; // Default difficulty

        // Game objects
        this.ball = null;
        this.paddle = null;
        this.bricks = null; // Phaser Group for bricks
        this.fallingNumbers = null; // Phaser Group for falling numbers

        // UI Elements
        this.uiContainer = null; // New: Container for all UI elements
        this.scoreText = null;
        this.livesText = null;
        this.islTargetDisplay = null; // HTML element for ISL target SVG
        this.messageText = null; // For game over/win messages

        // Input cursors
        this.cursors = null;

        // Game state flags
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
    }

    // --- Scene Lifecycle Methods ---

    preload() {
        // No assets to preload for this game as we are drawing shapes
    }

    create(data) {
        // Initialize game state from data passed by StartScene
        this.difficulty = data.difficulty || 'medium';
        this.highScore = data.highScore || 0;
        this.score = 0;
        this.lives = 3;
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;

        // Set background color for the game area
        this.cameras.main.setBackgroundColor('#000000');

        // --- Calculate scaled dimensions based on current game size ---
        this.gameWidth = this.sys.game.config.width;
        this.gameHeight = this.sys.game.config.height;

        // Define playable area and UI area widths
        this.playAreaWidth = this.gameWidth * PLAY_AREA_WIDTH_RATIO;
        this.uiAreaWidth = this.gameWidth * UI_AREA_WIDTH_RATIO;
        this.uiAreaStartX = this.playAreaWidth; // X-coordinate where UI area begins

        this.ballRadius = BALL_RADIUS_RATIO * this.gameWidth;
        this.paddleHeight = PADDLE_HEIGHT_RATIO * this.gameHeight;
        this.paddleWidth = PADDLE_WIDTH_RATIO * this.gameWidth;

        this.brickHeight = BRICK_HEIGHT_RATIO * this.gameHeight;
        this.brickPadding = BRICK_PADDING_RATIO * this.gameWidth;
        this.brickOffsetTop = BRICK_OFFSET_TOP_RATIO * this.gameHeight;

        const currentDifficultySettings = DIFFICULTY_SPEED_MULTIPLIERS[this.difficulty] || DIFFICULTY_SPEED_MULTIPLIERS['medium'];
        this.fallingNumberRadius = FALLING_NUMBER_RADIUS_RATIO * this.gameWidth;
        // Increased fallingNumberSpeed for better visibility
        this.fallingNumberSpeed = (800 * (this.gameHeight / BASE_GAME_HEIGHT)) * currentDifficultySettings.fallingNumber;
        this.ballSpeed = (200 * (this.gameWidth / BASE_GAME_WIDTH)) * currentDifficultySettings.ball; // Base ball speed


        // Set world bounds for physics to the play area
        // Changed setBoundsCollision to false for bottom to allow ball to fall
        this.physics.world.setBoundsCollision(true, true, true, false); // Left, Right, Top, Bottom
        this.physics.world.gravity.y = 0; // Ensure no global gravity affects ball (falling numbers will have individual gravity)
        // Adjust the right bound of the physics world to match the play area
        this.physics.world.setBounds(0, 0, this.playAreaWidth, this.gameHeight);


        // --- Create Game Objects (using physics bodies) ---

        // Paddle
        this.paddle = this.physics.add.image(
            this.playAreaWidth / 2, // Center of play area
            this.gameHeight - this.paddleHeight / 2 - 10, // Position slightly above bottom
            'paddle' // Placeholder key, we'll draw it
        ).setImmovable(true)
         .setDisplaySize(this.paddleWidth, this.paddleHeight)
         .setOrigin(0.5, 0.5)
         .setTint(0xA0AEC0); // Greyish color
        // Explicitly set paddle body size
        if (this.paddle.body) {
            this.paddle.body.setSize(this.paddleWidth, this.paddleHeight);
        }


        // Create a graphics object to draw the rounded rectangle for the paddle
        this.paddleGraphics = this.add.graphics();
        this.drawPaddleShape();


        // Ball
        this.ball = this.physics.add.image(
            this.playAreaWidth / 2, // Center of play area
            this.paddle.y - this.ballRadius - 5, // Start above paddle
            'ball' // Placeholder key, we'll draw it
        );
        // Ensure ball body is created and configured immediately
        if (this.ball && this.ball.body) {
            this.ball
                .setCollideWorldBounds(true)
                .setBounce(1) // Full bounce
                .setCircle(this.ballRadius) // Make it a circle for physics
                .setDisplaySize(this.ballRadius * 2, this.ballRadius * 2) // Set display size for appearance
                .setOrigin(0.5, 0.5)
                .setTint(0x63B3ED); // Blueish color
            this.ball.setVelocity(0); // Initialize with zero velocity, will be set in startGame
            // Explicitly set bounce on the body for clarity
            this.ball.body.setBounce(1, 1);
        } else {
            console.error("Failed to create ball physics body. Game may not function correctly.");
            // Fallback: create a non-physics ball to prevent further errors
            this.ball = this.add.graphics();
            this.ball.fillStyle(0x63B3ED, 1);
            this.ball.fillCircle(this.ballRadius, this.ballRadius, this.ballRadius);
            this.ball.x = this.playAreaWidth / 2 - this.ballRadius;
            this.ball.y = this.paddle.y - this.ballRadius * 2 - 5;
            // Mark game as unplayable without physics
            this.gameStarted = false;
            this.gameOver = true;
            this.messageText.setText('Error: Physics not loaded. Tap to restart.');
            this.messageText.setVisible(true);
            this.input.once('pointerdown', () => this.scene.restart());
        }

        // Create a graphics object to draw the circle for the ball
        this.ballGraphics = this.add.graphics();
        this.drawBallShape();


        // Bricks Group (Static, won't move)
        this.bricks = this.physics.add.staticGroup();
        this.createBricks();

        // Falling Numbers Group (Dynamic, will move)
        this.fallingNumbers = this.physics.add.group();

        // --- Create UI Elements (within Phaser) ---
        const uiFontSize = `${this.gameHeight * 0.03}px`;
        const uiFillColor = '#e2e8f0';

        // New: Create a container for all UI elements
        this.uiContainer = this.add.container(this.uiAreaStartX, 0);

        // UI Background Panel - added to uiContainer
        const uiPanelGraphics = this.add.graphics();
        uiPanelGraphics.fillStyle(0x2d3748, 1); // Darker background for UI
        uiPanelGraphics.fillRect(0, 0, this.uiAreaWidth, this.gameHeight); // Relative to container
        uiPanelGraphics.lineStyle(2, 0x4a5568, 1); // Border
        uiPanelGraphics.strokeRect(0, 0, this.uiAreaWidth, this.gameHeight); // Relative to container
        this.uiContainer.add(uiPanelGraphics); // Add to UI container


        // Score Text - positioned relative to uiContainer
        this.scoreText = this.add.text(this.uiAreaWidth * 0.1, this.gameHeight * 0.05, `Score: ${this.score}`, {
            fontFamily: 'Inter',
            fontSize: uiFontSize,
            fill: uiFillColor
        }).setOrigin(0, 0);
        this.uiContainer.add(this.scoreText);

        // Lives Text - positioned relative to uiContainer
        this.livesText = this.add.text(this.uiAreaWidth * 0.9, this.gameHeight * 0.05, `Lives: ${this.lives}`, {
            fontFamily: 'Inter',
            fontSize: uiFontSize,
            fill: uiFillColor
        }).setOrigin(1, 0);
        this.uiContainer.add(this.livesText);

        // ISL Target Display (Phaser DOM Element for SVG) - positioned relative to uiContainer
        const islContainerDiv = document.createElement('div');
        islContainerDiv.style.cssText = `
            font-family: 'Inter';
            font-size: ${uiFontSize};
            color: #e2e8f0;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #3e4c5e; /* Slightly lighter than panel background */
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 0 10px rgba(255,255,255,0.1);
            width: 120px; /* Larger container for better visibility */
            height: 120px;
        `;

        const islLabel = document.createElement('div');
        islLabel.style.cssText = `
            font-weight: bold;
            margin-bottom: 8px;
            color: #9f7aea;
            font-size: ${uiFontSize}; /* Ensure label scales */
        `;
        islLabel.textContent = 'Target ISL:';
        islContainerDiv.appendChild(islLabel);

        const islSvgContainer = document.createElement('div');
        islSvgContainer.style.cssText = `
            width: 80px; /* Larger SVG display area */
            height: 80px;
            background-color: #1a202c; /* Darker background for the SVG itself */
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: inset 0 0 8px rgba(0,0,0,0.5);
            border: 2px solid #63b3ed; /* Blue border */
        `;
        this.islTargetSvgElement = islSvgContainer; // Store reference to update SVG later
        islContainerDiv.appendChild(islSvgContainer);

        // Position ISL target relative to uiContainer (center of UI area)
        this.islTargetDisplay = this.add.dom(
            this.uiAreaWidth / 2, // Center horizontally within UI area
            this.gameHeight / 2, // Center vertically in the whole game height
            islContainerDiv
        );
        this.islTargetDisplay.setOrigin(0.5, 0.5); // Center the DOM element
        this.uiContainer.add(this.islTargetDisplay); // Add to UI container


        this.setNewISLTargetNumber(); // Set initial ISL target

        // Game Over/Win Message Text - centered on the ENTIRE game area
        this.messageText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Tap to Start', {
            fontFamily: 'Inter',
            fontSize: `${this.gameHeight * 0.08}px`,
            fill: '#e2e8f0',
            align: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5, 0.5).setDepth(100).setVisible(true); // Initially visible to prompt start


        // --- Set up Collisions ---
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.overlap(this.paddle, this.fallingNumbers, this.catchFallingNumber, null, this);


        // --- Input Handling ---
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.on('pointermove', this.movePaddle, this);
        this.input.once('pointerdown', this.startGame, this); // Start game on first click/tap
    }

    update() {
        if (!this.gameStarted || this.gameOver || this.gameWon) {
            // If game is not started, over, or won, pause ball movement
            if (this.ball && this.ball.body) { // Defensive check
                this.ball.setVelocity(0);
            }
            return;
        }

        // Paddle movement with keyboard (if not using pointermove)
        if (this.cursors.left.isDown) {
            this.paddle.x -= 7 * (this.gameWidth / BASE_GAME_WIDTH);
        } else if (this.cursors.right.isDown) {
            this.paddle.x += 7 * (this.gameWidth / BASE_GAME_WIDTH);
        }
        // Keep paddle within bounds of the play area
        this.paddle.x = Phaser.Math.Clamp(this.paddle.x, this.paddle.width / 2, this.playAreaWidth - this.paddle.width / 2);

        // Update paddle graphics position
        this.paddleGraphics.x = this.paddle.x; // Graphics x matches physics body x (center)
        this.paddleGraphics.y = this.paddle.y; // Graphics y matches physics body y (center)


        // Update ball graphics position
        this.ballGraphics.x = this.ball.x - this.ballRadius;
        this.ballGraphics.y = this.ball.y - this.ballRadius;

        // Update falling numbers
        this.fallingNumbers.children.each(function (number) {
            if (number.active) {
                // Synchronize label position with sprite position
                if (number.label) {
                    number.label.x = number.x;
                    number.label.y = number.y;
                }
                // Number moves downwards automatically due to physics.gravity
                // We just need to remove it if it goes off screen (below game height)
                if (number.y > this.gameHeight + number.displayHeight / 2) {
                    if (number.label) number.label.destroy(); // Defensive check
                    number.destroy(); // Remove from scene and group
                }
            }
        }, this);

        // Check if ball falls off bottom (of the play area)
        // Since setBoundsCollision(false) for bottom, this check is now the primary way to lose a life
        if (this.ball.y > this.gameHeight + this.ballRadius) {
            this.loseLife();
        }
    }

    // --- Custom Game Functions ---

    drawPaddleShape() {
        this.paddleGraphics.clear();
        this.paddleGraphics.fillStyle(0xA0AEC0, 1); // Greyish color
        // Draw the rounded rectangle centered around its own (0,0) point
        this.paddleGraphics.fillRoundedRect(-this.paddleWidth / 2, -this.paddleHeight / 2, this.paddleWidth, this.paddleHeight, 5);
    }

    drawBallShape() {
        this.ballGraphics.clear();
        this.ballGraphics.fillStyle(0x63B3ED, 1); // Blueish color
        this.ballGraphics.fillCircle(this.ballRadius, this.ballRadius, this.ballRadius);
    }

    createBricks() {
        const brickRowCount = 5;
        const desiredColumnCount = 8; // Let's aim for 8 columns

        // Calculate brick width to fit perfectly across playAreaWidth
        // Total width taken by padding = (desiredColumnCount - 1) * this.brickPadding
        // Remaining width for bricks = this.playAreaWidth - (desiredColumnCount - 1) * this.brickPadding
        // Width per brick = Remaining width / desiredColumnCount
        this.brickWidth = (this.playAreaWidth - (desiredColumnCount - 1) * this.brickPadding) / desiredColumnCount;
        // Ensure brick width is not less than a minimum reasonable size
        this.brickWidth = Math.max(this.brickWidth, 50); // Minimum 50px

        const brickColumnCount = desiredColumnCount; // Use the desired count

        this.bricks.clear(true, true); // Clear existing bricks if any
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                // Bricks are positioned within the play area
                // Calculate X position: (current column * (brick width + padding)) + half brick width (to center)
                let brickX = (c * (this.brickWidth + this.brickPadding)) + (this.brickWidth / 2);
                let brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop + (this.brickHeight / 2);

                // Create a rectangle for the brick and add it to the static group
                const brick = this.bricks.create(brickX, brickY, 'brick').setImmovable(true);
                brick.setDisplaySize(this.brickWidth, this.brickHeight);
                brick.setOrigin(0.5, 0.5); // Origin at center for physics body
                // Explicitly set the physics body size to match the display size
                brick.body.setSize(this.brickWidth, this.brickHeight);
                brick.setTint((r % 2 === 0) ? 0xF6AD55 : 0x9F7AEA); // Orange / Purple

                // Create a graphics object for each brick to draw its rounded shape
                brick.graphics = this.add.graphics();
                brick.graphics.fillStyle(brick.tintTopLeft, 1); // Use brick's tint
                // Draw the rectangle centered around its own (x,y) which is (0,0) relative to graphics object
                brick.graphics.fillRoundedRect(-this.brickWidth / 2, -this.brickHeight / 2, this.brickWidth, this.brickHeight, 3);
                // Position the graphics object at the same center as the physics body
                brick.graphics.x = brick.x;
                brick.graphics.y = brick.y;
            }
        }
    }

    setNewISLTargetNumber() {
        this.currentISLTargetNumber = Phaser.Math.Between(1, 5); // Random number between 1 and 5
        // Update the DOM element with the new SVG
        this.islTargetSvgElement.innerHTML = ISL_SVG_NUMBERS[this.currentISLTargetNumber];
    }

    startGame() {
        // Ensure the ball object and its physics body are ready before attempting to use them.
        if (!this.ball || !this.ball.body) {
            console.error("startGame: Ball object or its physics body is not initialized. Cannot start game.");
            this.messageText.setText('Game Error: Restart required.');
            this.messageText.setVisible(true);
            this.input.once('pointerdown', () => this.scene.restart()); // Offer restart
            return;
        }

        if (!this.gameStarted && !this.gameOver && !this.gameWon) {
            this.gameStarted = true;
            this.messageText.setVisible(false);
            // Apply initial ball velocity based on difficulty
            // Initial upward velocity, horizontal component is zero initially
            const ballSpeedY = (-this.ballSpeed); // Directly use negative ballSpeed for upward
            this.ball.setVelocity(0, ballSpeedY); // Start with no horizontal velocity
        }
    }

    loseLife() {
        this.lives--;
        this.livesText.setText(`Lives: ${this.lives}`);

        if (this.lives === 0) {
            this.endGame(false); // Game Over
        } else {
            // Reset ball and paddle for next life, within the play area
            this.ball.setPosition(this.playAreaWidth / 2, this.paddle.y - this.ballRadius - 5);
            if (this.ball && this.ball.body) { // Defensive check
                this.ball.setVelocity(0);
            }
            this.paddle.setPosition(this.playAreaWidth / 2, this.paddle.y);
            this.gameStarted = false; // Pause game until next start
            this.fallingNumbers.clear(true, true); // Clear any falling numbers and their labels
            this.messageText.setText('Tap to continue...');
            this.messageText.setVisible(true);
            this.input.once('pointerdown', this.startGame, this); // Re-enable start on tap
        }
    }

    endGame(win) {
        this.gameOver = true;
        this.gameWon = win;
        if (this.ball && this.ball.body) { // Defensive check
            this.ball.setVelocity(0);
        }
        this.physics.pause(); // Pause all physics

        if (win) {
            this.messageText.setText('YOU WIN!');
        } else {
            this.messageText.setText('GAME OVER');
        }
        this.messageText.setVisible(true);

        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('breakoutHighScore', this.highScore);
        }

        // Allow restarting by going back to StartScene
        this.input.once('pointerdown', () => {
            this.scene.start('StartScene', { highScore: this.highScore }); // Pass updated high score
        });
    }

    // --- Collision Callbacks ---

    hitPaddle(ball, paddle) {
        // Calculate the hit position relative to the paddle's center (-0.5 to 0.5)
        // This determines how much horizontal velocity to impart.
        const hitPosition = (ball.x - paddle.x) / (paddle.width / 2); // Ranges from -1 (far left) to 1 (far right)

        // Map hitPosition [-1, 1] to an angle range for bounce, e.g., [150, 30] degrees
        // 150 degrees is top-left, 90 degrees is straight up, 30 degrees is top-right
        const angleInDegrees = Phaser.Math.Linear(150, 30, (hitPosition + 1) / 2);
        const angleInRadians = Phaser.Math.DegToRad(angleInDegrees);

        // Set the new velocity from the calculated angle and maintain the ball's speed
        this.physics.velocityFromAngle(angleInRadians, this.ballSpeed, ball.body.velocity);
    }

    hitBrick(ball, brick) {
        // Destroy the brick and its graphics
        brick.graphics.destroy();
        brick.destroy();
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Generate multiple falling numbers
        let numbersToFall = [];
        numbersToFall.push(this.currentISLTargetNumber); // Ensure correct target is present

        while (numbersToFall.length < NUM_FALLING_ITEMS_PER_BRICK) {
            let randomNum = Phaser.Math.Between(1, 5);
            if (randomNum !== this.currentISLTargetNumber && !numbersToFall.includes(randomNum)) {
                numbersToFall.push(randomNum);
            }
        }
        // Shuffle to randomize horizontal positions
        Phaser.Utils.Array.Shuffle(numbersToFall);

        // Spawn each number
        for (let i = 0; i < numbersToFall.length; i++) {
            const spawnX = brick.x; // Spawn at brick's X position (center)
            const spawnY = brick.y; // Spawn at brick's Y position (center)

            // Create a graphics object to draw the circle
            const circleGraphics = this.add.graphics();
            const circleColor = (numbersToFall[i] === this.currentISLTargetNumber) ? 0x48BB78 : 0xE0E0E0; // Green for target, light grey for others
            circleGraphics.fillStyle(circleColor, 1);
            // Draw the circle centered around its own (0,0) point
            circleGraphics.fillCircle(0, 0, this.fallingNumberRadius);

            // Generate a texture from the graphics
            const textureKey = `fallingNumberCircle_${Phaser.Math.RND.uuid()}`; // Unique key for texture
            circleGraphics.generateTexture(textureKey, this.fallingNumberRadius * 2, this.fallingNumberRadius * 2);
            circleGraphics.destroy(); // Destroy the graphics object after generating texture

            // Create a physics sprite for the falling number
            const fallingNumSprite = this.physics.add.sprite(spawnX, spawnY, textureKey);
            fallingNumSprite.setCircle(this.fallingNumberRadius); // Set physics body shape
            fallingNumSprite.setOrigin(0.5, 0.5); // Center the sprite's origin
            fallingNumSprite.setTint(circleColor); // Apply color to sprite

            // Create a text label for the number
            const numberLabel = this.add.text(spawnX, spawnY, numbersToFall[i], { // Position directly at spawnX, spawnY
                fontFamily: 'Inter',
                fontSize: `${this.fallingNumberRadius * 1.2}px`,
                fill: (numbersToFall[i] === this.currentISLTargetNumber) ? '#e2e8f0' : '#333',
                align: 'center'
            }).setOrigin(0.5, 0.5); // Center the text on its own coordinates

            fallingNumSprite.body.setAllowGravity(true); // Allow gravity for falling numbers
            // Set individual gravity for the falling number's body AND give it an initial downward push
            fallingNumSprite.body.setGravityY(this.fallingNumberSpeed); // Apply continuous gravity
            fallingNumSprite.body.setVelocityY(this.fallingNumberSpeed * 0.5); // Give an initial downward velocity
            
            fallingNumSprite.value = numbersToFall[i]; // Store the number value
            fallingNumSprite.label = numberLabel; // Store reference to label for destruction

            this.fallingNumbers.add(fallingNumSprite); // Add to falling numbers group
        }

        // Check win condition
        if (this.bricks.countActive(true) === 0) {
            this.endGame(true); // Game Won
        }
    }

    catchFallingNumber(paddle, number) {
        if (number.active) {
            if (number.value === this.currentISLTargetNumber) {
                this.score += 100; // Big bonus for correct ISL number
                this.scoreText.setText(`Score: ${this.score}`);
                this.setNewISLTargetNumber(); // Set a new target
            }
            if (number.label) number.label.destroy(); // Defensive check
            number.destroy(); // Destroy the falling number
        }
    }

    // This method is called when the scene is shut down (e.g., restarted)
    shutdown() {
        // Clean up event listeners to prevent memory leaks
        this.input.off('pointermove', this.movePaddle, this);
        this.input.off('pointerdown', this.startGame, this);
        // Clear any DOM elements created by Phaser (like the ISL target display)
        if (this.islTargetDisplay && this.islTargetDisplay.node && this.islTargetDisplay.node.parentNode) {
            this.islTargetDisplay.node.parentNode.removeChild(this.islTargetDisplay.node);
        }
    }

    // --- Input Callbacks ---
    movePaddle(pointer) {
        if (this.gameStarted) {
            // Constrain paddle movement to the play area
            this.paddle.x = Phaser.Math.Clamp(pointer.x, this.paddle.width / 2, this.playAreaWidth - this.paddle.width / 2);
            this.paddleGraphics.x = this.paddle.x; // Graphics x matches physics body x (center)
        }
    }
}
