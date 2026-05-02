'use client'
import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

function HydrateProgress() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user?.id) return

    const mergeProgress = async () => {
      // 1. Collect everything in localStorage
      const localEntries = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith('progress_')) continue
        const [, packId, gameId] = key.split('_')
        try {
          const data = JSON.parse(localStorage.getItem(key))
          localEntries.push({ packId, gameId, ...data })
        } catch {}
      }

      // 2. Fetch DB progress
      const res = await fetch('/api/progress').catch(() => null)
      if (!res?.ok) return
      const dbEntries = await res.json()

      // 3. Build DB lookup
      const dbMap = {}
      for (const e of dbEntries) {
        dbMap[`${e.packId}_${e.gameId}`] = e
        // Also write DB data into localStorage so it's available offline
        localStorage.setItem(
          `progress_${e.packId}_${e.gameId}`,
          JSON.stringify({ completed: e.completed, score: e.score, attempts: e.attempts })
        )
      }

      // 4. Push local entries that are better than DB (or missing from DB)
      for (const local of localEntries) {
        const key    = `${local.packId}_${local.gameId}`
        const remote = dbMap[key]
        const localIsBetter = !remote ||
          local.score > remote.score ||
          local.attempts > remote.attempts

        if (localIsBetter) {
          await fetch('/api/progress', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              packId:    local.packId,
              gameId:    local.gameId,
              completed: local.completed || remote?.completed || false,
              score:     Math.max(local.score ?? 0, remote?.score ?? 0),
              attempts:  Math.max(local.attempts ?? 0, remote?.attempts ?? 0),
            }),
          }).catch(() => {})
        }
      }
    }

    mergeProgress()
  }, [session?.user?.id])

  return null
}

export default function SessionProvider({ children, session }) {
  return (
    <NextAuthSessionProvider session={session}>
      <HydrateProgress />
      {children}
    </NextAuthSessionProvider>
  )
}