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
import CrosswordGame from './games/CrossWordGame';
import WordScrambleGame from './games/WordScramble';
import WordSearchGame from './games/WordSearchGame';
import IndiaMapGame from './games/IndiaMapGame';
import MultipleChoiceGame from './games/MultipleChoiceGame';
import ReverseMultipleChoiceGame from './games/ReverseMultipleChoiceGame';
import CountingGame from './games/CountingGame';
import ColorMatchGame from './games/ColorMatchGame';
import DragDropMatchGame from './games/DragAndDropMatchGame';

import GameErrorBoundary from './components/GameErrorBoundary';
import { saveProgress, getProgress } from './utils/storage';
import { getCachedAssets } from './utils/mediaCache';
import categoriesData from './data/categories.json';

// ---------------------------------------------------------------------------
// Pack loader
// By the time the router calls this, SignTypePage has already fetched the JSON
// and preloaded all media into mediaCache. This loader just reads from cache
// and re-fetches JSON only as a fallback (e.g. direct URL navigation).
// ---------------------------------------------------------------------------
async function packLoader({ params }) {
  const { category: categoryId, packId } = params;

  const category = categoriesData.categories.find(c => c.id === categoryId);
  if (!category) throw new Response('Category not found', { status: 404 });

  const packMeta = category.packs.find(p => p.id === packId);
  if (!packMeta) throw new Response('Pack not found', { status: 404 });

  // Fast path — SignTypePage already loaded and cached everything
  const cachedAssets = getCachedAssets(packId);
  if (cachedAssets) {
    // JSON is cheap, re-fetch it to get data (no media cost)
    const res = await fetch(`/data/packs/${packMeta.dataFile}`);
    if (!res.ok) throw new Response('Failed to load pack', { status: res.status });
    const data = await res.json();
    return { category, pack: { ...packMeta, id: packId }, data, assets: cachedAssets, gameAssets: category.gameAssets ?? null };
  }

  // Fallback path — user navigated directly to a URL without going through SignTypePage.
  // Load JSON + preload media now (no progress UI, but works correctly).
  const res = await fetch(`/data/packs/${packMeta.dataFile}`);
  if (!res.ok) throw new Response(`Failed to load pack: ${packMeta.dataFile}`, { status: res.status });
  const data = await res.json();

  const { preloadPackMedia } = await import('./utils/mediaCache');
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
  learn: LearnGame,
  quiz: QuizGame,
  match: MatchGame,
  interactiveClock: InteractiveClockGame,
  bucket: BucketGame,
  breakout: BreakoutGame,
  findInImage: FindInImageGame,
  crossword: CrosswordGame,
  wordScramble: WordScrambleGame,
  wordSearch: WordSearchGame,
  indiaMap: IndiaMapGame,
  multipleChoice: MultipleChoiceGame,
  reverseMultipleChoice: ReverseMultipleChoiceGame,
  countingGame: CountingGame,
  colorMatch: ColorMatchGame,
  dragDropMatch: DragDropMatchGame,
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
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/:category',
    element: <SignTypePage />,
  },
  {
    path: '/:category/:packId',
    loader: packLoader,
    element: <ContentPage />,
  },
  {
    path: '/:category/:packId/game/:gameId',
    loader: packLoader,
    element: <GamePage />,
  },
  {
    path: '*',
    loader: () => redirect('/'),
    element: null,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}