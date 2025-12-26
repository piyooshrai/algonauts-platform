import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { MascotPlaceholder } from '../ui/Mascot'
import { useOnboarding } from '../../context/OnboardingContext'

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { setUserType } = useOnboarding()

  const handleLearner = () => {
    setUserType('learner')
    navigate('/language')
  }

  const handleRecruiter = () => {
    setUserType('recruiter')
    navigate('/recruiter-dashboard')
  }

  return (
    <GradientBackground className="safe-area-inset">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Title */}
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            Transform
            <br />
            Your Career
          </h1>
          <p className="text-white/90 text-xl mt-3">
            One habit at a time.
          </p>
        </div>

        {/* Mascot */}
        <div className="flex-1 flex items-center justify-center min-h-[200px] animate-bounce-in">
          <MascotPlaceholder variant="welcome" size="xl" />
        </div>

        {/* Buttons */}
        <div className="w-full max-w-sm space-y-4 animate-slide-up">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLearner}
          >
            I'm a Learner
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleRecruiter}
            className="!text-amber-600"
          >
            I'm a Recruiter
          </Button>
        </div>
      </div>
    </GradientBackground>
  )
}
