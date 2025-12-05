import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'

export function SplashScreen() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/welcome')
    }, 2500)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <GradientBackground className="items-center justify-center">
      <div className="flex flex-col items-center animate-bounce-in">
        {/* Logo / Brand */}
        <div className="w-32 h-32 mb-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <svg viewBox="0 0 100 100" className="w-20 h-20">
            <circle cx="50" cy="50" r="40" fill="#2dd4bf" />
            <circle cx="35" cy="42" r="8" fill="white" />
            <circle cx="65" cy="42" r="8" fill="white" />
            <circle cx="35" cy="42" r="4" fill="#1e293b" />
            <circle cx="65" cy="42" r="4" fill="#1e293b" />
            <path d="M 42 58 L 50 68 L 58 58 Z" fill="#f97316" />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
          Saarthi
        </h1>
        <p className="text-white/80 text-lg">
          Your Career Guide
        </p>

        {/* Loading indicator */}
        <div className="mt-12 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-white/60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </GradientBackground>
  )
}
