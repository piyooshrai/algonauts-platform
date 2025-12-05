import { Routes, Route, Navigate } from 'react-router-dom'
import { SplashScreen } from './components/screens/SplashScreen'
import { WelcomeScreen } from './components/screens/WelcomeScreen'
import { LanguageScreen } from './components/screens/LanguageScreen'
import { GoalScreen } from './components/screens/GoalScreen'
import { TimeScreen } from './components/screens/TimeScreen'
import { CareerScreen } from './components/screens/CareerScreen'
import { SignupScreen } from './components/screens/SignupScreen'
import { DashboardScreen } from './components/screens/DashboardScreen'
import { RecruiterDashboard } from './components/screens/RecruiterDashboard'
import { useOnboarding } from './context/OnboardingContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isOnboardingComplete } = useOnboarding()

  if (!isOnboardingComplete) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/welcome" element={<WelcomeScreen />} />
      <Route path="/language" element={<LanguageScreen />} />
      <Route path="/goal" element={<GoalScreen />} />
      <Route path="/time" element={<TimeScreen />} />
      <Route path="/career" element={<CareerScreen />} />
      <Route path="/signup" element={<SignupScreen />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardScreen />
          </ProtectedRoute>
        }
      />
      <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
