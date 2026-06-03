import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Hammer, MapPin, Globe, Bell, Heart, Target, Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const steps = [
  {
    id: 'interest',
    title: 'What drives your craft?',
    subtitle: 'Select your primary interests so we can tailor your workbench.',
    options: ['Woodworking', 'Metalworking', 'Digital Fabrication', 'Traditional Arts', 'Electronics', 'Textiles'],
    icon: Heart
  },
  {
    id: 'categories',
    title: 'Tool Preferences',
    subtitle: 'Which categories of equipment do you use most often?',
    options: ['Hand Tools', 'Power Tools', 'Heavy Machinery', 'Precision Gear', 'Vintage/Antique', 'Sustainable'],
    icon: Hammer
  },
  {
    id: 'location',
    title: 'Where do you create?',
    subtitle: 'Your location helps us connect you with nearby artisans.',
    type: 'input',
    placeholder: 'CITY, COUNTRY',
    icon: MapPin
  },
  {
    id: 'intent',
    title: 'Your Intent',
    subtitle: 'How do you plan to use ForgeShare?',
    options: ['Borrowing Tools', 'Listing My Tools', 'Community Projects', 'Learning & Workshops', 'Professional Networking'],
    icon: Target
  },
  {
    id: 'workshop',
    title: 'Workshop Needs',
    subtitle: 'Tell us about your space requirements.',
    options: ['Home Garage', 'Shared Studio', 'Industrial Unit', 'Mobile/Portable', 'No Current Space'],
    icon: Home
  },
  {
    id: 'notifications',
    title: 'Stay Connected',
    subtitle: 'How should we reach you for community updates?',
    options: ['Daily Digest', 'Weekly Highlights', 'Real-time Alerts', 'Important Only', 'None'],
    icon: Bell
  }
]

