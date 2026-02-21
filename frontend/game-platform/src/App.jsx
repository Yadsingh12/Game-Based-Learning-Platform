// src/App.jsx - React Router v6

import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  redirect,
  useLoaderData,
  useParams,
  useNavigate,
} from 'react-router-dom';

import AppLayout    from './AppLayout';
import ErrorPage    from './pages/ErrorPage';
import MainPage     from './pages/MainPage';
import SignTypePage from './pages/SignTypePage';
import ContentPage  from './pages/ContentPage';
import AboutPage    from './pages/AboutPage';

import LearnGame                 from './games/LearnGame';
import QuizGame                  from './games/QuizGame';
import MatchGame                 from './games/MatchGame';
import InteractiveClockGame      from './games/InteractiveClockGame';
import BucketGame                from './games/BucketGame';
import BreakoutGame              from './games/BreakoutGame';
import FindInImageGame           from './games/FindInImageGame';
import CrossWordGame             from './games/CrossWordGame';
import WordScrambleGame          from './games/WordScramble';
import WordSearchGame            from './games/WordSearchGame';
import IndiaMapGame              from './games/IndiaMapGame';
import MultipleChoiceGame        from './games/MultipleChoiceGame';
import ReverseMultipleChoiceGame from './games/ReverseMultipleChoiceGame';
import CountingGame              from './games/CountingGame';
import ColorMatchGame            from './games/ColorMatchGame';
import DragDropMatchGame         from './games/DragAndDropMatchGame';

import GameErrorBoundary from './components/GameErrorBoundary';
import { saveProgress, getProgress } from './utils/storage';
import { fetchPackData, preloadPackMedia } from './utils/mediaCache';
import categoriesData from './data/categories.json';

// ---------------------------------------------------------------------------
// Pack loader — fully cache-first, works offline after first load
// ---------------------------------------------------------------------------
async function packLoader({ params }) {
  const { category: categoryId, packId } = params;

  const category = categoriesData.categories.find(c => c.id === categoryId);
  if (!category) throw new Response('Category not found', { status: 404 });

  const packMeta = category.packs.find(p => p.id === packId);
  if (!packMeta) throw new Response('Pack not found', { status: 404 });

  // Cache-first — reads from dataCache if already fetched, no network when offline
  const data = await fetchPackData(packId, packMeta.dataFile);

  // Cache-first — reads from mediaCache if already preloaded, no network when offline
  const assets = await preloadPackMedia(packId, data);

  return {
    category,
    pack: { ...packMeta, id: packId },
    data,
    assets,
    gameAssets: category.gameAssets ?? null,
  };
}

// ---------------------------------------------------------------------------
// Game registry
// ---------------------------------------------------------------------------
const GAME_REGISTRY = {
  learn:                 LearnGame,
  quiz:                  QuizGame,
  match:                 MatchGame,
  interactiveClock:      InteractiveClockGame,
  bucket:                BucketGame,
  breakout:              BreakoutGame,
  findInImage:           FindInImageGame,
  crossWord:             CrossWordGame,
  wordScramble:          WordScrambleGame,
  wordSearch:            WordSearchGame,
  indiaMap:              IndiaMapGame,
  multipleChoice:        MultipleChoiceGame,
  reverseMultipleChoice: ReverseMultipleChoiceGame,
  countingGame:          CountingGame,
  colorMatch:            ColorMatchGame,
  dragDropMatch:         DragDropMatchGame,
};

// ---------------------------------------------------------------------------
// GamePage
// ---------------------------------------------------------------------------
function GamePage() {
  const { category: categoryId, packId, gameId } = useParams();
  const { category, pack, data, assets, gameAssets } = useLoaderData();
  const navigate = useNavigate();

  const GameComponent = GAME_REGISTRY[gameId];

  const handleExit = (score) => {
    if (score !== undefined) {
      const current = getProgress(packId, gameId);
      saveProgress(packId, gameId, {
        completed: true,
        score: Math.max(score, current.score ?? 0),
        attempts: (current.attempts ?? 0) + 1,
      });
    }
    navigate(`/${categoryId}/${packId}`);
  };

  const handleCrash = () => {
    console.warn('Game crashed. Returning to content screen.');
    navigate(`/${categoryId}/${packId}`);
  };

  if (!GameComponent) {
    navigate(`/${categoryId}/${packId}`, { replace: true });
    return null;
  }

  return (
    <GameErrorBoundary onRecover={handleCrash}>
      <GameComponent
        data={data}
        pack={pack}
        category={category}
        assets={assets}
        gameAssets={gameAssets}
        onExit={handleExit}
      />
    </GameErrorBoundary>
  );
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        id: 'main',
        path: '/',
        element: <MainPage />,
        handle: { title: 'Sign Language Learning' },
      },
      {
        id: 'about',
        path: '/about',
        element: <AboutPage />,
        handle: { title: 'About' },
      },
      {
        id: 'signType',
        path: '/:category',
        element: <SignTypePage />,
        handle: { title: 'Select Pack' },
      },
      {
        id: 'content',
        path: '/:category/:packId',
        loader: packLoader,
        element: <ContentPage />,
        errorElement: <ErrorPage />,
        handle: { title: 'Select Game' },
      },
      {
        id: 'game',
        path: '/:category/:packId/game/:gameId',
        loader: packLoader,
        element: <GamePage />,
        errorElement: <ErrorPage />,
        handle: { title: 'Playing' },
      },
      {
        path: '*',
        loader: () => redirect('/'),
        element: null,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}