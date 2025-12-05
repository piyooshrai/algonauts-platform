import type { ReactNode } from 'react'

interface GradientBackgroundProps {
  children: ReactNode
  className?: string
}

export function GradientBackground({ children, className = '' }: GradientBackgroundProps) {
  return (
    <div
      className={`min-h-screen min-h-[100dvh] bg-gradient-saarthi flex flex-col ${className}`}
    >
      {children}
    </div>
  )
}
