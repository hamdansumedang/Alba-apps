import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RoleGuard } from './components/RoleGuard'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './features/auth/LoginPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CategoriesPage } from './features/master/CategoriesPage'
import { PaymentMethodsPage } from './features/master/PaymentMethodsPage'
import { TransactionsPage } from './features/transactions/TransactionsPage'
import { LedgerPage } from './features/ledger/LedgerPage'
import { InventoryPage } from './features/kantin/InventoryPage'
import { PartnersPage } from './features/kantin/PartnersPage'
import { KantinSalesPage } from './features/kantin/KantinSalesPage'
import { KantinReportPage } from './features/kantin/KantinReportPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RoleGuard><AppLayout /></RoleGuard>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/kantin/pos" element={<KantinSalesPage />} />
            <Route path="/kantin/inventory" element={<InventoryPage />} />
            <Route path="/kantin/partners" element={<PartnersPage />} />
            <Route path="/kantin/reports" element={<KantinReportPage />} />
            <Route path="/master/categories" element={<CategoriesPage />} />
            <Route path="/master/payment-methods" element={<PaymentMethodsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}