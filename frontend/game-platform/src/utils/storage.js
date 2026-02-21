// src/utils/storage.js

import { fetchPackData, preloadPackMedia } from './mediaCache';

// ---------------------------------------------------------------------------
// Progress utilities
// ---------------------------------------------------------------------------
// NOTE — future DB sync point:
// When adding a backend, replace localStorage calls here with API calls.
// Suggested pattern: write to localStorage immediately (optimistic),
// then sync to DB in the background. On load, prefer DB data over localStorage
// if the user is authenticated, falling back to localStorage when offline.
// ---------------------------------------------------------------------------

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

  // TODO: sync to DB
  // syncProgressToDb(packId, gameId, progress).catch(console.warn);
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

// ---------------------------------------------------------------------------
// Pack loading
// Both calls are cache-first — work offline once a pack has been loaded once.
// ---------------------------------------------------------------------------

export const loadPack = async (dataFile, onProgress) => {
  try {
    const packId = dataFile.replace('.json', '');

    // fetchPackData: network on first call, dataCache on repeat (incl. offline)
    const packData = await fetchPackData(packId, dataFile);

    // preloadPackMedia: fetches blobs on first call, mediaCache on repeat
    const assets = await preloadPackMedia(packId, packData, onProgress);

    return { data: packData, assets };
  } catch (err) {
    console.error('🔥 Failed to load pack:', err);
    return { data: null, assets: null };
  }
};