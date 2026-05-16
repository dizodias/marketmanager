import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BackendProvider } from './context/BackendContext'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './components/Dashboard'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import MovementsPage from './pages/MovementsPage'
import SettingsPage from './pages/SettingsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import TypesPage from './pages/admin/TypesPage'
import UsersPage from './pages/admin/UsersPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <BackendProvider>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/movements" element={<MovementsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />

                  <Route element={<ProtectedRoute requireAdmin />}>
                    <Route path="/admin/categories" element={<CategoriesPage />} />
                    <Route path="/admin/types" element={<TypesPage />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BackendProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
