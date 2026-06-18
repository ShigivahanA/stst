import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import api from '../../services/api'

// Normalise both the new flat model (userName, userRole, userLocation)
// and the old legacy nested-user shape so either works seamlessly
function normaliseReview(r) {
  return {
    _id: r._id,
    text: r.text || r.comment || '',
    name: r.userName || r.user?.name || 'Anonymous',
    role: r.userRole || r.user?.role || 'Verified Customer',
    location: r.userLocation || r.user?.onboardingData?.location || 'Tamil Nadu',
  }
}

const FALLBACK_REVIEWS = [
  {
    _id: '1',
    text: "STAT Surgical Supplies has been our trusted partner for rehabilitation equipment. Their wholesale pricing and product quality are unmatched. Highly recommended for any medical professional!",
    user: { name: 'Dr. Priya Sharma', role: 'Orthopedic Surgeon', onboardingData: { location: 'Chennai' } }
  },
  {
    _id: '2',
    text: "We have been sourcing respiratory care products from STAT for over 2 years. Their delivery is always on time, and the customer service team is extremely responsive and helpful.",
    user: { name: 'Rajesh Kumar', role: 'Hospital Procurement Manager', onboardingData: { location: 'Chennai' } }
  },
  {
    _id: '3',
    text: "Excellent range of diagnostic tools at competitive prices. STAT Surgical Supplies has everything a modern clinic needs. The team goes above and beyond to fulfill our requirements.",
    user: { name: 'Dr. Anitha Balan', role: 'Clinic Director', onboardingData: { location: 'Pammal' } }
  }
]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [current, setCurrent] = useState(0)
  const [reviews, setReviews] = useState(FALLBACK_REVIEWS.map(normaliseReview))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const res = await api.get('/content/reviews')
        if (res.data.data?.length > 0) {
          setReviews(res.data.data.map(normaliseReview))
        }
      } catch (err) {
        console.error('Failed to fetch landing reviews', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const next = () => setCurrent((prev) => (prev + 1) % reviews.length)
  const prev = () => setCurrent((prev) => (prev - 1 + reviews.length) % reviews.length)


  if (loading) {
    return (
      <div className="bg-artisan-dark py-24 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <section id="testimonials" className="bg-artisan-dark bg-noise border-b-2 border-artisan-light min-h-screen flex flex-col">
        <div className="container-custom py-12 lg:py-16 flex flex-col flex-1 justify-center items-center text-center w-full">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase text-artisan-light/20">
            Yet to review.
          </h2>
          <p className="text-[10px] font-mono text-artisan-grey uppercase tracking-widest mt-4">Be the first to leave a legacy.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="testimonials" className="bg-artisan-dark bg-noise border-b-2 border-artisan-light min-h-screen flex flex-col">
      <div className="container-custom py-12 lg:py-16 flex flex-col flex-1 justify-between w-full">

        {/* Header */}
        <div className="mb-6 lg:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="flex items-center gap-4 mb-2"
            >
              <div className="w-8 h-1 bg-artisan-grey" />
              <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Customer Feedback</span>
            </motion.div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
              What Our <br />
              <span className="text-outline">Customers Say.</span>
            </h2>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-artisan-grey/60">
              Trusted by hospitals, clinics, and medical professionals across Tamil Nadu
            </p>
          </div>

          {/* Index Counter */}
          <div className="text-artisan-light font-display font-extrabold text-3xl lg:text-4xl opacity-10">
            0{current + 1} <span className="text-xl lg:text-2xl">/ 0{reviews.length}</span>
          </div>
        </div>

        {/* Single Testimonial Display */}
        <div ref={ref} className="relative border-2 border-artisan-light p-6 lg:p-12 flex-1 flex flex-col justify-center overflow-hidden rounded-xl">

          {/* Background Decorative Quote */}
          <div className="absolute -top-12 -left-6 text-[10rem] md:text-[15rem] font-display font-extrabold text-artisan-light/[0.03] pointer-events-none select-none">
            "
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="relative z-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
                {/* Quote Text */}
                <div className="lg:col-span-9">
                  <p className="text-xl md:text-2xl lg:text-4xl font-display font-extrabold text-artisan-light leading-tight">
                    "{reviews[current].text}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="lg:col-span-3 lg:border-l-2 border-artisan-light/10 lg:pl-8 pt-4 lg:pt-0">
                  <div className="text-lg md:text-xl font-display font-extrabold text-artisan-grey uppercase mb-1">
                    {reviews[current].name}
                  </div>
                  <div className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.3em] leading-relaxed">
                    {reviews[current].role} <br />
                    {reviews[current].location}
                  </div>

                  {/* Small Inverted Quote Icon */}
                  <div className="mt-6 w-10 h-10 bg-artisan-grey flex items-center justify-center">
                    <Quote className="w-5 h-5 text-artisan-dark" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls Integrated into Border */}
          {reviews.length > 1 && (
            <div className="absolute bottom-0 right-0 flex border-t-2 border-l-2 border-artisan-light rounded-xl">
              <motion.button
                onClick={prev}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center border-r-2 border-artisan-light hover:bg-artisan-grey hover:text-artisan-dark transition-colors duration-300 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                onClick={next}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center hover:bg-artisan-grey hover:text-artisan-dark transition-colors duration-300"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 flex justify-between items-center px-4 opacity-40">
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-artisan-light">Verified Customer Testimony</span>
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <div key={i} className={`h-1 transition-all duration-500 ${i === current ? 'w-12 bg-artisan-grey' : 'w-4 bg-artisan-light/20'}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
