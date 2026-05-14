import { notFound } from 'next/navigation'
import categoriesData from '@/data/categories.json'
import { fetchPackData } from '@/lib/mediaCache.server'
import GameClient from './GameClient'

export default async function GamePage({ params }) {
  const { category: categoryId, packId, gameId } = await params

  const category = categoriesData.categories.find(c => c.id === categoryId)
  if (!category) notFound()

  const packMeta = category.packs.find(p => p.id === packId)
  if (!packMeta) notFound()

  const data = await fetchPackData(packId, packMeta.dataFile)
  // Media preloading is handled client-side in GameClient (server can't create blob URLs)

  return (
    <GameClient
      categoryId={categoryId}
      packId={packId}
      gameId={gameId}
      category={category}
      pack={{ ...packMeta, id: packId }}
      data={data}
      gameAssets={category.gameAssets ?? null}
    />
  )
}