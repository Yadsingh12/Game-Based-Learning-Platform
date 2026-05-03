'use client'
import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [prompt,    setPrompt]    = useState(null)
  const [show,      setShow]      = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      // Show after 30 seconds or on second visit
      const visits = parseInt(localStorage.getItem('visits') ?? '0') + 1
      localStorage.setItem('visits', visits)
      if (visits >= 2) setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
    setPrompt(null)
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-80">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 p-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600
                          flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-6 h-6">
              <path d="M5 15V8M5 8L10 5L15 8M15 8V15"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="10" cy="12" r="2.5" fill="white" fillOpacity="0.95"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-gray-800 text-sm">Install SignLearn</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Add to home screen for the best experience
            </p>
          </div>
          <button onClick={() => setShow(false)}
            className="text-gray-300 hover:text-gray-500 flex-shrink-0 text-lg leading-none">
            ×
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleInstall}
            className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-blue-600
                       text-white font-bold rounded-xl text-sm
                       hover:opacity-90 active:scale-95 transition-all">
            Install
          </button>
          <button onClick={() => setShow(false)}
            className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold
                       rounded-xl text-sm hover:bg-gray-200 transition-all">
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}