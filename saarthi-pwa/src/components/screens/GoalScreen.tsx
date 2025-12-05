import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { OptionCard } from '../ui/OptionCard'
import { MascotPlaceholder } from '../ui/Mascot'
import { useOnboarding } from '../../context/OnboardingContext'
import type { Goal } from '../../context/OnboardingContext'

const goals: { id: Goal; label: string }[] = [
  { id: 'first-job', label: 'Get my first job' },
  { id: 'switch-role', label: 'Switch to a better role' },
  { id: 'learn-skills', label: 'Learn new skills for current job' },
]

export function GoalScreen() {
  const navigate = useNavigate()
  const { goal, setGoal } = useOnboarding()

  const handleContinue = () => {
    if (goal) {
      navigate('/time')
    }
  }

  return (
    <GradientBackground className="safe-area-inset">
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="self-start text-white/80 hover:text-white mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Title */}
        <div className="text-center mb-4 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            What's your goal?
          </h1>
          <p className="text-white/80 text-base mt-2">
            You can change this anytime.
          </p>
        </div>

        {/* Mascot */}
        <div className="flex justify-center my-6 animate-bounce-in">
          <MascotPlaceholder variant="glasses" size="lg" />
        </div>

        {/* Goal options */}
        <div className="space-y-3 animate-slide-up">
          {goals.map((g) => (
            <OptionCard
              key={g.id}
              selected={goal === g.id}
              onClick={() => setGoal(g.id)}
            >
              <span className="font-medium">{g.label}</span>
            </OptionCard>
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-auto pt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            disabled={!goal}
          >
            Continue
          </Button>
        </div>
      </div>
    </GradientBackground>
  )
}
