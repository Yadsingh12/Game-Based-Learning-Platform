'use client'
import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function Avatar({ user, size = 36 }) {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  if (user?.image) return (
    <img src={user.image} alt=""
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  )
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(124,58,237,0.2)', color: '#a78bfa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.35,
    }}>{initials}</div>
  )
}

function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60)    return 'just now'
  if (s < 3600)  return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function PostPage({ params }) {
  const { postId }                = use(params)
  const { data: session, status } = useSession()
  const router                    = useRouter()

  const [post,       setPost]       = useState(null)
  const [comments,   setComments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [body,       setBody]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin')
  }, [status])

  useEffect(() => {
    if (status !== 'authenticated') return
    const load = async () => {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/forum/posts/${postId}`),
        fetch(`/api/forum/posts/${postId}/comments`),
      ])
      if (!postRes.ok) { router.push('/forum'); return }
      const [postData, commentsData] = await Promise.all([
        postRes.json(), commentsRes.json(),
      ])
      setPost(postData)
      setComments(Array.isArray(commentsData) ? commentsData : [])
      setLoading(false)
    }
    load()
  }, [postId, status])

  const handleComment = async () => {
    setError('')
    if (!body.trim()) return
    setSubmitting(true)
    const res  = await fetch(`/api/forum/posts/${postId}/comments`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ body }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setComments(c => [...c, data])
    setBody('')
    setSubmitting(false)
  }

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    const res = await fetch(`/api/forum/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    if (res.ok) setComments(c => c.filter(x => x.id !== commentId))
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return
    const res = await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' })
    if (res.ok) router.push('/forum')
  }

  if (status === 'loading' || status === 'unauthenticated' || loading) return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-600/10 to-transparent" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">

        <Link href="/forum"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70
                     text-sm font-bold transition-colors mb-8">
          ← Back to Forum
        </Link>

        {/* Post */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <Avatar user={post.user} size={40} />
              <div>
                <p className="text-white font-bold text-sm">{post.user?.name}</p>
                <p className="text-white/30 text-xs">{timeAgo(post.createdAt)}</p>
              </div>
            </div>
            {session?.user?.id === post.user?.id && (
              <button onClick={handleDeletePost}
                className="text-white/20 hover:text-red-400 text-sm font-bold
                           px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all
                           border border-transparent hover:border-red-500/20">
                Delete
              </button>
            )}
          </div>
          <h1 className="text-2xl font-black text-white mb-3">{post.title}</h1>
          <p className="text-white/50 leading-relaxed whitespace-pre-wrap">{post.body}</p>
        </div>

        {/* Comments count */}
        <h2 className="text-white font-black text-lg mb-4">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>

        {/* Comment form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6">
          <div className="flex gap-3">
            <Avatar user={session.user} size={36} />
            <div className="flex-1">
              <textarea
                placeholder="Write a comment..."
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                           text-white placeholder-white/20 resize-none text-sm
                           focus:outline-none focus:border-violet-500/50 transition-all"
              />
              {error && <p className="text-red-400 text-xs mt-1 font-medium">{error}</p>}
              <button
                onClick={handleComment}
                disabled={submitting || !body.trim()}
                className="mt-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600
                           text-white font-bold rounded-xl text-sm
                           hover:opacity-90 active:scale-95 transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>

        {/* Empty comments */}
        {comments.length === 0 ? (
          <div className="text-center py-16 bg-white/5 border border-white/10 rounded-2xl">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-white font-black mb-1">No comments yet</p>
            <p className="text-white/30 text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map(comment => (
              <div key={comment.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <Avatar user={comment.user} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">
                          {comment.user?.name?.split(' ')[0]}
                        </span>
                        <span className="text-white/30 text-xs">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {session?.user?.id === comment.user?.id && (
                        <button onClick={() => handleDeleteComment(comment.id)}
                          className="text-white/20 hover:text-red-400 transition-colors
                                     text-xl leading-none px-1">
                          ×
                        </button>
                      )}
                    </div>
                    <p className="text-white/50 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}