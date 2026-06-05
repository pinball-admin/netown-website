'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface Comment {
  id: string
  author: string
  avatar: string
  country: string
  content: string
  time: string
}

interface AIExpertCardProps {
  id: string
  name: string
  specialty: string
  gradient: string
  accentColor: string
  imageUrl: string
  accuracy: number
  streak: number
  preferences: string[]
  traits: string[]
  prediction?: string
  isChampion?: boolean
}

export default function AIExpertCard({
  id,
  name,
  specialty,
  gradient,
  accentColor,
  imageUrl,
  accuracy,
  streak,
  preferences,
  traits,
  prediction,
  isChampion,
}: AIExpertCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, isLoggedIn } = useAuth()
  const { t } = useI18n()

  const colorClasses: Record<string, { specialty: string; tag: string }> = {
    blue: {
      specialty: 'text-blue-300',
      tag: 'bg-blue-500/20 text-blue-400',
    },
    amber: {
      specialty: 'text-amber-300',
      tag: 'bg-amber-500/20 text-amber-400',
    },
    red: {
      specialty: 'text-red-300',
      tag: 'bg-red-500/20 text-red-400',
    },
    green: {
      specialty: 'text-green-300',
      tag: 'bg-green-500/20 text-green-400',
    },
    yellow: {
      specialty: 'text-yellow-300',
      tag: 'bg-yellow-500/20 text-yellow-400',
    },
  }
  const colors = colorClasses[accentColor] || colorClasses.blue

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  useEffect(() => {
    if (isExpanded) {
      fetchComments()
    }
  }, [isExpanded, id])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/forum/comment?postId=${encodeURIComponent(id)}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      setComments([])
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isLoggedIn || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/forum/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, content: newComment.trim() }),
      })

      const data = await response.json()
      
      if (data.success && data.comment) {
        setComments(prev => [data.comment, ...prev])
        setNewComment('')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={`bg-slate-900/60 backdrop-blur-md border rounded-xl overflow-hidden transition-all duration-500 ${
        isChampion ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-700/60'
      }`}
    >
      {/* Header */}
      <div
        className={`bg-gradient-to-br ${gradient} p-6 cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl ${gradient} shadow-lg flex items-center justify-center ${isChampion ? 'ring-2 ring-amber-400' : ''}`}>
            <span className="text-white text-lg font-bold">{initials}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">{name}</h3>
              {isChampion && <span className="text-lg">👑</span>}
            </div>
            <div className={`${colors.specialty} text-sm font-medium mt-1`}>
              {specialty} Expert
            </div>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold">{accuracy}%</span>
                <span className="text-slate-200 text-xs">{t('ui.accuracy')}</span>
              </div>
              {streak >= 3 && (
                <div className="flex items-center gap-1">
                  <span>🔥</span>
                  <span className="text-white font-semibold">{streak}</span>
                  <span className="text-slate-200 text-xs">{t('ui.winStreak')}</span>
                </div>
              )}
            </div>
          </div>
          <div className="text-slate-200">
            <svg className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Preferences & Traits */}
        <div className="flex flex-wrap gap-2 mt-4">
          {preferences.map((pref, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-xs rounded-full"
            >
              {pref}
            </span>
          ))}
          {traits.map((trait, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 ${colors.tag} text-xs rounded-full`}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 border-t border-slate-700/60">
          {/* Prediction */}
          {prediction && (
            <div className="bg-slate-800/60 rounded-xl p-4 mb-6">
              <div className="text-slate-400 text-sm mb-2">{t('ui.latestPrediction')}</div>
              <p className="text-slate-200">{prediction}</p>
            </div>
          )}

          {/* Comments Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>💬</span> {t('ui.comments')} ({comments.length})
            </h4>

            {/* Comments List */}
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-slate-800/40 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-sm">
                      {comment.avatar}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{comment.author}</span>
                      <span>{comment.country}</span>
                      <span className="text-slate-500 text-xs">{comment.time}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm pl-9">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="bg-slate-800/60 rounded-xl p-4">
              {isLoggedIn ? (
                <>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('ui.shareYourThoughts')}
                    className="w-full bg-transparent text-slate-300 text-sm placeholder-slate-500 resize-none focus:outline-none mb-3 min-h-[60px]"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || isSubmitting}
                      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                        newComment.trim() && !isSubmitting
                          ? `bg-gradient-to-r ${gradient} text-white hover:opacity-90`
                          : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? t('ui.posting') : t('ui.sendComment')}
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
        </div>
      )}
    </div>
  )
}
