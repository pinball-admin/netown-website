'use client'

import { useState, useEffect } from 'react'
import { useI18n } from '@/contexts/I18nContext'
import { getUpcomingMatches, createPrediction } from '@/libs/prediction/user-predictions'

interface UserPredictionFormProps {
  userId: string
}

export default function UserPredictionForm({ userId }: UserPredictionFormProps) {
  const { t } = useI18n()
  const [matches, setMatches] = useState<any[]>([])
  const [selectedMatch, setSelectedMatch] = useState('')
  const [predictionType, setPredictionType] = useState<'match_result' | 'score' | 'over_under' | 'total_goals'>('match_result')
  const [prediction, setPrediction] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getUpcomingMatches()
    const mockMatches = [
      { id: 'match-1', homeTeam: 'Argentina', awayTeam: 'Brazil', startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { id: 'match-2', homeTeam: 'France', awayTeam: 'Germany', startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { id: 'match-3', homeTeam: 'Spain', awayTeam: 'England', startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) },
    ]
    setMatches(mockMatches)
  }, [])

  const handleSubmit = async () => {
    if (!selectedMatch || !prediction) {
      setMessage('Please select a match and enter your prediction')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/predictions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, matchId: selectedMatch, type: predictionType, prediction })
      })
      const result = await response.json()
      if (result.success) {
        setMessage('Prediction submitted successfully!')
        setPrediction('')
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Failed to submit prediction')
    }
    setLoading(false)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-black/50 border border-slate-800 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>⚽</span> {t('ui.makeYourPrediction')}
      </h3>

      {message && (
        <div className={`text-sm mb-4 ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-slate-400 mb-2">{t('prediction.selectMatch')}</label>
          <select
            value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            className="w-full px-4 py-3 bg-black/50 border border-slate-700 rounded-xl text-white focus:border-[#00FF66] focus:outline-none transition-colors"
          >
            <option value="">{t('prediction.chooseMatch')}</option>
            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.homeTeam} vs {match.awayTeam} - {formatDate(match.startTime)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">{t('prediction.predictionType')}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'match_result', label: t('prediction.result'), difficulty: t('prediction.easy') },
              { value: 'over_under', label: t('prediction.overUnder'), difficulty: t('prediction.medium') },
              { value: 'total_goals', label: t('prediction.totalGoals'), difficulty: t('prediction.hard') },
              { value: 'score', label: t('prediction.exactScore'), difficulty: t('prediction.hard') },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setPredictionType(type.value as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  predictionType === type.value
                    ? 'bg-[#00FF66] text-black'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <div>{type.label}</div>
                <div className="text-xs opacity-70">{type.difficulty}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-2">{t('prediction.yourPrediction')}</label>
          {predictionType === 'match_result' ? (
            <div className="grid grid-cols-3 gap-2">
              {['win', 'draw', 'loss'].map((result) => (
                <button
                  key={result}
                  onClick={() => setPrediction(result)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    prediction === result
                      ? 'bg-[#00FF66] text-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {result === 'win' ? 'Home Win' : result === 'draw' ? 'Draw' : 'Away Win'}
                </button>
              ))}
            </div>
          ) : predictionType === 'over_under' ? (
            <div className="grid grid-cols-4 gap-2">
              {['over_1.5', 'under_1.5', 'over_2.5', 'under_2.5'].map((option) => (
                <button
                  key={option}
                  onClick={() => setPrediction(option)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    prediction === option
                      ? 'bg-[#00FF66] text-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {option.replace('_', ' ')}
                </button>
              ))}
            </div>
          ) : predictionType === 'total_goals' ? (
            <div className="grid grid-cols-5 gap-2">
              {['0', '1', '2', '3', '4+'].map((goals) => (
                <button
                  key={goals}
                  onClick={() => setPrediction(goals === '4+' ? '4' : goals)}
                  className={`py-3 rounded-xl font-medium transition-colors ${
                    prediction === (goals === '4+' ? '4' : goals)
                      ? 'bg-[#00FF66] text-black'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {goals}
                </button>
              ))}
            </div>
          ) : (
            <input
              type="text"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="e.g., 2-1"
              className="w-full px-4 py-3 bg-black/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-[#00FF66] focus:outline-none transition-colors"
            />
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Prediction'}
        </button>
      </div>
    </div>
  )
}
