'use client'
import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'

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
  if (s < 60)   return 'just now'
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

export default function ForumPage() {
  const { data: session } = useSession()
  const [posts,       setPosts]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showForm,    setShowForm]    = useState(false)
  const [title,       setTitle]       = useState('')
  const [body,        setBody]        = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState('')

  const fetchPosts = async () => {
    setLoading(true)
    const res  = await fetch('/api/forum/posts')
    const data = await res.json()
    setPosts(data.posts ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchPosts() }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-blue-600 px-6 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-black text-white mb-3">Community Forum</h1>
          <p className="text-white/80 mb-8">
            Ask questions, share tips, and connect with other ISL learners
          </p>
          {session?.user ? (
            <button onClick={() => setShowForm(s => !s)}
              className="px-6 py-3 bg-white text-violet-700 font-black rounded-2xl
                         hover:bg-violet-50 active:scale-95 transition-all shadow-lg">
              {showForm ? '✕ Cancel' : '✏️ New Post'}
            </button>
          ) : (
            <button onClick={() => signIn('google')}
              className="px-6 py-3 bg-white text-violet-700 font-black rounded-2xl
                         hover:bg-violet-50 transition-all shadow-lg">
              Sign in to post
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* New post form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-black text-gray-800 text-lg mb-4">Create a post</h2>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-3
                         font-semibold text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-violet-400 transition-all"
            />
            <textarea
              placeholder="What's on your mind? Ask a question, share a tip..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4
                         text-gray-800 placeholder-gray-400 resize-none
                         focus:outline-none focus:border-violet-400 transition-all"
            />
            {error && <p className="text-red-500 text-sm mb-3 font-medium">{error}</p>}
            <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-blue-600
                           text-white font-bold rounded-xl hover:opacity-90
                           active:scale-95 transition-all disabled:opacity-50">
                {submitting ? 'Posting...' : 'Post'}
              </button>
              <button onClick={() => { setShowForm(false); setError('') }}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold
                           rounded-xl hover:bg-gray-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Posts list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent
                            rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-black text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-500">Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <Link key={post.id} href={`/forum/${post.id}`}
                className="block bg-white rounded-2xl border border-gray-100
                           hover:border-violet-200 hover:shadow-md
                           transition-all p-5 group">
                <div className="flex items-start gap-3">
                  <Avatar user={post.user} size={9} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-black text-gray-800 group-hover:text-violet-700
                                     transition-colors leading-tight">
                        {post.title}
                      </h3>
                      {session?.user?.id === post.user?.id && (
                        <button
                          onClick={e => { e.preventDefault(); handleDelete(post.id) }}
                          className="text-gray-300 hover:text-red-400 transition-colors
                                     flex-shrink-0 text-lg leading-none">
                          ×
                        </button>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{post.body}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-400 font-medium">
                        {post.user?.name?.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400 font-medium">
                        💬 {post._count?.comments ?? 0} comments
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