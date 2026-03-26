import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Calendar, Truck, CheckCircle, XCircle, Clock,
  Star, MessageSquare, Package, Search
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

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()

  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)

  useEffect(() => {
    if (!user || user.user_type !== 'customer') { navigate('/login'); return }
    fetchBookings()
  }, [user])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await axios.get('/api/bookings/my-bookings')
      setBookings(res.data)
    } catch {
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(id) {
    if (!confirm(t('customerDash.cancel') + '?')) return
    try {
      await axios.patch(`/api/bookings/${id}/status`, { status: 'cancelled' })
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (err) {
      alert(err.response?.data?.error || t('customerDash.failedCancel'))
    }
  }

  function handleReviewSubmitted(bookingId, review) {
    setBookings(prev => prev.map(b =>
      b.id === bookingId ? { ...b, review_id: review.id, rating: review.rating, comment: review.comment } : b
    ))
    setReviewModal(null)
  }

  const total = bookings.length
  const completed = bookings.filter(b => b.status === 'completed').length
  const upcoming = bookings.filter(b => ['pending', 'confirmed'].includes(b.status)).length

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('customerDash.title')}</h1>
        <p className="text-gray-500 mt-1">{t('customerDash.welcomeBack')}, {user?.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="text-sm text-gray-500 mt-0.5">{t('customerDash.totalBookings')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{completed}</p>
          <p className="text-sm text-gray-500 mt-0.5">{t('customerDash.completed')}</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{upcoming}</p>
          <p className="text-sm text-gray-500 mt-0.5">{t('customerDash.upcoming')}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{t('customerDash.noBookings')}</p>
          <p className="text-sm mt-1">{t('customerDash.noBookingsSub')}</p>
          <Link to="/trucks" className="btn-primary inline-flex items-center gap-2 mt-4">
            <Search className="w-4 h-4" /> {t('customerDash.browseTrucks')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const { color, icon: StatusIcon } = STATUS_STYLES[booking.status] || STATUS_STYLES.pending
            const canReview = booking.status === 'completed' && !booking.review_id
            const hasReview = booking.status === 'completed' && booking.review_id

            return (
              <div key={booking.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-brand-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link to={`/trucks/${booking.truck_id}`} className="font-bold text-gray-900 hover:text-brand-600 transition-colors">
                          {booking.make} {booking.model}
                        </Link>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {t(`statuses.${booking.status}`)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{booking.license_plate} · {booking.truck_type}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        <span className="font-medium">{booking.start_date}</span> → <span className="font-medium">{booking.end_date}</span>
                        <span className="ml-3 font-semibold text-brand-600">${booking.total_price.toFixed(2)}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{t('customerDash.owner')}: {booking.owner_name}</p>

                      {hasReview && (
                        <div className="mt-2 flex items-center gap-2">
                          <StarRating rating={booking.rating} size="sm" />
                          {booking.comment && <span className="text-xs text-gray-500 italic">"{booking.comment}"</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canReview && (
                      <button
                        onClick={() => setReviewModal(booking)}
                        className="btn-primary text-sm flex items-center gap-1.5 py-1.5 px-3"
                      >
                        <Star className="w-4 h-4" /> {t('customerDash.leaveReview')}
                      </button>
                    )}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="btn-danger text-sm flex items-center gap-1.5 py-1.5 px-3"
                      >
                        <XCircle className="w-4 h-4" /> {t('customerDash.cancel')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {reviewModal && (
        <ReviewModal
          booking={reviewModal}
          onClose={() => setReviewModal(null)}
          onSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}

function ReviewModal({ booking, onClose, onSubmitted }) {
  const { t } = useLang()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await axios.post('/api/reviews', {
        booking_id: booking.id,
        rating,
        comment: comment.trim() || null
      })
      onSubmitted(booking.id, res.data)
    } catch (err) {
      setError(err.response?.data?.error || t('customerDash.failedReview'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{t('customerDash.reviewTitle')}</h2>
            <p className="text-sm text-gray-500">{booking.make} {booking.model}</p>
          </div>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('customerDash.rating')} *</label>
            <div className="flex items-center gap-3">
              <StarRating rating={rating} onRate={setRating} size="lg" />
              <span className="text-sm text-gray-500">{rating} / 5</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageSquare className="w-4 h-4 inline mr-1" />{t('customerDash.comment')}
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder={t('customerDash.commentPlaceholder')}
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? t('customerDash.submitting') : t('customerDash.submitReview')}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary px-5">{t('customerDash.cancelBtn')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
