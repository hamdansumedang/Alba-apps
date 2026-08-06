import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RoleGuard } from './components/RoleGuard'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CategoriesPage } from './features/master/CategoriesPage'
import { PaymentMethodsPage } from './features/master/PaymentMethodsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <RoleGuard>
                <AppLayout />
              </RoleGuard>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/master/categories" element={<CategoriesPage />} />
            <Route path="/master/payment-methods" element={<PaymentMethodsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
