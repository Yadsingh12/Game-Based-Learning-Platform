// src/App.jsx - Main Router Component

import React, { useState } from 'react';
import MainPage from './pages/MainPage';
import SignTypePage from './pages/SignTypePage';
import ContentPage from './pages/ContentPage';

import LearnGame from './games/LearnGame';
import QuizGame from './games/QuizGame';
import MatchGame from './games/MatchGame';
import InteractiveClockGame from './games/InteractiveClockGame';
import BucketGame from './games/BucketGame';
import BreakoutGame from './games/BreakoutGame';
import FindInImageGame from './games/FindInImageGame';

import { saveProgress, getProgress } from './utils/storage';
import GameErrorBoundary from './components/GameErrorBoundary';


export default function App() {
  const [screen, setScreen] = useState('main');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [packData, setPackData] = useState(null);
  const [packAssets, setPackAssets] = useState(null);

  // Navigate to sign type page when category is selected
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setScreen('signType');
  };

  // Receive fully loaded pack from SignTypePage
  const handlePackSelect = ({ data, assets, ...pack }) => {
    setSelectedPack(pack);
    setPackData(data);
    setPackAssets(assets); // optional: store preloaded assets
    setScreen('content');
  };

  // Navigate to game screen
  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setScreen('playing');
  };

  const handleGameCrash = () => {
    console.warn("Game crashed. Returning to content screen.");
    setSelectedGame(null);
    setScreen('content');
  };

  // Handle game exit and save progress
  const handleGameExit = (score) => {
    if (score !== undefined) {
      const currentProgress = getProgress(selectedPack.id, selectedGame.id);
      saveProgress(selectedPack.id, selectedGame.id, {
        completed: true,
        score: Math.max(score, currentProgress.score),
        attempts: currentProgress.attempts + 1,
      });
    }
    setSelectedGame(null);
    setScreen('content');
  };

  // Back navigation handlers
  const handleBackToSignType = () => {
    setSelectedPack(null);
    setPackData(null);
    setPackAssets(null);
    setScreen('signType');
  };

  const handleBackToMain = () => {
    setSelectedCategory(null);
    setScreen('main');
  };

  // Route to appropriate screen
  switch (screen) {
    case 'main':
      return <MainPage onSelectCategory={handleCategorySelect} />;

    case 'signType':
      return (
        <SignTypePage
          category={selectedCategory}
          onSelectPack={handlePackSelect}
          onBack={handleBackToMain}
        />
      );

    case 'content':
      return (
        <ContentPage
          category={selectedCategory}
          pack={selectedPack}
          packData={packData}
          packAssets={packAssets} // optional
          onSelectGame={handleGameSelect}
          onBack={handleBackToSignType}
        />
      );

    case 'playing':
      if (!selectedGame) return null;

      const gameProps = {
        data: packData,
        pack: selectedPack,
        category: selectedCategory,
        assets: packAssets,
        onExit: handleGameExit,
      };
      console.log("Rendering game:", selectedGame.id, gameProps);

      switch (selectedGame.id) {
        case 'learn':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <LearnGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'quiz':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <QuizGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'match':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <MatchGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'sequence':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <SequenceGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'interactiveClock':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <InteractiveClockGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'bucket':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <BucketGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'breakout':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <BreakoutGame {...gameProps} />
            </GameErrorBoundary>
          );

        case 'findInImage':
          return (
            <GameErrorBoundary onRecover={handleGameCrash}>
              <FindInImageGame {...gameProps} />
            </GameErrorBoundary>
          );

        default:
          return null;
      }

    default:
      return null;
  }
}
