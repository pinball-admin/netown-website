'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { SkeletonCard, SkeletonText, SkeletonBadge } from '@/components/ui/Skeleton'

interface AIModel {
  id: string
  name: string
  description: string
  method: 'Bayesian' | 'Neural Network' | 'xG Analysis' | 'Monte Carlo'
  accuracy: number
  color: string
  recentPredictions: number
}

const AIModels: AIModel[] = [
  {
    id: 'dixon_coles',
    name: 'Dixon-Coles Model',
    description: 'Poisson regression with draw correction',
    method: 'Bayesian',
    accuracy: 76.5,
    color: 'from-blue-500 to-cyan-500',
    recentPredictions: 42
  },
  {
    id: 'elo',
    name: 'Enhanced ELO Rating',
    description: 'Dynamic team strength rating system',
    method: 'Neural Network',
    accuracy: 72.3,
    color: 'from-purple-500 to-pink-500',
    recentPredictions: 56
  },
  {
    id: 'xg',
    name: 'Expected Goals (xG)',
    description: 'Shot-quality based goal prediction',
    method: 'xG Analysis',
    accuracy: 74.8,
    color: 'from-green-500 to-emerald-500',
    recentPredictions: 38
  },
  {
    id: 'gbdt',
    name: 'Gradient Boosting ML',
    description: 'Feature-based machine learning model',
    method: 'Monte Carlo',
    accuracy: 78.2,
    color: 'from-orange-500 to-red-500',
    recentPredictions: 47
  }
]

interface ApiPrediction {
  match: {
    id: string
    homeTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    awayTeam: { id: string; name: string; shortName: string; flag: string; group: string }
    date: string
    time: string
    group: string
  }
  consensus: {
    homeWinProb: number
    drawProb: number
    awayWinProb: number
    predictedScore: { home: number; away: number }
    confidence: number
  }
  models?: {
    dixonColes: { homeWin: number; draw: number; awayWin: number }
    elo: { homeWin: number; draw: number; awayWin: number }
    xg: { homeWin: number; draw: number; awayWin: number }
    gbdt: { homeWin: number; draw: number; awayWin: number }
  }
}

