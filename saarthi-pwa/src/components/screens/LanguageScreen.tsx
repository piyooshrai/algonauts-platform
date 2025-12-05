import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { OptionCard } from '../ui/OptionCard'
import { useOnboarding } from '../../context/OnboardingContext'
import type { Language } from '../../context/OnboardingContext'

const languages: { id: Language; name: string; nativeName: string }[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { id: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { id: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { id: 'mr', name: 'Marathi', nativeName: 'मराठी' },
]

export function LanguageScreen() {
  const navigate = useNavigate()
  const { language, setLanguage } = useOnboarding()

  const handleContinue = () => {
    if (language) {
      navigate('/goal')
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
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
            Choose your
            <br />
            language
          </h1>
          <p className="text-white/80 text-base mt-2">
            You can change this anytime in settings.
          </p>
        </div>

        {/* Language options */}
        <div className="flex-1 space-y-3 animate-slide-up">
          {languages.map((lang) => (
            <OptionCard
              key={lang.id}
              selected={language === lang.id}
              onClick={() => setLanguage(lang.id)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{lang.name}</span>
                <span className="text-sm opacity-80">{lang.nativeName}</span>
              </div>
            </OptionCard>
          ))}
        </div>

        {/* Continue button */}
        <div className="mt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
            disabled={!language}
          >
            Continue
          </Button>
        </div>
      </div>
    </GradientBackground>
  )
}
