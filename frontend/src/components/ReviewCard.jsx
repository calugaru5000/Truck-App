import { User } from 'lucide-react'
import StarRating from './StarRating'

export default function ReviewCard({ review }) {
  const date = new Date(review.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  })

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.customer_name}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>
      {review.comment && (
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      )}
    </div>
  )
}
