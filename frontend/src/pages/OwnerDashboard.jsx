import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Plus, Truck, Calendar, Star, Edit2, Trash2,
  CheckCircle, XCircle, Clock, Package, TrendingUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import StarRating from '../components/StarRating'

const STATUS_STYLES = {
  pending:   { color: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function OwnerDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  const [trucks, setTrucks] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trucks')

  useEffect(() => {
    if (!user || user.user_type !== 'owner') { navigate('/login'); return }
    fetchData()
  }, [user])

  async function fetchData() {
    setLoading(true)
    try {
      const [trucksRes, bookingsRes] = await Promise.all([
        axios.get('/api/trucks/owner/my-trucks'),
        axios.get('/api/bookings/owner-bookings'),
      ])
      setTrucks(trucksRes.data)
      setBookings(bookingsRes.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function deleteTruck(id) {
    if (!confirm('Delete this truck? This action cannot be undone.')) return
    try {
      await axios.delete(`/api/trucks/${id}`)
      setTrucks(prev => prev.filter(t => t.id !== id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete')
    }
  }

  async function updateBookingStatus(bookingId, status) {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status })
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update')
    }
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const totalRevenue = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + b.total_price, 0)
  const avgRating = trucks.reduce((s, t) => s + t.avg_rating, 0) / (trucks.length || 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('ownerDash.title')}</h1>
          <p className="text-gray-500 mt-1">{t('ownerDash.welcomeBack')}, {user?.name}</p>
        </div>
        <Link to="/owner/add-truck" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('ownerDash.addTruck')}
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Truck} label={t('ownerDash.totalTrucks')} value={trucks.length} color="brand" />
        <StatCard icon={Calendar} label={t('ownerDash.pendingRequests')} value={pendingBookings.length} color="amber" />
        <StatCard icon={TrendingUp} label={t('ownerDash.totalRevenue')} value={`$${totalRevenue.toFixed(0)}`} color="green" />
        <StatCard icon={Star} label={t('ownerDash.avgRating')} value={isNaN(avgRating) ? '—' : avgRating.toFixed(1)} color="purple" />
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {['trucks', 'bookings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'trucks' ? t('ownerDash.trucksTab') : t('ownerDash.bookingsTab')}
            {tab === 'bookings' && pendingBookings.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingBookings.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : activeTab === 'trucks' ? (
        <TrucksTab trucks={trucks} onDelete={deleteTruck} />
      ) : (
        <BookingsTab bookings={bookings} onUpdateStatus={updateBookingStatus} />
      )}
    </div>
  )
}

function TrucksTab({ trucks, onDelete }) {
  const { t } = useLang()
  if (trucks.length === 0) {
    return (
      <div className="card text-center py-16 text-gray-400">
        <Truck className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">{t('ownerDash.noTrucks')}</p>
        <p className="text-sm mt-1">{t('ownerDash.noTrucksSub')}</p>
        <Link to="/owner/add-truck" className="btn-primary inline-flex items-center gap-2 mt-4">
          <Plus className="w-4 h-4" /> {t('ownerDash.addFirstTruck')}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trucks.map(truck => (
        <div key={truck.id} className="card hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{truck.year} {truck.make} {truck.model}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${truck.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {truck.is_available ? t('ownerDash.available') : t('ownerDash.unavailable')}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono">{truck.license_plate} · {truck.truck_type}</p>
                <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-500 flex-wrap">
                  <span className="font-semibold text-brand-600">${truck.price_per_day}/day</span>
                  <StarRating rating={truck.avg_rating} size="sm" showCount count={truck.review_count} />
                  <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" />{truck.booking_count} bookings</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={`/owner/edit-truck/${truck.id}`} className="btn-secondary p-2">
                <Edit2 className="w-4 h-4" />
              </Link>
              <button onClick={() => onDelete(truck.id)} className="btn-danger p-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function BookingsTab({ bookings, onUpdateStatus }) {
  const { t } = useLang()
  if (bookings.length === 0) {
    return (
      <div className="card text-center py-16 text-gray-400">
        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p className="text-lg font-medium">{t('ownerDash.noBookings')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => {
        const { color, icon: StatusIcon } = STATUS_STYLES[booking.status] || STATUS_STYLES.pending
        return (
          <div key={booking.id} className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{booking.make} {booking.model}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {t(`statuses.${booking.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {t('ownerDash.customer')}: <span className="font-medium text-gray-700">{booking.customer_name}</span>
                  {booking.customer_phone && <span className="ml-2 text-gray-400">{booking.customer_phone}</span>}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-medium">{booking.start_date}</span> → <span className="font-medium">{booking.end_date}</span>
                  <span className="ml-3 font-semibold text-brand-600">${booking.total_price.toFixed(2)}</span>
                </p>
                {booking.notes && <p className="text-sm text-gray-400 mt-1 italic">"{booking.notes}"</p>}
              </div>

              {booking.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                    className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <CheckCircle className="w-4 h-4" /> {t('ownerDash.confirm')}
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                    className="btn-danger text-sm flex items-center gap-1.5 py-1.5 px-3"
                  >
                    <XCircle className="w-4 h-4" /> {t('ownerDash.decline')}
                  </button>
                </div>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => onUpdateStatus(booking.id, 'completed')}
                  className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" /> {t('ownerDash.markCompleted')}
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  )
}
