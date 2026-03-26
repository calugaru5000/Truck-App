import { Link } from 'react-router-dom'
import { Truck, Shield, Star, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'

const TRUCK_TYPE_KEYS = ['flatbed', 'tanker', 'refrigerated', 'box', 'dump', 'tow']

export default function Home() {
  const { user } = useAuth()
  const { t } = useLang()

  const FEATURES = [
    { icon: Truck, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Shield, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Star, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: Clock, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ]

  const CTA_ITEMS = [
    t('home.freeToList'),
    t('home.setYourPrice'),
    t('home.manageBookings'),
    t('home.getReviews'),
  ]

  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-orange-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Truck className="w-4 h-4" />
              {t('home.badge')}
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
              {t('home.hero')}
            </h1>
            <p className="text-xl text-orange-100 mb-8 leading-relaxed">
              {t('home.heroSub')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/trucks" className="bg-white text-brand-700 hover:bg-orange-50 font-bold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 text-lg">
                {t('home.browseTrucks')} <ArrowRight className="w-5 h-5" />
              </Link>
              {!user && (
                <Link to="/register" className="border-2 border-white/50 hover:border-white text-white font-bold px-8 py-3 rounded-xl transition-colors text-lg">
                  {t('home.listYourTruck')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('home.whyTitle')}</h2>
          <p className="text-gray-500 mt-2">{t('home.whySub')}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.browseByType')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {TRUCK_TYPE_KEYS.map(typeKey => (
              <Link
                key={typeKey}
                to={`/trucks?type=${typeKey}`}
                className="bg-white border border-gray-200 hover:border-brand-400 hover:shadow-md rounded-xl p-4 text-center transition-all group"
              >
                <Truck className="w-8 h-8 text-brand-400 group-hover:text-brand-600 mx-auto mb-2 transition-colors" />
                <span className="text-sm font-semibold text-gray-700 group-hover:text-brand-700">
                  {t(`truckTypes.${typeKey}`)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('home.ownerCta')}</h2>
          <p className="text-orange-100 text-lg mb-8">{t('home.ownerCtaSub')}</p>
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm">
            {CTA_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          {!user && (
            <Link to="/register" className="bg-white text-brand-700 hover:bg-orange-50 font-bold px-8 py-3 rounded-xl transition-colors inline-flex items-center gap-2 text-lg">
              {t('home.registerAsOwner')} <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
