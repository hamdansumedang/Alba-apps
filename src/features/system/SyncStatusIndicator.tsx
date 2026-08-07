import React from 'react'
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useOfflineSync } from '../../hooks/useOfflineSync'

export const SyncStatusIndicator: React.FC = () => {
  const { isOnline, syncStatus, pendingCount, syncPendingTransactions } = useOfflineSync()

  // Trigger on-demand sync if user clicks
  const handleClick = () => {
    if (isOnline && pendingCount > 0) {
      syncPendingTransactions()
    }
  }

  // Determine UI state
  let bgColor = 'bg-emerald-50 border-emerald-200 text-emerald-700'
  let Icon = CheckCircle2
  let label = 'Online & Sinkron'

  if (!isOnline) {
    bgColor = 'bg-red-50 border-red-200 text-red-700'
    Icon = WifiOff
    label = 'Mode Offline'
  } else if (syncStatus === 'syncing') {
    bgColor = 'bg-blue-50 border-blue-200 text-blue-700'
    Icon = RefreshCw
    label = 'Menyinkronkan...'
  } else if (syncStatus === 'error' || pendingCount > 0) {
    bgColor = 'bg-amber-50 border-amber-200 text-amber-700'
    Icon = AlertCircle
    label = `${pendingCount} Antrian`
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition hover:opacity-80 ${bgColor}`}
      title="Status koneksi & sinkronisasi"
    >
      <Icon className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
      <span>{label}</span>
    </div>
  )
}
