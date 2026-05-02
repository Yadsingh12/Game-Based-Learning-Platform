'use client'
import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="px-4 py-2 rounded-xl text-sm font-bold
                 bg-white/20 text-white border border-white/30
                 hover:bg-white/30 active:scale-95 transition-all"
    >
      Sign out
    </button>
  )
}