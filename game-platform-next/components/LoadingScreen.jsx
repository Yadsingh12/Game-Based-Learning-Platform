'use client'

export default function LoadingScreen({ packName, loaded = 0, total = 0 }) {
  const progress = total > 0 ? Math.round((loaded / total) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden
                    flex items-center justify-center">

      {/* Ambient blob */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center w-80">

        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="w-20 h-20 border-4 border-white/10 rounded-full" />
          <div className="absolute inset-0 w-20 h-20 border-4 border-t-violet-500
                          border-r-transparent border-b-transparent border-l-transparent
                          rounded-full animate-spin" />
          <div className="absolute inset-3 flex items-center justify-center">
            <span className="text-2xl">🤟</span>
          </div>
        </div>

        <p className="text-white font-black text-xl mb-2">
          Loading {packName}
        </p>
        <p className="text-white/40 text-sm mb-6">
          Preparing signs, videos and content
        </p>

        {total > 0 && (
          <>
            {/* Progress bar */}
            <div className="w-full bg-white/10 rounded-full h-2 mb-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500
                           rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white/30 font-medium">
              <span>{loaded} of {total} assets</span>
              <span>{progress}%</span>
            </div>
          </>
        )}

        {total === 0 && (
          <div className="flex items-center justify-center gap-1.5">
            {[0, 1, 2].map(i => (
              <div key={i}
                className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}