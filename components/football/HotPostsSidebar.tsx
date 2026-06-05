'use client'

import { useI18n } from '@/contexts/I18nContext'

interface HotPost {
  id: number
  title: string
  author: string
  likes: number
  comments: number
}

const HOT_POSTS: HotPost[] = [
  { id: 1, title: 'ui.hotPost1', author: 'ui.mockAuthor1', likes: 234, comments: 45 },
  { id: 2, title: 'ui.hotPost2', author: 'ui.mockAuthor2', likes: 189, comments: 32 },
  { id: 3, title: 'ui.hotPost3', author: 'ui.mockAuthor3', likes: 567, comments: 89 },
  { id: 4, title: 'ui.hotPost4', author: 'ui.mockAuthor4', likes: 345, comments: 67 },
  { id: 5, title: 'ui.hotPost5', author: 'ui.mockAuthor5', likes: 456, comments: 78 },
]

export default function HotPostsSidebar() {
  const { t } = useI18n()
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/60 rounded-xl p-5">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
        🔥 {t('ui.hotTopics')}
      </h2>

      <div className="space-y-3">
        {HOT_POSTS.map((post, index) => (
          <div
            key={post.id}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer group"
          >
            <span className={`text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              index === 0 ? 'bg-red-500 text-white' :
              index === 1 ? 'bg-orange-500 text-white' :
              index === 2 ? 'bg-yellow-500 text-black' :
              'bg-slate-700 text-slate-400'
            }`}>
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-300 text-xs font-medium truncate group-hover:text-white transition-colors">
                {t(post.title)}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-slate-500 text-xs">{t(post.author)}</span>
                <span className="text-slate-600 text-xs">|</span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <span>❤️</span>{post.likes}
                </span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <span>💬</span>{post.comments}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-lg text-orange-400 text-xs font-medium hover:from-orange-500/30 hover:to-pink-500/30 transition-all">
        {t('ui.viewAllHotPosts')}
      </button>
    </div>
  )
}
