'use client'

import { useState, useEffect, useCallback } from 'react'

interface PushState {
  isSupported: boolean
  isSubscribed: boolean
  subscription: PushSubscription | null
}

export function usePushNotifications() {
  const [state, setState] = useState<PushState>({
    isSupported: false,
    isSubscribed: false,
    subscription: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window
    setState((prev) => ({ ...prev, isSupported: supported }))

    if (!supported) {
      setLoading(false)
      return
    }

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        setState({
          isSupported: true,
          isSubscribed: !!subscription,
          subscription: subscription || null,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const subscribe = useCallback(async () => {
    if (!state.isSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      setState((prev) => ({ ...prev, isSubscribed: true, subscription }))

      // Send to server
      const sub = subscription.toJSON()
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: sub.keys?.p256dh,
          auth: sub.keys?.auth,
        }),
      })

      return true
    } catch (error) {
      console.error('Push subscription failed:', error)
      return false
    }
  }, [state.isSupported])

  const unsubscribe = useCallback(async () => {
    if (!state.subscription) return

    try {
      await state.subscription.unsubscribe()
      setState((prev) => ({ ...prev, isSubscribed: false, subscription: null }))
    } catch (error) {
      console.error('Push unsubscription failed:', error)
    }
  }, [state.subscription])

  return { ...state, loading, subscribe, unsubscribe }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
