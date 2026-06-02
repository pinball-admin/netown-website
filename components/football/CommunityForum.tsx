'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Post {
  id: string | number
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
}

// Pure football images only - no basketball or dead links!
const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
  'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=400',
  'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=400',
]

const getRandomImage = () => {
  return FOOTBALL_IMAGES[Math.floor(Math.random() * FOOTBALL_IMAGES.length)]
}

// Mock data - pure football content only!
const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: 'MessiFanArgentina',
    avatar: '🔵',
    country: '🇦🇷',
    content: 'USA vs Morocco opening match analysis: Pulisic is the key. His Chelsea form resurrection this season has been incredible. If he stays fit, USA goes through from Group A. The home advantage cannot be underestimated!',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    likes: 234,
    comments: 45,
    time: '2h ago',
    isHot: true,
    isPinned: true,
    tags: ['USA', 'Morocco', 'Analysis'],
  },
  {
    id: 2,
    author: 'CroatiaWizard',
    avatar: '🔴',
    country: '🇭🇷',
    content: 'Modric at 41 still running the show! His partnership with Kovacic and Brozovic is the heartbeat of this team. Nigeria better watch out - Croatia midfield control is UNREAL.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400',
    likes: 189,
    comments: 32,
    time: '3h ago',
    isHot: true,
    tags: ['Croatia', 'Modric', 'Midfield'],
  },
  {
    id: 3,
    author: 'BrazilianSambaKing',
    avatar: '💛',
    country: '🇧🇷',
    content: 'Neymar ALONE is worth the ticket price! His final World Cup - the entire Brazil is behind him. 2026 is HIS tournament. Prediction: 8 goals minimum!',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    likes: 567,
    comments: 89,
    time: '4h ago',
    isHot: true,
    tags: ['Brazil', 'Neymar', 'Prediction'],
  },
  {
    id: 4,
    author: 'EnglandHoper2026',
    avatar: '⚽',
    country: '🏴',
    content: 'Southgate OUT! Kane needs proper service. 2022 penalty heartbreak cannot happen again. Our golden generation deserves a trophy!',
    imageUrl: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=400',
    likes: 345,
    comments: 67,
    time: '5h ago',
    isHot: true,
    tags: ['England', 'Kane', 'Analysis'],
  },
  {
    id: 5,
    author: 'FranceUltraMbappe',
    avatar: '💙',
    country: '🇫🇷',
    content: 'Mbappe 2026 = Ronaldo 2002 zone! Euro 2024 humiliation → World Cup glory transformation. France dark horse? NO! France is the FAVORITE.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    likes: 456,
    comments: 78,
    time: '6h ago',
    isHot: true,
    tags: ['France', 'Mbappe', 'Favorites'],
  },
  {
    id: 6,
    author: 'GermanyTechExpert',
    avatar: '⚫',
    country: '🇩🇪',
    content: 'Nagelsmann tactical revolution fascinating! Wirtz false-9 hybrid, Musiala gravity creation, Havertz movement... Germany WC2022 trauma fuel → 2026 CHAMPIONS!',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400',
    likes: 298,
    comments: 41,
    time: '7h ago',
    tags: ['Germany', 'Nagelsmann', 'Tactics'],
  },
  {
    id: 7,
    author: 'MoroccoAtlasLion',
    avatar: '🟢',
    country: '🇲🇦',
    content: 'Hakimi Inter teammates revenge motivation! Amrabat return = defensive excellence. 2022 semi-final inspiration carries forward. AFRICA RISING!',
    imageUrl: 'https://images.unsplash.com/photo-1522778114943-52418b61a052?w=400',
    likes: 312,
    comments: 55,
    time: '8h ago',
    isHot: true,
    tags: ['Morocco', 'Hakimi', 'Africa'],
  },
  {
    id: 8,
    author: 'JapanBundesligaFan',
    avatar: '🔴',
    country: '🇯🇵',
    content: 'Kubo + Oiyma La Masia synthesis UNSTOPPABLE! 8 Japan players in Bundesliga = tactical preparation sophistication.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
    likes: 187,
    comments: 29,
    time: '9h ago',
    tags: ['Japan', 'Kubo', 'Bundesliga'],
  },
]

export default function CommunityForum() {
  const [posts, setPosts] = useState<Post[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      if (data.success && data.posts && data.posts.length > 0) {
        const dbPosts: Post[] = data.posts.map((p: any) => ({
          id: p.id,
          author: p.author,
          avatar: p.avatar || '⚽',
          country: p.country || '🌍',
          content: p.content,
          imageUrl: p.imageUrl || getRandomImage(),
          likes: p.likes || 0,
          comments: p.comments || 0,
          time: formatTime(p.createdAt),
          tags: ['Discussion'],
        }))
        setPosts(dbPosts)
      } else {
        setPosts(MOCK_POSTS)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setPosts(MOCK_POSTS)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !isAuthenticated || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent.trim(),
          imageUrl: getRandomImage(),
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
        setPosts(prev => [newPost, ...prev])
        setNewPostContent('')
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
        🔥 Community Forum
      </h2>

      {/* Post Creation Box */}
      {isAuthenticated && user && (
        <div className="mb-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Share your thoughts on World Cup 2026..."
            className="w-full bg-transparent text-slate-300 text-sm placeholder-slate-500 resize-none focus:outline-none mb-3 min-h-[60px]"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {newPostContent.length}/500
            </span>
            <button
              onClick={handleSubmitPost}
              disabled={!newPostContent.trim() || isSubmitting}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-semibold rounded-lg hover:from-orange-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Posting...' : '发布'}
            </button>
          </div>
          {showSuccess && (
            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <span>✓</span> Post published successfully!
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`bg-slate-800/40 backdrop-blur-sm border rounded-xl p-3 hover:border-orange-500/30 transition-all duration-300 cursor-pointer ${
              post.isPinned
                ? 'border-amber-500/50'
                : post.isHot
                ? 'border-orange-500/30'
                : 'border-slate-700/60'
            }`}
          >
            <div className="flex items-start gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm flex-shrink-0">
                {post.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-white text-xs font-medium truncate">
                    {post.author}
                  </span>
                  <span>{post.country}</span>
                  {post.isHot && (
                    <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full">
                      🔥 HOT
                    </span>
                  )}
                  {post.isPinned && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
                      📌 Pinned
                    </span>
                  )}
                </div>
                <span className="text-slate-500 text-xs">{post.time}</span>
              </div>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed mb-2 line-clamp-3">
              {post.content}
            </p>
            {post.imageUrl && (
              <div className="mb-2 rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt="Football action"
                  className="w-full h-28 object-cover"
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <span>❤️</span>
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <span>💬</span>
                <span>{post.comments}</span>
              </div>
              <div className="flex-1" />
              <div className="flex gap-1 flex-wrap">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/50">
        <button className="w-full py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all">
          View All {posts.length}+ Discussions →
        </button>
      </div>
    </div>
  )
}
