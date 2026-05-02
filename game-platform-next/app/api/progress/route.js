import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/progress?packId=xxx  — fetch all progress for a pack
export async function GET(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json([], { status: 200 })

  const { searchParams } = new URL(request.url)
  const packId = searchParams.get('packId')

  const progress = await db.progress.findMany({
    where: { userId: session.user.id, ...(packId ? { packId } : {}) },
  })

  return Response.json(progress)
}

// POST /api/progress — save progress for a game
export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { packId, gameId, completed, score, attempts } = await request.json()

  const progress = await db.progress.upsert({
    where: { userId_packId_gameId: { userId: session.user.id, packId, gameId } },
    update: { completed, score, attempts },
    create: { userId: session.user.id, packId, gameId, completed, score, attempts },
  })

  return Response.json(progress)
}