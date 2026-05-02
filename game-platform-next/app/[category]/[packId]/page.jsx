// Server component — no 'use client'
import { notFound } from 'next/navigation';
import categoriesData from '@/data/categories.json';
import { fetchPackData, preloadPackMedia } from '@/lib/mediaCache.server'
import ContentClient from './ContentClient';   // ← split interactive part out

export default async function ContentPage({ params }) {
  const { category: categoryId, packId } = await params;

  const category = categoriesData.categories.find(c => c.id === categoryId);
  if (!category) notFound();

  const packMeta = category.packs.find(p => p.id === packId);
  if (!packMeta) notFound();

  const data   = await fetchPackData(packId, packMeta.dataFile);
  const assets = await preloadPackMedia(packId, data);

  return (
    <ContentClient
      category={category}
      pack={{ ...packMeta, id: packId }}
      data={data}
      assets={assets}
    />
  );
}