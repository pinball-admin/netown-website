'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import LoginModal from '@/components/LoginModal'

interface QuizData {
  id: string
  question: string
  options: string[]
  year: number
}

interface QuizResult {
  correct: boolean
  earned: number
  explanation: string
  funFact: string | null
  correctAnswer: string
}

export default function DailyQuizCard() {
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [alreadyAnswered, setAlreadyAnswered] = useState(false)
  const [userResult, setUserResult] = useState<{ correct: boolean; earned: number } | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuiz = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/quiz/today')
      const data = await res.json()

      if (data.success) {
        setQuiz(data.quiz)
        setAlreadyAnswered(data.alreadyAnswered)
        setUserResult(data.userResult)
      }
    } catch (err) {
      console.error('Failed to fetch quiz:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuiz()
  }, [fetchQuiz])

  const handleAnswer = async (optionIndex: number) => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    if (submitting || !quiz) return

    setSubmitting(true)
    setSelectedOption(optionIndex)

    try {
      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId: quiz.id, selectedOption: optionIndex }),
      })
      const data = await res.json()

      if (data.success) {
        setResult({
          correct: data.correct,
          earned: data.earned,
          explanation: data.explanation,
          funFact: data.funFact,
          correctAnswer: data.correctAnswer,
        })
      } else {
        setError(data.error || 'Failed to submit answer')
        setSelectedOption(null)
      }
    } catch (err) {
      setError('Network error')
      setSelectedOption(null)
    } finally {
      setSubmitting(false)
    }
  }

  const getOptionStyle = (index: number) => {
    // Before answering
    if (!result && selectedOption === null) {
      return 'bg-slate-800/60 border-slate-700/50 hover:border-emerald-500/30 hover:bg-slate-700/60 cursor-pointer'
    }

    // While submitting selected option
    if (!result && selectedOption === index) {
      return 'bg-emerald-500/20 border-emerald-500/50 animate-pulse'
    }

    // After result
    if (result) {
      if (index === quiz?.options.indexOf(result.correctAnswer)) {
        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
      }
      if (index === selectedOption && !result.correct) {
        return 'bg-red-500/20 border-red-500/50 text-red-300'
      }
      return 'bg-slate-800/30 border-slate-700/30 opacity-50'
    }

    return 'bg-slate-800/60 border-slate-700/50'
  }

  if (loading) {
    return (
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 mb-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
        <div className="h-4 w-full bg-slate-700 rounded mb-3" />
        <div className="h-4 w-3/4 bg-slate-700 rounded mb-3" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 bg-slate-700/50 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!quiz && !alreadyAnswered) {
    return null // No quiz for today
  }

  const wrongAnswer = result && !result.correct

  return (
    <>
      <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 mb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🎯</span>
          <div>
            <h3 className="text-white font-bold text-sm">Daily Quiz</h3>
            <p className="text-slate-500 text-xs">World Cup History</p>
          </div>
          {quiz && (
            <span className="ml-auto text-xs text-slate-500 bg-slate-800/60 px-2 py-1 rounded-full">
              {quiz.year}
            </span>
          )}
        </div>

        {/* Already answered state */}
        {alreadyAnswered && userResult && !result && (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">{userResult.correct ? '🎉' : '😅'}</div>
            <p className="text-white font-medium mb-1">
              {userResult.correct ? 'Correct!' : 'Already answered'}
            </p>
            {userResult.correct && (
              <p className="text-emerald-400 text-sm">+{userResult.earned} 🍬</p>
            )}
            {!userResult.correct && (
              <p className="text-slate-400 text-xs">Come back tomorrow for a new question!</p>
            )}
          </div>
        )}

        {/* Question */}
        {quiz && !result && (
          <>
            <p className="text-white font-medium mb-4">{quiz.question}</p>
            <div className="space-y-2">
              {quiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={submitting}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-150 text-sm text-slate-300 ${getOptionStyle(index)}`}
                >
                  <span className="mr-2 text-slate-500">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-3">
            <p className="text-red-400 text-sm mb-2">{error}</p>
            <button onClick={fetchQuiz} className="text-emerald-400 text-xs hover:text-emerald-300 transition-colors">
              Try Again
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div>
            <div className={`text-center py-3 mb-3 rounded-xl ${result.correct ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              {result.correct ? (
                <>
                  <div className="text-2xl mb-1">🎉</div>
                  <p className="text-emerald-400 font-bold">Correct! +{result.earned} 🍬</p>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-1">😅</div>
                  <p className="text-red-400 font-bold text-sm">Not quite!</p>
                  <p className="text-slate-300 text-xs mt-1">
                    Correct answer: <span className="text-emerald-400 font-medium">{result.correctAnswer}</span>
                  </p>
                </>
              )}
            </div>

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-3">
              <p className="text-slate-400 text-xs leading-relaxed">{result.explanation}</p>
            </div>

            {result.funFact && (
              <div className="mt-2 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <p className="text-amber-400 text-xs font-medium mb-1">💡 Fun Fact</p>
                <p className="text-slate-400 text-xs">{result.funFact}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  )
}
