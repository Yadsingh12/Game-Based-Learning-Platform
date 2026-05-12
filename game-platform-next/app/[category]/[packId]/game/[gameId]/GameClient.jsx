'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import GameErrorBoundary from '@/components/GameErrorBoundary'
import { saveProgress, getProgress } from '@/lib/storage'
import { preloadPackMedia } from '@/lib/mediaCache.client'

// Game registry
import LearnGame                 from '@/games/LearnGame'
import InteractiveClockGame      from '@/games/InteractiveClockGame'
import BucketGame                from '@/games/BucketGame'
import BreakoutGame              from '@/games/BreakoutGame'
import FindInImageGame           from '@/games/FindInImageGame'
import CrossWordGame             from '@/games/CrosswordGame'
import WordScrambleGame          from '@/games/WordScramble'
import WordSearchGame            from '@/games/WordSearchGame'
import IndiaMapGame              from '@/games/IndiaMapGame'
import MultipleChoiceGame        from '@/games/MultipleChoiceGame'
import ReverseMultipleChoiceGame from '@/games/ReverseMultipleChoiceGame'
import CountingGame              from '@/games/CountingGame'
import ColorMatchGame            from '@/games/ColorMatchGame'
import DragDropMatchGame         from '@/games/DragAndDropMatchGame'

const GAME_REGISTRY = {
  learn:                 LearnGame,
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
}

export default function GameClient({
  categoryId, packId, gameId,
  category, pack, data, gameAssets
}) {
  const router = useRouter()
  // Assets are preloaded client-side because the server mediaCache returns empty
  // blob URLs (server can't create objectURLs — only the browser can)
  const [assets, setAssets] = useState(null)

  useEffect(() => {
    if (!data) return
    preloadPackMedia(packId, data).then(setAssets)
  }, [packId, data])

  const GameComponent = GAME_REGISTRY[gameId]

  const handleExit = (score) => {
    if (score !== undefined) {
      const current = getProgress(packId, gameId)
      saveProgress(packId, gameId, {
        completed: true,
        score: Math.max(score, current.score ?? 0),
        attempts: (current.attempts ?? 0) + 1,
      })
    }
    router.push(`/${categoryId}/${packId}`)
  }

  const handleCrash = () => {
    console.warn('Game crashed. Returning to content screen.')
    router.push(`/${categoryId}/${packId}`)
  }

  if (!GameComponent) {
    router.replace(`/${categoryId}/${packId}`)
    return null
  }

  // Wait for client-side asset preloading before mounting the game
  if (!assets) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
        <div className="text-white/50 text-sm animate-pulse">Loading assets…</div>
      </div>
    )
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
  )
}