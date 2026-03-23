'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  maxStars?: number
  size?: 'sm' | 'md' | 'lg'
  label?: string
  required?: boolean
}

export default function StarRating({
  value,
  onChange,
  maxStars = 5,
  size = 'md',
  label,
  required = false
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizes = {
    sm: { star: 20, gap: 1 },
    md: { star: 32, gap: 2 },
    lg: { star: 40, gap: 3 }
  }

  const { star: starSize, gap } = sizes[size]

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1
          const isFilled = starValue <= (hoverValue || value)
          
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverValue(starValue)}
              onMouseLeave={() => setHoverValue(0)}
              className="focus:outline-none"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isFilled ? 1 : 0.85,
                }}
                transition={{ duration: 0.15 }}
              >
                <Star
                  size={starSize}
                  className={`transition-colors duration-200 ${
                    isFilled
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                      : 'fill-gray-100 text-gray-300'
                  }`}
                />
              </motion.div>
            </motion.button>
          )
        })}
        {value > 0 && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ml-2 text-sm font-medium text-gray-600"
          >
            {value} / {maxStars}
          </motion.span>
        )}
      </div>
    </div>
  )
}
