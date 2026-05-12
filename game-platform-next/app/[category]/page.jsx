'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Package } from 'lucide-react'
import LoadingScreen from '@/components/LoadingScreen'
import { preloadPackMedia } from '@/lib/mediaCache.client'
import categoriesData from '@/data/categories.json'

export default function SignTypePage({ params }) {
  const { category: categoryId } = use(params)
  const router = useRouter()

  const category = categoriesData.categories.find(c => c.id === categoryId)
  const [loadingPack, setLoadingPack] = useState(null)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })

  if (!category) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🤷</div>
          <p className="text-white/60 text-lg mb-6">Category not found.</p>
          <button onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600
                       text-white font-bold rounded-xl hover:opacity-90 transition-all">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const handlePackClick = async (pack) => {
    setLoadingPack(pack.name)
    setProgress({ loaded: 0, total: 0 })
    const res = await fetch(`/data/packs/${pack.dataFile}`)
    if (!res.ok) { setLoadingPack(null); return }
    const packJson = await res.json()
    await preloadPackMedia(pack.id, packJson, (loaded, total) => {
      setProgress({ loaded, total })
    })
    setLoadingPack(null)
    router.push(`/${categoryId}/${pack.id}`)
  }

  if (loadingPack) {
    return <LoadingScreen packName={loadingPack} loaded={progress.loaded} total={progress.total} />
  }

  const totalSigns = category.packs.reduce((s, p) => s + (p.signCount ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient blobs matching category color */}
      <div className="absolute top-0 left-0 right-0 h-72 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${category.colorScheme.gradient}
                         opacity-20 blur-3xl scale-110`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-white/10 border border-white/10 mb-4">
            <span className="text-xl">{category.icon}</span>
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
              {category.name}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Choose a Pack
          </h1>
          <p className="text-white/40">
            {category.packs.length} pack{category.packs.length !== 1 ? 's' : ''} ·{' '}
            {totalSigns} signs total
          </p>
        </div>

        {/* Pack grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {category.packs.map((pack, i) => (
            <button
              key={pack.id}
              onClick={() => handlePackClick(pack)}
              className="group text-left p-6 rounded-2xl
                         bg-white/5 border border-white/10
                         hover:bg-white/10 hover:border-white/20
                         hover:scale-[1.02] active:scale-[0.98]
                         transition-all duration-200 relative overflow-hidden"
            >
              {/* Hover glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.colorScheme.gradient}
                               opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center
                                  justify-center text-lg font-black text-white/60">
                    {i + 1}
                  </div>
                  <Play size={18}
                    style={{ color: category.colorScheme.primary }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
                <h3 className="text-white font-black text-lg mb-1">{pack.name}</h3>
                <p className="text-white/40 text-sm mb-4">{pack.range}</p>
                <div className="flex items-center gap-2">
                  <Package size={12} className="text-white/30" />
                  <span className="text-white/30 text-xs font-semibold">
                    {pack.signCount} signs
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}