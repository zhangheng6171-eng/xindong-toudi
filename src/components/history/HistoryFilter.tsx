'use client'

import { motion } from 'framer-motion'

export type FilterType = 'all' | 'contacted' | 'dated' | 'relationship'

interface HistoryFilterProps {
  activeFilter: FilterType
  onFilterChange: (filter: FilterType) => void
}

const filters: { key: FilterType; label: string; count?: number }[] = [
  { key: 'all', label: '全部' },
  { key: 'contacted', label: '已联系' },
  { key: 'dated', label: '已约会' },
  { key: 'relationship', label: '建立关系' },
]

export default function HistoryFilter({
  activeFilter,
  onFilterChange,
}: HistoryFilterProps) {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key
        
        return (
          <motion.button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`
              relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              transition-colors duration-200
              ${isActive 
                ? 'text-white' 
                : 'text-gray-600 bg-white/60 hover:bg-white/80'
              }
            `}
            style={{
              background: isActive 
                ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)' 
                : undefined,
              boxShadow: isActive 
                ? '0 4px 15px rgba(255, 107, 107, 0.3)' 
                : '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
            whileTap={{ scale: 0.95 }}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                isActive ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {filter.count}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export { filters }
