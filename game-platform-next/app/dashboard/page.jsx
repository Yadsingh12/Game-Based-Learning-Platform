import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import categoriesData from '@/data/categories.json'
import gameTemplatesData from '@/data/gameTemplates.json'
import SignOutButton from '@/components/SignOutButton'
import Link from 'next/link'

const GAME_ICONS = {
  learn: '📖', quiz: '🧠', match: '🃏', findInImage: '🔍',
  wordSearch: '🔤', wordScramble: '🔀', crossWord: '✏️',
  breakout: '🏓', bucket: '🪣', interactiveClock: '🕐',
  indiaMap: '🗺️', multipleChoice: '☑️', reverseMultipleChoice: '🔄',
  countingGame: '🔢', colorMatch: '🎨', dragDropMatch: '↔️',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/signin')

  const allProgress = await db.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  const completed = allProgress.filter(p => p.completed)
  const avgScore  = completed.length
    ? Math.round(completed.reduce((s, p) => s + p.score, 0) / completed.length)
    : 0

  // Build lookup maps
  const packMap = {}
  for (const cat of categoriesData.categories) {
    for (const pack of cat.packs) {
      packMap[pack.id] = {
        packName:     pack.name,
        categoryName: cat.name,
        categoryId:   cat.id,
        gradient:     cat.colorScheme?.gradient ?? 'from-purple-500 to-blue-500',
        primary:      cat.colorScheme?.primary  ?? '#7c3aed',
      }
    }
  }

  const gameMap = {}
  for (const g of gameTemplatesData.games) {
    gameMap[g.id] = g.name
  }

  // Group progress by pack
  const byPack = {}
  for (const p of allProgress) {
    if (!byPack[p.packId]) byPack[p.packId] = []
    byPack[p.packId].push(p)
  }

  const initials = session.user.name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero header */}
      <div className="bg-gradient-to-br from-violet-600 to-blue-600 px-6 pt-8 pb-24">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img src={session.user.image}
                className="w-14 h-14 rounded-2xl ring-4 ring-white/30 shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-2xl ring-4 ring-white/30 shadow-lg
                              bg-white/20 flex items-center justify-center
                              text-white font-black text-xl">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white/70 text-sm font-medium">Welcome back</p>
              <h1 className="text-white font-black text-2xl leading-tight">
                {session.user.name?.split(' ')[0]}
              </h1>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>

      {/* Stats cards — overlapping the hero */}
      <div className="max-w-5xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Games Played',   value: allProgress.length, icon: '🎮', color: 'from-violet-500 to-purple-600' },
            { label: 'Completed',      value: completed.length,   icon: '✅', color: 'from-green-400 to-emerald-600' },
            { label: 'Avg Score',      value: `${avgScore}%`,     icon: '⭐', color: 'from-amber-400 to-orange-500'  },
          ].map(({ label, value, icon, color }) => (
            <div key={label}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/80 p-5 text-center border border-gray-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color}
                              flex items-center justify-center text-lg mx-auto mb-3`}>
                {icon}
              </div>
              <div className="text-3xl font-black text-gray-800 mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>

        {/* Pack progress */}
        {Object.keys(byPack).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-4">Your Packs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(byPack).map(([packId, games]) => {
                const meta       = packMap[packId]
                const doneCount  = games.filter(g => g.completed).length
                const pct        = Math.round((doneCount / games.length) * 100)
                return (
                  <Link key={packId}
                    href={`/${meta?.categoryId ?? ''}/${packId}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100
                               hover:shadow-md hover:border-violet-200 transition-all p-5 block">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-0.5">
                          {meta?.categoryName}
                        </p>
                        <h3 className="font-black text-gray-800">{meta?.packName ?? packId}</h3>
                      </div>
                      <span className="text-sm font-black text-violet-600 bg-violet-50
                                       px-2 py-1 rounded-lg">
                        {pct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>

                    {/* Game pills */}
                    <div className="flex flex-wrap gap-2">
                      {games.map(g => (
                        <span key={g.gameId}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold
                            ${g.completed
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                          {GAME_ICONS[g.gameId] ?? '🎮'} {gameMap[g.gameId] ?? g.gameId}
                          {g.completed && (
                            <span className="font-black text-green-600">{g.score}%</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {allProgress.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mb-8">
            <div className="text-6xl mb-4">🤟</div>
            <h3 className="text-xl font-black text-gray-800 mb-2">No games played yet</h3>
            <p className="text-gray-500 mb-6">Start learning sign language through interactive games</p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold
                         bg-gradient-to-r from-violet-600 to-blue-600 text-white
                         hover:opacity-90 transition-all shadow-sm">
              Start Learning
            </Link>
          </div>
        )}

        {/* Recent activity */}
        {allProgress.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-black text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {allProgress.slice(0, 10).map(p => {
                const meta = packMap[p.packId]
                return (
                  <div key={p.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                      {GAME_ICONS[p.gameId] ?? '🎮'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {gameMap[p.gameId] ?? p.gameId}
                      </p>
                      <p className="text-xs text-gray-400">
                        {meta?.packName ?? p.packId} · {meta?.categoryName} · {p.attempts} attempt{p.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.completed
                        ? <span className="text-xs bg-green-50 text-green-700 border border-green-200
                                           px-2 py-1 rounded-lg font-bold">✓ Done</span>
                        : <span className="text-xs bg-gray-50 text-gray-400 border border-gray-200
                                           px-2 py-1 rounded-lg font-semibold">In progress</span>
                      }
                      <span className="text-sm font-black text-violet-600 w-12 text-right">
                        {p.score}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}