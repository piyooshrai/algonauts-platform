import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GradientBackground } from '../ui/GradientBackground'
import { Button } from '../ui/Button'
import { useOnboarding } from '../../context/OnboardingContext'

export function SignupScreen() {
  const navigate = useNavigate()
  const { name, email, phone, setName, setEmail, setPhone, completeOnboarding } = useOnboarding()
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      completeOnboarding()
      navigate('/dashboard')
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
            Create your
            <br />
            account
          </h1>
          <p className="text-white/80 text-base mt-2">
            Let's get you started on your learning journey.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4 animate-slide-up">
          {/* Name input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className={`
                w-full px-4 py-3 rounded-card bg-white/90 text-gray-800
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                ${errors.name ? 'ring-2 ring-red-500' : ''}
              `}
            />
            {errors.name && (
              <p className="text-red-200 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`
                w-full px-4 py-3 rounded-card bg-white/90 text-gray-800
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                ${errors.email ? 'ring-2 ring-red-500' : ''}
              `}
            />
            {errors.email && (
              <p className="text-red-200 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone input */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className={`
                w-full px-4 py-3 rounded-card bg-white/90 text-gray-800
                placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary
                ${errors.phone ? 'ring-2 ring-red-500' : ''}
              `}
            />
            {errors.phone && (
              <p className="text-red-200 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Terms */}
        <p className="text-white/60 text-xs text-center mt-6">
          By signing up, you agree to our{' '}
          <span className="text-white underline">Terms of Service</span> and{' '}
          <span className="text-white underline">Privacy Policy</span>
        </p>

        {/* Submit button */}
        <div className="mt-auto pt-6">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleSubmit}
          >
            Create Account
          </Button>
        </div>
      </div>
    </GradientBackground>
  )
}
