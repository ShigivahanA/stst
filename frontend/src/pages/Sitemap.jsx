import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Home, LayoutGrid, ShoppingBag, ShieldCheck, Mail, ArrowLeft } from 'lucide-react'
import SEO from '../components/SEO'

const sitemapData = [
  {
    title: 'Main Navigation',
    icon: Home,
    links: [
      { name: 'Home', path: '/' },
      { name: 'Categories', path: '/categories' },
      { name: 'All Products', path: '/allproduct' },
      { name: 'Bulk Orders', path: '/bulk-enquiry' },
      { name: 'About', path: '/about' },
    ]
  },
  {
    title: 'Company Info',
    icon: LayoutGrid,
    links: [
      { name: 'FAQ', path: '/faq' },
    ]
  },
  {
    title: 'Account & Cart',
    icon: ShoppingBag,
    links: [
      { name: 'My Profile', path: '/profile' },
      { name: 'Shopping Cart', path: '/cart' },
      { name: 'Wishlist', path: '/wishlist' },
      { name: 'Orders History', path: '/history' },
    ]
  },
  {
    title: 'Legal Policies',
    icon: ShieldCheck,
    links: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Shipping & Delivery', path: '/shipping' },
      { name: 'Returns & Refunds', path: '/returns' },
    ]
  }
]

export default function Sitemap() {
  const [activeSection, setActiveSection] = useState('sec-0')

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      sitemapData.forEach((_, idx) => {
        const el = document.getElementById(`sec-${idx}`)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(`sec-${idx}`)
          }
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative">
      <SEO
        title="Sitemap"
        description="Navigate across all pages, policies, categories, and contact portals of Stat Surgicals easily."
        keywords={['stat surgicals sitemap', 'medical catalog navigation', 'surgical shop pages']}
        canonicalPath="/sitemap"
      />
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

        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
              Back to Home
            </span>
          </Link>
        </div>
        
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
                  SITE
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  MAP.
                </motion.span>
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-xs font-mono text-artisan-light/50 uppercase tracking-widest pt-2"
            >
              <span>Stat Surgicals</span>
              <span className="hidden sm:inline">/</span>
              <span>Sitemap</span>
            </motion.div>
          </div>
        </header>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT COLUMN: STICKY NAVIGATION */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-widest block">Sitemap Sections</span>
                <div className="h-0.5 bg-artisan-light/10 w-12" />
              </div>
              <nav className="flex flex-col space-y-3">
                {sitemapData.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollTo(`sec-${idx}`)}
                    className={`text-left text-xs font-display font-bold uppercase tracking-wider py-1.5 transition-all duration-300 border-l-2 pl-4 hover:text-artisan-grey hover:border-artisan-grey/50 ${activeSection === `sec-${idx}`
                        ? 'border-artisan-grey text-artisan-grey pl-6'
                        : 'border-artisan-light/10 text-artisan-light/50'
                      }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* RIGHT COLUMN: DETAIL MAP */}
          <main className="lg:col-span-9 space-y-20">
            {sitemapData.map((section, idx) => (
              <motion.section
                key={idx}
                id={`sec-${idx}`}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                className="space-y-8 scroll-mt-24"
              >
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">
                    [ Section 0{idx + 1} ]
                  </span>
                  <div className="h-px bg-artisan-light/10 flex-1" />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey rounded-xl">
                    <section.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-display font-extrabold uppercase text-artisan-light tracking-tight">
                    {section.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.links.map((link, lIdx) => (
                    <Link
                      key={lIdx}
                      to={link.path}
                      className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] hover:bg-artisan-light/[0.03] hover:border-artisan-grey transition-all duration-300 group flex items-center justify-between rounded-xl"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-display font-bold text-artisan-light group-hover:text-artisan-grey transition-colors uppercase">
                          {link.name}
                        </span>
                        <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">
                          Path: {link.path}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-artisan-light/20 group-hover:text-artisan-grey group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </motion.section>
            ))}
          </main>

        </div>

        {/* BOTTOM HELP BANNER */}
        <div className="border-t border-b border-artisan-light/10 py-20 flex flex-col items-center text-center space-y-12 mt-32 relative z-10">
          <div className="flex flex-col items-center gap-4">
            <Mail className="w-16 h-16 text-artisan-grey mb-4 animate-pulse" />
            <h2 className="text-2xl font-display font-extrabold uppercase text-artisan-light">Need Help?</h2>
            <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-[0.4em] max-w-lg leading-relaxed">
              "OUR SUPPORT TEAM IS HERE TO HELP YOU FIND EQUIPMENT AND ANSWER ACCOUNT QUESTIONS."
            </p>
          </div>
          <Link to="/support" className="flex items-center gap-4 text-xs font-mono font-bold text-artisan-grey uppercase tracking-widest hover:text-artisan-light transition-colors group">
            Contact Support <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  )
}
