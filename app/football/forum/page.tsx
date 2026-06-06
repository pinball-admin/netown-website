'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import ComplianceNotice from '@/components/football/ComplianceNotice'
import DynamicAdBanner from '@/components/football/DynamicAdBanner'
import MasterUpgradeWidget from '@/components/football/MasterUpgradeWidget'
import FootballTopBar from '@/components/football/FootballTopBar'
import MobileBottomNav from '@/components/football/MobileBottomNav'
import PageTransition from '@/components/ui/PageTransition'

// Pure football images only!
const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1489944440615?w=800',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
  'https://images.unsplash.com/photo-1431324155629?w=800',
  'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=800',
  'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800',
]

interface Comment {
  id: string
  author: string
  avatar: string
  country: string
  content: string
  time: string
  createdAt: Date
}

interface Post {
  id: string
  author: string
  avatar: string
  country: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  time: string
  isHot?: boolean
  isPinned?: boolean
  tags: string[]
  isMasterPost?: boolean
  masterName?: string
  isAIOracle?: boolean
}

// Mock data for master posts and initial posts
const INITIAL_POSTS: Post[] = [
  { id: 'master-beckham_chen', author: 'AI Expert Team', avatar: '🤖', country: '🌍', content: 'Bayesian model leverages P=0.72 for home advantage. Pulisic creativity vs Hakimi speed on the flanks - expect USA to exploit wide areas with precision crosses to Sargent. Morocco set-piece vulnerability (12% conceded from corners in qualifiers) could be decisive.', imageUrl: FOOTBALL_IMAGES[0], likes: 234, comments: 45, time: '2h ago', isHot: true, isPinned: true, tags: ['USA', 'Morocco', 'Analysis'], isMasterPost: true, masterName: 'Beckham Chen' },
  { id: 'master-zidane_gao', author: 'AI Expert Team', avatar: '🤖', country: '🌍', content: 'Modric at 41 still running the show! His partnership with Kovacic and Brozovic is the heartbeat of this team. Nigeria better watch out - Croatia midfield control is UNREAL. Modric worldie probability spikes to 23% when space exists.', imageUrl: FOOTBALL_IMAGES[1], likes: 189, comments: 32, time: '3h ago', isHot: true, tags: ['Croatia', 'Modric', 'Midfield'], isMasterPost: true, masterName: 'Zidane Gao' },
  { id: 'master-batistuta_zhang', author: 'AI Expert Team', avatar: '🤖', country: '🌍', content: 'Neymar ALONE is worth the ticket price! His final World Cup - the entire Brazil is behind him. 2026 is HIS tournament. Prediction: 8 goals minimum! Samba style replication in Europe - Brazil attacking football will terrify opponents.', imageUrl: FOOTBALL_IMAGES[2], likes: 567, comments: 89, time: '4h ago', isHot: true, tags: ['Brazil', 'Neymar', 'Prediction'], isMasterPost: true, masterName: 'Batistuta Zhang' },
]

