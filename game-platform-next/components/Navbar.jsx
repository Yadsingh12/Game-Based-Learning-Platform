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
    <nav className="sticky top-0 z-40 bg-[#0f0a1e]/90 backdrop-blur-md border-b border-white/[0.07]">

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2">

        {/* Back button */}
        {backPath && (
          <button
            onClick={() => router.push(backPath)}
            aria-label="Go back"
            className="w-8 h-8 rounded-lg flex items-center justify-center
                       text-white/35 hover:text-white/75 hover:bg-white/[0.06]
                       active:scale-90 transition-all duration-150"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
          </button>
        )}

        {/* Logo */}
        <button
          onClick={() => go('/')}
          className="flex items-center gap-2.5 active:scale-[0.98] transition-transform duration-150"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600
                          flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
              <path d="M5 15V8M5 8L10 5L15 8M15 8V15"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="12" r="2.5" fill="white" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-black text-[15px] tracking-tight text-white">
              SignLearn
            </span>
            {title && (
              <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-white/25 mt-0.5">
                {title}
              </span>
            )}
          </div>
        </button>

        <div className="flex-1" />

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-0.5">
          <NavLink active={isActive('/')}       onClick={() => go('/')}>Home</NavLink>
          <NavLink active={isActive('/about')}  onClick={() => go('/about')}>About</NavLink>
          <NavLink active={isActive('/forum')}  onClick={() => go('/forum')}>Forum</NavLink>
          <NavLink active={isActive('/donate')} onClick={() => go('/donate')}>Donate</NavLink>
        </div>

        {/* Desktop auth */}
        <div className="hidden sm:flex items-center">
          {session ? (
            <>
              <div className="w-px h-5 bg-white/[0.08] mx-3" />
              <button
                onClick={() => go('/dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg
                           text-white/55 hover:text-white hover:bg-white/[0.06]
                           transition-all duration-150"
              >
                {session.user?.image ? (
                  <img src={session.user.image} alt=""
                    className="w-6 h-6 rounded-full" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-blue-600
                                  flex items-center justify-center text-[11px] font-black text-white">
                    {session.user?.name?.[0]}
                  </div>
                )}
                <span className="text-sm font-semibold">
                  {session.user?.name?.split(' ')[0]}
                </span>
              </button>
              <button
                onClick={() => signOut()}
                className="ml-1 px-3 py-1.5 rounded-lg text-sm font-semibold
                           text-white/25 hover:text-red-400 hover:bg-red-500/10
                           transition-all duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="w-px h-5 bg-white/[0.08] mx-3" />
              <button
                onClick={() => signIn('google')}
                className="px-4 py-2 rounded-lg text-sm font-bold text-white
                           bg-gradient-to-r from-violet-600 to-blue-600
                           hover:opacity-90 active:scale-95 transition-all duration-150"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center
                     text-white/40 hover:text-white/75 hover:bg-white/[0.06]
                     active:scale-90 transition-all duration-150"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden overflow-hidden transition-all duration-200 ease-in-out
                       ${menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-white/[0.07] bg-[#0d0919]/98 px-3 py-2 flex flex-col gap-0.5">
          <MobileNavLink active={isActive('/')}       onClick={() => go('/')}>Home</MobileNavLink>
          <MobileNavLink active={isActive('/about')}  onClick={() => go('/about')}>About</MobileNavLink>
          <MobileNavLink active={isActive('/forum')}  onClick={() => go('/forum')}>Forum</MobileNavLink>
          <MobileNavLink active={isActive('/donate')} onClick={() => go('/donate')}>Donate</MobileNavLink>

          <div className="my-1.5 border-t border-white/[0.07]" />

          {session ? (
            <>
              <MobileNavLink active={isActive('/dashboard')} onClick={() => go('/dashboard')}>
                Dashboard
              </MobileNavLink>
              <button
                onClick={() => { signOut(); setMenuOpen(false) }}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold
                           text-red-400/70 hover:text-red-400 hover:bg-red-500/10
                           transition-all duration-150"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={() => { signIn('google'); setMenuOpen(false) }}
              className="w-full py-2.5 rounded-lg text-sm font-bold text-white text-center
                         bg-gradient-to-r from-violet-600 to-blue-600
                         hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
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
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150
        ${active
          ? 'text-white bg-white/[0.08]'
          : 'text-white/45 hover:text-white/80 hover:bg-white/[0.05]'}`}
    >
      {children}
    </button>
  )
}

function MobileNavLink({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold
                  transition-all duration-150
        ${active
          ? 'text-white bg-white/[0.08]'
          : 'text-white/45 hover:text-white/75 hover:bg-white/[0.05]'}`}
    >
      {children}
    </button>
  )
}