import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, MessageCircle, Mail, ArrowUp } from 'lucide-react'

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-artisan-light bg-noise border-t-2 border-artisan-grey relative overflow-hidden min-h-screen flex flex-col justify-between">
      <div className="container-custom py-12 lg:py-16 flex flex-col flex-1 justify-between w-full relative z-10">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-16 mb-auto my-auto">

          {/* Brand Intro */}
          <div className="lg:col-span-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl md:text-3xl font-display font-extrabold uppercase tracking-tighter">
                  <span className="text-artisan-dark">STAT</span>
                  <span className="text-artisan-grey ml-2">Surgical Supplies</span>
                </span>
              </div>
              <p className="text-sm md:text-base text-artisan-dark/70 leading-relaxed mb-6 max-w-sm font-body">
                Quality Surgical Products @ Wholesale Price
              </p>
            </div>

            {/* Social / Contact Shortcut Icons */}
            <div className="flex gap-4 mt-2">
              <a href="https://wa.me/918608678828" target="_blank" rel="noopener noreferrer" className="p-2 border border-artisan-dark/10 hover:border-artisan-dark hover:bg-artisan-dark hover:text-artisan-light transition-all rounded-none text-artisan-dark/60">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="tel:+918608678828" className="p-2 border border-artisan-dark/10 hover:border-artisan-dark hover:bg-artisan-dark hover:text-artisan-light transition-all rounded-none text-artisan-dark/60">
                <Phone className="w-4 h-4" />
              </a>
              <a href="mailto:statsurgicalsupplies@gmail.com" className="p-2 border border-artisan-dark/10 hover:border-artisan-dark hover:bg-artisan-dark hover:text-artisan-light transition-all rounded-none text-artisan-dark/60">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.3em] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'All Products', href: '/rent' },
                { label: 'Categories', href: '/categories' },
                { label: 'Book In-Store Demo', href: '/book-demo' },
                { label: 'Bulk Order Enquiry', href: '/bulk-enquiry' },
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/support' },
                { label: 'FAQ', href: '/faq' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm font-display font-extrabold uppercase text-artisan-dark/60 hover:text-artisan-dark hover:underline transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.3em] mb-6">Customer Service</h4>
            <ul className="space-y-3">
              {[
                { label: 'Shipping Policy', href: '/shipping' },
                { label: 'Returns & Refunds', href: '/returns' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs md:text-sm font-display font-extrabold uppercase text-artisan-dark/60 hover:text-artisan-dark hover:underline transition-all duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us Detail */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.3em] mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-artisan-grey flex-shrink-0" />
                <span className="text-xs text-artisan-dark/70 leading-relaxed font-body">
                  No 85, Nalla Thambi Road, Pammal, Chennai-600 075 Tamil Nadu.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-artisan-grey flex-shrink-0" />
                <a href="tel:+918608678828" className="text-xs text-artisan-dark/70 hover:text-artisan-dark hover:underline transition-all font-body font-semibold">
                  (+91) 86086 78828
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-artisan-grey flex-shrink-0" />
                <a href="https://wa.me/918608678828" target="_blank" rel="noopener noreferrer" className="text-xs text-artisan-dark/70 hover:text-artisan-dark hover:underline transition-all font-body font-semibold">
                  WhatsApp Us
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-artisan-grey flex-shrink-0" />
                <a href="mailto:statsurgicalsupplies@gmail.com" className="text-xs text-artisan-dark/70 hover:text-artisan-dark hover:underline transition-all font-body">
                  statsurgicalsupplies@gmail.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Massive Logo Finale */}
        <div className="relative border-t-2 border-artisan-dark/5 pt-8 mt-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="text-[8vw] font-display font-extrabold uppercase tracking-[-0.05em] leading-none text-artisan-dark select-none opacity-[0.02] mb-6 pointer-events-none"
          >
            STAT SURGICALS
          </motion.div>

          {/* Legal & Back to Top */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-2">
              <span className="text-[10px] font-mono font-bold text-artisan-dark/40 uppercase tracking-[0.2em]">
                © 2026 STAT Surgical Supplies. All rights reserved.
              </span>
              <Link to="/sitemap" className="text-[10px] font-mono font-bold text-artisan-dark/30 hover:text-artisan-dark uppercase tracking-[0.2em] transition-colors">Sitemap</Link>
            </div>

            <button
              onClick={scrollToTop}
              className="group flex items-center gap-3 text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.3em] hover:text-artisan-dark transition-colors"
            >
              BACK TO TOP
              <div className="w-8 h-8 border-2 border-artisan-grey flex items-center justify-center group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all">
                <ArrowUp className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
