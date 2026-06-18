import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ChevronRight, Mail, MapPin, Globe, Loader2 } from 'lucide-react'
import api from '../services/api'

export default function Privacy() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    api.get('/content/page/privacy')
      .then(res => {
        const fetched = res.data.data?.sections || []
        setSections(fetched)
        if (fetched.length > 0) {
          setActiveSection(`sec-${fetched[0]._id}`)
        }
      })
      .catch(err => console.error('Error fetching privacy page:', err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (sections.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      for (const section of sections) {
        const el = document.getElementById(`sec-${section._id}`)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`sec-${section._id}`)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    }
  }

  const renderBody = (bodyText) => {
    const paragraphs = bodyText.split('\n').filter(p => p.trim())
    return paragraphs.map((para, pIdx) => {
      // Check if it is a bullet point
      if (para.trim().startsWith('- ')) {
        return (
          <ul key={pIdx} className="list-disc list-inside space-y-1.5 pl-2 font-mono text-xs uppercase tracking-wider text-artisan-light/60 my-2">
            <li>{para.trim().replace(/^- /, '')}</li>
          </ul>
        )
      }
      // Check if it looks like a Definition (e.g. "Account: means a unique...")
      const colonIdx = para.indexOf(':')
      if (colonIdx > 0 && colonIdx < 35 && !para.trim().startsWith('http')) {
        const term = para.substring(0, colonIdx).trim()
        const definition = para.substring(colonIdx + 1).trim()
        return (
          <div
            key={pIdx}
            className="border border-artisan-light/10 p-5 bg-artisan-light/[0.01] hover:border-artisan-grey/40 transition-colors duration-300 my-4 rounded-xl"
          >
            <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-2">{term}</strong>
            <p className="text-sm text-artisan-light/70">{definition}</p>
          </div>
        )
      }
      // Check if it's a numbered item
      if (/^\d+\.\s/.test(para.trim())) {
        return (
          <div key={pIdx} className="flex items-start gap-3 my-2">
            <span className="w-6 h-6 border border-artisan-light/15 flex items-center justify-center text-xs text-artisan-grey font-mono shrink-0 rounded-xl">
              {para.match(/^\d+/)[0]}
            </span>
            <span className="text-sm sm:text-base pt-0.5">{para.replace(/^\d+\.\s/, '')}</span>
          </div>
        )
      }
      return <p key={pIdx} className="mb-4">{para}</p>
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-artisan-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-artisan-grey" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-artisan-grey/5 blur-[140px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Abstract structural grid */}
        <svg className="absolute -top-20 -left-20 w-[500px] h-[500px] text-artisan-grey/5" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <motion.circle
            cx="100"
            cy="100"
            r="70"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="6 12"
            animate={{ rotate: 360 }}
            transition={{ duration: 50, ease: "linear", repeat: Infinity }}
          />
        </svg>
      </div>

      <div className="container-custom relative z-10">

        {/* HERO HEADER */}
        <header className="mb-16 border-b border-artisan-light/10 pb-12">
          <div className="max-w-4xl space-y-6">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-artisan-light">
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  PRIVACY
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline animate-pulse"
                >
                  POLICY.
                </motion.span>
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-xs font-mono text-artisan-light/50 uppercase tracking-widest pt-2"
            >
              <span>DYNAMIC PROTOCOL ACTIVE</span>
              <span className="hidden sm:inline">/</span>
              <span>STAT SURGICAL SUPPLIES</span>
            </motion.div>
          </div>
        </header>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN: STICKY NAVIGATION */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-widest block">Document Sections</span>
                <div className="h-0.5 bg-artisan-light/10 w-12" />
              </div>
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-3"
              >
                {sections.map((section) => (
                  <motion.button
                    variants={itemVariants}
                    key={section._id}
                    onClick={() => scrollTo(`sec-${section._id}`)}
                    className={`text-left text-xs font-display font-bold uppercase tracking-wider py-1.5 transition-all duration-300 border-l-2 pl-4 hover:text-artisan-grey hover:border-artisan-grey/50 ${activeSection === `sec-${section._id}`
                        ? 'border-artisan-grey text-artisan-grey pl-6'
                        : 'border-artisan-light/10 text-artisan-light/50'
                      }`}
                  >
                    {section.heading.replace(/^\[[a-zA-Z\s&]+\]\s*/, '')}
                  </motion.button>
                ))}
              </motion.nav>
            </div>
          </aside>

          {/* RIGHT COLUMN: DETAILED LAW TEXT */}
          <main className="lg:col-span-9 space-y-20 font-body text-artisan-light/70 text-sm sm:text-base leading-relaxed">
            {sections.map((section, idx) => (
              <motion.section
                key={section._id}
                id={`sec-${section._id}`}
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-6 scroll-mt-24"
              >
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">
                    [ SECTION // {String(idx + 1).padStart(2, '0')} ]
                  </span>
                  <div className="h-px bg-artisan-light/10 flex-1" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">
                  {section.heading.replace(/^\[[a-zA-Z\s&]+\]\s*/, '')}
                </h2>
                <div className="space-y-4">
                  {renderBody(section.body)}
                </div>
              </motion.section>
            ))}
          </main>

        </div>

      </div>
    </div>
  )
}
