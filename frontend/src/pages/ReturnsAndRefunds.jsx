import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Clock, CreditCard, ShieldCheck } from 'lucide-react'

const returnSteps = [
  { name: 'Step 1: Initiate', time: 'Online Request', desc: 'Log in to your account, go to "Order History", select the order and click "Return Items" to start.' },
  { name: 'Step 2: Label & Pack', time: 'Prepaid Label', desc: 'Print the prepaid return shipping label. Package the item(s) securely and attach the label.' },
  { name: 'Step 3: Drop Off', time: 'Authorized Hub', desc: 'Drop off the package at any authorized shipping location.' }
]

const refundInfo = [
  {
    title: 'Return Policy',
    icon: ShieldCheck,
    desc: 'We accept returns within 30 days of purchase for most items. Products must be in original condition with all packaging and tags intact.',
    extra: [
      'Personalized or custom-made products',
      'Digital downloads',
      'Gift cards',
      'Personal care items that have been opened'
    ]
  },
  {
    title: 'Processing Time',
    icon: Clock,
    desc: 'Return processing typically takes 3-5 business days from the time we receive your item. Refunds are usually processed within 7-10 business days, depending on your payment method.'
  },
  {
    title: 'Refund Methods',
    icon: CreditCard,
    desc: 'Refunds will be issued to the original payment method used for the purchase. For credit card payments, it may take an additional 3-5 business days for the refund to appear on your statement. You may also choose to receive store credit, which will be issued immediately upon approval of your return.'
  }
]

const returnsFaqs = [
  {
    q: 'What if I received a defective item?',
    a: 'If you receive a defective item, please contact our customer service team within 48 hours of delivery. We\'ll arrange for a replacement or refund at no additional cost to you.'
  },
  {
    q: 'Do I have to pay for return shipping?',
    a: 'Return shipping is free for defective items or if we sent the wrong product. For other returns, a flat fee of $5.99 will be deducted from your refund to cover return shipping costs.'
  },
  {
    q: 'Can I exchange an item instead of returning it?',
    a: 'Yes, you can request an exchange for a different size, color, or similar item of equal value. Simply select "Exchange" instead of "Return" when initiating the process in your account.'
  },
  {
    q: 'What if my return is outside the 30-day window?',
    a: 'Returns after 30 days are evaluated on a case-by-case basis. Please contact our customer service team to discuss your situation.'
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

export default function ReturnsAndRefunds() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-artisan-grey/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Animated Scope Grid */}
        <svg className="absolute -top-12 -right-12 md:right-10 w-96 h-96 text-artisan-grey/5" viewBox="0 0 200 200" fill="none">
          <defs>
            <pattern id="returns-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#returns-grid)" />
          <motion.circle
            cx="100"
            cy="100"
            r="80"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="4 8"
            animate={{ rotate: 360 }}
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
                  RETURNS &
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  REFUNDS.
                </motion.span>
              </span>
            </h1>
            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed max-w-2xl border-t border-artisan-light/10 pt-6">
              Learn about our return guidelines, refund processing timeframes, methods, and step-by-step return instructions.
            </p>
          </div>
        </header>

        {/* SECTION 1: RETURN INSTRUCTIONS */}
        <div className="mb-20 space-y-6">
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Return Instructions</span>
            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed max-w-2xl">
              To initiate a return, follow these simple steps:
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {returnSteps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="border border-artisan-light/10 p-6 relative overflow-hidden bg-artisan-light/[0.01] hover:border-artisan-grey/40 hover:bg-artisan-light/[0.02] transition-colors duration-300 flex flex-col justify-between group cursor-default"
              >
                <div className="flex justify-between items-center mb-6">
                  <span className="w-8 h-8 border border-artisan-light/15 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-colors duration-300 shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </span>
                  <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest block font-bold">
                    [ ACTION // 0{idx + 1} ]
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="text-base font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors duration-300">{step.name}</h3>
                    <span className="text-[9px] font-mono text-artisan-grey font-bold uppercase tracking-widest">{step.time}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-body text-artisan-light/60 normal-case leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* SECTION 2: REFUND INFO */}
        <div className="mb-24 space-y-16 max-w-3xl">
          {refundInfo.map((info, idx) => {
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
                {info.extra && (
                  <ul className="mt-4 space-y-2 list-disc list-inside text-xs sm:text-sm text-artisan-light/60 font-body pl-2">
                    {info.extra.map((item, extraIdx) => (
                      <li key={extraIdx} className="normal-case">{item}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* SECTION 3: FAQ ACCORDIONS */}
        <div className="max-w-3xl mx-auto space-y-6 pt-8 border-t border-artisan-light/5">
          <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Returns FAQ</span>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {returnsFaqs.map((faq, idx) => (
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
