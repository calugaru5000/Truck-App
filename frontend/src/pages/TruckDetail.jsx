import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  Truck, MapPin, Weight, DollarSign, Phone, Mail,
  User, Calendar, ArrowLeft, Star, AlertCircle
} from 'lucide-react'
import StarRating from '../components/StarRating'
import ReviewCard from '../components/ReviewCard'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

export default function TruckDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [truck, setTruck] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      axios.get(`/api/trucks/${id}`),
      axios.get(`/api/reviews/truck/${id}`)
    ]).then(([truckRes, reviewRes]) => {
      setTruck(truckRes.data)
      setReviews(reviewRes.data)
    }).catch(() => {
      navigate('/trucks')
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-100 rounded-xl" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    )
  }

  if (!truck) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/trucks" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t('truckDetail.backToListings')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-brand-50 to-orange-100 rounded-2xl h-64 flex items-center justify-center relative">
            <Truck className="w-32 h-32 text-brand-400" />
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur text-brand-700 text-sm font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {t(`truckTypes.${truck.truck_type}`)}
            </div>
            {!truck.is_available && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {t('trucks.unavailable')}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {truck.year} {truck.make} {truck.model}
            </h1>
            <p className="text-gray-400 font-mono mt-1 text-sm">{truck.license_plate}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={truck.avg_rating} size="md" showCount count={truck.review_count} />
              <span className="text-sm text-gray-500 font-medium">
                {Number(truck.avg_rating).toFixed(1)} {t('truckDetail.avgLabel')}
              </span>
            </div>
          </div>

          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">{t('truckDetail.truckDetails')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Detail icon={Weight} label={t('truckDetail.capacity')} value={`${truck.capacity_tons} ${t('truckDetail.tons')}`} />
              <Detail icon={Truck} label={t('truckDetail.type')} value={t(`truckTypes.${truck.truck_type}`)} />
              <Detail icon={Calendar} label={t('truckDetail.year')} value={truck.year} />
              {truck.location && <Detail icon={MapPin} label={t('truckDetail.location')} value={truck.location} />}
            </div>
            {truck.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">{truck.description}</p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="font-bold text-gray-900 mb-2">
              {t('truckDetail.ownerInfo')}
            </h2>
            <div className="flex items-center gap-3 mt-3">
              <div className="w-11 h-11 bg-brand-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{truck.owner_name}</p>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  {truck.owner_phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {truck.owner_phone}
                    </span>
                  )}
                  {truck.owner_email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" /> {truck.owner_email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-gray-900 text-xl mb-4">
              {t('truckDetail.reviews')} ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="card text-center text-gray-400 py-8">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{t('truckDetail.noReviews')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card sticky top-24">
            <div className="flex items-baseline gap-1 mb-1">
              <DollarSign className="w-5 h-5 text-brand-600" />
              <span className="text-3xl font-extrabold text-brand-700">{truck.price_per_day}</span>
              <span className="text-gray-400 font-normal">{t('truckDetail.pricePerDay')}</span>
            </div>
            <p className="text-xs text-gray-400 mb-5">{t('truckDetail.priceSub')}</p>

            {!user ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 text-center mb-3">{t('truckDetail.signInToBook')}</p>
                <Link to="/login" className="btn-primary w-full text-center block">{t('truckDetail.signInBtn')}</Link>
                <Link to="/register" className="btn-secondary w-full text-center block">{t('truckDetail.createAccount')}</Link>
              </div>
            ) : user.user_type === 'owner' ? (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-500 text-center">
                {t('truckDetail.ownerCantBook')}
              </div>
            ) : !truck.is_available ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 text-center">
                {t('truckDetail.truckUnavailable')}
              </div>
            ) : (
              <Link
                to={`/book/${truck.id}`}
                className="btn-primary w-full text-center block py-3 text-base"
              >
                {t('truckDetail.bookNow')}
              </Link>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-400">
              <p className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> {t('truckDetail.freeCancellation')}</p>
              <p className="flex items-center gap-2"><AlertCircle className="w-3.5 h-3.5" /> {t('truckDetail.ownerConfirms')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-sm font-semibold text-gray-800 ${capitalize ? 'capitalize' : ''}`}>{value}</p>
      </div>
    </div>
  )
}
