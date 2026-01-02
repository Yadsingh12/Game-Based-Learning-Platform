// src/games/NumberKingdom/data/levelData.js

export const levelData = {
  1: {
    scenes: [
      {
        background: "kingdom_fading.png",
        text: "Seeker… our world is fading into shadows. Darkness grows because people have forgotten the magic of numbers. We need to stop the decay before the knowledge of mathematics becomes lost!"
      },
      {
        background: "fairy.png",
        text: "I am Lumina, the Guiding Fairy. I’ve watched over Number Kingdom for centuries. But now… even the Numen are forgetting how to count! I will tell you what Numen are, but first, you must know what Math is."
      },
      {
        background: "meadow.png",
        text: "Math is how we understand numbers and shapes. It helps us count, build things, share fairly, and solve puzzles. Without math, we’d be lost—even in everyday things like playing games or baking cookies!"
      },
      {
        background: "map.png",
        text: "Your journey will have games and puzzles. Win them to bring knowledge back—and unlock new paths across the kingdom! You will meet many friends and face challenges, but I will be here to guide you."
      },
      {
        background: "fairy.png",
        text: "Are you ready, Seeker? Let’s start by testing how well you listened to me."
      }
    ],
    miniGame: "recognitionScene",
    questions: [
      {
        question: "What is Math?",
        media: "fairy.png",
        options: [
          "A type of food",
          "Magic that helps us understand numbers and shapes",
          "A sleeping spell",
          "A place in the kingdom"
        ],
        correctIndex: 1
      },
      {
        question: "Why do we need math?",
        media: "map.png",
        options: [
          "To fly like fairies",
          "To play music",
          "To count, build, share, and solve puzzles",
          "To talk to animals"
        ],
        correctIndex: 2
      }
    ],
  }
};
