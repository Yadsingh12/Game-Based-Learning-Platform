'use client'

const dataCache  = new Map()
const mediaCache = new Map()

async function fetchBlob(src, onProgress) {
  try {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    onProgress?.()
    return { ok: true, src, objectUrl }
  } catch (err) {
    console.warn('❌ Failed to preload:', src, err)
    onProgress?.()
    return { ok: false, src, objectUrl: null }
  }
}

export async function fetchPackData(packId, dataFile) {
  if (dataCache.has(packId)) return dataCache.get(packId)

  const res = await fetch(`/data/packs/${dataFile}`)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${dataFile}`)
  const json = await res.json()

  dataCache.set(packId, json)
  return json
}

export async function preloadPackMedia(packId, packJson, onProgress) {
  if (mediaCache.has(packId)) {
    const cached = mediaCache.get(packId)
    onProgress?.(cached.totalAssets, cached.totalAssets)
    return cached
  }

  const signs = packJson.signs ?? []
  const svgs  = []

  const videoUrls = [...new Set(signs.map(s => s.videoUrl).filter(Boolean))]
  const imageUrls = [...new Set([
    ...signs.filter(s => s.visual?.type === 'image').map(s => s.visual.value),
    ...signs.flatMap(s => s.assets?.match?.images ?? []),
  ])]

  for (const sign of signs) {
    if (sign.visual?.type === 'svg') svgs.push({ id: sign.id, path: sign.visual.value })
  }

  const totalAssets = videoUrls.length + imageUrls.length
  let loadedCount = 0
  const report = () => onProgress?.(++loadedCount, totalAssets)

  const [videoResults, imageResults] = await Promise.all([
    Promise.all(videoUrls.map(url => fetchBlob(url, report))),
    Promise.all(imageUrls.map(url => fetchBlob(url, report))),
  ])

  const videos = {}
  const images = {}
  for (const r of videoResults) if (r.ok) videos[r.src] = r.objectUrl
  for (const r of imageResults) if (r.ok) images[r.src] = r.objectUrl

  const entry = { videos, images, svgs, totalAssets }
  mediaCache.set(packId, entry)
  return entry
}

export function getCachedAssets(packId) { return mediaCache.get(packId) ?? null }
export function getCachedData(packId)   { return dataCache.get(packId)  ?? null }

export function evictPackCache(packId) {
  const entry = mediaCache.get(packId)
  if (entry) {
    for (const url of Object.values(entry.videos)) URL.revokeObjectURL(url)
    for (const url of Object.values(entry.images)) URL.revokeObjectURL(url)
    mediaCache.delete(packId)
  }
  dataCache.delete(packId)
}