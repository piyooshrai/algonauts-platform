import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../context/OnboardingContext'

export function RecruiterDashboard() {
  const navigate = useNavigate()
  const { resetOnboarding } = useOnboarding()

  const handleBackToWelcome = () => {
    resetOnboarding()
    navigate('/welcome')
  }

  return (
    <GradientBackground className="safe-area-inset">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-4">
            Recruiter Portal
          </h1>
          <p className="text-white/80 text-lg mb-8 max-w-sm">
            Coming soon! We're building an amazing experience for recruiters to discover talented candidates.
          </p>

          <div className="space-y-4">
            <div className="bg-white/10 rounded-card p-4 text-left">
              <h3 className="text-white font-semibold mb-2">What to expect:</h3>
              <ul className="text-white/80 text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Browse verified candidate profiles
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Filter by skills and experience
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Connect with potential hires
                </li>
              </ul>
            </div>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleBackToWelcome}
            >
              Back to Welcome
            </Button>
          </div>
        </div>
      </div>
    </GradientBackground>
  )
}
