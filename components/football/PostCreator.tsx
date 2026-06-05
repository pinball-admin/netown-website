'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { useToast } from '@/contexts/ToastContext'

interface PostCreatorProps {
  onSuccess?: () => void
}

export default function PostCreator({ onSuccess }: PostCreatorProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionResults, setMentionResults] = useState<{ id: string; name: string; accuracy: number }[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionIndex, setMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { user, isLoggedIn } = useAuth()
  const { t } = useI18n()
  const { toast } = useToast()

  const insertMention = (name: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart || 0
    const textBeforeCursor = content.slice(0, cursorPos)
    const textAfterCursor = content.slice(cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      const beforeMention = textBeforeCursor.slice(0, atMatch.index)
      const newContent = `${beforeMention}@${name} ${textAfterCursor}`
      setContent(newContent)
      setShowMentions(false)
      setMentionResults([])
      setTimeout(() => {
        textarea.focus()
        const newPos = beforeMention.length + name.length + 2
        textarea.setSelectionRange(newPos, newPos)
      }, 0)
    }
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)

    const cursorPos = e.target.selectionStart || 0
    const textBeforeCursor = val.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@(\w*)$/)

    if (atMatch) {
      const query = atMatch[1]
      setMentionSearch(query)
      setShowMentions(true)
      setMentionIndex(0)
      if (query.length >= 1) {
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) setMentionResults(data.users)
          })
          .catch(() => {})
      }
    } else {
      setShowMentions(false)
      setMentionResults([])
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() || !isLoggedIn || !user) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/forum/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: content.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setTitle('')
        setContent('')
        toast(t('ui.postPublished'), 'success')
        onSuccess?.()
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-2xl">📝</span>
        {t('ui.createPost')}
      </h2>

      {isLoggedIn ? (
        <>
          {/* Title Input */}
          <div className="mb-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('ui.addTitle')}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
              maxLength={100}
            />
          </div>

          {/* Content Textarea */}
          <div className="mb-4 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder={t('ui.shareWorldCup')}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
              rows={5}
              maxLength={1000}
            />
            {/* @Mention dropdown */}
            {showMentions && mentionResults.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 max-h-40 overflow-y-auto">
                {mentionResults.map((u, i) => (
                  <button
                    key={u.id}
                    onClick={() => insertMention(u.name)}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between ${
                      i === mentionIndex ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <span>@{u.name}</span>
                    <span className="text-xs text-slate-500">{u.accuracy}%</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-end mt-2">
              <span className="text-slate-500 text-sm">{content.length}/1000</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <span>📷</span> {t('ui.addImage')}
              </span>
              <span className="flex items-center gap-1">
                <span>🏷️</span> {t('ui.addTags')}
              </span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                content.trim() && !isSubmitting
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 hover:scale-105'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? t('ui.publishing') : t('ui.publishNow')}
            </button>
          </div>
        </>
      ) : (
        <div className="bg-slate-800/40 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-white font-semibold mb-2">{t('ui.loginToPost')}</h3>
          <p className="text-slate-400 text-sm mb-4">
            {t('ui.loginToPostDesc')}
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-emerald-400 hover:to-cyan-400 transition-all"
          >
            {t('ui.loginNow')}
          </Link>
        </div>
      )}
    </div>
  )
}
