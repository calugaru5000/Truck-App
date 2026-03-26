import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import TruckCard from '../components/TruckCard'
import { useLang } from '../context/LangContext'

const TRUCK_TYPE_KEYS = ['flatbed', 'tanker', 'refrigerated', 'box', 'dump', 'tow', 'other']

export default function TruckList() {
  const { t } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    location: '',
    min_price: '',
    max_price: '',
    available: 'true',
  })

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks(overrides = {}) {
    setLoading(true)
    try {
      const params = { ...filters, ...overrides }
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, v) })
      const res = await axios.get(`/api/trucks?${query}`)
      setTrucks(res.data)
    } catch {
      setTrucks([])
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchTrucks()
  }

  function clearFilters() {
    const cleared = { type: '', location: '', min_price: '', max_price: '', available: 'true' }
    setFilters(cleared)
    fetchTrucks(cleared)
  }

  const hasActiveFilters = filters.type || filters.location || filters.min_price || filters.max_price

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('trucks.title')}</h1>
        <p className="text-gray-500 mt-1">{t('trucks.subtitle')}</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder={t('trucks.searchPlaceholder')}
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
          <select
            className="input-field sm:w-44"
            value={filters.type}
            onChange={e => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">{t('trucks.allTypes')}</option>
            {TRUCK_TYPE_KEYS.map(key => (
              <option key={key} value={key}>{t(`truckTypes.${key}`)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-brand-50 border-brand-300' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('trucks.filters')}
          </button>
          <button type="submit" className="btn-primary px-6">{t('trucks.search')}</button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('trucks.minPrice')}</label>
              <input
                type="number"
                className="input-field"
                placeholder="0"
                value={filters.min_price}
                onChange={e => setFilters({ ...filters, min_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('trucks.maxPrice')}</label>
              <input
                type="number"
                className="input-field"
                placeholder="9999"
                value={filters.max_price}
                onChange={e => setFilters({ ...filters, max_price: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('trucks.availability')}</label>
              <select
                className="input-field"
                value={filters.available}
                onChange={e => setFilters({ ...filters, available: e.target.value })}
              >
                <option value="">{t('trucks.allAvailability')}</option>
                <option value="true">{t('trucks.availableOnly')}</option>
                <option value="false">{t('trucks.unavailableOnly')}</option>
              </select>
            </div>
          </div>
        )}
      </form>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-sm text-gray-500">{t('trucks.activeFilters')}</span>
          {filters.type && <FilterTag label={`${t('trucks.typeFilter')} ${t(`truckTypes.${filters.type}`)}`} onRemove={() => setFilters({ ...filters, type: '' })} />}
          {filters.location && <FilterTag label={`${t('trucks.locationFilter')} ${filters.location}`} onRemove={() => setFilters({ ...filters, location: '' })} />}
          {filters.min_price && <FilterTag label={`${t('trucks.minFilter')}${filters.min_price}`} onRemove={() => setFilters({ ...filters, min_price: '' })} />}
          {filters.max_price && <FilterTag label={`${t('trucks.maxFilter')}${filters.max_price}`} onRemove={() => setFilters({ ...filters, max_price: '' })} />}
          <button onClick={clearFilters} className="text-sm text-red-500 hover:underline ml-1">{t('trucks.clearAll')}</button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm h-64 animate-pulse">
              <div className="bg-gray-100 h-40 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : trucks.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{t('trucks.noTrucksFound')}</p>
          <p className="text-sm mt-1">{t('trucks.noTrucksSub')}</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{trucks.length} {trucks.length !== 1 ? t('trucks.trucksFound') : t('trucks.truckFound')} {t('trucks.found')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trucks.map(truck => <TruckCard key={truck.id} truck={truck} />)}
          </div>
        </>
      )}
    </div>
  )
}

function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full border border-brand-200">
      {label}
      <button onClick={onRemove} className="hover:text-brand-900">
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}
