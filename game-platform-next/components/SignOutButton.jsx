'use client'
import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 rounded-xl text-sm font-bold
                 bg-white/10 text-white/60 border border-white/10
                 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20
                 transition-all">
      Sign out
    </button>
  )
}