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
  let session
  try { session = await auth() } catch { session = null }
  if (!session?.user) redirect('/auth/signin')

  const allProgress = await db.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  const completed = allProgress.filter(p => p.completed)
  const avgScore  = completed.length
    ? Math.round(completed.reduce((s, p) => s + p.score, 0) / completed.length)
    : 0

  const packMap = {}
  for (const cat of categoriesData.categories)
    for (const pack of cat.packs)
      packMap[pack.id] = { packName: pack.name, categoryName: cat.name, categoryId: cat.id }

  const gameMap = {}
  for (const g of gameTemplatesData.games) gameMap[g.id] = g.name

  const byPack = {}
  for (const p of allProgress) {
    if (!byPack[p.packId]) byPack[p.packId] = []
    byPack[p.packId].push(p)
  }

  const initials = session.user.name
    ?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient blob */}
      <div className="absolute top-0 left-0 right-0 h-80 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20
                        blur-3xl scale-110" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Profile header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            {session.user.image ? (
              <img src={session.user.image} alt=""
                className="w-14 h-14 rounded-2xl ring-2 ring-white/10 shadow-xl" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600
                              flex items-center justify-center text-white font-black text-xl shadow-xl">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white/40 text-sm font-medium">Welcome back</p>
              <h1 className="text-white font-black text-2xl leading-tight">
                {session.user.name?.split(' ')[0]}
              </h1>
            </div>
          </div>
          <SignOutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Games Played',  value: allProgress.length, emoji: '🎮', from: 'from-violet-500', to: 'to-purple-600' },
            { label: 'Completed',     value: completed.length,   emoji: '✅', from: 'from-green-400',  to: 'to-emerald-600' },
            { label: 'Avg Score',     value: `${avgScore}%`,     emoji: '⭐', from: 'from-amber-400',  to: 'to-orange-500' },
          ].map(({ label, value, emoji, from, to }) => (
            <div key={label}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${from} ${to}
                               flex items-center justify-center text-lg mx-auto mb-3`}>
                {emoji}
              </div>
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-white/30 text-xs font-bold uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Packs */}
        {Object.keys(byPack).length > 0 && (
          <div className="mb-8">
            <h2 className="text-white font-black text-lg mb-4">Your Packs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(byPack).map(([packId, games]) => {
                const meta      = packMap[packId]
                const doneCount = games.filter(g => g.completed).length
                const pct       = Math.round((doneCount / games.length) * 100)
                return (
                  <Link key={packId}
                    href={`/${meta?.categoryId ?? ''}/${packId}`}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5
                               hover:bg-white/10 hover:border-white/20
                               transition-all block">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-1">
                          {meta?.categoryName}
                        </p>
                        <h3 className="text-white font-black">{meta?.packName ?? packId}</h3>
                      </div>
                      <span className="text-violet-400 font-black text-sm
                                       bg-violet-500/10 px-2 py-1 rounded-lg border border-violet-500/20">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500
                                      rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {games.map(g => (
                        <span key={g.gameId}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                                      text-xs font-semibold border
                            ${g.completed
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-white/5 text-white/30 border-white/10'}`}>
                          {GAME_ICONS[g.gameId] ?? '🎮'} {gameMap[g.gameId] ?? g.gameId}
                          {g.completed && (
                            <span className="font-black text-green-400">{g.score}%</span>
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
          <div className="bg-white/5 border border-white/10 rounded-3xl p-16
                          text-center mb-8">
            <div className="text-7xl mb-4">🤟</div>
            <h3 className="text-white font-black text-xl mb-2">No games played yet</h3>
            <p className="text-white/40 mb-8">
              Start learning sign language through interactive games
            </p>
            <Link href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold
                         bg-gradient-to-r from-violet-600 to-blue-600 text-white
                         hover:opacity-90 transition-all shadow-lg shadow-violet-500/25">
              Start Learning
            </Link>
          </div>
        )}

        {/* Recent activity */}
        {allProgress.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-black text-lg mb-4">Recent Activity</h2>
            <div className="space-y-2">
              {allProgress.slice(0, 10).map(p => {
                const meta = packMap[p.packId]
                return (
                  <div key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl
                               hover:bg-white/5 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center
                                    justify-center text-lg flex-shrink-0">
                      {GAME_ICONS[p.gameId] ?? '🎮'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">
                        {gameMap[p.gameId] ?? p.gameId}
                      </p>
                      <p className="text-white/30 text-xs">
                        {meta?.packName} · {meta?.categoryName} · {p.attempts} attempt{p.attempts !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg border
                        ${p.completed
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-white/5 text-white/30 border-white/10'}`}>
                        {p.completed ? '✓ Done' : 'In progress'}
                      </span>
                      <span className="text-violet-400 font-black text-sm w-12 text-right">
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