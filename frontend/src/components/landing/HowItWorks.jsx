import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const steps = [
  {
    id: '01',
    title: 'Discover Gear',
    description: 'Browse our curated collection of professional artisan tools available in your area. Precision search for specialized equipment.'
  },
  {
    id: '02',
    title: 'Secure Booking',
    description: 'Confirm your dates and pay securely through our encrypted artisan network. Full insurance on every rental.'
  },
  {
    id: '03',
    title: 'Collect & Create',
    description: 'Pick up your equipment from a verified owner and start building your legacy with professional-grade tools.'
  },
  {
    id: '04',
    title: 'Return & Review',
    description: 'Seamlessly return the tool and share your experience with the community to build collective trust.'
  }
]

export default function HowItWorks() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  // Ruler movement animation
  const rulerX = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])

  return (
    <section 
      ref={containerRef}
      id="how-it-works" 
      className="bg-artisan-dark bg-noise border-b border-artisan-light/10 overflow-hidden"
    >
      <div className="container-custom py-24 lg:py-48">
        
        {/* Header */}
        <div className="mb-24 lg:mb-40 flex flex-col lg:flex-row lg:items-end justify-between gap-12">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              className="flex items-center gap-4 mb-8"
            >
              <div className="w-12 h-1 bg-artisan-grey" />
              <span className="text-sm font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">The Journey</span>
            </motion.div>
            
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
              Simple <br />
              <span className="text-outline">Steps.</span>
            </h2>
          </div>
          <p className="lg:max-w-xs text-artisan-light/40 font-mono text-xs uppercase tracking-[0.2em] leading-loose">
            A straightforward process designed for real makers. Follow the steps from discovery to final creation.
          </p>
        </div>

        {/* The "Ruler" Section */}
        <div className="relative mt-20">
          
          {/* Animated Ruler Marks (Desktop only) */}
          <div className="hidden lg:block absolute -top-12 left-0 w-full overflow-hidden h-24 pointer-events-none">
            <motion.div 
              style={{ x: rulerX }}
              className="flex gap-4 items-end whitespace-nowrap opacity-20"
            >
              {Array.from({ length: 100 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`bg-artisan-light w-[2px] ${i % 10 === 0 ? 'h-12' : i % 5 === 0 ? 'h-8' : 'h-4'}`}
                />
              ))}
            </motion.div>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-artisan-light/10 border border-artisan-light/10">
            {steps.map((step, i) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="bg-artisan-dark p-10 lg:p-16 flex flex-col group relative overflow-hidden h-[450px] lg:h-[600px]"
              >
                {/* Visual Anchor: Large Number Index */}
                <div className="mb-12">
                  <span className="text-xs font-mono font-bold text-artisan-grey tracking-[0.4em] block mb-4">STEP_{step.id}</span>
                  <div className="h-px w-full bg-gradient-to-r from-artisan-grey to-transparent" />
                </div>

                <div className="mt-auto">
                  <div className="text-[6rem] lg:text-[10rem] font-display font-extrabold text-artisan-light/[0.03] leading-none mb-4">
                    {step.id}
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-display font-extrabold uppercase text-artisan-light mb-6 group-hover:text-artisan-grey transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-artisan-light/60 text-base leading-relaxed font-light">
                    {step.description}
                  </p>
                </div>

                {/* Hover Reveal Border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-artisan-grey scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                <div className="absolute top-0 left-0 w-1 h-full bg-artisan-grey scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500 delay-100" />
              </motion.div>
            ))}
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-12 lg:mt-24 flex justify-between items-center px-4">
            <div className="flex gap-4">
               <div className="w-12 h-[2px] bg-artisan-grey" />
               <div className="w-4 h-[2px] bg-artisan-light/20" />
               <div className="w-4 h-[2px] bg-artisan-light/20" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-artisan-grey font-bold">Simple. Secure. Reliable.</span>
            <div className="flex gap-4">
               <div className="w-4 h-[2px] bg-artisan-light/20" />
               <div className="w-4 h-[2px] bg-artisan-light/20" />
               <div className="w-12 h-[2px] bg-artisan-grey" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
