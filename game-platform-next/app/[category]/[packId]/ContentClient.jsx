'use client'
import { useRouter } from 'next/navigation'
import { Lock, Star, CheckCircle, Book, Brain, Gamepad2, Zap,
         MessageSquare, Repeat, Clock, Droplet, Gamepad, Search,
         Grid, Shuffle, Grid3x3, MapPin, CheckSquare, Video,
         Hash, Palette, Move, ChevronRight } from 'lucide-react'
import gameTemplatesData from '@/data/gameTemplates.json'
import { getProgress, isGameUnlocked } from '@/lib/storage'

const iconMap = {
  Book, Brain, Gamepad2, Zap, MessageSquare, Repeat, Clock, Droplet,
  Gamepad, Search, Grid, Shuffle, Grid3x3, MapPin, CheckSquare, Video,
  Hash, Palette, Move,
}

const getAvailableGamesForCategory = (categoryId, allGames) =>
  allGames.filter(g => g.applicableCategories.includes(categoryId))

export default function ContentClient({ category, pack, data: packData }) {
  const router = useRouter()
  const availableGames = getAvailableGamesForCategory(category.id, gameTemplatesData.games)

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient header glow */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${category.colorScheme.gradient}
                         opacity-20 blur-3xl scale-110`} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-white/10 border border-white/10 mb-4">
            <span className="text-lg">{category.icon}</span>
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
              {category.name}
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">{pack.name}</h1>
          <p className="text-white/40">
            {packData.length} signs loaded · Choose a game to play
          </p>
        </div>

        {availableGames.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-white/50 text-lg">No games available for this pack yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGames.map(game => {
              const unlocked = isGameUnlocked(pack.id, game)
              const progress = getProgress(pack.id, game.id)
              const Icon     = iconMap[game.icon]

              return (
                <button
                  key={game.id}
                  onClick={() => unlocked && router.push(`/${category.id}/${pack.id}/game/${game.id}`)}
                  disabled={!unlocked}
                  className={`group text-left p-6 rounded-2xl border transition-all duration-200
                    relative overflow-hidden
                    ${unlocked
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                      : 'bg-white/[0.02] border-white/5 cursor-not-allowed opacity-50'}`}
                >
                  {/* Completion glow */}
                  {progress.completed && (
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10
                                    to-emerald-500/5 pointer-events-none" />
                  )}

                  <div className="relative z-10">
                    {/* Icon row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ background: unlocked ? `${category.colorScheme.primary}20` : '#ffffff10' }}>
                        {Icon && (
                          <Icon size={22}
                            style={{ color: unlocked ? category.colorScheme.primary : '#6b7280' }} />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {progress.completed && (
                          <CheckCircle size={18} className="text-green-400" />
                        )}
                        {!unlocked && (
                          <Lock size={16} className="text-white/20" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-white font-black text-base mb-1">{game.name}</h3>
                    <p className="text-white/40 text-xs leading-relaxed mb-3">
                      {game.description}
                    </p>

                    {/* Score or lock reason */}
                    {progress.completed ? (
                      <div className="flex items-center gap-1.5">
                        <Star size={12} className="text-amber-400" />
                        <span className="text-amber-400 text-xs font-black">
                          Best: {progress.score}%
                        </span>
                      </div>
                    ) : !unlocked && game.unlockRequirement ? (
                      <p className="text-white/20 text-xs">
                        🔒 Score {game.unlockRequirement.minScore}% in{' '}
                        {game.unlockRequirement.game}
                      </p>
                    ) : unlocked ? (
                      <div className="flex items-center gap-1 text-white/30
                                      group-hover:text-white/60 transition-colors">
                        <span className="text-xs font-semibold">Play</span>
                        <ChevronRight size={12} />
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}