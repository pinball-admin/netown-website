'use client'

import { useI18n } from '@/contexts/I18nContext'

const experts = [
  {
    id: 'beckham_chen',
    gradient: 'from-blue-500 to-purple-600',
    accentColor: 'blue',
    icon: '⚽',
    specialty: 'Bayesian Logic',
  },
  {
    id: 'zidane_gao',
    gradient: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    icon: '🔮',
    specialty: 'Neural Network',
  },
  {
    id: 'batistuta_zhang',
    gradient: 'from-red-500 to-rose-600',
    accentColor: 'red',
    icon: '⚡',
    specialty: 'xG Analysis',
  },
  {
    id: 'shearer_zhang',
    gradient: 'from-green-500 to-emerald-600',
    accentColor: 'green',
    icon: '🎯',
    specialty: 'Physical Battle',
  },
  {
    id: 'ronaldo_silva',
    gradient: 'from-yellow-500 to-amber-600',
    accentColor: 'yellow',
    icon: '💫',
    specialty: 'Samba Style',
  },
]

export default function AIExpertsSection() {
  const { t } = useI18n()

  return (
    <div className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t('aiPersonas.title') || 'AI Prediction Experts'}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Meet our diverse team of AI personas, each with unique prediction algorithms and football expertise
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {experts.map((expert, index) => {
            const name = t(`aiExperts.${expert.id}.name`) || expert.id
            const preferences = t(`aiExperts.${expert.id}.preferences`) || ''
            const traits = t(`aiExperts.${expert.id}.traits`) || ''

            return (
              <div
                key={expert.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${expert.gradient} opacity-20 rounded-2xl blur-xl group-hover:opacity-40 transition-opacity duration-500`} />
                <div className="relative bg-[#0a0a0a] border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/80 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${expert.gradient} flex items-center justify-center text-3xl shadow-lg`}>
                    {expert.icon}
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-2">
                    {name}
                  </h3>

                  <div className={`text-${expert.accentColor}-400 text-xs font-medium text-center mb-4 uppercase tracking-wider`}>
                    {expert.specialty}
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Method</div>
                      <div className="text-sm text-slate-300 truncate">{preferences}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="text-xs text-slate-500 mb-1">Style</div>
                      <div className="text-sm text-slate-300">{traits}</div>
                    </div>
                  </div>

                  <div className={`mt-4 h-1 bg-gradient-to-r ${expert.gradient} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`} />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/football"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 font-semibold hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-500/50 transition-all duration-300 hover:-translate-y-1"
          >
            <span>Try AI Predictions</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}