import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { OptionCard } from '../ui/OptionCard'
import { MascotPlaceholder } from '../ui/Mascot'
import { useOnboarding } from '../../context/OnboardingContext'
import type { CareerPath } from '../../context/OnboardingContext'

const careerPaths: { id: CareerPath; label: string }[] = [
  { id: 'software-development', label: 'Software Development' },
  { id: 'cloud-engineering', label: 'Cloud Engineering' },
  { id: 'data-analytics', label: 'Data Analytics' },
  { id: 'ai-ml', label: 'AI & Machine Learning' },
  { id: 'ui-ux-design', label: 'UI/UX Design' },
  { id: 'healthcare-support', label: 'Healthcare Support' },
  { id: 'customer-service', label: 'Customer Service' },
  { id: 'digital-marketing', label: 'Digital Marketing' },
]

export function CareerScreen() {
  const navigate = useNavigate()
  const { careerPath, setCareerPath } = useOnboarding()

  const handleContinue = () => {
    if (careerPath) {
      navigate('/signup')
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
            What would you
            <br />
            like to become?
          </h1>
          <p className="text-white/80 text-base mt-2">
            Pick one to start—you can change paths anytime.
          </p>
        </div>

        {/* Mascot */}
        <div className="flex justify-center my-4 animate-bounce-in">
          <MascotPlaceholder variant="default" size="md" />
        </div>

        {/* Career options */}
        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          <div className="grid grid-cols-2 gap-3 animate-slide-up">
            {careerPaths.map((path) => (
              <OptionCard
                key={path.id}
                selected={careerPath === path.id}
                onClick={() => setCareerPath(path.id)}
                className="text-center py-4"
              >
                <span className="font-medium text-sm">{path.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        {/* Continue button */}
        <div className="mt-4 pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            disabled={!careerPath}
          >
            Continue
          </Button>
        </div>
      </div>
    </GradientBackground>
  )
}
