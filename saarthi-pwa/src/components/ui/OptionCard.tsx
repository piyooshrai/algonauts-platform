import type { ReactNode } from 'react'

interface OptionCardProps {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
}

export function OptionCard({
  children,
  selected = false,
  onClick,
  className = ''
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full px-5 py-4 rounded-card text-left
        transition-all duration-200 tap-highlight
        ${selected
          ? 'bg-primary text-white shadow-lg shadow-primary/30'
          : 'bg-secondary text-gray-800 hover:bg-secondary-dark'
        }
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface TimeOptionCardProps {
  minutes: number
  label: string
  description: string
  selected?: boolean
  onClick?: () => void
}

export function TimeOptionCard({
  minutes,
  label,
  description,
  selected = false,
  onClick,
}: TimeOptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 p-4 rounded-card text-center
        transition-all duration-200 tap-highlight
        ${selected
          ? 'bg-primary text-white shadow-lg shadow-primary/30'
          : 'bg-secondary text-gray-800 hover:bg-secondary-dark'
        }
      `}
    >
      <div className={`text-3xl font-bold ${selected ? 'text-white' : 'text-primary'}`}>
        {minutes}
      </div>
      <div className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-800'}`}>
        {label}
      </div>
      <div className={`text-xs mt-1 ${selected ? 'text-white/80' : 'text-gray-600'}`}>
        {description}
      </div>
    </button>
  )
}
