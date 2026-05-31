'use client'

import { useCompliance } from '@/contexts/ComplianceContext'
import { useI18n } from '@/contexts/I18nContext'

export default function ConnectWalletButton() {
  const { isWeb3Enabled, isPureDataMode } = useCompliance()
  const { t } = useI18n()

  if (isPureDataMode || !isWeb3Enabled) {
    return null
  }

  const handleConnect = () => {
    console.log('🔌 Web3 Wallet connection triggered')
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-500/50 rounded-lg transition-all duration-200"
    >
      <span className="text-lg">🔌</span>
      <span className="text-white text-sm font-medium">{t('connectWallet.connect')}</span>
    </button>
  )
}
