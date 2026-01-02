import React, { useState, useEffect } from "react";
import { HelpCircle } from "lucide-react";
import "./CrosswordGame.css";

const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_TRIES = 3;
const MAX_WORD_LENGTH = 8; // prevent words from overflowing

export default function CrosswordGame() {
  const [words, setWords] = useState([]);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [video, setVideo] = useState("");

  // pick random valid word
  const pickRandomWord = (items) => {
    const valid = items.filter(
      (d) =>
        d.enabled &&
        !d.name.includes(" ") && // no spaces
        d.name.length <= MAX_WORD_LENGTH // max length
    );
    if (valid.length === 0) return null;
    const randomItem = valid[Math.floor(Math.random() * valid.length)];
    return randomItem;
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/labels.json");
      const data = await res.json();

      // store filtered items (still objects, not just names)
      const validItems = data.filter(
        (d) => d.enabled && !d.name.includes(" ") && d.name.length <= MAX_WORD_LENGTH
      );

      setWords(validItems); // <-- keep full objects

      const randomItem = pickRandomWord(validItems);
      if (!randomItem) return;
      setTargetWord(randomItem.name.toUpperCase());
      setVideo(randomItem.sample_video);
    };
    fetchData();
  }, []);

  const handleKeyPress = (letter) => {
    if (gameOver) return;
    if (currentGuess.length < targetWord.length) {
      setCurrentGuess(currentGuess + letter);
    }
  };

  const handleBackspace = () => {
    if (gameOver) return;
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleEnter = () => {
    if (gameOver) return;
    if (currentGuess.length !== targetWord.length) return;

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    if (currentGuess === targetWord) {
      setGameOver(true);
      setMessage("🎉 Congratulations! You guessed the word!");
    } else if (newGuesses.length >= MAX_TRIES) {
      setGameOver(true);
      setMessage(`❌ You could not make it. The word was ${targetWord}. Don’t worry, try again!`);
    }
    setCurrentGuess("");
  };

  const getLetterStatus = (guess, index) => {
    const letter = guess[index];
    if (targetWord[index] === letter) return "green";
    if (targetWord.includes(letter)) return "yellow";
    return "red";
  };

  const restartGame = () => {
    const randomItem = pickRandomWord(words);
    if (!randomItem) return;
    setTargetWord(randomItem.name.toUpperCase());
    setVideo(randomItem.sample_video);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("");
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>Crossword Guess Game</h1>
        <button onClick={() => setShowInstructions(!showInstructions)}>
          <HelpCircle className="icon" />
        </button>
      </div>

      {showInstructions && (
        <div className="instructions">
          Guess the word in 5 tries. Correct letters in the correct position will turn{" "}
          <b className="green">green</b>, letters in the word but wrong place will turn{" "}
          <b className="yellow">yellow</b>, and wrong letters will turn <b className="red">red</b>. Green letters remain fixed in
          future tries. Use the on-screen keyboard to type, backspace to delete, and enter to submit.
        </div>
      )}

      {video && (
        <div className="video-wrapper">
          <video src={video}
            muted
            loop
            autoPlay
            playsInline />
        </div>
      )}

      {/* Reserved 5 rows for guesses */}
      <div className="guesses">
        {Array.from({ length: MAX_TRIES }).map((_, rowIndex) => {
          const guess = guesses[rowIndex] || "";
          return (
            <div key={rowIndex} className="guess-row">
              {Array.from({ length: targetWord.length }).map((_, i) => {
                const fixedGreen = guesses.some((g) => g[i] === targetWord[i]);
                const char =
                  guess[i] ||
                  (rowIndex === guesses.length && currentGuess[i]) ||
                  (fixedGreen ? targetWord[i] : "");
                let status = "default";
                if (guess.length === targetWord.length && guess[i]) {
                  status = getLetterStatus(guess, i);
                }
                return (
                  <div key={i} className={`letter-box ${status}`}>
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {gameOver ? (
        <div className="end-game">
          <p>{message}</p>
          <button onClick={restartGame} className="restart-btn">
            Restart
          </button>
        </div>
      ) : (
        <>
          {/* Keyboard */}
          <div className="keyboard">
            {ALPHABETS.map((letter) => (
              <button key={letter} onClick={() => handleKeyPress(letter)}>
                {letter}
              </button>
            ))}
            <button onClick={handleBackspace} className="special-btn red">
              ⌫
            </button>
            <button onClick={handleEnter} className="special-btn green">
              Enter
            </button>
          </div>
          <p className="tries-left">Tries left: {MAX_TRIES - guesses.length}</p>
        </>
      )}
    </div>
  );
}
