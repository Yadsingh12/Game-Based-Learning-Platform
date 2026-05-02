import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const allProgress = await db.progress.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  const completed  = allProgress.filter(p => p.completed)
  const totalScore = completed.reduce((sum, p) => sum + p.score, 0)
  const avgScore   = completed.length ? Math.round(totalScore / completed.length) : 0

  return Response.json({
    totalGamesPlayed:    allProgress.length,
    totalGamesCompleted: completed.length,
    averageScore:        avgScore,
    recentActivity:      allProgress.slice(0, 10),
    progress:            allProgress,
  })
}