export default function AIModelPanel() {
  const { t, tTeam } = useI18n()
  const [selectedModel, setSelectedModel] = useState<string>('dixon_coles')
  const [activeTab, setActiveTab] = useState<'models' | 'predictions'>('models')
  const [apiPredictions, setApiPredictions] = useState<ApiPrediction[]>([])
  const [loading, setLoading] = useState(false)
  const [engine, setEngine] = useState<string>('')

  useEffect(() => {
    if (activeTab === 'predictions') {
      fetchPredictions()
    }
  }, [activeTab])

  const selectedModelData = AIModels.find(model => model.id === selectedModel) || AIModels[0]

  const fetchPredictions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/predictions/auto?limit=4')
      const json = await res.json()
      if (json.success) {
        setApiPredictions(json.predictions || [])
        setEngine(json.engine || 'basic-elo')
      }
    } catch (err) {
      console.error('[AIModelPanel] Failed to fetch:', err)
    } finally {
      setLoading(false)
    }
  }

  const getModelProbability = (pred: ApiPrediction, modelId: string) => {
    if (!pred.models) return null
    const modelMap: Record<string, { homeWin: number; draw: number; awayWin: number }> = {
      dixon_coles: pred.models.dixonColes,
      elo: pred.models.elo,
      xg: pred.models.xg,
      gbdt: pred.models.gbdt,
    }
    const m = modelMap[modelId]
    if (!m) return null
    return {
      homeWin: Math.round(m.homeWin),
      draw: Math.round(m.draw),
      awayWin: Math.round(m.awayWin),
      pick: m.homeWin > m.awayWin ? 'home' : m.awayWin > m.homeWin ? 'away' : 'draw',
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          🤖 {t('ai.aiModelHub')}
        </h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${activeTab === 'models' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {t('ai.aiModels')}
          </button>
          <button
            onClick={() => setActiveTab('predictions')}
            className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 ${activeTab === 'predictions' 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            {t('ai.predictionsTab')}
          </button>
        </div>
      </div>

      {activeTab === 'models' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AIModels.map((model) => (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${selectedModel === model.id
                  ? 'bg-slate-800/60 border-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800/40 border-slate-700/60 hover:border-emerald-500/30 hover:-translate-y-0.5'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${model.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className="text-white font-bold text-sm">🤖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">{model.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{model.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">
                        {model.method}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                        {model.accuracy}% Acc
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedModelData && (
            <div className="mt-6 pt-6 border-t border-slate-800/50">
              <div className="bg-slate-800/40 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${selectedModelData.color} flex items-center justify-center`}>
                      <span className="text-white text-sm">🤖</span>
                    </div>
                    <h3 className="text-white font-semibold">{selectedModelData.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-emerald-400 text-lg font-bold">{selectedModelData.accuracy}%</div>
                    <div className="text-slate-400 text-xs">{t('ui.predictionAccuracy')}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs">{t('ui.recentPredictions')}</div>
                    <div className="text-white text-xl font-bold">{selectedModelData.recentPredictions}</div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <div className="text-slate-400 text-xs">{t('ai.method')}</div>
                    <div className="text-white text-sm font-medium">{selectedModelData.method}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r ${selectedModelData.color} h-full transition-all duration-1000`}
                      style={{ width: `${selectedModelData.accuracy}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>0%</span>
                    <span>{t('ai.accuracy')}</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-slate-800/40 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-3">
                    <SkeletonBadge className="w-16" />
                    <SkeletonBadge className="w-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-700/60 rounded" />
                      <SkeletonText className="w-16" />
                    </div>
                    <SkeletonText className="w-12 h-6" />
                    <div className="flex items-center gap-2">
                      <SkeletonText className="w-16" />
                      <div className="w-8 h-8 bg-slate-700/60 rounded" />
                    </div>
                  </div>
                  <SkeletonText className="mt-4 h-2 w-full" />
                </div>
              ))}
            </div>
          ) : apiPredictions.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  {engine === 'ensemble' ? '🧠 Ensemble Engine (7 models)' : '⚡ Basic ELO Model'}
                </span>
                <button onClick={fetchPredictions} className="text-xs text-emerald-400 hover:text-emerald-300">
                  🔄 Refresh
                </button>
              </div>
              {apiPredictions.map((pred, index) => {
                const homeName = tTeam(pred.match.homeTeam.id) || pred.match.homeTeam.shortName
                const awayName = tTeam(pred.match.awayTeam.id) || pred.match.awayTeam.shortName
                return (
                <div key={index} className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/60">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">
                      {pred.match.homeTeam.flag} {homeName} vs {awayName} {pred.match.awayTeam.flag}
                    </h3>
                    <span className="text-xs text-slate-500">{pred.match.date} · {pred.match.group}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {AIModels.map((model) => {
                      const probs = getModelProbability(pred, model.id)
                      if (!probs) {
                        return (
                          <div key={model.id} className="bg-slate-900/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <div className={`w-6 h-6 rounded bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                                <span className="text-white text-xs">🤖</span>
                              </div>
                            </div>
                            <div className="text-slate-400 text-xs">—</div>
                          </div>
                        )
                      }
                      const pick = probs.pick === 'home' ? homeName : probs.pick === 'away' ? awayName : 'Draw'
                      return (
                        <div key={model.id} className="bg-slate-900/50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div className={`w-6 h-6 rounded bg-gradient-to-br ${model.color} flex items-center justify-center`}>
                              <span className="text-white text-xs">🤖</span>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 text-sm font-bold">
                                {Math.max(probs.homeWin, probs.draw, probs.awayWin)}%
                              </div>
                            </div>
                          </div>
                          <div className="text-white text-xs font-medium truncate">{pick}</div>
                          <div className="text-slate-400 text-[10px]">{model.name.split(' ')[0]}</div>
                          <div className="flex gap-0.5 mt-1">
                            <div className="h-1 rounded-l bg-emerald-500" style={{ width: `${probs.homeWin * 0.7}%` }} />
                            <div className="h-1 bg-amber-500" style={{ width: `${probs.draw * 0.7}%` }} />
                            <div className="h-1 rounded-r bg-cyan-500" style={{ width: `${probs.awayWin * 0.7}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )})}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No predictions available. Try refreshing.</p>
              <button onClick={fetchPredictions} className="mt-3 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm">
                🔄 Refresh
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-xs">
            <span className="text-emerald-400">{t('ai.importantNotice')}</span>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-semibold rounded-lg hover:from-emerald-400 hover:to-cyan-400 transition-all duration-300 hover:scale-105">
            {t('ai.compareAll')}
          </button>
        </div>
      </div>
    </div>
  )
}