import { motion } from 'framer-motion'
import { ShieldCheck, Lock, UserCheck, Heart, ArrowRight } from 'lucide-react'

const features = [
  {
    title: 'Tool Protection',
    desc: 'Every rental is covered by our comprehensive damage protection plan. Rest easy knowing your gear is safe.',
    icon: ShieldCheck
  },
  {
    title: 'Verified Makers',
    desc: 'We verify every member of our community. Identity checks and shop inspections are standard.',
    icon: UserCheck
  },
  {
    title: 'Secure Payments',
    desc: 'Funds are held in escrow and only released once the tool is returned and both parties are happy.',
    icon: Lock
  },
  {
    title: 'Community First',
    desc: 'A robust rating and review system ensures accountability and high standards for every artisan.',
    icon: Heart
  }
]

export default function SafetyTrust() {
  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24">
      <div className="container-custom">
        
        {/* HERO SECTION */}
        <header className="mb-24 md:mb-32 text-center">
           <div className="max-w-4xl mx-auto space-y-8">
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.6em] block"
              >
                Built on Integrity
              </motion.span>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
              >
                SAFETY <br />
                <span className="text-outline">& TRUST.</span>
              </motion.h1>
              <p className="text-xl md:text-2xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
                Trust is our most valuable tool. We've built the systems to keep you protected.
              </p>
           </div>
        </header>

        {/* FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
           {features.map((feature, idx) => (
             <div key={idx} className="p-12 border border-artisan-light/10 bg-artisan-light/[0.02] space-y-8 group hover:border-artisan-grey transition-all duration-700">
                <div className="w-16 h-16 bg-artisan-grey flex items-center justify-center text-artisan-dark">
                   <feature.icon className="w-8 h-8" />
                </div>
                <div className="space-y-4">
                   <h3 className="text-3xl font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors">{feature.title}</h3>
                   <p className="text-sm font-mono text-artisan-light/40 leading-relaxed uppercase tracking-widest leading-loose">
                      {feature.desc}
                   </p>
                </div>
             </div>
           ))}
        </div>

        {/* CERTIFICATE SECTION */}
        <div className="border-t border-b border-artisan-light/10 py-20 flex flex-col items-center text-center space-y-12">
           <div className="flex flex-col items-center gap-4">
              <ShieldCheck className="w-16 h-16 text-artisan-grey mb-4" />
              <h2 className="text-2xl font-display font-extrabold uppercase text-artisan-light">The Forge Guarantee</h2>
              <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-[0.4em] max-w-lg leading-relaxed">
                 "WE STAND BEHIND EVERY TRANSACTION. IF SOMETHING ISN'T RIGHT, WE'LL FIX IT. THAT'S OUR VOW TO THE ARTISAN COMMUNITY."
              </p>
           </div>
           <button className="flex items-center gap-4 text-xs font-mono font-bold text-artisan-grey uppercase tracking-widest hover:text-artisan-light transition-colors group">
              Read our full protocol <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  )
}
