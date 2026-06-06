'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface LoginModalProps {
  isOpen?: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen = true, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'set-password'>('email')
  const [loginMode, setLoginMode] = useState<'code' | 'password'>('password')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const { login } = useAuth()
  const { t } = useI18n()
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null

  // Auto-fill referral code from URL query param (?ref=XXXX)
  useEffect(() => {
    if (searchParams) {
      const ref = searchParams.get('ref')
      if (ref) {
        setReferralCode(ref.toUpperCase())
      }
    }
  }, [])

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
        body: JSON.stringify({ email, code, referralCode })
      })
      const result = await response.json()
      if (result.success) {
        await login(result.user)
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

  const handlePasswordLogin = async () => {
    if (!email || !email.includes('@')) {
      setMessage(t('login.invalidEmail'))
      return
    }
    if (!password || password.length < 6) {
      setMessage(t('login.invalidPassword') || 'Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/password-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, referralCode })
      })
      const result = await response.json()
      if (result.success) {
        await login(result.user)
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

  const handleSetPassword = async () => {
    if (!password || password.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password, referralCode })
      })
      const result = await response.json()
      if (result.success) {
        await login(result.user)
        onClose()
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('email')
    setEmail('')
    setCode('')
    setPassword('')
    setConfirmPassword('')
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
          {step === 'email' 
            ? (t('login.getStarted') || 'Get Started')
            : step === 'code' 
              ? (t('login.verifyEmail') || 'Verify Email')
              : step === 'set-password'
                ? (t('login.setPassword') || 'Set Password')
              : (t('login.enterPassword') || 'Enter Password')}
        </h2>

        {/* Login Mode Tabs */}
        {step === 'email' && (
          <div className="flex mb-6 bg-[#1a1a1a] rounded-xl p-1">
            <button
              onClick={() => { setLoginMode('password'); setMessage('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'password'
                  ? 'bg-[#00FF66] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('login.passwordLogin') || 'Password'}
            </button>
            <button
              onClick={() => { setLoginMode('code'); setMessage('') }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                loginMode === 'code'
                  ? 'bg-[#00FF66] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('login.emailCode') || 'Email Code'}
            </button>
          </div>
        )}

        {message && (
          <div className={`text-sm mb-4 text-center ${
            message.includes('success') || message.includes('sent') || message.includes('DEV') 
              ? 'text-green-400' 
              : 'text-red-400'
          }`}>
            {message}
          </div>
        )}

        {step === 'email' && loginMode === 'code' ? (
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
            {referralCode && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {t('referral.refParamHint') || 'You were invited! Using referral code:'} <strong>{referralCode}</strong>
              </div>
            )}
            {!referralCode && (
              <div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  placeholder={t('referral.enterCodeHint') || 'Have a referral code? Enter it here'}
                  className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                  maxLength={8}
                />
              </div>
            )}
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.sending') : t('login.sendCode')}
            </button>
          </div>
        ) : step === 'email' && loginMode === 'password' ? (
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
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('login.password') || 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                autoComplete="current-password"
              />
            </div>
            {referralCode && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                {t('referral.refParamHint') || 'You were invited! Using referral code:'} <strong>{referralCode}</strong>
              </div>
            )}
            {!referralCode && (
              <div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                  placeholder={t('referral.enterCodeHint') || 'Have a referral code? Enter it here'}
                  className="w-full px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                  maxLength={8}
                />
              </div>
            )}
            <button
              onClick={handlePasswordLogin}
              disabled={loading}
              className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('login.loggingIn') || 'Logging in...') : (t('login.loginRegister') || 'Login / Register')}
            </button>
          </div>
        ) : step === 'code' ? (
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
              {loading ? t('login.verifying') : (t('login.loginRegister') || 'Login')}
            </button>
            <button
              onClick={() => {
                setStep('set-password')
                setPassword('')
                setConfirmPassword('')
                setMessage('')
              }}
              className="w-full py-3 bg-transparent border border-[#00FF66]/30 text-[#00FF66] font-semibold rounded-xl hover:bg-[#00FF66]/10 transition-colors"
            >
              {t('login.setPasswordOption') || 'Set Password & Login'}
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
        ) : step === 'set-password' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('login.newPassword') || 'New Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">{t('login.confirmPassword') || 'Confirm Password'}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                autoComplete="new-password"
              />
            </div>
            <button
              onClick={handleSetPassword}
              disabled={loading}
              className="w-full py-3 bg-[#00FF66] text-black font-bold rounded-xl hover:bg-[#00FF66]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (t('login.saving') || 'Saving...') : (t('login.saveLogin') || 'Save & Login')}
            </button>
            <button
              onClick={() => {
                setStep('code')
                setPassword('')
                setConfirmPassword('')
                setMessage('')
              }}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              {t('login.back') || 'Back'}
            </button>
          </div>
        ) : null}

        <div className="mt-6 text-center text-xs text-slate-500">
          {t('login.termsNotice')}
        </div>
      </div>
    </div>
  )
}
