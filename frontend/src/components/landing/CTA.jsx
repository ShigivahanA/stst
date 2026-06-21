import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageCircle, ShoppingBag, Clock, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="bg-artisan-grey/90 backdrop-blur-md bg-noise min-h-screen flex flex-col justify-center overflow-hidden relative border-b-2 border-artisan-light">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
        <ShoppingBag className="w-64 h-64 text-artisan-dark" />
      </div>

      <div className="container-custom py-12 lg:py-16 flex flex-col flex-1 justify-between w-full relative z-10">
        <div className="max-w-6xl my-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="mb-6 lg:mb-8"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-dark/60 mb-2 block">Final Step</span>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-dark">
              Ready to <br />
              <span className="text-artisan-dark/40">Order?</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg lg:text-xl text-artisan-dark/80 max-w-2xl mb-8 font-body leading-relaxed"
          >
            Get in touch with us today for wholesale pricing, bulk orders, and personalized assistance. We're here to help you find exactly what you need.
          </motion.p>

          {/* Large Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex-1 sm:flex-initial">
              <motion.button
                className="w-full px-10 py-5 bg-artisan-dark text-artisan-light font-display font-black uppercase tracking-widest text-xs border border-artisan-light flex items-center justify-center gap-3 rounded-full cursor-pointer"
                initial={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#fffcf2", color: "#252422", borderColor: "#252422" }}
                animate={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#fffcf2", color: "#252422", borderColor: "#252422" }}
                whileHover={{ 
                   y: -2,
                   boxShadow: "0 8px 0 0 #fffcf2",
                   backgroundColor: "#252422",
                   color: "#fffcf2",
                   borderColor: "#252422"
                }}
                whileTap={{ 
                   y: 6,
                   boxShadow: "0 0px 0 0 #fffcf2"
                }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </motion.button>
            </a>

            <Link to="/book-demo" className="w-full sm:w-auto flex-1 sm:flex-initial">
              <motion.button
                className="w-full px-10 py-5 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest text-xs border-2 border-artisan-dark rounded-full flex items-center justify-center gap-3 cursor-pointer"
                initial={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#eb5e28", color: "#fffcf2", borderColor: "#fffcf2" }}
                animate={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#eb5e28", color: "#fffcf2", borderColor: "#fffcf2" }}
                whileHover={{ 
                   y: -2,
                   boxShadow: "0 8px 0 0 #252422",
                   backgroundColor: "#fffcf2",
                   color: "#252422",
                   borderColor: "#fffcf2"
                }}
                whileTap={{ 
                   y: 6,
                   boxShadow: "0 0px 0 0 #252422"
                }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
              >
                <Calendar className="w-4 h-4" />
                Book Trial Demo
              </motion.button>
            </Link>
          </motion.div>

          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-6 border-t border-artisan-dark/10 flex flex-wrap gap-x-8 gap-y-3"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-artisan-dark/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Mon–Sat: 9:00 AM – 9:00 PM</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-artisan-dark/60">
              <Clock className="w-3.5 h-3.5" />
              <span>Sun: 10:00 AM – 2:00 PM</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
