import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, Clock, Globe, ShieldCheck } from 'lucide-react'

const shippingMethods = [
  { name: 'Standard Shipping', time: '3-5 business days', desc: 'Affordable delivery for standard orders across regional routes.' },
  { name: 'Express Shipping', time: '1-2 business days', desc: 'Fast-tracked air dispatch for time-sensitive tools and orders.' },
  { name: 'Same-Day Delivery', time: 'select areas only', desc: 'Immediate dispatch for urgent local needs within eligible zones.' }
]

const shippingInfo = [
  {
    title: 'Processing Time',
    icon: Clock,
    desc: 'Orders are typically processed within 24 hours of being placed. During peak seasons or promotional periods, processing may take up to 48 hours.'
  },
  {
    title: 'International Shipping',
    icon: Globe,
    desc: 'We ship to over 100 countries worldwide. International shipping typically takes 7-14 business days, depending on the destination and customs processing.'
  },
  {
    title: 'Shipping Costs',
    icon: ShieldCheck,
    desc: 'Shipping costs are calculated based on weight, dimensions, and destination. Free shipping is available for orders over $50 within the continental US.'
  }
]

const shippingFaqs = [
  {
    q: 'How can I track my order?',
    a: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order in your account dashboard under "Order History."'
  },
  {
    q: 'What if my package is lost or damaged?',
    a: 'If your package is lost or damaged during transit, please contact our customer service team immediately so we can assist you with a replacement or refund.'
  },
  {
    q: 'Do you ship to P.O. boxes?',
    a: 'Yes, standard shipping supports deliveries to P.O. boxes. Express and same-day dispatches require a physical, verified shipping or residential address.'
  },
  {
    q: 'Can I change my shipping address after placing an order?',
    a: 'Address modifications are supported as long as the order has not yet been processed. Please contact our support team immediately to request an address update.'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
  }
}

function AccordionItem({ question, answer, isOpen, onToggle }) {
  return (
    <motion.div
      layout
      variants={itemVariants}
      className={`border border-artisan-light/10 p-6 transition-colors duration-300 bg-artisan-light/[0.01] hover:border-artisan-grey/40 hover:bg-artisan-light/[0.02] ${isOpen ? 'border-artisan-grey bg-artisan-light/[0.03]' : ''
        }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center text-left text-artisan-light hover:text-artisan-grey transition-colors group"
      >
        <span className="font-display font-extrabold uppercase text-sm sm:text-base tracking-tight leading-snug">
          {question}
        </span>
        <span className="ml-4 shrink-0 w-8 h-8 rounded-full bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-light/60 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-500 relative overflow-hidden">
          <span className="absolute w-3 h-[2px] bg-current" />
          <motion.span
            className="absolute w-[2px] h-3 bg-current"
            animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
            className="overflow-hidden"
          >
            <p className="text-xs sm:text-sm font-body text-artisan-light/60 normal-case leading-relaxed pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Shipping() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-artisan-grey/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Animated Scope Grid */}
        <svg className="absolute -top-12 -right-12 md:right-10 w-96 h-96 text-artisan-grey/5" viewBox="0 0 200 200" fill="none">
          <defs>
            <pattern id="shipping-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#shipping-grid)" />
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          />
        </svg>
      </div>

      <div className="container-custom relative z-10">

        {/* HERO SECTION */}
        <header className="mb-16 md:mb-24">
          <div className="max-w-4xl space-y-6">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-artisan-light">
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  SHIPPING
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  POLICIES.
                </motion.span>
              </span>
            </h1>
            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed max-w-2xl border-t border-artisan-light/10 pt-6">
              Learn about our shipping coordinates, packaging protocols, processing schedules, and cargo protection guidelines.
            </p>
          </div>
        </header>

        {/* SECTION 1: SHIPPING METHODS */}
        <div className="mb-20 space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Shipping Methods</span>
            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed max-w-2xl">
              We offer various shipping methods to meet your needs:
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {shippingMethods.map((method, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="border border-artisan-light/10 p-6 relative overflow-hidden bg-artisan-light/[0.01] hover:border-artisan-grey/40 hover:bg-artisan-light/[0.02] transition-colors duration-300 flex flex-col justify-between group cursor-default"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="w-8 h-8 border border-artisan-light/15 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-colors duration-300 shrink-0">
                    <Truck className="w-4 h-4" />
                  </span>
                  <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest block font-bold">
                    [ METHOD // 0{idx + 1} ]
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-base font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors duration-300">{method.name}</h3>
                    <span className="text-[9px] font-mono text-artisan-grey font-bold uppercase tracking-widest">{method.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-body text-artisan-light/60 normal-case leading-relaxed">{method.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* SECTION 2: SHIPPING INFO */}
        <div className="mb-24 space-y-16 max-w-3xl">
          {shippingInfo.map((info, idx) => {
            const Icon = info.icon
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-4 border-l-2 border-artisan-grey pl-6 py-2 relative"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 border border-artisan-light/15 flex items-center justify-center text-artisan-grey shrink-0">
                    <Icon className="w-4 h-4" />
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-extrabold uppercase text-artisan-light tracking-tight">{info.title}</h3>
                </div>
                <p className="text-sm sm:text-base font-body text-artisan-light/70 normal-case leading-relaxed max-w-2xl">{info.desc}</p>
              </motion.div>
            )
          })}
        </div>

        {/* SECTION 3: FAQ ACCORDIONS */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-artisan-light/5">
          <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Shipping FAQs</span>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {shippingFaqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === idx}
                onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
              />
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  )
}
