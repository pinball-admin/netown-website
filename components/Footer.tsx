'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#030712] border-t border-slate-800/50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-slate-400 text-sm">
            © 2026 Netown. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-slate-400 hover:text-[#00FF66] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-[#00FF66] transition-colors">
              Terms
            </Link>
            <Link href="/disclaimer" className="text-slate-400 hover:text-[#00FF66] transition-colors">
              Disclaimer
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-slate-500 text-xs">
          This is a fan-made platform. Not affiliated with FIFA or the 2026 World Cup.
        </div>
      </div>
    </footer>
  )
}