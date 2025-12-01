"use client"

import { Star } from "lucide-react"
import { useState, useEffect } from "react"

interface StarRatingProps {
  onRate?: (rating: number) => void
  defaultValue?: number
  readOnly?: boolean
  size?: number
}

export function StarRating({ onRate, defaultValue = 0, readOnly = false, size = 24 }: StarRatingProps) {
  const [rating, setRating] = useState(defaultValue)
  const [hoverRating, setHoverRating] = useState(0)

  useEffect(() => {
    setRating(defaultValue)
  }, [defaultValue])

  const handleClick = (value: number) => {
    if (!readOnly) {
      setRating(value)
      onRate?.(value)
    }
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => handleClick(value)}
          onMouseEnter={() => !readOnly && setHoverRating(value)}
          onMouseLeave={() => setHoverRating(0)}
          disabled={readOnly}
          className="focus:outline-none transition-transform hover:scale-110 disabled:cursor-default disabled:hover:scale-100"
        >
          <Star
            size={size}
            className={`transition-colors ${
              value <= (hoverRating || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
