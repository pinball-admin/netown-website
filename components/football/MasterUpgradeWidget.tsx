'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface UpgradeProgress {
  accuracy: number
  predictionProgress: number
  accuracyProgress: number
  candyProgress: number
  overallProgress: number
  canUpgrade: boolean
}

export default function MasterUpgradeWidget() {
  const { user, isLoggedIn, refreshUser } = useAuth()
  const { t } = useI18n()
  const [progress, setProgress] = useState<UpgradeProgress | null>(null)
  const [role, setRole] = useState<string>('user')
  const [upgrading, setUpgrading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return
    fetch('/api/user/upgrade')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProgress(data.progress)
          setRole(data.role)
        }
      })
      .catch(() => setProgress(null))
  }, [isLoggedIn, user?.candyBalance, user?.totalPredictions, user?.correctPredictions])

  if (!isLoggedIn || !user) return null

  const overall = progress?.overallProgress ?? 0
  const isMaster = role === 'master' || user.role === 'master'

  const handleUpgrade = async () => {
    setUpgrading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/user/upgrade', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage(t('ui.upgradeSuccess'))
        setRole('ai_master')
        await refreshUser()
      } else {
        setMessage(data.message || t('ui.requirementsNotMet'))
      }
    } catch {
      setMessage(t('ui.upgradeFailed'))
    } finally {
      setUpgrading(false)
    }
  }

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-5 shadow-xl">
      <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
        🏆 {t('ui.upgradeTitle')}
      </h2>

      {isMaster ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm text-center">
          {t('ui.certifiedPredictor')}
        </div>
      ) : (
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-slate-300">{t('ui.progressToMaster')}</div>
              <div className="text-xs text-emerald-400">{overall}%</div>
            </div>
            <div className="w-full bg-slate-800/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000"
                style={{ width: `${overall}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-2">
              {user.totalPredictions} {t('ui.predictions').toLowerCase()} · {user.correctPredictions} {t('ui.correct')} (
              {user.totalPredictions > 0
                ? Math.round((user.correctPredictions / user.totalPredictions) * 100)
                : 0}
              %)
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="bg-slate-800/40 rounded-lg p-2">
              <div className="text-emerald-400 text-sm font-bold">
                {user.totalPredictions}/20
              </div>
              <div className="text-xs text-slate-400">{t('ui.predictions')}</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-2">
              <div className="text-amber-400 text-sm font-bold">{user.candyBalance}</div>
              <div className="text-xs text-slate-400">{t('ui.candy')}</div>
            </div>
            <div className="bg-slate-800/40 rounded-lg p-2">
              <div className="text-purple-400 text-sm font-bold">
                {progress?.accuracy ?? 0}%
              </div>
              <div className="text-xs text-slate-400">{t('ui.accuracy')}</div>
            </div>
          </div>

          {message && (
            <p className="text-xs text-slate-400 mb-3 text-center">{message}</p>
          )}

          <button
            onClick={handleUpgrade}
            disabled={upgrading || !progress?.canUpgrade}
            className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-lg hover:from-purple-400 hover:to-pink-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {upgrading ? t('ui.upgrading') : t('ui.upgradeToMaster')}
          </button>
        </>
      )}
    </div>
  )
}
