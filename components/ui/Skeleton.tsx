'use client'

import React from 'react'

interface SkeletonProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-5 ${className}`}>
      <div className="space-y-4 animate-pulse">
        <SkeletonText className="w-1/3" />
        <SkeletonText className="w-2/3" />
        <SkeletonText className="w-1/2" />
      </div>
    </div>
  )
}

export function SkeletonText({ className = '' }: SkeletonProps) {
  return <div className={`h-4 bg-slate-700/60 rounded ${className}`} />
}

export function SkeletonAvatar({ className = '' }: SkeletonProps) {
  return <div className={`bg-slate-700/60 rounded-lg shrink-0 ${className}`} />
}

export function SkeletonBar({ className = '' }: SkeletonProps) {
  return <div className={`h-2 bg-slate-700/50 rounded-full ${className}`} />
}

export function SkeletonBadge({ className = '' }: SkeletonProps) {
  return <div className={`h-5 bg-slate-700/50 rounded-full ${className}`} />
}

export function SkeletonTeamCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-4">
        <SkeletonAvatar className="w-12 h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonText className="w-20" />
          <SkeletonText className="w-16 h-3" />
        </div>
        <div className="text-center">
          <SkeletonText className="w-10 h-5 mx-auto" />
        </div>
        <div className="flex-1 space-y-2 text-right">
          <SkeletonText className="w-20 ml-auto" />
          <SkeletonText className="w-16 h-3 ml-auto" />
        </div>
        <SkeletonAvatar className="w-12 h-12" />
      </div>
      <SkeletonBar className="mt-4" />
    </div>
  )
}

export function SkeletonPostCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-900/60 border border-slate-700/60 rounded-xl p-6 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <SkeletonAvatar className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5">
          <SkeletonText className="w-24" />
          <SkeletonText className="w-16 h-3" />
        </div>
      </div>
      <SkeletonText className="w-3/4 mb-2" />
      <SkeletonText className="w-full mb-2" />
      <SkeletonText className="w-1/2 mb-4" />
      <SkeletonBar className="w-full h-32 rounded-lg" />
      <div className="flex gap-4 mt-4">
        <SkeletonText className="w-12 h-3" />
        <SkeletonText className="w-12 h-3" />
        <SkeletonText className="w-12 h-3" />
      </div>
    </div>
  )
}

export function SkeletonExpertCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 animate-pulse ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <SkeletonAvatar className="w-6 h-6 rounded-full" />
        <SkeletonText className="w-16" />
      </div>
      <div className="space-y-1">
        <SkeletonText className="w-full h-3" />
        <SkeletonText className="w-3/4 h-3" />
        <SkeletonText className="w-1/2 h-3" />
      </div>
    </div>
  )
}
