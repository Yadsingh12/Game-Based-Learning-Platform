import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(request, { params }) {
  const { commentId } = await params  
  const session = await auth()

  if (!session?.user?.id)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) return Response.json({ error: 'Not found' }, { status: 404 })
  if (comment.userId !== session.user.id)
    return Response.json({ error: 'Forbidden' }, { status: 403 })

  await db.comment.delete({ where: { id: commentId } })
  return Response.json({ success: true })
}