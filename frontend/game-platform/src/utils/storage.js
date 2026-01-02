import { preloadPack } from './preloadPack';

// ------------------------
// Progress utilities
// ------------------------
export const getProgress = (packId, gameId) => {
  const key = `progress_${packId}_${gameId}`;
  const stored = localStorage.getItem(key);
  return stored
    ? JSON.parse(stored)
    : { completed: false, score: 0, attempts: 0 };
};

export const saveProgress = (packId, gameId, progress) => {
  const key = `progress_${packId}_${gameId}`;
  localStorage.setItem(key, JSON.stringify(progress));
};

export const isGameUnlocked = (packId, gameTemplate) => {
  if (!gameTemplate.unlockRequirement) return true;

  const { game, minScore } = gameTemplate.unlockRequirement;
  const progress = getProgress(packId, game);
  return progress.score >= minScore;
};

export const isGameSupported = (pack, gameId) => {
  if (!pack.supportedGames) return true;
  return pack.supportedGames.includes(gameId);
};

export const getAvailableGames = (pack, allGames) => {
  return allGames.filter(game => isGameSupported(pack, game.id));
};

// ------------------------
// Load and preload a pack
// ------------------------
export const loadPack = async (dataFile, onProgress) => {
  try {
    const response = await fetch(`/data/packs/${dataFile}`);
    if (!response.ok) throw new Error(`Failed to fetch pack: ${response.status}`);

    const packData = await response.json();

    // preload assets and pass progress callback
    const assets = await preloadPack(packData, onProgress);

    return { data: packData, assets };
  } catch (err) {
    console.error('🔥 Failed to load pack:', err);
    return { data: null, assets: null };
  }
};
