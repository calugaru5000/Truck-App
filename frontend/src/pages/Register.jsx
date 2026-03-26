import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Truck, Eye, EyeOff, User, Building2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

export default function Register() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '', password: '', name: '', phone: '', user_type: 'customer'
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/register', form)
      login(res.data.token, res.data.user)
      navigate(form.user_type === 'owner' ? '/owner/dashboard' : '/customer/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error || t('auth.registerFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-2xl mb-4">
            <Truck className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('auth.createAccount')}</h1>
          <p className="text-gray-500 mt-1">{t('auth.joinSub')}</p>
        </div>

        <div className="card">
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.iAmA')}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'customer', label: t('auth.customerLabel'), desc: t('auth.customerDesc'), Icon: User },
                { value: 'owner', label: t('auth.ownerLabel'), desc: t('auth.ownerDesc'), Icon: Building2 },
              ].map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, user_type: value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    form.user_type === value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${form.user_type === value ? 'text-brand-600' : 'text-gray-400'}`} />
                  <p className={`font-semibold text-sm ${form.user_type === value ? 'text-brand-700' : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder={t('auth.fullNamePlaceholder')}
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder={t('auth.emailPlaceholder')}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
              <input
                type="tel"
                className="input-field"
                placeholder={t('auth.phonePlaceholder')}
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  className="input-field pr-10"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-base mt-2">
              {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">{t('auth.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
