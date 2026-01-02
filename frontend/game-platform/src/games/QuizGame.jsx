import React, { useState, useMemo } from 'react';

export default function QuizGame({ data, pack, category, onExit }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = useMemo(() => {
    return data.map(correct => {
      const wrongOptions = data
        .filter(item => item.id !== correct.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correct, ...wrongOptions]
        .sort(() => Math.random() - 0.5);
      
      return { correct, options };
    });
  }, [data]);

  const currentQ = questions[currentQuestion];

  const handleAnswer = (option) => {
    if (answered) return;
    setSelectedAnswer(option);
    setAnswered(true);
    if (option.id === currentQ.correct.id) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestion < data.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      const finalScore = Math.round((score / data.length) * 100);
      onExit(finalScore);
    }
  };

  return (
    <div className={`game-container bg-gradient-to-br ${category.colorScheme.gradient}`}>
      <div className="game-card">
        <div className="game-header">
          <h2 className="text-2xl font-bold text-gray-800">Quiz Mode</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              {category.name} - {pack.name}
            </p>
            <p className="text-gray-600">
              Question {currentQuestion + 1} / {data.length}
            </p>
            <div 
              className="badge badge-success"
              style={{ 
                backgroundColor: `${category.colorScheme.light}40`,
                color: category.colorScheme.dark
              }}
            >
              Score: {score}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-6">
          <div 
            className="progress-fill"
            style={{ 
              width: `${((currentQuestion + 1) / data.length) * 100}%`,
              backgroundColor: category.colorScheme.primary 
            }}
          ></div>
        </div>

        <div className="bg-gray-100 rounded-lg p-8 mb-6 text-center">
          <div className="w-48 h-48 mx-auto bg-gray-300 rounded-lg flex items-center justify-center mb-4">
            <img 
              src={currentQ.correct.thumbnailUrl} 
              alt="Sign"
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <p className="text-gray-600" style={{display: 'none'}}>
              Video: {currentQ.correct.name}
            </p>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            What sign is this?
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentQ.options.map(option => {
            let className = 'answer-option ';
            if (answered) {
              if (option.id === currentQ.correct.id) {
                className += 'answer-option-correct';
              } else if (option.id === selectedAnswer?.id) {
                className += 'answer-option-incorrect';
              } else {
                className += 'answer-option-disabled';
              }
            } else {
              className += 'answer-option-default';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={className}
              >
                {option.name}
              </button>
            );
          })}
        </div>

        {answered && (
          <button
            onClick={handleNext}
            className="w-full btn"
            style={{ 
              backgroundColor: category.colorScheme.primary,
              color: 'white'
            }}
          >
            {currentQuestion === data.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}