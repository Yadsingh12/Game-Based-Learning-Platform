import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  const { postId } = await params  

  const post = await db.post.findUnique({
    where:   { id: postId },
    include: {
      user:   { select: { name: true, image: true, id: true } },
      _count: { select: { comments: true } },
    },
  })
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 })
  return Response.json(post)
}

export async function DELETE(request, { params }) {
  const { postId } = await params        // ← await
  const session = await auth()

  if (!session?.user?.id)
    return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const post = await db.post.findUnique({ where: { id: postId } })
  if (!post) return Response.json({ error: 'Not found' }, { status: 404 })
  if (post.userId !== session.user.id)
    return Response.json({ error: 'Forbidden' }, { status: 403 })

  await db.post.delete({ where: { id: postId } })
  return Response.json({ success: true })
}