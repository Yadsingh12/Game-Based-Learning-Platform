// src/utils/mediaCache.js
// Two caches:
//   dataCache  — pack JSON, so navigating while offline never re-fetches
//   mediaCache — all videos + images as blob URLs (served from RAM, zero network)

const dataCache  = new Map(); // packId → packJson
const mediaCache = new Map(); // packId → { videos, images, svgs, totalAssets }

// ---------------------------------------------------------------------------
// Internal: fetch any URL as a blob URL
// ---------------------------------------------------------------------------
async function fetchBlob(src, onProgress) {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    onProgress?.();
    return { ok: true, src, objectUrl };
  } catch (err) {
    console.warn('❌ Failed to preload:', src, err);
    onProgress?.();
    return { ok: false, src, objectUrl: null };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch pack JSON — network on first call, memory cache on every subsequent
 * call including while offline.
 */
export async function fetchPackData(packId, dataFile) {
  if (dataCache.has(packId)) return dataCache.get(packId);

  const res = await fetch(`/data/packs/${dataFile}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${dataFile}`);
  const json = await res.json();

  dataCache.set(packId, json);
  return json;
}

/**
 * Preload all media for a pack as blob URLs.
 * Cache-first — repeat calls return instantly, works offline.
 * onProgress(loaded, total) fires during first load only.
 *
 * assets.videos[originalUrl] → blob URL  →  <video src={...}>
 * assets.images[originalUrl] → blob URL  →  <img src={...}>
 */
export async function preloadPackMedia(packId, packJson, onProgress) {
  if (mediaCache.has(packId)) {
    const cached = mediaCache.get(packId);
    onProgress?.(cached.totalAssets, cached.totalAssets);
    return cached;
  }

  const signs = packJson.signs ?? [];
  const svgs  = [];

  const videoUrls = [...new Set(signs.map(s => s.videoUrl).filter(Boolean))];
  const imageUrls = [...new Set([
    ...signs.filter(s => s.visual?.type === 'image').map(s => s.visual.value),
    ...signs.flatMap(s => s.assets?.match?.images ?? []),
  ])];

  for (const sign of signs) {
    if (sign.visual?.type === 'svg') svgs.push({ id: sign.id, path: sign.visual.value });
  }

  const totalAssets = videoUrls.length + imageUrls.length;
  let loadedCount = 0;
  const report = () => onProgress?.(++loadedCount, totalAssets);

  // Fetch everything as blobs in parallel — both videos AND images
  // blob URLs are RAM-resident, so <video src={blobUrl}> / <img src={blobUrl}>
  // never touch the network regardless of connection state
  const [videoResults, imageResults] = await Promise.all([
    Promise.all(videoUrls.map(url => fetchBlob(url, report))),
    Promise.all(imageUrls.map(url => fetchBlob(url, report))),
  ]);

  const videos = {};
  const images = {};
  for (const r of videoResults) if (r.ok) videos[r.src] = r.objectUrl;
  for (const r of imageResults) if (r.ok) images[r.src] = r.objectUrl;

  const entry = { videos, images, svgs, totalAssets };
  mediaCache.set(packId, entry);
  return entry;
}

/** Synchronous media read — null if not yet cached. */
export function getCachedAssets(packId) {
  return mediaCache.get(packId) ?? null;
}

/** Synchronous JSON read — null if not yet fetched. */
export function getCachedData(packId) {
  return dataCache.get(packId) ?? null;
}

/** Free RAM for a pack — revokes blob URLs and clears both caches. */
export function evictPackCache(packId) {
  const entry = mediaCache.get(packId);
  if (entry) {
    for (const url of Object.values(entry.videos)) URL.revokeObjectURL(url);
    for (const url of Object.values(entry.images)) URL.revokeObjectURL(url);
    mediaCache.delete(packId);
  }
  dataCache.delete(packId);
}