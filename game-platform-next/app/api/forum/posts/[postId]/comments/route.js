import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request, { params }) {
  const { postId } = await params 

  const comments = await db.comment.findMany({
    where:   { postId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { name: true, image: true, id: true } } },
  })
  return Response.json(comments)
}

export async function POST(request, { params }) {
  const { postId } = await params        
  const session = await auth()

  if (!session?.user?.id)
    return Response.json({ error: 'Sign in to comment' }, { status: 401 })

  const { body } = await request.json()
  if (!body?.trim())
    return Response.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const comment = await db.comment.create({
    data:    { body: body.trim(), userId: session.user.id, postId },
    include: { user: { select: { name: true, image: true, id: true } } },
  })

  return Response.json(comment, { status: 201 })
}