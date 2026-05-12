'use client'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
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

export default function ForumPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showForm,   setShowForm]   = useState(false)
  const [title,      setTitle]      = useState('')
  const [body,       setBody]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin')
  }, [status])

  const fetchPosts = async () => {
    setLoading(true)
    const res  = await fetch('/api/forum/posts')
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (status === 'authenticated') fetchPosts()
  }, [status])

  const handleSubmit = async () => {
    setError('')
    if (!title.trim() || !body.trim()) { setError('Fill in both fields'); return }
    setSubmitting(true)
    const res  = await fetch('/api/forum/posts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, body }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSubmitting(false); return }
    setPosts(p => [data, ...p])
    setTitle(''); setBody(''); setShowForm(false)
    setSubmitting(false)
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return
    await fetch(`/api/forum/posts/${postId}`, { method: 'DELETE' })
    setPosts(p => p.filter(x => x.id !== postId))
  }

  if (status === 'loading' || status === 'unauthenticated') return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      {/* Ambient blob */}
      <div className="absolute top-0 left-0 right-0 h-64 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/10
                        blur-3xl scale-110" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-white/10 border border-white/10 mb-4">
            <span className="text-sm">💬</span>
            <span className="text-white/60 text-xs font-bold uppercase tracking-wider">
              Community
            </span>
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Forum</h1>
          <p className="text-white/40 mb-8">
            Ask questions, share tips, connect with ISL learners
          </p>
          <button
            onClick={() => setShowForm(s => !s)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600
                       text-white font-black rounded-2xl hover:opacity-90
                       active:scale-95 transition-all shadow-lg shadow-violet-500/25">
            {showForm ? '✕ Cancel' : '✏️ New Post'}
          </button>
        </div>

        {/* New post form */}
        {showForm && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h2 className="text-white font-black text-lg mb-4">Create a post</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl mb-3
                         text-white placeholder-white/20 font-semibold
                         focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <textarea
              placeholder="What's on your mind?"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl mb-4
                         text-white placeholder-white/20 resize-none
                         focus:outline-none focus:border-violet-500/50 transition-all"
            />
            {error && <p className="text-red-400 text-sm mb-3 font-medium">{error}</p>}
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600
                           text-white font-bold rounded-xl hover:opacity-90
                           active:scale-95 transition-all disabled:opacity-50">
                {submitting ? 'Posting...' : 'Post'}
              </button>
              <button onClick={() => { setShowForm(false); setError('') }}
                className="px-6 py-2.5 bg-white/10 text-white/60 font-bold
                           rounded-xl hover:bg-white/20 transition-all border border-white/10">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-white font-black text-xl mb-2">No posts yet</h3>
            <p className="text-white/40">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <Link key={post.id} href={`/forum/${post.id}`}
                className="block bg-white/5 border border-white/10 rounded-2xl p-5
                           hover:bg-white/10 hover:border-white/20 transition-all group">
                <div className="flex items-start gap-3">
                  <Avatar user={post.user} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-white font-black leading-tight
                                     group-hover:text-violet-300 transition-colors">
                        {post.title}
                      </h3>
                      {session?.user?.id === post.user?.id && (
                        <button
                          onClick={e => { e.preventDefault(); handleDelete(post.id) }}
                          className="text-white/20 hover:text-red-400 transition-colors
                                     flex-shrink-0 text-xl leading-none">
                          ×
                        </button>
                      )}
                    </div>
                    <p className="text-white/40 text-sm line-clamp-2 mb-3">{post.body}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs font-semibold">
                        {post.user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/30 text-xs">{timeAgo(post.createdAt)}</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/30 text-xs font-semibold">
                        💬 {post._count?.comments ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}