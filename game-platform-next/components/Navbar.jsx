// components/Navbar.tsx  — replace entire file
'use client'
import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ArrowLeft, Menu, X } from 'lucide-react'

function useBackPath() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null
  if (segments.length === 1) return '/'
  if (segments.length === 2) return `/${segments[0]}`
  if (segments.length === 4 && segments[2] === 'game') return `/${segments[0]}/${segments[1]}`
  return '/'
}

function useTitle() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0)         return null
  if (segments[0] === 'about')       return 'About'
  if (segments[0] === 'dashboard')   return 'Dashboard'
  if (segments[0] === 'forum')       return 'Community'
  if (segments[0] === 'donate')      return 'Support Us'
  if (segments.length === 1)         return 'Select Pack'
  if (segments.length === 2)         return 'Select Game'
  if (segments[2] === 'game')        return 'Playing'
  return null
}

export default function Navbar() {
  const router   = useRouter()
  const pathname = usePathname()
  const backPath = useBackPath()
  const title    = useTitle()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = path => pathname === path
  const go = path => { router.push(path); setMenuOpen(false) }

  return (
    <nav className="relative z-40 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm shadow-purple-100/50">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-600 via-blue-500 to-violet-600" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">

        {/* Back button */}
        {backPath && (
          <button
            onClick={() => router.push(backPath)}
            aria-label="Go back"
            className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500
                       hover:text-violet-700 hover:bg-violet-50 active:scale-90 transition-all duration-150"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
        )}

        {/* Logo — no mr-auto so desktop links can be pushed right naturally */}
        <button
          onClick={() => go('/')}
          className="flex items-center gap-2.5 group px-2 py-1 rounded-2xl
                     hover:bg-gray-100/70 active:scale-[0.98] transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600
                          flex items-center justify-center shadow-md shadow-violet-200
                          group-hover:shadow-violet-300 group-hover:scale-105 transition-all duration-200 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-[18px] h-[18px]">
              <path d="M5 15V8M5 8L10 5L15 8M15 8V15"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="12" r="2.5" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[1.05rem] tracking-tight
                             bg-gradient-to-r from-violet-700 to-blue-600 bg-clip-text text-transparent">
              SignLearn
            </span>
            {title && (
              <span className="text-[0.6rem] font-semibold tracking-widest uppercase text-gray-400 mt-0.5">
                {title}
              </span>
            )}
          </div>
        </button>

        {/* Spacer — pushes nav links to the right */}
        <div className="flex-1" />

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          <NavLink active={isActive('/')}       onClick={() => go('/')}>Home</NavLink>
          <NavLink active={isActive('/about')}  onClick={() => go('/about')}>About</NavLink>
          <NavLink active={isActive('/forum')}  onClick={() => go('/forum')}>Forum</NavLink>
          <NavLink active={isActive('/donate')} onClick={() => go('/donate')}>Donate</NavLink>

          {session ? (
            <div className="flex items-center gap-1 ml-3 pl-3 border-l border-purple-100">
              <button onClick={() => go('/dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold
                           text-gray-600 hover:text-violet-700 hover:bg-violet-50 transition-all">
                {session.user?.image && (
                  <img src={session.user.image} alt=""
                    className="w-6 h-6 rounded-full ring-1 ring-violet-200" />
                )}
                {session.user?.name?.split(' ')[0]}
              </button>
              <button onClick={() => signOut()}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-400
                           hover:text-red-500 hover:bg-red-50 transition-all">
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => signIn('google')}
              className="ml-3 px-4 py-2 rounded-xl text-sm font-bold
                         bg-gradient-to-r from-violet-600 to-blue-600 text-white
                         hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-violet-200">
              Sign in
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-xl
                     text-gray-500 hover:text-violet-700 hover:bg-violet-50 active:scale-90 transition-all"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out
                       ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-purple-50 bg-white/95 px-3 py-2 flex flex-col gap-1">
          <MobileNavLink active={isActive('/')}       onClick={() => go('/')}>Home</MobileNavLink>
          <MobileNavLink active={isActive('/about')}  onClick={() => go('/about')}>About</MobileNavLink>
          <MobileNavLink active={isActive('/forum')}  onClick={() => go('/forum')}>Forum</MobileNavLink>
          <MobileNavLink active={isActive('/donate')} onClick={() => go('/donate')}>Donate</MobileNavLink>
          {session ? (
            <>
              <MobileNavLink active={isActive('/dashboard')} onClick={() => go('/dashboard')}>
                Dashboard
              </MobileNavLink>
              <button onClick={() => { signOut(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                           text-red-500 hover:bg-red-50 border-l-2 border-transparent transition-all">
                Sign out
              </button>
            </>
          ) : (
            <button onClick={() => { signIn('google'); setMenuOpen(false) }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                         text-violet-700 bg-violet-50 border-l-2 border-violet-500 transition-all">
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ children, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
        ${active ? 'text-violet-700 bg-violet-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/80'}`}
    >
      {children}
      <span className={`absolute bottom-1 left-3 right-3 h-[2px] rounded-full
                        bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-200 origin-left
                        ${active ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
    </button>
  )
}

function MobileNavLink({ children, active, onClick }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold
                  transition-all duration-150 border-l-2
        ${active ? 'bg-violet-50 text-violet-700 border-violet-500'
                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent'}`}
    >
      {children}
    </button>
  )
}