const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const texPacker = require("free-tex-packer-core");

// CONFIG
const videoDir = `C:/Users/yadau/Desktop/coding/Game-Based-Learning-Platform/frontend/game-platform/public/assets/SignMatch/videos`;
const tempRoot = `C:/Users/yadau/Desktop/coding/Game-Based-Learning-Platform/frontend/game-platform/public/assets/SignMatch/frames`;
const outputDir = `C:/Users/yadau/Desktop/coding/Game-Based-Learning-Platform/frontend/game-platform/public/assets/SignMatch/spritesheets`;
const fps = 10;

function extractFrames(videoPath, framesDir, fps) {
    if (!fs.existsSync(framesDir)) {
        fs.mkdirSync(framesDir, { recursive: true });
    }

    const command = `ffmpeg -i "${videoPath}" -vf fps=${fps} "${framesDir}/frame_%04d.png" -hide_banner -loglevel error`;
    console.log(`Extracting frames: ${command}`);
    execSync(command);
}

function createSpritesheet(framesDir, outputSubDir, sheetName) {
    const files = fs.readdirSync(framesDir)
        .filter(f => f.endsWith(".png"))
        .map(f => ({
            path: f,
            contents: fs.readFileSync(path.join(framesDir, f))
        }));

    if (files.length === 0) {
        console.warn(`No frames found for ${sheetName}. Skipping.`);
        return;
    }

    texPacker(
        files,
        {
            textureName: sheetName,
            width: 8192,
            height: 8192,
            fixedSize: false,
            padding: 2,
            allowRotation: false,
            allowTrim: false,
            removeFileExtension: true,
            exporter: "Phaser3",
        },
        (packedFiles) => {
            if (!fs.existsSync(outputSubDir)) {
                fs.mkdirSync(outputSubDir, { recursive: true });
            }

            packedFiles.forEach(file => {
                const outPath = path.join(outputSubDir, file.name);
                fs.writeFileSync(outPath, file.buffer);
                console.log("Written:", outPath);
            });
            console.log(`Spritesheet packed for: ${sheetName}`);
        }
    );
}

function deleteTemp(framesDir) {
    if (fs.existsSync(framesDir)) {
        fs.rmSync(framesDir, { recursive: true, force: true });
        console.log(`Deleted temp folder: ${framesDir}`);
    }
}

function processAllVideos() {
    const files = fs.readdirSync(videoDir)
        .filter(f => f.toLowerCase().endsWith(".mp4"));

    if (files.length === 0) {
        console.log("No videos found!");
        return;
    }

    files.forEach(file => {
        const baseName = path.parse(file).name;
        console.log(`=== Processing video: ${file} ===`);

        const videoPath = path.join(videoDir, file);
        const framesDir = path.join(tempRoot, baseName);
        const outputSubDir = path.join(outputDir, baseName);

        extractFrames(videoPath, framesDir, fps);
        createSpritesheet(framesDir, outputSubDir, baseName);
        deleteTemp(framesDir);

        console.log(`✅ Finished: ${baseName}`);
        console.log("-------------------------------------------");
    });
}

processAllVideos();
