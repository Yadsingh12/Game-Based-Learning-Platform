'use client'
import { useState, useEffect, use } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

function Avatar({ user, size = 8 }) {
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'
  return user?.image ? (
    <img src={user.image} alt=""
      className={`w-${size} h-${size} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div className={`w-${size} h-${size} rounded-full bg-violet-100 text-violet-700
                     flex items-center justify-center font-bold text-xs flex-shrink-0`}>
      {initials}
    </div>
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
  const { postId }        = use(params)
  const { data: session } = useSession()
  const router            = useRouter()

  const [post,       setPost]       = useState(null)
  const [comments,   setComments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [body,       setBody]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    const load = async () => {
      const [postRes, commentsRes] = await Promise.all([
        fetch(`/api/forum/posts`),
        fetch(`/api/forum/posts/${postId}/comments`),
      ])
      const postsData    = await postRes.json()
      const commentsData = await commentsRes.json()
      const found = postsData.posts?.find(p => p.id === postId)
      if (!found) { router.push('/forum'); return }
      setPost(found)
      setComments(commentsData)
      setLoading(false)
    }
    load()
  }, [postId])

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
    await fetch(`/api/forum/posts/${postId}/comments/${commentId}`, { method: 'DELETE' })
    setComments(c => c.filter(x => x.id !== commentId))
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Post */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar user={post.user} size={10} />
            <div>
              <p className="font-bold text-gray-800 text-sm">{post.user?.name}</p>
              <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
            </div>
          </div>
          <h1 className="text-2xl font-black text-gray-800 mb-3">{post.title}</h1>
          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.body}</p>
        </div>

        {/* Comments header */}
        <h2 className="font-black text-gray-800 text-lg mb-4">
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </h2>

        {/* Comment form */}
        {session?.user ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <div className="flex gap-3">
              <Avatar user={session.user} size={9} />
              <div className="flex-1">
                <textarea
                  placeholder="Write a comment..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                             text-gray-800 placeholder-gray-400 resize-none text-sm
                             focus:outline-none focus:border-violet-400 transition-all"
                />
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                <button onClick={handleComment} disabled={submitting || !body.trim()}
                  className="mt-2 px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600
                             text-white font-bold rounded-xl text-sm
                             hover:opacity-90 active:scale-95 transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? 'Posting...' : 'Comment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-center">
            <p className="text-gray-500 text-sm mb-3">Sign in to join the conversation</p>
            <button onClick={() => signIn('google')}
              className="px-5 py-2 bg-gradient-to-r from-violet-600 to-blue-600
                         text-white font-bold rounded-xl text-sm hover:opacity-90 transition-all">
              Sign in
            </button>
          </div>
        )}

        {/* Comments */}
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-sm">No comments yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-3">
                  <Avatar user={comment.user} size={8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-sm">
                          {comment.user?.name?.split(' ')[0]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      {session?.user?.id === comment.user?.id && (
                        <button onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors text-lg">
                          ×
                        </button>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
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