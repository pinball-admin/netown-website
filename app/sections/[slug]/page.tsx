'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Footer from '@/components/Footer'

interface SectionDetail {
  id: string
  name: string
  description: string | null
  slug: string
  icon: string | null
  category: string | null
  rules: string | null
  status: string
  memberCount: number
  postCount: number
  createdAt: string
  owner: { id: string; name: string; displayName: string | null } | null
  _count: { members: number; posts: number }
}

interface PostData {
  id: string
  content: string
  imageUrl: string | null
  sourceLanguage: string
  likes: number
  createdAt: string
  user: { id: string; name: string; displayName: string | null; avatarUrl: string | null }
  _count: { comments: number; reactions: number }
}

export default function SectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const slug = params.slug as string

  const [section, setSection] = useState<SectionDetail | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  // Check if user just created this section
  const justCreated = searchParams.get('created') === 'true'

  // Fetch section detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionRes, membershipRes] = await Promise.all([
          fetch(`/api/sections/${slug}`),
          fetch(`/api/sections/${slug}/posts`),
        ])
        const sectionData = await sectionRes.json()
        if (sectionData.success) setSection(sectionData.section)

        const postsData = await membershipRes.json()
        if (postsData.success) setPosts(postsData.posts)
      } catch (err) {
        console.error('Failed to fetch section:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  // Check membership
  useEffect(() => {
    if (!user || !section) return
    setIsOwner(section.owner?.id === user.id)
    // Simple check - try to see if user is a member
    const checkMembership = async () => {
      try {
        // For now, just check if user is the owner
        if (section.owner?.id === user.id) {
          setIsMember(true)
        }
      } catch (err) {}
    }
    checkMembership()
  }, [user, section])

  const handleJoin = async () => {
    if (!user) {
      toast('请先登录', 'error')
      return
    }
    setJoining(true)
    try {
      const res = await fetch(`/api/sections/${slug}/join`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setIsMember(true)
        setSection(prev => prev ? { ...prev, memberCount: prev.memberCount + 1, _count: { ...prev._count, members: prev._count.members + 1 } } : prev)
        toast('已加入板块', 'success')
      } else {
        toast(data.message, 'error')
      }
    } catch (err) {
      toast('操作失败', 'error')
    } finally {
      setJoining(false)
    }
  }

  const handleLeave = async () => {
    setJoining(true)
    try {
      const res = await fetch(`/api/sections/${slug}/leave`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setIsMember(false)
        setSection(prev => prev ? { ...prev, memberCount: prev.memberCount - 1, _count: { ...prev._count, members: prev._count.members - 1 } } : prev)
        toast('已离开板块', 'success')
      } else {
        toast(data.message, 'error')
      }
    } catch (err) {
      toast('操作失败', 'error')
    } finally {
      setJoining(false)
    }
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.trim()) return
    setPosting(true)
    try {
      // Use forum create API but we need to add sectionId support
      // For now, create a post via the forum API
      // TODO: Add sectionId to forum create API
      const res = await fetch('/api/forum/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newPost }),
      })
      const data = await res.json()
      if (data.success) {
        setNewPost('')
        toast('发布成功', 'success')
        // Refresh posts
        const postsRes = await fetch(`/api/sections/${slug}/posts`)
        const postsData = await postsRes.json()
        if (postsData.success) setPosts(postsData.posts)
      } else {
        toast(data.message, 'error')
      }
    } catch (err) {
      toast('发布失败', 'error')
    } finally {
      setPosting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-white mb-2">板块不存在</h2>
          <Link href="/sections" className="text-emerald-400 hover:text-emerald-300">← 返回板块列表</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030712]">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/sections" className="text-sm text-slate-400 hover:text-white transition-all">
            ← 板块列表
          </Link>
          <Link href="/" className="text-white font-bold text-lg">Netown</Link>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Just created notice */}
        {justCreated && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="text-amber-400 font-bold">板块已创建，等待管理员审核</p>
                <p className="text-amber-400/70 text-sm">管理员审核通过后，其他用户才能看到和加入该板块</p>
              </div>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="bg-[#0f1729] border border-slate-800 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-5">
            <div className="text-5xl flex-shrink-0 w-16 h-16 flex items-center justify-center bg-slate-800 rounded-xl">
              {section.icon || '📁'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{section.name}</h1>
                {section.status === 'pending' && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                    审核中
                  </span>
                )}
              </div>
              {section.description && (
                <p className="text-slate-400 mb-4">{section.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span>👥 {section.memberCount} 成员</span>
                <span>📝 {section.postCount} 帖子</span>
                {section.owner && (
                  <span>👑 {section.owner.displayName || section.owner.name}</span>
                )}
                {section.rules && (
                  <button
                    onClick={() => setShowRules(!showRules)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    📜 版规
                  </button>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              {isOwner ? (
                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-bold">
                  版主
                </span>
              ) : isMember ? (
                <button
                  onClick={handleLeave}
                  disabled={joining}
                  className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-sm font-bold hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50"
                >
                  {joining ? '...' : '退出'}
                </button>
              ) : section.status === 'approved' ? (
                <button
                  onClick={handleJoin}
                  disabled={joining || !user}
                  className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg text-sm hover:bg-emerald-400 transition-all disabled:opacity-50"
                >
                  {joining ? '...' : !user ? '登录后加入' : '+ 加入'}
                </button>
              ) : null}
            </div>
          </div>

          {/* Rules */}
          {showRules && section.rules && (
            <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
              <h3 className="text-white font-bold mb-2">📜 版规</h3>
              <p className="text-slate-300 text-sm whitespace-pre-wrap">{section.rules}</p>
            </div>
          )}
        </div>

        {/* Post creation */}
        {user && section.status === 'approved' && (
          <form onSubmit={handlePost} className="mb-6 bg-[#0f1729] border border-slate-800 rounded-xl p-4">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`在 #${section.name} 发帖...`}
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">{newPost.length}/500</span>
              <button
                type="submit"
                disabled={posting || !newPost.trim()}
                className="px-5 py-2 bg-emerald-500 text-black font-bold text-sm rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-all"
              >
                {posting ? '发布中...' : '发布'}
              </button>
            </div>
          </form>
        )}

        {/* Posts */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white mb-4">📝 帖子</h2>
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-[#0f1729] border border-slate-800 rounded-xl">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-slate-400">还没有帖子，来发第一条吧！</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-[#0f1729] border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-bold">
                    {(post.user.displayName || post.user.name || '?')[0]}
                  </div>
                  <span className="text-sm text-white font-medium">{post.user.displayName || post.user.name}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
                <p className="text-slate-200 text-sm whitespace-pre-wrap mb-3">{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="rounded-lg max-h-60 object-cover mb-3" />
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>❤️ {post.likes || post._count?.reactions || 0}</span>
                  <span>💬 {post._count?.comments || 0}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