import ConsentModal from '../components/auth/ConsentModal'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selections, setSelections] = useState({})
  const [isFinishing, setIsFinishing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showConsent, setShowConsent] = useState(false)
  const navigate = useNavigate()
  const { completeOnboarding, user } = useAuth()

  const step = steps[currentStep]

  useEffect(() => {
    if (isFinishing) {
      const finish = async () => {
        try {
          const onboardingData = {
            craftInterests: Array.isArray(selections.interest) ? selections.interest : [selections.interest],
            preferredCategories: Array.isArray(selections.categories) ? selections.categories : [selections.categories],
            location: {
              type: 'Point',
              coordinates: [0, 0],
              address: selections.location
            },
            intent: selections.intent?.toLowerCase().includes('borrow') ? 'renter' : 
                    selections.intent?.toLowerCase().includes('list') ? 'owner' : 'both',
            workshopNeeds: Array.isArray(selections.workshop) ? selections.workshop : [selections.workshop],
            notificationPreferences: {
              email: selections.notifications !== 'None',
              push: selections.notifications !== 'None'
            }
          }
          await completeOnboarding(onboardingData)
        } catch (err) {
          console.error('Onboarding update failed', err)
        }
      }
      finish()

      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer)
            setTimeout(() => setShowConsent(true), 800)
            return 100
          }
          return prev + 1
        })
      }, 30)
      return () => clearInterval(timer)
    }
  }, [isFinishing, selections, completeOnboarding])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      setIsFinishing(true)
    }
  }

  const handleSelect = (option) => {
    setSelections({ ...selections, [step.id]: option })
  }

  return (
    <div className="min-h-screen w-full bg-artisan-dark overflow-hidden relative flex flex-col items-center justify-center p-4 md:p-12 lg:p-24 bg-noise">
      
      <AnimatePresence mode="wait">
        {isFinishing ? (
          <motion.div
            key="finishing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-4xl flex flex-col items-center justify-center text-center space-y-12"
          >
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.6em]">Setting up your shop</span>
              <h2 className="text-7xl md:text-9xl font-display font-extrabold uppercase tracking-tighter text-artisan-light tabular-nums">
                {progress}%
              </h2>
            </div>

            <div className="w-full max-w-md h-1 bg-artisan-light/5 relative overflow-hidden">
               <motion.div 
                 style={{ width: `${progress}%` }}
                 className="absolute inset-0 bg-artisan-grey"
               />
            </div>
            
            <div className="flex items-center gap-12">
               <div className="flex flex-col items-start gap-2">
                  <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Status</span>
                  <span className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-widest">
                    {progress < 30 ? 'Getting to know you' : progress < 70 ? 'Finding your tools' : 'Opening the doors'}
                  </span>
               </div>
               <div className="w-px h-8 bg-artisan-light/10" />
               <div className="flex flex-col items-start gap-2">
                  <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Heading to</span>
                  <span className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-widest">The Marketplace</span>
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="w-full max-w-5xl h-full flex flex-col justify-center py-8 md:py-0"
          >
            {/* Step Header */}
            <div className="mb-6 lg:mb-10 shrink-0">
              <div className="flex items-center gap-4 lg:gap-6 mb-4 lg:mb-6">
                 <div className="w-12 h-12 lg:w-16 lg:h-16 bg-artisan-grey flex items-center justify-center">
                   <step.icon className="w-6 h-6 lg:w-8 lg:h-8 text-artisan-dark" />
                 </div>
                 <div className="h-px flex-1 bg-artisan-light/10" />
                 <span className="text-[10px] lg:text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">0{currentStep + 1} // 0{steps.length}</span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light mb-2 lg:mb-4">
                {step.title}
              </h1>
              <p className="text-sm md:text-lg lg:text-lg text-artisan-light/40 font-display font-bold uppercase tracking-widest max-w-2xl">
                {step.subtitle}
              </p>
            </div>

            {/* Interaction Area (No scrolling on Large Screens) */}
            <div className="w-full overflow-y-auto lg:overflow-visible max-h-[60vh] lg:max-h-none scrollbar-hide shrink pr-2 lg:pr-0">
              {step.type === 'input' ? (
                <div className="group relative border-b-2 lg:border-b-4 border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2 lg:pb-4">
                  <input 
                    type="text" 
                    placeholder={step.placeholder}
                    className="w-full bg-transparent outline-none text-2xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase text-artisan-light placeholder:text-artisan-light/5"
                    autoFocus
                    onChange={(e) => handleSelect(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 pb-4">
                  {step.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      className={`p-4 lg:p-6 border-2 text-left transition-all duration-500 group relative overflow-hidden ${
                        selections[step.id] === option 
                          ? 'border-artisan-grey bg-artisan-grey text-artisan-dark' 
                          : 'border-artisan-light/5 hover:border-artisan-light/20 text-artisan-light'
                      }`}
                    >
                      <span className="text-xs lg:text-sm font-display font-extrabold uppercase tracking-widest relative z-10">{option}</span>
                      {selections[step.id] === option && (
                        <Check className="absolute top-3 right-3 lg:top-4 lg:right-4 w-3 h-3 lg:w-4 lg:h-4 text-artisan-dark" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation Action */}
            <div className="mt-6 lg:mt-12 flex justify-between items-center shrink-0">
              <button 
                onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                className={`text-[9px] lg:text-[10px] font-mono font-bold uppercase tracking-[0.4em] transition-all ${currentStep > 0 ? 'text-artisan-light/40 hover:text-artisan-grey' : 'opacity-0 pointer-events-none'}`}
              >
                Previous
              </button>
              <motion.button
                whileHover={selections[step.id] ? { scale: 1.05 } : {}}
                whileTap={selections[step.id] ? { scale: 0.95 } : {}}
                disabled={!selections[step.id]}
                onClick={handleNext}
                className={`px-8 lg:px-12 py-4 lg:py-6 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.4em] text-[10px] lg:text-xs transition-all duration-500 flex items-center gap-4 lg:gap-6 ${
                  selections[step.id] ? 'opacity-100 hover:bg-artisan-light cursor-pointer' : 'opacity-20 cursor-not-allowed'
                }`}
              >
                {currentStep === steps.length - 1 ? 'Complete' : 'Continue'}
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Progress Indicator (Phantom Scale) - Hidden on Mobile */}
      {!isFinishing && (
        <div className="absolute top-1/2 left-12 -translate-y-1/2 hidden xl:flex flex-col gap-6">
          {steps.map((_, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className={`h-1 transition-all duration-700 ${idx === currentStep ? 'w-12 bg-artisan-grey' : 'w-4 bg-artisan-light/10'}`} />
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest transition-opacity duration-700 ${idx === currentStep ? 'opacity-100 text-artisan-grey' : 'opacity-0'}`}>
                Step_0{idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Decorative Branding */}
      <div className="hidden sm:block absolute bottom-8 lg:bottom-12 right-8 lg:right-12 text-[10px] font-mono text-artisan-light/10 uppercase tracking-[0.5em] select-none">
        ForgeShare // Orientation Session
      </div>

      <AnimatePresence>
        {showConsent && (
          <ConsentModal onComplete={() => navigate('/marketplace')} />
        )}
      </AnimatePresence>
    </div>
  )
}
