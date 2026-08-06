import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { UserRole } from '../types'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

/**
 * RoleGuard – protects routes based on authentication and role.
 *
 * Usage:
 *   <RoleGuard allowedRoles={['admin']}>
 *     <AdminPage />
 *   </RoleGuard>
 */
export function RoleGuard({
  children,
  allowedRoles,
  redirectTo = '/login',
}: RoleGuardProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  // Role check
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold text-red-600">Akses Ditolak</h1>
        <p className="text-gray-600">
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
