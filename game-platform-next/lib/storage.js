const isBrowser = typeof window !== 'undefined'

// ── local helpers ──────────────────────────────────────────────────────────

const localGet = (packId, gameId) => {
  if (!isBrowser) return null
  const key = `progress_${packId}_${gameId}`
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : null
}

const localSet = (packId, gameId, progress) => {
  if (!isBrowser) return
  const key = `progress_${packId}_${gameId}`
  localStorage.setItem(key, JSON.stringify(progress))
}

// ── DB sync (fire and forget) ──────────────────────────────────────────────

async function syncToDb(packId, gameId, progress) {
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packId, gameId, ...progress }),
    })
  } catch (err) {
    console.warn('Progress sync failed (offline?):', err)
  }
}

// ── public API ─────────────────────────────────────────────────────────────

export const getProgress = (packId, gameId) => {
  if (!isBrowser) return { completed: false, score: 0, attempts: 0 }
  return localGet(packId, gameId) ?? { completed: false, score: 0, attempts: 0 }
}

export const saveProgress = (packId, gameId, progress) => {
  if (!isBrowser) return
  // Write locally first (instant UI update)
  localSet(packId, gameId, progress)
  // Sync to DB in background — won't block game exit
  syncToDb(packId, gameId, progress)
}

export const isGameUnlocked = (packId, gameTemplate) => {
  if (!isBrowser) return true
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

// Hydrate localStorage from DB on login — call this once after session loads
export const hydrateProgressFromDb = async () => {
  if (!isBrowser) return
  try {
    const res = await fetch('/api/progress')
    if (!res.ok) return
    const entries = await res.json()
    for (const entry of entries) {
      localSet(entry.packId, entry.gameId, {
        completed: entry.completed,
        score:     entry.score,
        attempts:  entry.attempts,
      })
    }
  } catch (err) {
    console.warn('Failed to hydrate progress:', err)
  }
}

export const loadPack = async (dataFile, onProgress) => {
  if (!isBrowser) return { data: null, assets: null }
  try {
    const { fetchPackData, preloadPackMedia } = await import('@/lib/mediaCache.client')
    const packId   = dataFile.replace('.json', '')
    const packData = await fetchPackData(packId, dataFile)
    const assets   = await preloadPackMedia(packId, packData, onProgress)
    return { data: packData, assets }
  } catch (err) {
    console.error('Failed to load pack:', err)
    return { data: null, assets: null }
  }
}