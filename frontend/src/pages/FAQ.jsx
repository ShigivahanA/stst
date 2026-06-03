import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search, Truck, RotateCcw, Package, CreditCard, ArrowRight } from 'lucide-react'

const faqData = [
  {
    category: 'Orders & Shipping',
    icon: Truck,
    questions: [
      {
        q: 'How long does shipping take within India?',
        a: 'Most orders are processed within 24-48 hours. Delivery takes 3-5 business days for major cities and 5-7 business days for regional clinics and hospitals across India.'
      },
      {
        q: 'Do you offer express delivery for urgent surgical supplies?',
        a: 'Yes, express overnight shipping is available for select items to hospitals and clinics across major metros. Please contact support via WhatsApp or call to request express dispatch.'
      },
      {
        q: 'How can I track my bulk order?',
        a: 'Once shipped, a tracking number and link from our shipping partners (Delhivery, BlueDart, DTDC) will be sent to your registered email and WhatsApp.'
      },
      {
        q: 'Do you deliver to remote clinics and hospital facilities?',
        a: 'Yes, we ship to healthcare professionals and institutions across all pincodes in India.'
      }
    ]
  },
  {
    category: 'Returns & Refunds',
    icon: RotateCcw,
    questions: [
      {
        q: 'What is your return policy on medical/surgical equipment?',
        a: 'Due to sterility and safety standards, returns are accepted within 7 days of delivery only for unused, unopened items in their original packaging. Lifesaving and sterilized items are not returnable once opened.'
      },
      {
        q: 'How do I initiate a refund or exchange?',
        a: 'To request a return/refund, email statsurgicalsupplies@gmail.com with your order number and invoice. Our quality control team will inspect the item before approval.'
      },
      {
        q: 'What if I receive a damaged or incorrect medical device?',
        a: 'Report any issues within 24 hours of receipt with unboxing videos/photos. We will immediately arrange a replacement or complete refund.'
      },
      {
        q: 'How long does the refund processing take?',
        a: 'Approved refunds are processed within 5-7 business days to the original payment method or hospital account.'
      }
    ]
  },
  {
    category: 'Products & Inventory',
    icon: Package,
    questions: [
      {
        q: 'Are all STAT Surgical products certified and quality tested?',
        a: 'Absolutely. All products are CE/ISO certified and undergo strict multi-point inspections before dispatch to ensure clinical compliance.'
      },
      {
        q: 'Do you provide warranty and servicing for diagnostic devices?',
        a: 'Yes, diagnostic devices like ECG monitors and pulse oximeters come with a 1-year manufacturer warranty. We also provide post-purchase calibration support.'
      },
      {
        q: 'Can I request a custom bulk quote for hospital setups?',
        a: 'Yes! We specialize in wholesale procurement for clinics and hospitals. Reach out via our Support form or WhatsApp to get a custom bulk quote.'
      },
      {
        q: 'What should I do if an item I need is out of stock?',
        a: 'You can sign up for stock alerts or directly message our team. We can source specific surgical supplies through our wholesale network.'
      }
    ]
  },
  {
    category: 'Account & Payment',
    icon: CreditCard,
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click the Sign Up button at the top right, fill in your details (name, email, hospital/clinic name, password), and verify your email.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards, UPI (Google Pay, PhonePe, Paytm), Net Banking (SBI, HDFC, ICICI), Razorpay, and direct Bank Transfer (RTGS/NEFT) for institutional bulk orders.'
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes, all transactions are processed through secure, PCI-DSS compliant payment gateways (Razorpay) utilizing 256-bit SSL encryption.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Go to the Login page, click "Forgot Password", enter your registered email, and we will send a password reset link to your email inbox.'
      }
    ]
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
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
      className={`border border-artisan-light/10 p-6 transition-all duration-500 bg-artisan-light/[0.01] hover:border-artisan-grey/40 hover:bg-artisan-light/[0.02] ${isOpen ? 'border-artisan-grey bg-artisan-light/[0.03]' : ''
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
          {/* Horizontal line of the plus/minus symbol */}
          <span className="absolute w-3 h-[2px] bg-current" />
          {/* Vertical line of the plus/minus symbol: rotates and fades out on expand */}
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
            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Orders & Shipping')
  const [openIndex, setOpenIndex] = useState(null)

  // When active category changes, close any open accordion
  useEffect(() => {
    setOpenIndex(null)
  }, [activeCategory])

  // Filter questions based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return faqData

    return faqData.map(cat => ({
      ...cat,
      questions: cat.questions.filter(q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(cat => cat.questions.length > 0)
  }, [searchQuery])

  const displayQuestions = useMemo(() => {
    if (searchQuery.trim()) {
      // Flatten all matching questions
      return filteredData.flatMap(cat =>
        cat.questions.map(q => ({ ...q, category: cat.category }))
      )
    } else {
      const cat = faqData.find(c => c.category === activeCategory)
      return cat ? cat.questions : []
    }
  }, [searchQuery, filteredData, activeCategory])

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Subtle glowing radial background */}
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-artisan-grey/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />

        {/* Animated Clinical Scope SVG */}
        <svg className="absolute -top-12 -right-12 md:right-10 w-96 h-96 text-artisan-grey/10" viewBox="0 0 200 200" fill="none">
          <defs>
            <pattern id="faq-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#faq-grid)" />

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
          <motion.circle
            cx="100"
            cy="100"
            r="40"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="20 10"
            animate={{ rotate: -360 }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          />
          <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
          <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </svg>
      </div>

      <div className="container-custom relative z-10">

        {/* HERO SECTION */}
        <header className="mb-16 md:mb-24">
          <div className="max-w-4xl space-y-6">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  QUESTIONS &
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  ANSWERS.
                </motion.span>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
              Find instant answers regarding shipping, order tracking, returns, quality control, and payment protocols.
            </p>
          </div>
        </header>

        {/* SEARCH BAR */}
        <div className="max-w-xl mb-16 relative group">
          {/* Subtle glow behind input */}
          <div className="absolute inset-0 bg-artisan-grey/5 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

          <div className="relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
            <label className="block text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey group-focus-within:tracking-[0.4em] transition-all duration-300">
              Search FAQs
            </label>
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-artisan-light/30 group-focus-within:text-artisan-grey transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TYPE KEYWORDS OR QUESTIONS..."
                className="w-full bg-transparent outline-none text-base font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10" />
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-artisan-grey scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left panel: Category selector */}
          {!searchQuery.trim() && (
            <div className="lg:col-span-4 space-y-3">
              <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block mb-4">FAQ Categories</span>
              <div className="flex flex-col gap-2 border-l border-artisan-light/5 pl-0">
                {faqData.map((cat) => {
                  const Icon = cat.icon
                  const isActive = activeCategory === cat.category
                  return (
                    <button
                      key={cat.category}
                      onClick={() => setActiveCategory(cat.category)}
                      className={`relative flex items-center justify-between px-6 py-4 border transition-all duration-500 shrink-0 text-left group overflow-hidden ${isActive
                          ? 'border-artisan-grey text-artisan-dark font-bold'
                          : 'border-artisan-light/10 text-artisan-light/60 hover:border-artisan-grey hover:text-artisan-light'
                        }`}
                    >
                      {/* Sliding active background marker */}
                      {isActive && (
                        <motion.div
                          layoutId="activeCategoryBg"
                          className="absolute inset-0 bg-artisan-grey z-0"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      <div className="relative z-10 flex items-center gap-3">
                        <Icon className={`w-4 h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:rotate-6'}`} />
                        <span className="text-[10px] font-display font-black uppercase tracking-wider">{cat.category}</span>
                      </div>

                      <span className={`relative z-10 text-[8px] font-mono tracking-widest ${isActive ? 'text-artisan-dark/50' : 'text-artisan-light/20 group-hover:text-artisan-light/40'}`}>
                        [{cat.questions.length}]
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Right panel: Accordion list */}
          <div className={`${searchQuery.trim() ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-6`}>
            {searchQuery.trim() && (
              <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">
                Search Results ({displayQuestions.length})
              </span>
            )}

            <motion.div
              key={activeCategory + searchQuery} // triggers remount & entrance animation on change
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {displayQuestions.length > 0 ? (
                displayQuestions.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === idx}
                    onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
                  />
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-artisan-light/10">
                  <p className="text-xs font-mono text-artisan-light/40 uppercase tracking-wider">
                    No matching questions found. Try searching for other terms or contact our support team.
                  </p>
                </div>
              )}
            </motion.div>
          </div>

        </div>

        {/* CTA SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-20 border border-artisan-light/10 p-8 md:p-10 bg-artisan-light/[0.01] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-artisan-grey/5 to-transparent pointer-events-none" />
          
          <div className="space-y-2 relative z-10 max-w-2xl">
            <h3 className="text-xl sm:text-2xl font-display font-extrabold uppercase text-artisan-light tracking-tight">
              Can't find what you're looking for?
            </h3>
            <p className="text-xs font-mono text-artisan-light/40 uppercase tracking-wider leading-relaxed">
              Our customer support team is here to help with any questions you may have.
            </p>
          </div>
          
          <Link 
            to="/support" 
            className="relative z-10 shrink-0 px-8 py-4 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.4em] text-[10px] hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 flex items-center gap-3 group"
          >
            <span>Contact Support</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
          </Link>
        </motion.div>

      </div>
    </div>
  )
}