export default function ForumPage() {
  const { t } = useI18n()
  const { user, isLoggedIn } = useAuth()
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [loading, setLoading] = useState(true)
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newCommentContent, setNewCommentContent] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [oracleTriggering, setOracleTriggering] = useState(false)
  const [oracleResult, setOracleResult] = useState<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({})
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>({})

  // Fetch reactions for all posts
  useEffect(() => {
    if (posts.length === 0) return
    posts.forEach((post) => {
      fetch(`/api/forum/reaction?postId=${post.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setReactions((prev) => ({ ...prev, [post.id]: data.reactions }))
          }
        })
        .catch(() => {})
    })
  }, [posts.length])

  const handleReaction = async (postId: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLoggedIn) return

    try {
      const res = await fetch('/api/forum/reaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, type }),
      })
      const data = await res.json()
      if (data.success) {
        // Update counts
        setReactions((prev) => {
          const current = { ...prev }
          if (!current[postId]) current[postId] = {}
          const delta = data.action === 'added' ? 1 : -1
          current[postId] = {
            ...current[postId],
            [type]: Math.max(0, (current[postId][type] || 0) + delta),
          }
          return current
        })
        // Track user's active reactions
        setUserReactions((prev) => {
          const current = prev[postId] || []
          if (data.action === 'added') {
            return { ...prev, [postId]: [...current, type] }
          } else {
            return { ...prev, [postId]: current.filter((t) => t !== type) }
          }
        })
      }
    } catch {}
  }
  const triggerOracle = async () => {
    setOracleTriggering(true)
    setOracleResult(null)
    try {
      const res = await fetch('/api/cron/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 8, publish: true, windowHours: 72 }),
      })
      const json = await res.json()
      if (json.success) {
        setOracleResult(`✅ ${json.published} predictions published, ${json.processed} processed`)
        // Refresh posts after a short delay
        setTimeout(() => fetchPosts(), 2000)
      } else {
        setOracleResult(`❌ ${json.error || 'Failed'}`)
      }
    } catch {
      setOracleResult('❌ Network error')
    } finally {
      setOracleTriggering(false)
    }
  }

  // Fetch posts on load
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      if (data.success && data.posts && data.posts.length > 0) {
        const dbPosts: Post[] = data.posts.map((p: any) => {
          const isAIOracle = p.author === 'AI Oracle'
          return {
            id: p.id,
            author: isAIOracle ? 'AI Oracle' : p.author,
            avatar: isAIOracle ? '🤖' : (p.avatar || '⚽'),
            country: isAIOracle ? '🌌' : (p.country || '🌍'),
            content: p.content,
            imageUrl: p.imageUrl,
            likes: p.likes || 0,
            comments: p.comments || 0,
            time: formatTime(p.createdAt),
            tags: isAIOracle ? ['AI Prediction', 'Match Analysis'] : ['Discussion'],
            isMasterPost: true,
            isAIOracle,
            masterName: isAIOracle ? 'AI Oracle' : undefined,
          }
        })
        setPosts([...INITIAL_POSTS, ...dbPosts])
      } else {
        setPosts(INITIAL_POSTS)
      }
    } catch (error) {
      console.error('[FORUM] Failed to fetch posts:', error)
      setPosts(INITIAL_POSTS)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`/api/forum/comment?postId=${postId}`)
      const data = await response.json()
      
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('[FORUM] Failed to fetch comments:', error)
      setComments([])
    }
  }

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isLoggedIn) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/forum/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
        }),
      })

      const data = await response.json()
      
      if (data.success && data.post) {
        const newPost: Post = {
          id: data.post.id,
          author: data.post.author,
          avatar: data.post.avatar,
          country: data.post.country,
          content: data.post.content,
          imageUrl: data.post.imageUrl,
          likes: data.post.likes,
          comments: data.post.comments,
          time: data.post.time,
          tags: ['Discussion'],
        }
        setPosts([newPost, ...posts])
        setNewPostContent('')
      }
    } catch (error) {
      console.error('[FORUM] Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newCommentContent.trim() || !isLoggedIn || !selectedPost) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: selectedPost.id,
          content: newCommentContent.trim(),
        }),
      })

      const data = await response.json()
      
      if (data.success && data.comment) {
        setComments([data.comment, ...comments])
        setNewCommentContent('')
        
        // Update post comment count
        setPosts(posts.map(p => 
          p.id === selectedPost.id 
            ? { ...p, comments: p.comments + 1 }
            : p
        ))
        
        if (selectedPost) {
          setSelectedPost({ ...selectedPost, comments: selectedPost.comments + 1 })
        }
      }
    } catch (error) {
      console.error('[FORUM] Failed to create comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post)
    setShowComments(true)
    fetchComments(post.id)
  }

  const closeComments = () => {
    setShowComments(false)
    setSelectedPost(null)
    setComments([])
  }

  return (
    <>
      <PageTransition>
      <div className="relative min-h-screen bg-[#030712] text-slate-50 overflow-x-hidden pb-16 md:pb-0">
      {/* Compliance Notice */}
      <ComplianceNotice />

      {/* Ambient Light Effects */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />

      <FootballTopBar />

      {/* Main Content */}
      <main className="pt-20 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                  🔥 {t('forum.pageTitle')}
                </h1>
                <p className="text-slate-400 mt-2">{t('forum.pageDesc')}</p>
              </div>
              {/* AI Oracle Trigger */}
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={triggerOracle}
                  disabled={oracleTriggering}
                  className="px-4 py-2.5 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 rounded-xl text-violet-400 text-sm font-medium hover:from-violet-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  title="Generate AI predictions and publish to forum"
                >
                  {oracleTriggering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>🔮</span> Run AI Oracle
                    </>
                  )}
                </button>
                {oracleResult && (
                  <span className={`text-xs ${oracleResult.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'}`}>
                    {oracleResult}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* Main Content - 70% */}
            <div className="lg:col-span-7 space-y-6">
              {/* Post Creation Box */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  {t('forum.postYourThoughts')}
                </h2>
                
                {isLoggedIn ? (
                  <div>
                    <textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={t('forum.sharePlaceholder')}
                      className="w-full bg-slate-800/60 text-slate-300 placeholder-slate-500 rounded-xl p-4 border border-slate-700/60 resize-none focus:outline-none focus:border-orange-500/30 mb-4 min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {newPostContent.length}/500
                      </span>
                      <button
                        onClick={handleSubmitPost}
                        disabled={!newPostContent.trim() || isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? t('forum.posting') : t('forum.post')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-800/40 rounded-xl border border-amber-500/30 text-center">
                    <div className="text-amber-400 text-lg mb-2">{t('forum.loginRequired')}</div>
                    <p className="text-slate-400 text-sm mb-4">{t('forum.loginToParticipate')}</p>
                    <Link 
                      href="/"
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-400 hover:to-pink-400 transition-all duration-300 inline-block"
                    >
                      {t('forum.goToLogin')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {loading ? (
                  <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">{t('forum.loadingPosts')}</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handleSelectPost(post)}
                      className={`bg-slate-900/40 backdrop-blur-md border rounded-xl p-5 shadow-xl transition-all duration-300 cursor-pointer hover:border-orange-500/30 hover:-translate-y-0.5 ${
                        post.isPinned ? 'border-amber-500/50' : post.isHot ? 'border-orange-500/30' : 'border-slate-800/60'
                      } ${post.isMasterPost ? 'border-l-4 border-l-emerald-500' : ''}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${post.isMasterPost ? 'from-emerald-500 to-cyan-500' : 'from-slate-600 to-slate-700'} flex items-center justify-center text-xl flex-shrink-0 shadow-lg`}>
                          {post.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-white font-semibold truncate">
                              {post.isMasterPost ? post.masterName : post.author}
                            </span>
                            <span className="text-slate-500">{post.country}</span>
                            {post.isHot && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">🔥 {t('ui.hot')}</span>}
                            {post.isPinned && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">📌 {t('ui.pinned')}</span>}
                            {post.isMasterPost && !post.isAIOracle && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">{t('forum.aiExpert')}</span>}
                            {post.isAIOracle && <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">🔮 {t('forum.aiOracle')}</span>}
                          </div>
                          <span className="text-slate-500 text-xs">{post.time}</span>
                        </div>
                      </div>

                      <p className="text-slate-300 leading-relaxed mb-4">{post.content}</p>

                      {post.imageUrl && (
                        <div className="mb-4 rounded-xl overflow-hidden">
                          <img
                            src={post.imageUrl}
                            alt="Football"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 pt-3 border-t border-slate-800/60 flex-wrap">
                        {/* Reaction buttons */}
                        {[
                          { type: 'like', emoji: '❤️', label: 'Like' },
                          { type: 'fire', emoji: '🔥', label: 'Fire' },
                          { type: 'laugh', emoji: '😂', label: 'Haha' },
                          { type: 'sad', emoji: '😢', label: 'Sad' },
                        ].map((r) => {
                          const count = reactions[post.id]?.[r.type] || 0
                          const active = (userReactions[post.id] || []).includes(r.type)
                          return (
                            <button
                              key={r.type}
                              onClick={(e) => handleReaction(post.id, r.type, e)}
                              className={`flex items-center gap-1 text-sm transition-all ${
                                active ? 'scale-110' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={r.label}
                            >
                              <span className={active ? '' : 'opacity-70'}>{r.emoji}</span>
                              {count > 0 && <span className="text-xs font-medium text-slate-400">{count}</span>}
                            </button>
                          )
                        })}
                        <div className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 transition-colors ml-auto">
                          <span>💬</span>
                          <span className="text-sm font-medium">{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar - 30% */}
            <div className="lg:col-span-3 space-y-6">
              <MasterUpgradeWidget />

              {/* Hot Posts Sidebar */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                  🔥 {t('forum.hotTopics')}
                </h2>
                <div className="space-y-3">
                  {posts.filter(p => p.isHot).slice(0, 5).map((post) => (
                    <div key={post.id} className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/60 hover:border-orange-500/30 transition-all cursor-pointer" onClick={() => handleSelectPost(post)}>
                      <p className="text-slate-300 text-sm line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span>❤️ {post.likes}</span>
                        <span>💬 {post.comments}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Banner Ad */}
              <DynamicAdBanner teamId="forum-top" teamName="Football Forum" teamFlag="⚽" variant="inline" />

              {/* Quick Stats */}
              <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                  {t('forum.forumStats')}
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400">{t('forum.totalPosts')}</span>
                    <span className="text-emerald-400 font-bold">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400">{t('forum.aiExperts')}</span>
                    <span className="text-cyan-400 font-bold">5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-800/40 rounded-lg">
                    <span className="text-slate-400">{t('forum.hotDiscussions')}</span>
                    <span className="text-orange-400 font-bold">{posts.filter(p => p.isHot).length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Comments Modal */}
      {showComments && selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#030712] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                {t('forum.discussion')}
              </h3>
              <button 
                onClick={closeComments}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Post Preview */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/40">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selectedPost.isMasterPost ? 'from-emerald-500 to-cyan-500' : 'from-slate-600 to-slate-700'} flex items-center justify-center text-xl flex-shrink-0`}>
                  {selectedPost.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-semibold">{selectedPost.isMasterPost ? selectedPost.masterName : selectedPost.author}</span>
                  <span className="text-slate-500 text-sm ml-2">{selectedPost.time}</span>
                </div>
              </div>
              <p className="text-slate-300">{selectedPost.content}</p>
              {selectedPost.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden">
                  <img
                    src={selectedPost.imageUrl}
                    alt="Football"
                    className="w-full h-40 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="p-6 border-b border-slate-800">
              {isLoggedIn ? (
                <div>
                  <textarea
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder={t('forum.addComment')}
                    className="w-full bg-slate-800/60 text-slate-300 placeholder-slate-500 rounded-xl p-4 border border-slate-700/60 resize-none focus:outline-none focus:border-emerald-500/30 mb-3 min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newCommentContent.trim() || isSubmittingComment}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? t('forum.commenting') : t('forum.comment')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30 text-center">
                  <p className="text-amber-400 text-sm">{t('forum.loginToComment')}</p>
                </div>
              )}
            </div>

            {/* Comments List */}
            <div className="p-6 overflow-y-auto max-h-[40vh]">
              {comments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>{t('forum.noCommentsYet')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-base flex-shrink-0">
                          {comment.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium text-sm">{comment.author}</span>
                            <span className="text-slate-500 text-xs">{comment.country}</span>
                            <span className="text-slate-500 text-xs">{comment.time}</span>
                          </div>
                          <p className="text-slate-300 text-sm mt-2">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
    <MobileBottomNav />
    </>
  )
}

function formatTime(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(date).toLocaleDateString()
}
