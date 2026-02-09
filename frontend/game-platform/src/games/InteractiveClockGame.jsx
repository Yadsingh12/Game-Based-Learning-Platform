// src/components/games/InteractiveClockGame.jsx
// STANDARDIZED interactive clock game that works with game props structure

import { useState } from "react";
import InteractiveClock from "./gameComponents/InteractiveClock";

const formatTime = (hour, minute, period) => {
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
};

/**
 * Generic interactive clock game that accepts game props
 * Works with the standardized game props: { data, pack, category, assets, onExit }
 */
const InteractiveClockGame = (props) => {
  // Extract signs from props - could be either direct signs prop or nested in data
  const signs = props.signs || props.data?.signs || props.data || [];
  const onComplete = props.onComplete || props.onExit;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userTime, setUserTime] = useState({ hour: 12, minute: 0, period: "AM" });
  const [prevUserTime, setPrevUserTime] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [resetKey, setResetKey] = useState(0);
  const [score, setScore] = useState(0);

  console.log('InteractiveClockGame props:', props);
  console.log('Signs extracted:', signs);

  if (!signs || signs.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">No time data available</p>
        <pre className="text-left mt-4 text-xs">{JSON.stringify(props, null, 2)}</pre>
      </div>
    );
  }

  const currentSign = signs[currentIndex];
  const correctTime = currentSign.visual; // { hour, minute, period }

  const handleTimeChange = (t) => {
    setUserTime((prev) => ({ ...prev, hour: t.hour, minute: t.minute }));
  };

  const isEqualTime = (a, b) =>
    a.hour === b.hour && a.minute === b.minute && a.period === b.period;

  const checkAnswer = () => {
    const correct = isEqualTime(userTime, correctTime);
    setPrevUserTime(userTime);
    setFeedback(correct ? "correct" : "incorrect");
    setUserTime(correctTime);
    
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex + 1 >= signs.length) {
      // Game complete
      const finalScore = score;
      const percentage = Math.round((finalScore / signs.length) * 100);
      
      if (onComplete) {
        onComplete(percentage);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setUserTime({ hour: 12, minute: 0, period: "AM" });
    setPrevUserTime(null);
    setFeedback(null);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden flex justify-center items-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-[500px] h-full max-h-[90vh] flex flex-col justify-center">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl text-center font-bold mb-3 sm:mb-4">
          ⏰ Interactive Clock Game
        </h2>

        {/* Progress */}
        <div className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">
          Question {currentIndex + 1} of {signs.length} | Score: {score}
        </div>

        {/* Video */}
        <video
          src={currentSign.videoUrl}
          muted
          loop
          autoPlay
          playsInline
          className="w-full max-w-[400px] mx-auto aspect-video rounded-xl shadow-lg mb-3 sm:mb-4 object-contain bg-black"
        />

        {/* Clock + AM/PM selector */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-3 sm:mb-4">
          <InteractiveClock
            key={resetKey}
            resetKey={resetKey}
            initialTime={{ hour: 12, minute: 0 }}
            forceTime={{ hour: userTime.hour, minute: userTime.minute }}
            onTimeChange={handleTimeChange}
            readOnly={Boolean(feedback)}
            flashFeedback={feedback}
          />

          {/* AM/PM Toggle */}
          <div
            className="flex flex-row sm:flex-col border-2 border-blue-600 rounded-lg overflow-hidden cursor-pointer select-none"
            onClick={() =>
              !feedback && setUserTime((prev) => ({
                ...prev,
                period: prev.period === "AM" ? "PM" : "AM",
              }))
            }
          >
            <span
              className={`flex-1 px-6 py-2 sm:px-4 text-center font-semibold transition-all duration-200 ${
                userTime.period === "AM"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              AM
            </span>
            <span
              className={`flex-1 px-6 py-2 sm:px-4 text-center font-semibold transition-all duration-200 ${
                userTime.period === "PM"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600"
              }`}
            >
              PM
            </span>
          </div>
        </div>

        {/* Fixed height container for button/result card - prevents layout shift */}
        <div className="min-h-[140px] sm:min-h-[160px] flex items-start justify-center">
          {/* Check Answer Button */}
          {!feedback && (
            <button
              onClick={checkAnswer}
              className="px-5 py-2.5 border-none rounded-lg text-sm sm:text-base font-semibold cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
            >
              Check Answer
            </button>
          )}

          {/* Result Card */}
          {feedback && (
            <div className="p-3 sm:p-4 rounded-xl bg-white shadow-md text-center max-w-[400px] w-full">
              <div className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">
                This is the correct position
              </div>
              <div
                className={`text-sm sm:text-base font-semibold mb-1 sm:mb-2 ${
                  feedback === "correct" ? "text-green-600" : "text-red-600"
                }`}
              >
                {feedback === "correct" ? "✅ Correct!" : "❌ Incorrect"}
              </div>
              <p className="text-xs sm:text-sm mb-2 sm:mb-3">
                Your Answer:&nbsp;
                {prevUserTime
                  ? formatTime(prevUserTime.hour, prevUserTime.minute, prevUserTime.period)
                  : "—"}
                <br className="sm:hidden" />
                <span className="hidden sm:inline">&nbsp;|&nbsp;</span>
                Correct Answer:&nbsp;
                {formatTime(
                  correctTime.hour,
                  correctTime.minute,
                  correctTime.period
                )}
              </p>
              <button
                onClick={nextQuestion}
                className="px-5 py-2.5 border-none rounded-lg text-sm sm:text-base font-semibold cursor-pointer bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
              >
                {currentIndex + 1 >= signs.length ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveClockGame;