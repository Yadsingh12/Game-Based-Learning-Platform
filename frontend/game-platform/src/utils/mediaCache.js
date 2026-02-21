// src/utils/mediaCache.js
// Fetches all media as blobs and stores object URLs in memory.
// Blob URLs are served entirely from RAM — zero network on playback,
// regardless of server cache headers or browser cache size limits.

const cache = new Map(); // Map<packId, { images, videos, svgs, totalAssets }>
const blobUrls = [];     // Track all created blob URLs for cleanup if needed

// ---------------------------------------------------------------------------
// Internal helpers — fetch as blob, create object URL
// ---------------------------------------------------------------------------
async function fetchBlob(src, onProgress) {
  try {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    blobUrls.push(objectUrl);
    onProgress?.();
    return { ok: true, src, objectUrl };
  } catch (err) {
    console.warn('❌ Failed to preload:', src, err);
    onProgress?.();
    return { ok: false, src, objectUrl: null };
  }
}

// Images still use HTMLImageElement so they're decoded and ready to paint
function preloadImage(src, onProgress) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.src = src;
      img.onload = () => { onProgress?.(); resolve({ ok: true, type: 'image', src, asset: img }); };
      img.onerror = () => { console.warn('❌ Image failed:', src); onProgress?.(); resolve({ ok: false, type: 'image', src }); };
    } catch (err) {
      console.error('🔥 Image preload error:', src, err);
      onProgress?.();
      resolve({ ok: false, type: 'image', src });
    }
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Preload all media for a pack into memory as blob URLs.
 * Returns cached result immediately on repeat calls.
 * onProgress(loaded, total) fires live during first load.
 *
 * assets.videos[originalUrl] → blob URL  (use as <video src={...}>)
 * assets.images[originalUrl] → HTMLImageElement (already decoded)
 */
export async function preloadPackMedia(packId, packJson, onProgress) {
  if (cache.has(packId)) {
    const cached = cache.get(packId);
    onProgress?.(cached.totalAssets, cached.totalAssets);
    return cached;
  }

  const signs = packJson.signs ?? [];
  const tasks = [];
  const svgs = [];

  // Collect unique URLs
  const videoUrls = [...new Set(signs.map(s => s.videoUrl).filter(Boolean))];
  const imageUrls = [...new Set([
    ...signs.filter(s => s.visual?.type === 'image').map(s => s.visual.value),
    ...signs.flatMap(s => s.assets?.match?.images ?? []),
  ])];

  const totalAssets = videoUrls.length + imageUrls.length;
  let loadedCount = 0;
  const report = () => onProgress?.(++loadedCount, totalAssets);

  // Fetch videos as blobs — this is the key difference vs HTMLVideoElement.
  // blob: URLs are served from RAM, so <video src={blobUrl}> never hits network.
  for (const url of videoUrls) {
    tasks.push(fetchBlob(url, report).then(r => ({ ...r, type: 'video' })));
  }

  for (const url of imageUrls) {
    tasks.push(preloadImage(url, report).then(r => ({ ...r, type: 'image' })));
  }

  // Collect SVGs (no preload needed — they're inlined or tiny)
  for (const sign of signs) {
    if (sign.visual?.type === 'svg') {
      svgs.push({ id: sign.id, path: sign.visual.value });
    }
  }

  const results = await Promise.all(tasks);

  const videos = {}; // originalUrl → blob URL string
  const images = {}; // originalUrl → HTMLImageElement

  for (const r of results) {
    if (!r.ok) continue;
    if (r.type === 'video') videos[r.src] = r.objectUrl;  // blob URL
    if (r.type === 'image') images[r.src] = r.asset;       // HTMLImageElement
  }

  const entry = { videos, images, svgs, totalAssets };
  cache.set(packId, entry);
  return entry;
}

/** Synchronous read — returns null if not yet cached. */
export function getCachedAssets(packId) {
  return cache.get(packId) ?? null;
}

/** Free memory for a pack. Revokes blob URLs so RAM is released. */
export function evictPackCache(packId) {
  const entry = cache.get(packId);
  if (!entry) return;
  for (const blobUrl of Object.values(entry.videos)) {
    URL.revokeObjectURL(blobUrl);
  }
  cache.delete(packId);
}