'use client'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import categoriesData from '@/data/categories.json'

export default function MainPage() {
  const router = useRouter()
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px]
                      bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px]
                      bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[30%] w-[400px] h-[400px]
                      bg-purple-800/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-violet-500/10 border border-violet-500/20 mb-6">
            <span className="text-violet-300 text-sm font-semibold tracking-wide">
              Indian Sign Language
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4 leading-tight">
            Learn{' '}
            <span className="bg-gradient-to-r from-violet-400 to-blue-400
                             bg-clip-text text-transparent">
              Sign Language
            </span>
            <br />through Play
          </h1>

          <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
            Master Indian Sign Language through interactive games, quizzes,
            and visual aids. Free, fun, and designed for everyone.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            {!session?.user && (
              <button
                onClick={() => signIn('google')}
                className="px-6 py-3 rounded-2xl font-bold text-sm
                           bg-gradient-to-r from-violet-600 to-blue-600 text-white
                           hover:opacity-90 active:scale-95 transition-all
                           shadow-lg shadow-violet-500/25">
                Get Started Free
              </button>
            )}
            <button
              onClick={() => document.getElementById('categories').scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-2xl font-bold text-sm
                         bg-white/10 text-white border border-white/10
                         hover:bg-white/20 transition-all">
              Browse Categories
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-16 max-w-2xl mx-auto">
          {[
            { value: '9+',   label: 'Categories' },
            { value: '16',   label: 'Game Types' },
            { value: '100+', label: 'Signs' },
          ].map(({ value, label }) => (
            <div key={label}
              className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="text-2xl font-black text-white mb-1">{value}</div>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div id="categories">
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-6 text-center">
            Choose a Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesData.categories.map((category, i) => (
              <button
                key={category.id}
                onClick={() => router.push(`/${category.id}`)}
                className="group relative text-left p-6 rounded-2xl
                           bg-white/5 border border-white/10
                           hover:bg-white/10 hover:border-white/20
                           hover:scale-[1.02] active:scale-[0.98]
                           transition-all duration-200 overflow-hidden"
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                                transition-opacity duration-300 pointer-events-none
                                bg-gradient-to-br from-violet-600/10 to-blue-600/10" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{category.icon}</span>
                    <span className="text-white/20 group-hover:text-white/40
                                     transition-colors text-2xl leading-none mt-1">
                      →
                    </span>
                  </div>
                  <h3 className="text-white font-black text-lg mb-1">
                    {category.name}
                  </h3>
                  <p className="text-white/40 text-sm">
                    {category.packs.length} {category.packs.length === 1 ? 'pack' : 'packs'} ·{' '}
                    {category.packs.reduce((s, p) => s + (p.signCount ?? 0), 0)} signs
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}