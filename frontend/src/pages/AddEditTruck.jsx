import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Truck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const TRUCK_TYPES = ['flatbed', 'tanker', 'refrigerated', 'box', 'dump', 'tow', 'other']

const EMPTY_FORM = {
  make: '', model: '', year: new Date().getFullYear(), license_plate: '',
  capacity_tons: '', truck_type: 'flatbed', price_per_day: '',
  description: '', location: '', is_available: true
}

export default function AddEditTruck() {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || user.user_type !== 'owner') { navigate('/login'); return }
    if (isEdit) {
      axios.get(`/api/trucks/${id}`)
        .then(res => {
          const t = res.data
          setForm({
            make: t.make, model: t.model, year: t.year, license_plate: t.license_plate,
            capacity_tons: t.capacity_tons, truck_type: t.truck_type, price_per_day: t.price_per_day,
            description: t.description || '', location: t.location || '', is_available: Boolean(t.is_available)
          })
        })
        .catch(() => navigate('/owner/dashboard'))
        .finally(() => setLoading(false))
    }
  }, [id, user])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (isEdit) {
        await axios.put(`/api/trucks/${id}`, form)
      } else {
        await axios.post('/api/trucks', form)
      }
      navigate('/owner/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || t('addTruck.failedSave'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/owner/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('addTruck.backToDash')}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <Truck className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? t('addTruck.editTitle') : t('addTruck.addTitle')}</h1>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.make')} *</label>
              <input type="text" required className="input-field" placeholder={t('addTruck.makePlaceholder')}
                value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.model')} *</label>
              <input type="text" required className="input-field" placeholder={t('addTruck.modelPlaceholder')}
                value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.year')} *</label>
              <input type="number" required className="input-field" min="1990" max={new Date().getFullYear() + 1}
                value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.licensePlate')} *</label>
              <input type="text" required className="input-field font-mono uppercase" placeholder={t('addTruck.licensePlatePlaceholder')}
                value={form.license_plate} onChange={e => setForm({ ...form, license_plate: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.truckType')} *</label>
              <select required className="input-field" value={form.truck_type}
                onChange={e => setForm({ ...form, truck_type: e.target.value })}>
                {TRUCK_TYPES.map(key => (
                  <option key={key} value={key}>{t(`truckTypes.${key}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.capacity')} *</label>
              <input type="number" required className="input-field" min="0.1" step="0.1" placeholder={t('addTruck.capacityPlaceholder')}
                value={form.capacity_tons} onChange={e => setForm({ ...form, capacity_tons: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.pricePerDay')} *</label>
              <input type="number" required className="input-field" min="1" step="0.01" placeholder={t('addTruck.pricePlaceholder')}
                value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.location')}</label>
              <input type="text" className="input-field" placeholder={t('addTruck.locationPlaceholder')}
                value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('addTruck.description')}</label>
            <textarea className="input-field resize-none" rows={3}
              placeholder={t('addTruck.descriptionPlaceholder')}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.is_available}
                  onChange={e => setForm({ ...form, is_available: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-brand-300 rounded-full peer peer-checked:bg-brand-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">
                {form.is_available ? t('addTruck.availableToggle') : t('addTruck.unavailableToggle')}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary flex-1 py-2.5">
              {submitting ? t('addTruck.saving') : isEdit ? t('addTruck.saveChanges') : t('addTruck.addBtn')}
            </button>
            <Link to="/owner/dashboard" className="btn-secondary px-6 text-center">{t('addTruck.cancelBtn')}</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
