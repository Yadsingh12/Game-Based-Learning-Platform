import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const page  = parseInt(searchParams.get('page') ?? '1')
  const limit = 20

  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    skip:  (page - 1) * limit,
    take:  limit,
    include: {
      user:     { select: { name: true, image: true, id: true } },
      _count:   { select: { comments: true } },
    },
  })

  const total = await db.post.count()
  return Response.json({ posts, total, pages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id)
    return Response.json({ error: 'Sign in to post' }, { status: 401 })

  const { title, body } = await request.json()
  if (!title?.trim() || !body?.trim())
    return Response.json({ error: 'Title and body required' }, { status: 400 })

  const post = await db.post.create({
    data: { title: title.trim(), body: body.trim(), userId: session.user.id },
    include: { user: { select: { name: true, image: true, id: true } }, _count: { select: { comments: true } } },
  })

  return Response.json(post, { status: 201 })
}