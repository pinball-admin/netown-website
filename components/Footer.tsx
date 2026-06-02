'use client'

import Link from 'next/link'
import { useI18n } from '@/contexts/I18nContext'

export default function Footer() {
  const { t } = useI18n()
  
  return (
    <footer className="bg-[#030712] border-t border-slate-800/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 第一层：版权与合规水印 */}
        <div className="text-center text-slate-400 text-sm mb-6">
          {t('footer.copyright') || '© 2026 Netown. All rights reserved. This is a fan-made platform. Not affiliated with FIFA or the 2026 World Cup.'}
        </div>
        
        {/* 第二层：法律条款链接 */}
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link href="/privacy-policy" className="text-slate-400 hover:text-[#00FF66] transition-colors">
            {t('footer.privacyPolicy') || 'Privacy Policy'}
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/terms" className="text-slate-400 hover:text-[#00FF66] transition-colors">
            {t('footer.termsOfService') || 'Terms of Service'}
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/disclaimer" className="text-slate-400 hover:text-[#00FF66] transition-colors">
            {t('footer.disclaimer') || 'Disclaimer'}
          </Link>
        </div>
      </div>
    </footer>
  )
}