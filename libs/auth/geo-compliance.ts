export type Region = 'CN' | 'GLOBAL'

export interface ComplianceRules {
  allowWeb3: boolean
  allowTokenConversion: boolean
  candyLabel: string
  maxCandyToConvert: number
  showCryptoContent: boolean
  showWalletConnect: boolean
}

const CN_RULES: ComplianceRules = {
  allowWeb3: false,
  allowTokenConversion: false,
  candyLabel: '站内积分凭证',
  maxCandyToConvert: 0,
  showCryptoContent: false,
  showWalletConnect: false
}

const GLOBAL_RULES: ComplianceRules = {
  allowWeb3: true,
  allowTokenConversion: true,
  candyLabel: 'Candy Points',
  maxCandyToConvert: 10000,
  showCryptoContent: true,
  showWalletConnect: true
}

const CN_IPS = [
  '103.235.46.',
  '119.29.29.',
  '183.195.195.',
  '123.125.114.',
  '223.5.5.',
  '223.6.6.',
  '106.11.',
  '180.101.',
  '116.211.',
  '122.225.',
]

export function detectRegion(ip: string): Region {
  for (const prefix of CN_IPS) {
    if (ip.startsWith(prefix)) {
      return 'CN'
    }
  }
  return 'GLOBAL'
}

export function getComplianceRules(region: Region): ComplianceRules {
  return region === 'CN' ? CN_RULES : GLOBAL_RULES
}

export function isUserInCN(region: Region): boolean {
  return region === 'CN'
}

export function canConvertToTokens(user: { region: Region; candyBalance: number; role: string }): boolean {
  if (user.region === 'CN') return false
  if (user.candyBalance < 10000) return false
  if (user.role !== 'master') return false
  return true
}
