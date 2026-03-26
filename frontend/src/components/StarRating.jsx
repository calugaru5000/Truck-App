import { Star } from 'lucide-react'

export default function StarRating({ rating, onRate, size = 'md', showCount, count }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }
  const iconSize = sizes[size] || sizes.md

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onRate && onRate(star)}
          className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          disabled={!onRate}
        >
          <Star
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
      {showCount && (
        <span className="text-sm text-gray-500 ml-1">
          ({count ?? 0})
        </span>
      )}
    </div>
  )
}
