'use client'

export default function ComplianceDisclaimer() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-slate-800 py-3 px-4 z-40">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs text-slate-400">
        <span className="text-yellow-400">⚠️</span>
        <span className="text-center">
          <strong className="text-slate-300">Disclaimer:</strong> All predictions are free of charge and intended for statistical research only. Not investment or betting advice.
        </span>
      </div>
    </div>
  )
}
