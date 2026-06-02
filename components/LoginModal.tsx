'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

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

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Please enter a valid email')
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
        setMessage('Verification code sent to your email')
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Failed to send code')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async () => {
    if (!code || code.length !== 6) {
      setMessage('Please enter a 6-digit verification code')
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
      setMessage('Login failed')
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
          {step === 'email' ? 'Get Started' : 'Verify Email'}
        </h2>

        {message && (
          <div className={`text-sm mb-4 text-center ${message.includes('success') || message.includes('sent') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </div>
        )}

        {step === 'email' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Email Address</label>
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
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Verification Code</label>
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
              {loading ? 'Verifying...' : 'Login / Register'}
            </button>
            <button
              onClick={() => {
                setStep('email')
                setCode('')
                setMessage('')
              }}
              className="w-full py-3 text-slate-400 hover:text-white transition-colors"
            >
              Change Email
            </button>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          By logging in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
}