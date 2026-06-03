import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, PlusCircle } from 'lucide-react'

export default function Marketplace() {
  return (
    <div className="min-h-screen w-full bg-artisan-dark overflow-hidden flex flex-col lg:flex-row bg-noise relative">
      
      {/* RENT A TOOL (Pane 01) */}
      <Link 
        to="/rent"
        className="relative flex-1 group overflow-hidden border-b lg:border-b-0 lg:border-r border-artisan-light/5"
      >
        <div className="absolute inset-0 bg-artisan-grey/5 group-hover:bg-artisan-grey/10 transition-colors duration-700" />
        
        {/* Background Text (Phantom) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-display font-extrabold text-artisan-light/[0.02] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          GET
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="w-20 h-20 bg-artisan-grey mx-auto flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
              <Search className="w-10 h-10 text-artisan-dark" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter text-artisan-light group-hover:text-outline transition-all duration-500">
                Rent a <br />
                Tool
              </h2>
              <p className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.5em]">
                Find the perfect gear for your project
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-artisan-light/20 group-hover:text-artisan-grey transition-colors">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Available Now</span>
              <div className="w-12 h-px bg-current" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.div>
        </div>
      </Link>

      {/* LIST YOUR TOOL (Pane 02) */}
      <Link 
        to="/list"
        className="relative flex-1 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-artisan-dark group-hover:bg-artisan-grey/[0.02] transition-colors duration-700" />
        
        {/* Background Text (Phantom) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20rem] font-display font-extrabold text-artisan-light/[0.02] select-none pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          GIVE
        </div>

        <div className="relative h-full flex flex-col items-center justify-center p-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="w-20 h-20 bg-artisan-grey mx-auto flex items-center justify-center group-hover:-rotate-12 transition-transform duration-500">
              <PlusCircle className="w-10 h-10 text-artisan-dark" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter text-artisan-light group-hover:text-outline transition-all duration-500">
                List your <br />
                Gear
              </h2>
              <p className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.5em]">
                Earn from the tools you own
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-artisan-light/20 group-hover:text-artisan-grey transition-colors">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest">Start Sharing</span>
              <div className="w-12 h-px bg-current" />
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.div>
        </div>
      </Link>

      {/* Branding Overlay */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 mix-blend-difference pointer-events-none">
        <span className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-[1em]">
          MARKETPLACE
        </span>
      </div>

    </div>
  )
}
