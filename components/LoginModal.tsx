'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const { login } = useAuth()
  const { t } = useI18n()

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setMessage(t('login.invalidEmail'))
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const result = await response.json()
      if (result.success) {
        setStep('code')
        // Dev mode: auto-fill code if returned
        if (result.devCode) {
          setCode(result.devCode)
          setMessage(`✅ DEV MODE - Code: ${result.devCode}`)
        } else {
          setMessage(t('login.codeSent'))
        }
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage(t('login.sendFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      setMessage(t('login.invalidCode'))
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      })
      const result = await response.json()
      if (result.success) {
        login(result.user)
        onClose()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage(t('login.loginFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-[#00FF66]/30 rounded-2xl p-6 sm:p-8 shadow-xl shadow-[#00FF66]/20">
        <button
          onClick={() => {
            onClose()
            setTimeout(handleReset, 200)
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          {step === 'email' ? t('login.getStarted') : t('login.verifyEmail')}
        </h2>

        {message && (
          <div className={`text-sm mb-4 text-center ${
            message.includes('success') || message.includes('sent') || message.includes('DEV') 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {message}
          </div>
        )}

        {step === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('login.emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                autoComplete="email"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.sending') : t('login.sendCode')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('login.codeLabel')}</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 text-center text-2xl tracking-widest font-mono focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                autoComplete="one-time-code"
                inputMode="numeric"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.verifying') : t('login.loginRegister')}
            </button>
            <button
              onClick={() => {
                setStep('email')
                setCode('')
                setMessage('')
              }}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              {t('login.changeEmail')}
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          {t('login.termsNotice')}
        </div>
      </div>
    </div>
  )
}