import { motion } from 'framer-motion'
import { Shield, CheckCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-react'

export default function Insurance() {
  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24">
      <div className="container-custom">
        
        {/* HERO SECTION */}
        <header className="mb-24 md:mb-32">
           <div className="max-w-4xl space-y-8">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.6em] block"
              >
                Coverage & Protection
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
              >
                TOTAL <br />
                <span className="text-outline">INSURANCE.</span>
              </motion.h1>
              <p className="text-xl md:text-2xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
                We've got you covered. Every rental includes ForgeGuard™ protection for ultimate peace of mind.
              </p>
           </div>
        </header>

        {/* COVERAGE DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
           <div className="lg:col-span-8 space-y-8">
              <div className="p-12 bg-artisan-light/[0.02] border border-artisan-light/10 space-y-12">
                 <div className="flex items-center gap-6">
                    <Shield className="w-12 h-12 text-artisan-grey" />
                    <h2 className="text-3xl font-display font-black text-artisan-light uppercase tracking-tight">ForgeGuard Protection</h2>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-4">
                       <h4 className="text-xs font-mono font-bold text-artisan-light/60 uppercase tracking-widest">Property Damage</h4>
                       <p className="text-xs font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider">
                          Coverage for accidental damage to tools during the rental period. Includes parts and labor.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xs font-mono font-bold text-artisan-light/60 uppercase tracking-widest">Liability Coverage</h4>
                       <p className="text-xs font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider">
                          General liability protection for users and owners against third-party claims.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xs font-mono font-bold text-artisan-light/60 uppercase tracking-widest">Theft & Loss</h4>
                       <p className="text-xs font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider">
                          Protection against tool theft or total loss during the rental session.
                       </p>
                    </div>
                    <div className="space-y-4">
                       <h4 className="text-xs font-mono font-bold text-artisan-light/60 uppercase tracking-widest">Downtime Credit</h4>
                       <p className="text-xs font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider">
                          Compensation for owners if a tool is out of service for extended repairs.
                       </p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-4 space-y-8">
              <div className="p-8 border-l-2 border-artisan-grey bg-artisan-grey/[0.02] space-y-6">
                 <div className="flex items-center gap-4 text-artisan-grey">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Important Note</span>
                 </div>
                 <p className="text-xs font-mono text-artisan-light/40 uppercase leading-relaxed tracking-widest">
                    Coverage is only active for rentals booked and paid through the official ForgeShare platform.
                 </p>
              </div>
              <button className="w-full p-8 border border-artisan-light/10 flex items-center justify-between group hover:bg-artisan-light hover:text-artisan-dark transition-all">
                 <div className="flex items-center gap-4">
                    <FileText className="w-6 h-6" />
                    <span className="text-xs font-mono font-bold uppercase tracking-[0.4em]">Full Policy (PDF)</span>
                 </div>
                 <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </div>

      </div>
    </div>
  )
}
