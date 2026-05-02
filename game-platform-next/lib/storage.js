// lib/storage.js
// NOTE — future DB sync point:
// When adding a backend, replace localStorage calls here with API calls.
// Suggested pattern: write to localStorage immediately (optimistic),
// then sync to DB in the background. On load, prefer DB data over localStorage
// if the user is authenticated, falling back to localStorage when offline.

const isBrowser = typeof window !== 'undefined'

export const getProgress = (packId, gameId) => {
  if (!isBrowser) return { completed: false, score: 0, attempts: 0 }
  const key = `progress_${packId}_${gameId}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : { completed: false, score: 0, attempts: 0 }
}

export const saveProgress = (packId, gameId, progress) => {
  if (!isBrowser) return
  const key = `progress_${packId}_${gameId}`
  localStorage.setItem(key, JSON.stringify(progress))
  // TODO: sync to DB
  // syncProgressToDb(packId, gameId, progress).catch(console.warn)
}

export const isGameUnlocked = (packId, gameTemplate) => {
  if (!isBrowser) return true   // show all unlocked during SSR, real check happens client-side
  if (!gameTemplate.unlockRequirement) return true
  const { game, minScore } = gameTemplate.unlockRequirement
  const progress = getProgress(packId, game)
  return progress.score >= minScore
}

export const isGameSupported = (pack, gameId) => {
  if (!pack.supportedGames) return true
  return pack.supportedGames.includes(gameId)
}

export const getAvailableGames = (pack, allGames) => {
  return allGames.filter(game => isGameSupported(pack, game.id))
}

// ---------------------------------------------------------------------------
// loadPack — client-only, only call this from client components (SignTypePage)
// Server components use fetchPackData from @/lib/mediaCache.server directly
// ---------------------------------------------------------------------------
export const loadPack = async (dataFile, onProgress) => {
  if (!isBrowser) return { data: null, assets: null }
  try {
    // Dynamic import so this module stays server-safe at the top level
    const { fetchPackData, preloadPackMedia } = await import('@/lib/mediaCache.client')
    const packId = dataFile.replace('.json', '')
    const packData = await fetchPackData(packId, dataFile)
    const assets   = await preloadPackMedia(packId, packData, onProgress)
    return { data: packData, assets }
  } catch (err) {
    console.error('Failed to load pack:', err)
    return { data: null, assets: null }
  }
}