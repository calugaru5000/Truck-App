import { Link } from 'react-router-dom'
import { MapPin, Weight, DollarSign, Truck } from 'lucide-react'
import StarRating from './StarRating'
import { useLang } from '../context/LangContext'

const TRUCK_TYPE_COLORS = {
  flatbed:   'bg-blue-100 text-blue-700',
  tanker:    'bg-purple-100 text-purple-700',
  refrigerated: 'bg-cyan-100 text-cyan-700',
  box:       'bg-green-100 text-green-700',
  dump:      'bg-amber-100 text-amber-700',
  tow:       'bg-red-100 text-red-700',
  other:     'bg-gray-100 text-gray-700',
}

export default function TruckCard({ truck }) {
  const { t } = useLang()
  const typeColor = TRUCK_TYPE_COLORS[truck.truck_type] || TRUCK_TYPE_COLORS.other

  return (
    <Link to={`/trucks/${truck.id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 to-orange-100 h-40 flex items-center justify-center relative">
          <Truck className="w-20 h-20 text-brand-400 group-hover:scale-105 transition-transform" />
          <div className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full ${typeColor}`}>
            {t(`truckTypes.${truck.truck_type}`)}
          </div>
          {!truck.is_available && (
            <div className="absolute top-3 left-3 bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
              {t('trucks.unavailable')}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-gray-900 text-lg leading-tight">
            {truck.year} {truck.make} {truck.model}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{truck.license_plate}</p>

          <div className="mt-3 flex items-center gap-1">
            <StarRating rating={truck.avg_rating} size="sm" showCount count={truck.review_count} />
          </div>

          <div className="mt-3 space-y-1.5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span>{truck.capacity_tons} {t('trucks.tonsCapacity')}</span>
            </div>
            {truck.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{truck.location}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-brand-700 font-bold text-lg">
              <DollarSign className="w-4 h-4" />
              <span>{truck.price_per_day}</span>
              <span className="text-gray-400 text-sm font-normal">{t('trucks.perDay')}</span>
            </div>
            <span className="text-xs text-gray-500">{t('trucks.by')} {truck.owner_name}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
