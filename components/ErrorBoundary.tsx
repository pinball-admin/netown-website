'use client'

import React from 'react'
import { useI18n } from '@/contexts/I18nContext'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <ErrorFallback
          message={this.state.error?.message || 'Unknown error'}
          onRetry={this.handleRetry}
        />
      )
    }

    return this.props.children
  }
}

function ErrorFallback({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-md border border-red-500/30 rounded-xl p-8 text-center mx-4 my-8">
      <div className="text-4xl mb-4">⚠️</div>
      <h3 className="text-white font-semibold text-lg mb-2">Something went wrong</h3>
      <p className="text-slate-400 text-sm mb-2 max-w-md mx-auto">
        An unexpected error occurred while loading this section.
      </p>
      <p className="text-red-400/60 text-xs font-mono mb-6 truncate max-w-md mx-auto">
        {message}
      </p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium text-sm hover:bg-red-500/30 transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
