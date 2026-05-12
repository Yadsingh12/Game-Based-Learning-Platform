'use client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GAMES = [
  ['📖','Learn','Watch and learn signs with video'],
  ['🧠','Quiz','Test your knowledge'],
  ['🃏','Match','Match signs to meanings'],
  ['🔍','Find in Image','Spot signs in scenes'],
  ['🔤','Word Search','Find signs in a grid'],
  ['🔀','Word Scramble','Unscramble sign names'],
  ['✏️','Crossword','Sign language crosswords'],
  ['🏓','Breakout','Break blocks with signs'],
  ['🪣','Bucket Sort','Sort signs into categories'],
  ['🕐','Interactive Clock','Learn time signs'],
  ['🗺️','India Map','Learn state signs'],
  ['🎨','Color Match','Match color signs'],
]

const FEATURES = [
  { icon: '🎮', title: '16 Game Types', desc: 'From simple flashcards to arcade-style breakout games' },
  { icon: '📴', title: 'Works Offline', desc: 'Play any loaded pack without internet connection' },
  { icon: '📊', title: 'Track Progress', desc: 'Scores and completion saved across all your devices' },
  { icon: '🔄', title: 'Smart Sync', desc: 'Progress syncs to cloud when you come back online' },
  { icon: '🏆', title: 'Unlock System', desc: 'Complete games to unlock harder challenges' },
  { icon: '📱', title: 'Install as App', desc: 'Add to home screen for a native app experience' },
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="text-7xl mb-6 animate-float inline-block">🤟</div>
          <h1 className="text-5xl font-black text-white mb-4">
            About{' '}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400
                             bg-clip-text text-transparent">
              SignLearn
            </span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            A free, interactive platform to learn Indian Sign Language
            through games. Built to make ISL accessible for everyone.
          </p>
        </div>

        {/* What is it */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
          <h2 className="text-white font-black text-xl mb-4">What is SignLearn?</h2>
          <p className="text-white/50 leading-relaxed mb-4">
            SignLearn is an interactive learning platform focused on Indian Sign Language (ISL).
            Instead of static lessons, we use games — quizzes, matching, word searches, and more —
            to make learning engaging and memorable.
          </p>
          <p className="text-white/50 leading-relaxed">
            Whether you're learning to communicate with deaf family members, studying ISL
            professionally, or just curious, SignLearn meets you where you are.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <span className="text-3xl mb-3 block">{icon}</span>
              <h3 className="text-white font-black text-sm mb-1">{title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Games */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
          <h2 className="text-white font-black text-xl mb-6">Game Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GAMES.map(([icon, name, desc]) => (
              <div key={name}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/5
                           border border-white/5">
                <span className="text-xl flex-shrink-0">{icon}</span>
                <div>
                  <p className="text-white font-bold text-sm">{name}</p>
                  <p className="text-white/30 text-xs leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-10">
          <h2 className="text-white font-black text-xl mb-6">How it works</h2>
          <div className="space-y-4">
            {[
              ['1', 'Pick a category', 'Choose from Alphabets, Numbers, Colors, Fruits, and more'],
              ['2', 'Select a pack', 'Each category has one or more sign packs to learn'],
              ['3', 'Play games', 'Work through multiple game types to reinforce learning'],
              ['4', 'Track progress', 'See your scores, completion rate, and improvement over time'],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600
                                flex items-center justify-center text-white font-black text-sm
                                flex-shrink-0 mt-0.5">
                  {num}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{title}</p>
                  <p className="text-white/40 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-blue-600
                       text-white font-black rounded-2xl text-lg
                       hover:opacity-90 active:scale-95 transition-all
                       shadow-xl shadow-violet-500/25">
            Start Learning Free
          </button>
        </div>

      </div>
    </div>
  )
}