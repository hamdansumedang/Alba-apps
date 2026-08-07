import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { ShieldCheck, Clock, Database } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  table_name: string
  record_id: string
  old_data: any
  new_data: any
  created_at: string
  user?: { name: string; email: string; role: string }
}

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*, user:users(name, email, role)')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setLogs(data || [])
    } catch (err: any) {
      console.error('Error fetching audit logs:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-indigo-600" />
          Audit Trail & Rekonsiliasi Pusat
        </h1>
        <p className="text-gray-500 text-sm mt-1">Pantau seluruh aktivitas modifikasi transaksi dan keamanan sistem.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-600" />
          Riwayat Log Aktivitas Sistem
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Aksi</th>
                <th className="py-3 px-4">Tabel</th>
                <th className="py-3 px-4">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Memuat log audit...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Belum ada aktivitas tercatat.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3 px-4 font-mono text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{log.user?.name || 'System'}</div>
                      <div className="text-xs text-gray-400">{log.user?.role || '-'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${log.action === 'INSERT' ? 'bg-emerald-50 text-emerald-600' : log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-600">{log.table_name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500 max-w-md truncate">
                      {log.action === 'INSERT' ? JSON.stringify(log.new_data) : log.action === 'UPDATE' ? `Old: ${JSON.stringify(log.old_data)} -> New: ${JSON.stringify(log.new_data)}` : JSON.stringify(log.old_data)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
