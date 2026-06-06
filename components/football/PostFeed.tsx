'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { SkeletonPostCard } from '@/components/ui/Skeleton'

interface Comment {
  id: string
  author: string
  avatar: string
  country: string
  content: string
  time: string
}

interface Post {
  id: string | number
  author: string
  avatar: string
  country: string
  content: string
  imageUrl?: string
  likes: number
  comments: Comment[]
  commentCount?: number
  time: string
  isHot?: boolean
  isPinned?: boolean
  tags: string[]
}

// Pure football images only!
const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1489944440615?w=800',
  'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=800',
  'https://images.unsplash.com/photo-1431324155629?w=800',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
]

function getMockPosts(t: (key: string) => string): Post[] {
  return [
    {
      id: 1,
      author: t('ui.mockAuthor1'),
      avatar: '🔵',
      country: '🇦🇷',
      content: t('ui.mockPost1'),
      imageUrl: FOOTBALL_IMAGES[0],
      likes: 234,
      comments: [
        { id: 'c1', author: 'FootballExpert', avatar: '⚽', country: '🇺🇸', content: t('ui.mockPost1').substring(0, 30) + '...', time: `1${t('ui.hAgo')}` },
        { id: 'c2', author: 'WorldCupFan', avatar: '⚽', country: '🌍', content: t('ui.mockPost1').substring(30, 60) + '...', time: `30${t('ui.mAgo')}` },
      ],
      time: `2${t('ui.hAgo')}`,
      isHot: true,
      isPinned: true,
      tags: [t('ui.mockTag1a'), t('ui.mockTag1b'), t('ui.mockTag1c')],
    },
    {
      id: 2,
      author: t('ui.mockAuthor2'),
      avatar: '🔴',
      country: '🇭🇷',
      content: t('ui.mockPost2'),
      imageUrl: FOOTBALL_IMAGES[1],
      likes: 189,
      comments: [
        { id: 'c3', author: 'ModricFan', avatar: '⚽', country: '🇪🇸', content: t('ui.mockPost2').substring(0, 30) + '...', time: `2${t('ui.hAgo')}` },
      ],
      time: `3${t('ui.hAgo')}`,
      isHot: true,
      tags: [t('ui.mockTag2a'), t('ui.mockTag2b'), t('ui.mockTag2c')],
    },
    {
      id: 3,
      author: t('ui.mockAuthor3'),
      avatar: '💛',
      country: '🇧🇷',
      content: t('ui.mockPost3'),
      imageUrl: FOOTBALL_IMAGES[2],
      likes: 567,
      comments: [],
      time: `4${t('ui.hAgo')}`,
      isHot: true,
      tags: [t('ui.mockTag3a'), t('ui.mockTag3b'), t('ui.mockTag3c')],
    },
    {
      id: 4,
      author: t('ui.mockAuthor4'),
      avatar: '⚽',
      country: '🏴',
      content: t('ui.mockPost4'),
      imageUrl: FOOTBALL_IMAGES[3],
      likes: 345,
      comments: [],
      time: `5${t('ui.hAgo')}`,
      isHot: true,
      tags: [t('ui.mockTag4a'), t('ui.mockTag4b'), t('ui.mockTag4c')],
    },
    {
      id: 5,
      author: t('ui.mockAuthor5'),
      avatar: '💙',
      country: '🇫🇷',
      content: t('ui.mockPost5'),
      imageUrl: FOOTBALL_IMAGES[0],
      likes: 456,
      comments: [],
      time: `6${t('ui.hAgo')}`,
      isHot: true,
      tags: [t('ui.mockTag5a'), t('ui.mockTag5b'), t('ui.mockTag5c')],
    },
  ]
}

