import { useState, useEffect, forwardRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import { Truck, Calendar, DollarSign, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const DateInput = forwardRef(({ value, onClick, placeholder }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className="input-field flex items-center gap-2 text-left cursor-pointer hover:border-brand-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
  >
    <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
    <span className={value ? 'text-gray-900' : 'text-gray-400'}>
      {value || placeholder}
    </span>
  </button>
))

export default function BookingPage() {
  const { truckId } = useParams()
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  const [truck, setTruck] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(null)
  const [notes, setNotes] = useState('')
  const [totalDays, setTotalDays] = useState(0)

  function toYMD(date) {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  useEffect(() => {
    if (!user || user.user_type !== 'customer') {
      navigate('/login')
      return
    }
    axios.get(`/api/trucks/${truckId}`)
      .then(res => setTruck(res.data))
      .catch(() => navigate('/trucks'))
      .finally(() => setLoading(false))
  }, [truckId, user])

  useEffect(() => {
    if (startDate && endDate) {
      const diff = (endDate - startDate) / (1000 * 60 * 60 * 24)
      setTotalDays(diff > 0 ? diff : 0)
    } else {
      setTotalDays(0)
    }
  }, [startDate, endDate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (totalDays <= 0) { setError(t('booking.invalidDateRange')); return }
    setSubmitting(true)
    try {
      await axios.post('/api/bookings', {
        truck_id: truckId,
        start_date: toYMD(startDate),
        end_date: toYMD(endDate),
        notes,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Booking failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('booking.successTitle')}</h1>
        <p className="text-gray-500 mb-6">
          {t('booking.successMsg')} <strong>{truck.year} {truck.make} {truck.model}</strong> {t('booking.successMsg2')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/customer/dashboard" className="btn-primary">{t('booking.viewMyBookings')}</Link>
          <Link to="/trucks" className="btn-secondary">{t('booking.browseMore')}</Link>
        </div>
      </div>
    )
  }

  const totalPrice = totalDays * (truck?.price_per_day || 0)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to={`/trucks/${truckId}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {t('booking.backToTruck')}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('booking.title')}</h1>

      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Truck className="w-8 h-8 text-brand-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{truck.year} {truck.make} {truck.model}</p>
            <p className="text-sm text-gray-400 font-mono">{truck.license_plate}</p>
            <p className="text-sm text-brand-600 font-semibold mt-0.5">${truck.price_per_day} / day</p>
          </div>
        </div>
      </div>

      <div className="card">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('booking.startDate')}
              </label>
              <DatePicker
                selected={startDate}
                onChange={date => { setStartDate(date); if (endDate && date >= endDate) setEndDate(null) }}
                minDate={today}
                dateFormat="dd MMM yyyy"
                customInput={<DateInput placeholder="Select start date" />}
                popperPlacement="bottom-start"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('booking.endDate')}
              </label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                minDate={startDate ? new Date(startDate.getTime() + 86400000) : today}
                dateFormat="dd MMM yyyy"
                customInput={<DateInput placeholder="Select end date" />}
                popperPlacement="bottom-start"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('booking.notes')}</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder={t('booking.notesPlaceholder')}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          {totalDays > 0 && (
            <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
              <h3 className="font-semibold text-brand-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> {t('booking.priceEstimate')}
              </h3>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>${truck.price_per_day} × {totalDays} {totalDays !== 1 ? t('booking.daysPlural') : t('booking.days')}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-brand-800 text-base border-t border-brand-200 pt-2 mt-2">
                  <span>{t('booking.total')}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || totalDays <= 0}
            className="btn-primary w-full py-3 text-base"
          >
            {submitting ? t('booking.submitting') : t('booking.confirmBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}
