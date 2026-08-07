import Dexie, { Table } from 'dexie'

export interface OfflineTransaction {
  id?: number
  tempId: string
  payload: any // The transaction data to be synced
  status: 'pending' | 'syncing' | 'synced' | 'failed'
  created_at: string
  error?: string
}

export class AlbaOfflineDB extends Dexie {
  offlineTransactions!: Table<OfflineTransaction>

  constructor() {
    super('alba_offline_db')
    this.version(1).stores({
      offlineTransactions: '++id, tempId, status, created_at',
    })
  }
}

export const offlineDb = new AlbaOfflineDB()