export default function PostFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPost, setExpandedPost] = useState<string | null>(null)
  const [newComment, setNewComment] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isLoggedIn } = useAuth()
  const { t } = useI18n()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/posts')
      const data = await response.json()

      if (data.success && data.posts && data.posts.length > 0) {
        const dbPosts: Post[] = data.posts.map((p: any) => ({
          id: p.id,
          author: p.author,
          avatar: p.avatar || '⚽',
          country: p.country || '🌍',
          content: p.content,
          imageUrl: p.imageUrl || FOOTBALL_IMAGES[Math.floor(Math.random() * FOOTBALL_IMAGES.length)],
          likes: p.likes || 0,
          comments: [],
          commentCount: typeof p.comments === 'number' ? p.comments : 0,
          time: formatTime(p.createdAt),
          tags: ['Discussion'],
        }))
        setPosts(dbPosts)
      } else {
        setPosts(getMockPosts(t))
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts(getMockPosts(t))
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return t('ui.justNow')
    if (diffMins < 60) return `${diffMins}${t('ui.mAgo')}`
    if (diffHours < 24) return `${diffHours}${t('ui.hAgo')}`
    if (diffDays < 7) return `${diffDays}${t('ui.dAgo')}`
    return date.toLocaleDateString()
  }

  const loadComments = async (postId: string | number) => {
    try {
      const response = await fetch(`/api/forum/comment?postId=${encodeURIComponent(String(postId))}`)
      const data = await response.json()
      if (data.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: data.comments } : post
          )
        )
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const handleExpandPost = (postId: string | number) => {
    const id = String(postId)
    if (expandedPost === id) {
      setExpandedPost(null)
      return
    }
    setExpandedPost(id)
    loadComments(postId)
  }

  const handleSubmitComment = async (postId: string | number) => {
    if (!newComment.trim() || !isLoggedIn || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: String(postId), content: newComment.trim() }),
      })

      const data = await response.json()

      if (data.success && data.comment) {
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [data.comment, ...post.comments],
            }
          }
          return post
        }))
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {loading ? (
        <>
          <SkeletonPostCard />
          <SkeletonPostCard />
          <SkeletonPostCard />
        </>
      ) : (
        posts.map((post) => (
        <div
          key={post.id}
          className={`bg-slate-900/60 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-300 ${
            post.isPinned ? 'border-amber-500/50' : post.isHot ? 'border-orange-500/30' : 'border-slate-700/60'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold">{post.author}</span>
                  <span>{post.country}</span>
                  {post.isHot && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full font-medium">
                      🔥 {t('ui.hot')}
                    </span>
                  )}
                  {post.isPinned && (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full font-medium">
                      📌 {t('ui.pinned')}
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-sm">{post.time}</span>
              </div>
            </div>

            {/* Content */}
            <p className="text-slate-200 text-base sm:text-lg leading-relaxed mt-4 mb-4">
              {post.content}
            </p>

            {/* Image */}
            {post.imageUrl && (
              <div className="rounded-xl overflow-hidden mb-4">
                <img
                  src={post.imageUrl}
                  alt={t('ui.footballAction')}
                  className="w-full h-48 md:h-64 object-cover"
                />
              </div>
            )}

            {/* Tags */}
            <div className="flex gap-2 flex-wrap mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors">
                <span className="text-xl">❤️</span>
                <span className="text-sm font-medium">{post.likes}</span>
              </button>
              <button
                onClick={() => handleExpandPost(post.id)}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
              >
                <span className="text-xl">💬</span>
                <span className="text-sm font-medium">
                  {post.comments.length > 0 ? post.comments.length : (post.commentCount ?? 0)} {t('ui.comments')}
                </span>
              </button>
              <button className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors">
                <span className="text-xl">🔄</span>
                <span className="text-sm font-medium">{t('ui.share')}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {expandedPost === String(post.id) && (
            <div className="px-6 pb-6 border-t border-slate-700/60 pt-4">
              {/* Comments List */}
              <div className="space-y-3 mb-4">
                {post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-800/40 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                          {comment.avatar}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{comment.author}</span>
                          <span>{comment.country}</span>
                          <span className="text-slate-500 text-xs">{comment.time}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 pl-10">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-center py-6">
                    {t('ui.noComments')}
                  </div>
                )}
              </div>

              {/* Comment Input */}
              <div className="bg-slate-800/60 rounded-xl p-4">
                {isLoggedIn ? (
                  <>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={t('ui.writeComment')}
                      className="w-full bg-transparent text-slate-300 placeholder-slate-500 resize-none focus:outline-none mb-3 min-h-[60px]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!newComment.trim() || isSubmitting}
                        className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                          newComment.trim() && !isSubmitting
                            ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isSubmitting ? t('ui.posting') : t('ui.postComment')}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 text-sm text-center py-4">
                    📌 {t('ui.pleaseLogin')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )))}
    </div>
  )
}
