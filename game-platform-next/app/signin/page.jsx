'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-sm w-full text-center">

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600
                        flex items-center justify-center shadow-lg shadow-violet-200 mx-auto mb-6">
          <svg viewBox="0 0 20 20" fill="none" className="w-8 h-8">
            <path d="M5 15V8M5 8L10 5L15 8M15 8V15"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="10" cy="12" r="2.5" fill="white" fillOpacity="0.95" />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-800 mb-2">Welcome to SignLearn</h1>
        <p className="text-gray-500 text-sm mb-8">
          Sign in to track your progress and join the community
        </p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5
                     bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700
                     hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700
                     active:scale-95 transition-all duration-200 shadow-sm
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          By signing in you agree to our terms of service.
          Your progress is saved across devices.
        </p>
      </div>
    </div>
  )
}