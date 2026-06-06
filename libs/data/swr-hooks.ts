'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

// Generic fetcher for SWR
export const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Failed to fetch data')
    try {
      const body = await res.json()
      ;(error as any).info = body
    } catch {}
    ;(error as any).status = res.status
    throw error
  }
  return res.json()
}

// Mutation sender for POST/PUT/DELETE
export const mutationSender = (url: string, { arg }: { arg: any }) =>
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(arg),
  }).then(r => r.json())

// ── User Stats ──

export function useUserStats() {
  return useSWR('/api/stats/user', fetcher, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    refreshInterval: 60000, // 1 min
  })
}

// ── Leaderboard ──

export function useLeaderboard(limit = 10) {
  return useSWR(`/api/leaderboard?limit=${limit}`, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // 30 sec
  })
}

// ── Predictions (auto/ensemble) ──

export function useAutoPredictions(limit = 60) {
  return useSWR(`/api/predictions/auto?limit=${limit}`, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 120000, // 2 min
  })
}

// ── User Predictions ──

export function useUserPredictions() {
  return useSWR('/api/predictions/user', fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 30000,
  })
}

// ── Mode B Predictions ──

export function useModeBPredictions(limit = 4) {
  return useSWR(`/api/predictions/mode-b?limit=${limit}`, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 120000,
  })
}

// ── Forum Posts ──

export function useForumPosts() {
  return useSWR('/api/posts', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000,
  })
}

// ── Forum Comments ──

export function useForumComments(postId: string) {
  return useSWR(postId ? `/api/forum/comment?postId=${encodeURIComponent(postId)}` : null, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 15000,
  })
}

// ── Geo Info ──

export function useGeoInfo() {
  return useSWR('/api/geo/info', fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: true,
    dedupingInterval: 3600000, // 1 hour
  })
}

// ── Matches / Scores ──

export function useMatchResults(matchIds: string[]) {
  const ids = matchIds.join(',')
  return useSWR(ids ? `/api/matches/result?matchIds=${encodeURIComponent(ids)}` : null, fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 8000, // 8 sec for live scores
  })
}

// ── Mutations (for writes) ──

export function useCreatePost() {
  return useSWRMutation('/api/posts/create', mutationSender)
}

export function useCreateComment() {
  return useSWRMutation('/api/forum/comment', mutationSender)
}

export function useAddReaction() {
  return useSWRMutation('/api/forum/reaction', mutationSender)
}

export function useDailyCheckin() {
  return useSWRMutation('/api/candy/daily-login', mutationSender)
}
