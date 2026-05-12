'use client'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [online,  setOnline]  = useState(true)

  useEffect(() => {
    setOnline(navigator.onLine)
    const on  = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online',  on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online',  on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const handleGoogleSignIn = async () => {
    if (!online) return
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden
                    flex items-center justify-center p-6">

      {/* Ambient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px]
                      bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px]
                      bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm">

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center
                        backdrop-blur-xl">

          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600
                          flex items-center justify-center shadow-lg shadow-violet-500/25
                          mx-auto mb-6">
            <svg viewBox="0 0 20 20" fill="none" className="w-8 h-8">
              <path d="M5 15V8M5 8L10 5L15 8M15 8V15"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="12" r="2.5" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>

          <h1 className="text-2xl font-black text-white mb-2">Welcome to SignLearn</h1>
          <p className="text-white/40 text-sm mb-8">
            Sign in to track your progress and join the community
          </p>

          {/* Offline warning */}
          {!online && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
              <p className="text-amber-400 text-sm font-bold mb-1">📴 You're offline</p>
              <p className="text-amber-400/70 text-xs">
                Sign in requires internet. You can still play cached packs.
              </p>
              <a href="/"
                className="inline-block mt-3 px-4 py-2 bg-amber-500/10 text-amber-400
                           font-bold rounded-xl text-sm hover:bg-amber-500/20 transition-all
                           border border-amber-500/20">
                Continue without signing in
              </a>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={loading || !online}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5
                       bg-white rounded-2xl font-bold text-gray-700
                       hover:bg-gray-50 active:scale-95 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-xl shadow-black/20">
            {loading ? (
              <div className="w-5 h-5 border-2 border-violet-600
                              border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Signing in...' : online ? 'Continue with Google' : 'Unavailable offline'}
          </button>

          <p className="text-white/20 text-xs mt-6">
            Progress saves locally and syncs when you sign in
          </p>
        </div>
      </div>
    </div>
  )
}