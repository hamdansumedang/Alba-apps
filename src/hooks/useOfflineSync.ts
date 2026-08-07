import { useState, useEffect, useCallback } from 'react'
import { offlineDb } from '../lib/offlineDb'
import { supabase } from '../lib/supabase'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [pendingCount, setPendingCount] = useState(0)

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load pending count
  const refreshPendingCount = useCallback(async () => {
    const count = await offlineDb.offlineTransactions.where('status').equals('pending').count()
    setPendingCount(count)
  }, [])

  useEffect(() => {
    refreshPendingCount()
  }, [refreshPendingCount])

  // Sync function
  const syncPendingTransactions = useCallback(async () => {
    if (!isOnline) return

    setSyncStatus('syncing')
    const pendingTxs = await offlineDb.offlineTransactions.where('status').equals('pending').toArray()

    for (const tx of pendingTxs) {
      try {
        await offlineDb.offlineTransactions.update(tx.id!, { status: 'syncing' })

        // Attempt to insert into Supabase
        const { error } = await supabase.from('transactions').insert(tx.payload)

        if (error) throw error

        await offlineDb.offlineTransactions.update(tx.id!, { status: 'synced' })
      } catch (err: any) {
        await offlineDb.offlineTransactions.update(tx.id!, {
          status: 'failed',
          error: err.message,
        })
        setSyncStatus('error')
        console.error('Sync failed for tx:', tx.tempId, err)
      }
    }

    await refreshPendingCount()
    setSyncStatus('idle')
  }, [isOnline, refreshPendingCount])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      syncPendingTransactions()
    }
  }, [isOnline, syncPendingTransactions])

  // Queue a transaction when offline
  const queueTransaction = async (payload: any) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    await offlineDb.offlineTransactions.add({
      tempId,
      payload,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    await refreshPendingCount()

    // If we are online, try to sync immediately
    if (isOnline) {
      syncPendingTransactions()
    }
  }

  return {
    isOnline,
    syncStatus,
    pendingCount,
    queueTransaction,
    syncPendingTransactions,
  }
}
