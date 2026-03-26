import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { Truck, LogOut, Menu, X, User, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t, lang, toggleLang } = useLang()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const LangToggle = () => (
    <button
      onClick={toggleLang}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all text-sm font-semibold text-gray-600 hover:text-brand-700"
      title={lang === 'en' ? 'Switch to Romanian' : 'Schimbă în Engleză'}
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇷🇴' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'RO' : 'EN'}</span>
    </button>
  )

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl">
            <Truck className="w-7 h-7" />
            <span>TruckHub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/trucks" className="text-gray-600 hover:text-brand-600 font-medium transition-colors">
              {t('nav.browseTrucks')}
            </Link>
            {user ? (
              <>
                <Link
                  to={user.user_type === 'owner' ? '/owner/dashboard' : '/customer/dashboard'}
                  className="text-gray-600 hover:text-brand-600 font-medium transition-colors flex items-center gap-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('nav.dashboard')}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-brand-600" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                      {t(`nav.${user.user_type}`)}
                    </span>
                  </div>
                  <LangToggle />
                  <button onClick={handleLogout} className="btn-secondary text-sm flex items-center gap-1">
                    <LogOut className="w-4 h-4" />
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <LangToggle />
                <Link to="/login" className="btn-secondary text-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn-primary text-sm">{t('nav.signUp')}</Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LangToggle />
            <button className="p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-2">
          <Link to="/trucks" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
            {t('nav.browseTrucks')}
          </Link>
          {user ? (
            <>
              <Link
                to={user.user_type === 'owner' ? '/owner/dashboard' : '/customer/dashboard'}
                className="block py-2 text-gray-700 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                {t('nav.dashboard')}
              </Link>
              <button onClick={handleLogout} className="w-full text-left py-2 text-red-600 font-medium">
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
                {t('nav.login')}
              </Link>
              <Link to="/register" className="block py-2 text-brand-600 font-medium" onClick={() => setMenuOpen(false)}>
                {t('nav.signUp')}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
