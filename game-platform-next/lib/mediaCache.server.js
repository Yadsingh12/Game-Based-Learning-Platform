import fs from 'fs'
import path from 'path'

const dataCache = new Map()

export async function fetchPackData(packId, dataFile) {
  if (dataCache.has(packId)) return dataCache.get(packId)

  const filePath = path.join(process.cwd(), 'public', 'data', 'packs', dataFile)
  const raw = fs.readFileSync(filePath, 'utf-8')
  const data = JSON.parse(raw)

  dataCache.set(packId, data)
  return data
}

// On the server, media preloading is a no-op — the client handles blob URLs
export async function preloadPackMedia(packId, data) {
  return { videos: {}, images: {}, svgs: [], totalAssets: 0 }
}