import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type UserType = 'learner' | 'recruiter' | null
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | null
export type Goal = 'first-job' | 'switch-role' | 'learn-skills' | null
export type TimeCommitment = 5 | 15 | 30 | null
export type CareerPath =
  | 'software-development'
  | 'cloud-engineering'
  | 'data-analytics'
  | 'ai-ml'
  | 'ui-ux-design'
  | 'healthcare-support'
  | 'customer-service'
  | 'digital-marketing'
  | null

interface OnboardingState {
  userType: UserType
  language: Language
  goal: Goal
  timeCommitment: TimeCommitment
  careerPath: CareerPath
  name: string
  email: string
  phone: string
  currentStep: number
  isOnboardingComplete: boolean
}

interface OnboardingContextType extends OnboardingState {
  setUserType: (type: UserType) => void
  setLanguage: (lang: Language) => void
  setGoal: (goal: Goal) => void
  setTimeCommitment: (time: TimeCommitment) => void
  setCareerPath: (path: CareerPath) => void
  setName: (name: string) => void
  setEmail: (email: string) => void
  setPhone: (phone: string) => void
  setCurrentStep: (step: number) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
}

const initialState: OnboardingState = {
  userType: null,
  language: null,
  goal: null,
  timeCommitment: null,
  careerPath: null,
  name: '',
  email: '',
  phone: '',
  currentStep: 0,
  isOnboardingComplete: false,
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem('saarthi-onboarding')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return initialState
      }
    }
    return initialState
  })

  const saveState = (newState: OnboardingState) => {
    localStorage.setItem('saarthi-onboarding', JSON.stringify(newState))
    setState(newState)
  }

  const setUserType = (userType: UserType) => {
    saveState({ ...state, userType })
  }

  const setLanguage = (language: Language) => {
    saveState({ ...state, language })
  }

  const setGoal = (goal: Goal) => {
    saveState({ ...state, goal })
  }

  const setTimeCommitment = (timeCommitment: TimeCommitment) => {
    saveState({ ...state, timeCommitment })
  }

  const setCareerPath = (careerPath: CareerPath) => {
    saveState({ ...state, careerPath })
  }

  const setName = (name: string) => {
    saveState({ ...state, name })
  }

  const setEmail = (email: string) => {
    saveState({ ...state, email })
  }

  const setPhone = (phone: string) => {
    saveState({ ...state, phone })
  }

  const setCurrentStep = (currentStep: number) => {
    saveState({ ...state, currentStep })
  }

  const completeOnboarding = () => {
    saveState({ ...state, isOnboardingComplete: true })
  }

  const resetOnboarding = () => {
    localStorage.removeItem('saarthi-onboarding')
    setState(initialState)
  }

  return (
    <OnboardingContext.Provider
      value={{
        ...state,
        setUserType,
        setLanguage,
        setGoal,
        setTimeCommitment,
        setCareerPath,
        setName,
        setEmail,
        setPhone,
        setCurrentStep,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
