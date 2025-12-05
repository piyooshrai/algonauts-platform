import { useState, useEffect } from 'react'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { MascotPlaceholder } from '../ui/Mascot'
import { useOnboarding } from '../../context/OnboardingContext'

// Confetti component
function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; color: string; left: number; delay: number }[]>([])

  useEffect(() => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setPieces(newPieces)

    // Clear confetti after animation
    const timer = setTimeout(() => setPieces([]), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 confetti-piece"
          style={{
            backgroundColor: piece.color,
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  )
}

export function DashboardScreen() {
  const { name, careerPath, resetOnboarding } = useOnboarding()
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const getCareerPathLabel = () => {
    const labels: Record<string, string> = {
      'software-development': 'Software Development',
      'cloud-engineering': 'Cloud Engineering',
      'data-analytics': 'Data Analytics',
      'ai-ml': 'AI & Machine Learning',
      'ui-ux-design': 'UI/UX Design',
      'healthcare-support': 'Healthcare Support',
      'customer-service': 'Customer Service',
      'digital-marketing': 'Digital Marketing',
    }
    return careerPath ? labels[careerPath] : 'Your Path'
  }

  return (
    <GradientBackground className="safe-area-inset">
      {showConfetti && <Confetti />}

      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-white/80 text-sm">Welcome back,</p>
            <h2 className="text-white text-xl font-bold">{name || 'Learner'}</h2>
          </div>
          <button
            onClick={resetOnboarding}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>

        {/* Day indicator */}
        <div className="text-center mb-2 animate-fade-in">
          <span className="text-white/80 text-sm">Day 1 • Lesson 1</span>
        </div>

        {/* Lesson title */}
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Introductions
          </h1>
          <p className="text-white/80 text-base mt-3 max-w-xs mx-auto">
            Master the art of introducing yourself with confidence.
          </p>
        </div>

        {/* Mascot with coin */}
        <div className="flex-1 flex items-center justify-center relative animate-bounce-in">
          <MascotPlaceholder variant="celebration" size="xl" />

          {/* Floating path indicator */}
          <div className="absolute bottom-0 right-1/4">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-white text-xs font-medium">{getCareerPathLabel()}</span>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="w-8 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
          <div className="w-2 h-2 rounded-full bg-white/40" />
        </div>

        {/* Start button */}
        <div className="animate-slide-up">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            className="!bg-secondary !text-gray-800 flex items-center justify-center gap-2"
          >
            Start Challenge
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Button>
        </div>

        {/* Bottom nav placeholder */}
        <div className="mt-6 flex justify-around items-center pt-4 border-t border-white/10">
          <button className="flex flex-col items-center gap-1 text-white">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs">Learn</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs">Progress</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>
    </GradientBackground>
  )
}
