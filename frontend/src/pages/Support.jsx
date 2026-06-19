import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, Phone, MapPin, Clock, ArrowRight, Navigation } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
  }
}

const formContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.25
    }
  }
}

const formItemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] }
  }
}

export default function Support() {
  const { addToast } = useToast()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [animationPhase, setAnimationPhase] = useState('idle') // 'idle', 'sending', 'success'

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setAnimationPhase('sending')

    // Stage 1: Letter flies into the box (takes about 1.5 seconds)
    setTimeout(() => {
      setAnimationPhase('success')
    }, 1500)

    // Stage 2: Trigger toast and reset after 3.2 seconds total
    setTimeout(() => {
      addToast('Message sent successfully! We will get back to you soon.', 'success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setSubmitting(false)
      setAnimationPhase('idle')
    }, 3200)
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative overflow-hidden">
      <SEO
        title="Contact Us & Customer Support"
        description="Get in touch with Stat Surgicals' customer support team. Reach us via phone, email, WhatsApp, or visit our store in Pammal, Chennai."
        keywords={['contact medical supplier', 'chennai surgical supplies phone number', 'stat surgicals address', 'customer service diagnostics']}
        canonicalPath="/support"
      />
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {/* Subtle glowing radial background */}
        <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-artisan-grey/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />

        {/* ECG Wave SVG animation */}
        <svg className="absolute -top-12 -right-12 md:right-10 w-96 h-96 text-artisan-grey/10" viewBox="0 0 200 200" fill="none">
          <defs>
            <pattern id="support-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#support-grid)" />

          <motion.path
            d="M 10 100 L 70 100 L 80 80 L 90 120 L 100 60 L 110 140 L 120 100 L 130 110 L 135 95 L 140 100 L 190 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0.1 }}
            animate={{
              pathLength: [0, 1],
              opacity: [0.1, 1, 0.1]
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Infinity,
              repeatDelay: 2
            }}
          />
          <circle cx="10" cy="100" r="2" fill="currentColor" opacity="0.5" />
          <circle cx="190" cy="100" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      </div>

      <div className="container-custom relative z-10">

        {/* HERO SECTION */}
        <header className="mb-16 md:mb-24">
          <div className="max-w-4xl space-y-6">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
            >
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  GET IN
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  TOUCH.
                </motion.span>
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl"
            >
              Have questions about our products or need a bulk quote? Our team is here to help you.
            </motion.p>
          </div>
        </header>

        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN: Contact & Business Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-5 space-y-12"
          >
            {/* Contact Details */}
            <div className="space-y-6">
              <motion.h2 variants={itemVariants} className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.4em] pb-3 border-b border-artisan-light/5">Contact Information</motion.h2>
              <div className="space-y-6">

                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey shrink-0 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-300 rounded-xl"
                  >
                    <MapPin className="w-5 h-5" />
                  </motion.div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-widest block font-bold font-bold">Our Location</span>
                    <p className="text-xs font-mono text-artisan-light/70 uppercase leading-relaxed tracking-wider">
                      No 85, Nalla Thambi Road, Pammal, Chennai-600 075, Tamil Nadu.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey shrink-0 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-300 rounded-xl"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </motion.div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-widest block font-bold font-bold">WhatsApp</span>
                    <a href="https://wa.me/918608678828" target="_blank" rel="noopener noreferrer" className="text-base font-display font-bold uppercase text-artisan-light hover:text-artisan-grey transition-colors tracking-tight block">
                      +91 86086 78828
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey shrink-0 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-300 rounded-xl"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-widest block font-bold font-bold">Call Us</span>
                    <a href="tel:+918608678828" className="text-base font-display font-bold uppercase text-artisan-light hover:text-artisan-grey transition-colors tracking-tight block">
                      (+91) 86086 78828
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex gap-4 items-start group cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-10 h-10 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey shrink-0 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-300 rounded-xl"
                  >
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-widest block font-bold font-bold">Email Support</span>
                    <a href="mailto:statsurgicalsupplies@gmail.com" className="text-xs font-mono text-artisan-light hover:text-artisan-grey transition-colors tracking-wider block">
                      statsurgicalsupplies@gmail.com
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Business Hours */}
            <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-artisan-light/5">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-artisan-grey" />
                <h2 className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Business Hours</h2>
              </div>
              <div className="space-y-3 pl-7">
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex justify-between text-xs font-mono text-artisan-light/60 hover:text-artisan-light uppercase tracking-wider transition-colors duration-300 cursor-default"
                >
                  <span>Monday - Friday</span>
                  <span className="font-bold text-artisan-light">9:00 AM - 7:00 PM</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex justify-between text-xs font-mono text-artisan-light/60 hover:text-artisan-light uppercase tracking-wider transition-colors duration-300 cursor-default"
                >
                  <span>Saturday</span>
                  <span className="font-bold text-artisan-light">10:00 AM - 5:00 PM</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ x: 4 }}
                  className="flex justify-between text-xs font-mono text-artisan-light/60 hover:text-artisan-light uppercase tracking-wider transition-colors duration-300 cursor-default"
                >
                  <span>Sunday</span>
                  <span className="font-bold text-red-500">Closed</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: Contact Form */}
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 bg-artisan-light/[0.01] border border-artisan-light/10 p-8 md:p-10 space-y-8 rounded-xl"
          >
            <motion.div variants={formItemVariants} className="space-y-2">
              <h2 className="text-2xl font-display font-black uppercase text-artisan-light tracking-tight">Send Message</h2>
              <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                Fill out the form below, and we will get back to you within 24 hours.
              </p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <motion.div variants={formItemVariants} className="group relative pb-2">
                <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey group-focus-within:tracking-[0.4em] transition-all duration-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="YOUR FULL NAME"
                  className="w-full bg-transparent outline-none text-base font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10" />
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-artisan-grey scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>

              {/* Email Address */}
              <motion.div variants={formItemVariants} className="group relative pb-2">
                <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey group-focus-within:tracking-[0.4em] transition-all duration-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="EMAIL@EXAMPLE.COM"
                  className="w-full bg-transparent outline-none text-base font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10" />
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-artisan-grey scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>

              {/* Subject */}
              <motion.div variants={formItemVariants} className="group relative pb-2">
                <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey group-focus-within:tracking-[0.4em] transition-all duration-300">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="HOW CAN WE HELP?"
                  className="w-full bg-transparent outline-none text-base font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10" />
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-artisan-grey scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>

              {/* Message */}
              <motion.div variants={formItemVariants} className="group relative pb-2">
                <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-2 group-focus-within:text-artisan-grey group-focus-within:tracking-[0.4em] transition-all duration-300">
                  Message
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="WRITE YOUR MESSAGE HERE..."
                  className="w-full bg-transparent outline-none text-sm font-display font-medium uppercase text-artisan-light placeholder:text-artisan-light/5 resize-none leading-relaxed"
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-artisan-light/10" />
                <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-artisan-grey scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={submitting}
                variants={formItemVariants}
                whileHover={animationPhase === 'idle' ? { scale: 1.01 } : {}}
                whileTap={animationPhase === 'idle' ? { scale: 0.99 } : {}}
                className="w-full h-16 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.6em] text-[10px] transition-all duration-500 flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-90 rounded-full"
              >
                {/* Hover bg slide - only active on idle */}
                {animationPhase === 'idle' && (
                  <div className="absolute inset-0 bg-artisan-light translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[0.33,1,0.68,1]" />
                )}

                <AnimatePresence mode="wait">
                  {animationPhase === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative z-10 flex items-center justify-center gap-4 group-hover:text-artisan-dark transition-colors duration-500"
                    >
                      <span>Send Message</span>
                      <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 group-hover:text-artisan-dark transition-all duration-500" />
                    </motion.div>
                  )}

                  {animationPhase === 'sending' && (
                    <motion.div
                      key="sending"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative z-10 flex items-center justify-center gap-3"
                    >
                      {/* Paper and Box SVG Animation */}
                      <div className="w-8 h-8 flex items-center justify-center relative shrink-0">
                        {/* The Box */}
                        <motion.svg
                          className="w-6 h-6 text-artisan-dark"
                          viewBox="0 0 64 64"
                          fill="none"
                          initial={{ y: 8, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Box Back */}
                          <path d="M16 38 L16 48 A2 2 0 0 0 18 50 L46 50 A2 2 0 0 0 48 48 L48 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          {/* Box Front Slot Cutout */}
                          <path d="M16 38 L24 38 L26 42 L38 42 L40 38 L48 38" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                        </motion.svg>

                        {/* The Floating Paper Letter */}
                        <motion.div
                          className="absolute top-0 text-artisan-dark"
                          initial={{ y: -10, x: -6, rotate: -15, opacity: 0, scale: 0.7 }}
                          animate={{
                            y: [-10, 0, 14],
                            x: [-6, 0, 0],
                            rotate: [-15, 0, 0],
                            opacity: [0, 1, 1, 0],
                            scale: [0.7, 0.85, 0.7]
                          }}
                          transition={{
                            duration: 1.1,
                            times: [0, 0.4, 1],
                            ease: "easeInOut",
                            repeat: Infinity,
                            repeatDelay: 0.2
                          }}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="5" width="18" height="14" rx="1" />
                            <path d="M3 7 L12 13 L21 7" />
                          </svg>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {animationPhase === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="relative z-10 flex items-center justify-center gap-3"
                    >
                      <div className="w-6 h-6 flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-artisan-dark" viewBox="0 0 32 32" fill="none">
                          {/* Success Checkmark Circle */}
                          <motion.circle
                            cx="16"
                            cy="16"
                            r="13"
                            stroke="currentColor"
                            strokeWidth="3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                          {/* Success Checkmark Path */}
                          <motion.path
                            d="M10 16 L14 20 L22 12"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>
          </motion.div>

        </div>

        {/* STORE LOCATION MAP */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 md:mt-28 space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-2">
              <h2 className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.4em] pb-1">Our Store</h2>
              <p className="text-sm font-mono text-artisan-light/40 uppercase tracking-wider">
                No 85, Nalla Thambi Road, Pammal, Chennai - 600 075
              </p>
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=No+85+Nalla+Thambi+Road+Pammal+Chennai+600075"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-artisan-grey text-artisan-dark text-[10px] font-display font-extrabold uppercase tracking-widest hover:bg-artisan-light rounded-full transition-all duration-300 group"
            >
              <Navigation className="w-4 h-4 group-hover:rotate-360 transition-transform duration-300" />
              Get Directions
            </a>
          </div>

          <div className="relative w-full border border-artisan-light/10 overflow-hidden rounded-xl" style={{ aspectRatio: '16/6' }}>
            {/* Dark-themed map overlay tint */}
            <div className="absolute inset-0 pointer-events-none z-10 mix-blend-multiply bg-artisan-dark/20" />
            <iframe
              title="STAT Surgical Supplies Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.4!2d80.1375!3d12.9475!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU2JzUxLjAiTiA4MMKwMDgnMTUuMCJF!5e0!3m2!1sen!2sin!4v1700000000000&q=No+85+Nalla+Thambi+Road+Pammal+Chennai+600075"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
