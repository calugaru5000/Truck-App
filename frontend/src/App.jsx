import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LangProvider, useLang } from './context/LangContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import TruckList from './pages/TruckList'
import TruckDetail from './pages/TruckDetail'
import BookingPage from './pages/BookingPage'
import OwnerDashboard from './pages/OwnerDashboard'
import CustomerDashboard from './pages/CustomerDashboard'
import AddEditTruck from './pages/AddEditTruck'

function ProtectedRoute({ children, requiredType }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (requiredType && user.user_type !== requiredType) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { t } = useLang()
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/trucks" element={<TruckList />} />
          <Route path="/trucks/:id" element={<TruckDetail />} />
          <Route path="/book/:truckId" element={
            <ProtectedRoute requiredType="customer"><BookingPage /></ProtectedRoute>
          } />
          <Route path="/customer/dashboard" element={
            <ProtectedRoute requiredType="customer"><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/owner/dashboard" element={
            <ProtectedRoute requiredType="owner"><OwnerDashboard /></ProtectedRoute>
          } />
          <Route path="/owner/add-truck" element={
            <ProtectedRoute requiredType="owner"><AddEditTruck /></ProtectedRoute>
          } />
          <Route path="/owner/edit-truck/:id" element={
            <ProtectedRoute requiredType="owner"><AddEditTruck /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} TruckHub. {t('common.footer')}
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LangProvider>
  )
}
