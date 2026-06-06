'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n, Language } from '@/contexts/I18nContext'
import { useRouter } from 'next/navigation'

interface ReferralData {
  referralCode: string
  referralLink: string
  referralCount: number
  totalEarnings: number
  referrals: { id: string; name: string; email: string; joinedAt: string }[]
}

export default function SettingsPage() {
  const { user, isLoggedIn, loading: authLoading, refreshUser } = useAuth()
  const { t, language, setLanguage } = useI18n()
  const router = useRouter()

  // Profile form
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('en')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  // Referral
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [referralLoading, setReferralLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<'code' | 'link' | null>(null)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/football')
    }
  }, [authLoading, isLoggedIn, router])

  useEffect(() => {
    if (user) {
      setDisplayName((user as any).displayName || user.name || '')
      setBio((user as any).bio || '')
      setPreferredLanguage((user as any).preferredLanguage || language || 'en')
    }
  }, [user, language])

  useEffect(() => {
    if (isLoggedIn) {
      fetchReferralData()
    }
  }, [isLoggedIn])

  const fetchReferralData = async () => {
    try {
      const res = await fetch('/api/auth/referral')
      const data = await res.json()
      if (data.success) {
        setReferralData(data.data)
      }
    } catch (e) {
      console.error('Failed to load referral data', e)
    } finally {
      setReferralLoading(false)
    }
  }

  const copyToClipboard = async (text: string, field: 'code' | 'link') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {}
  }

  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileMessage('')
    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, bio, preferredLanguage }),
      })
      const data = await response.json()
      if (data.success) {
        setProfileMessage('✅ ' + (t('settings.saved') || 'Saved successfully'))
        setLanguage(preferredLanguage as Language)
        await refreshUser()
      } else {
        setProfileMessage('❌ ' + data.message)
      }
    } catch {
      setProfileMessage('❌ ' + (t('settings.saveError') || 'Failed to save'))
    } finally {
      setProfileSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage('❌ ' + (t('settings.passwordsDontMatch') || 'Passwords do not match'))
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage('❌ ' + (t('settings.passwordTooShort') || 'Password must be at least 6 characters'))
      return
    }
    setPasswordSaving(true)
    setPasswordMessage('')
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await response.json()
      if (data.success) {
        setPasswordMessage('✅ ' + (t('settings.passwordChanged') || 'Password changed successfully'))
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordMessage('❌ ' + data.message)
      }
    } catch {
      setPasswordMessage('❌ ' + (t('settings.changeError') || 'Failed to change password'))
    } finally {
      setPasswordSaving(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#00FF66] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!isLoggedIn) return null

  const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'zh', label: '中文' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'ja', label: '日本語' },
    { code: 'ko', label: '한국어' },
    { code: 'pt', label: 'Português' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1a2e]/80 to-[#0a0a0a] border-b border-[#00FF66]/20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/football')}
            className="text-slate-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            ← {t('settings.back') || 'Back'}
          </button>
          <h1 className="text-3xl font-bold text-white">
            ⚙️ {t('settings.title') || 'Settings'}
          </h1>
          <p className="text-slate-400 mt-1">
            {user?.email}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Settings */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            👤 {t('settings.profile') || 'Profile'}
          </h2>

          <div className="space-y-5">
            {/* Display Name */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.displayName') || 'Display Name'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
                maxLength={50}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.bio') || 'Bio'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors resize-none"
                rows={3}
                maxLength={200}
                placeholder={t('settings.bioPlaceholder') || 'Tell us about yourself...'}
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.preferredLanguage') || 'Preferred Language'}
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white focus:outline-none focus:border-[#00FF66]/50 transition-colors appearance-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {profileMessage && (
              <div className={`text-sm ${profileMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {profileMessage}
              </div>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={profileSaving}
              className="px-6 py-3 bg-gradient-to-r from-[#00FF66] to-emerald-500 text-black font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profileSaving ? (t('settings.saving') || 'Saving...') : (t('settings.save') || 'Save Changes')}
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🔑 {t('settings.changePassword') || 'Change Password'}
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.currentPassword') || 'Current Password'}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.newPassword') || 'New Password'}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                {t('settings.confirmPassword') || 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00FF66]/50 transition-colors"
              />
            </div>

            {passwordMessage && (
              <div className={`text-sm ${passwordMessage.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {passwordMessage}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordSaving ? (t('settings.changing') || 'Changing...') : (t('settings.changePassword') || 'Change Password')}
            </button>
          </div>
        </div>

        {/* Referral Section */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🎁 {t('referral.title') || 'Invite Friends'}
          </h2>

          {referralLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-[#00FF66] border-t-transparent rounded-full" />
            </div>
          ) : referralData ? (
            <div className="space-y-5">
              {/* Earn bonus description */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-4">
                <p className="text-emerald-300 text-sm">
                  {t('referral.earnBonus') || 'You and your friend each get 50 🍬 when they sign up with your link!'}
                </p>
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('referral.yourCode') || 'Your Referral Code'}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-center">
                    <span className="text-2xl font-mono font-bold text-[#00FF66] tracking-widest">
                      {referralData.referralCode}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralData.referralCode, 'code')}
                    className="px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-slate-400 hover:text-white hover:border-[#00FF66]/50 transition-all"
                  >
                    {copiedField === 'code' ? '✅' : '📋'}
                  </button>
                </div>
              </div>

              {/* Share Link */}
              <div>
                <label className="block text-sm text-slate-400 mb-2">
                  {t('referral.shareLink') || 'Share Link'}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-sm text-slate-400 truncate">
                    {referralData.referralLink}
                  </div>
                  <button
                    onClick={() => copyToClipboard(referralData.referralLink, 'link')}
                    className="px-4 py-3 bg-gradient-to-r from-[#00FF66] to-emerald-500 text-black font-bold rounded-xl hover:opacity-90 transition-all"
                  >
                    {copiedField === 'link' ? '✅' : (t('referral.shareLink') || 'Copy')}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-[#00FF66]">{referralData.referralCount}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('referral.totalReferrals') || 'Total Referrals'}</p>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-amber-400">{referralData.totalEarnings} 🍬</p>
                  <p className="text-xs text-slate-400 mt-1">{t('referral.totalEarnings') || 'Total Earnings'}</p>
                </div>
              </div>

              {/* Recent Referrals */}
              {referralData.referrals.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-3">{t('referral.stats') || 'Referral Stats'}</p>
                  <div className="space-y-2">
                    {referralData.referrals.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between py-2 px-3 bg-slate-900/40 rounded-lg">
                        <span className="text-sm text-slate-300">{r.name || r.email}</span>
                        <span className="text-xs text-slate-500">{new Date(r.joinedAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {referralData.referrals.length === 0 && (
                <div className="text-center py-6 text-slate-500">
                  <p className="text-3xl mb-2">📤</p>
                  <p className="text-sm">{t('referral.noReferralsYet') || 'No referrals yet. Share your link to earn!'}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              Failed to load referral info
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 {t('settings.accountInfo') || 'Account Info'}
          </h2>
          <div className="space-y-3 text-slate-300">
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">{t('settings.email') || 'Email'}</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">{t('settings.role') || 'Role'}</span>
              <span className="capitalize">{user?.role}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/60">
              <span className="text-slate-400">{t('settings.candyBalance') || 'Candy Balance'}</span>
              <span className="text-[#00FF66] font-bold">{user?.candyBalance} 🍬</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400">{t('settings.memberSince') || 'Member Since'}</span>
              <span>{user?.createdAt ? new Date(user.createdAt as any).toLocaleDateString() : '-'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
