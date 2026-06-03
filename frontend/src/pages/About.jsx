import { motion } from 'framer-motion'
import { Users, Globe, Target, ShieldCheck, IndianRupee, Heart, Activity } from 'lucide-react'

const stats = [
   { label: 'Years of Experience', value: '10+' },
   { label: 'Clients Served', value: '5K+' },
   { label: 'Products Delivered', value: '50K+' },
   { label: 'Support SLA', value: '24/7' }
]

const features = [
   { title: 'Customer Focused', icon: Users, desc: 'Personalized service for every medical professional and clinic.' },
   { title: 'Quality Assured', icon: ShieldCheck, desc: 'Every product undergoes rigorous multi-point quality inspections.' },
   { title: 'India Wide', icon: Globe, desc: 'Reliable cold-chain and standard shipping to hospitals across India.' },
   { title: 'Best Pricing', icon: IndianRupee, desc: 'Direct wholesale rates without middleman or agency markup.' }
]

const containerVariants = {
   hidden: { opacity: 0 },
   visible: {
      opacity: 1,
      transition: {
         staggerChildren: 0.1,
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

const fadeLeftVariants = {
   hidden: { opacity: 0, x: -20 },
   visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] }
   }
}

export default function About() {
   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative overflow-hidden">
         {/* Background Graphic Accents */}
         <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {/* Glowing Orbs */}
            <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] rounded-full bg-artisan-grey/5 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />

            {/* ECG / Cardiogram Wave animation */}
            <svg className="absolute top-1/4 -left-20 w-[600px] h-96 text-artisan-grey/5" viewBox="0 0 600 200" fill="none">
               <defs>
                  <pattern id="about-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                     <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
               </defs>
               <rect width="100%" height="100%" fill="url(#about-grid)" />
               <motion.path
                  d="M 0 100 L 120 100 L 135 70 L 150 130 L 165 40 L 180 160 L 195 100 L 210 110 L 220 95 L 230 100 L 600 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0, opacity: 0.1 }}
                  animate={{
                     pathLength: [0, 1],
                     opacity: [0.1, 0.6, 0.1]
                  }}
                  transition={{
                     duration: 4,
                     ease: "easeInOut",
                     repeat: Infinity,
                     repeatDelay: 3
                  }}
               />
            </svg>

            {/* Rotating compass grid */}
            <svg className="absolute -bottom-20 -right-20 w-[450px] h-[450px] text-artisan-grey/5" viewBox="0 0 200 200" fill="none">
               <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
               <motion.circle
                  cx="100"
                  cy="100"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="0.5"
                  strokeDasharray="10 5"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 45, ease: "linear", repeat: Infinity }}
               />
            </svg>
         </div>

         <div className="container-custom relative z-10">

            {/* HERO SECTION */}
            <header className="mb-16 md:mb-24">
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                  <div className="lg:col-span-8 space-y-6">
                     <h1
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-artisan-light"
                     >
                        <span className="overflow-hidden block">
                           <motion.span
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                              className="block"
                           >
                              STAT
                           </motion.span>
                        </span>
                        <span className="overflow-hidden block">
                           <motion.span
                              initial={{ y: "100%" }}
                              animate={{ y: 0 }}
                              transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                              className="block text-outline"
                           >
                              SURGICALS.
                           </motion.span>
                        </span>
                     </h1>
                  </div>
                  <div className="lg:col-span-4 pb-2">
                     <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed border-t border-artisan-light/10 pt-6"
                     >
                        We are dedicated to providing the highest quality surgical and medical supplies at wholesale prices, supporting healthcare professionals across India.
                     </motion.p>
                  </div>
               </div>
            </header>

            {/* MISSION PANEL */}
            <motion.section
               initial="hidden"
               whileInView="visible"
               viewport={{ once: true, margin: "-100px" }}
               variants={fadeLeftVariants}
               className="mb-16 md:mb-24 max-w-4xl border border-artisan-light/10 p-6 md:p-8 bg-artisan-light/[0.01] relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-[9px] font-mono tracking-widest text-artisan-grey font-bold">[ MISSION // 01 ]</span>
               </div>
               <div className="space-y-4 relative z-10">
                  <div className="flex items-center gap-3">
                     <Activity className="w-4 h-4 text-artisan-grey" />
                     <h2 className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.5em]">Our Mission Statement</h2>
                  </div>
                  <p className="text-sm sm:text-base md:text-lg font-mono text-artisan-light/75 uppercase tracking-wider leading-relaxed max-w-3xl">
                     At STAT Surgical Supplies, our mission is to democratize access to premium medical equipment. We believe that every hospital, clinic, and household should have access to reliable diagnostic and rehabilitation tools without the burden of excessive costs.
                  </p>
               </div>
            </motion.section>

            {/* FEATURES GRID */}
            <div className="mb-24 space-y-6">
               <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Core Commitments</span>
               <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
               >
                  {features.map((item, idx) => {
                     const Icon = item.icon
                     return (
                        <motion.div
                           key={idx}
                           variants={itemVariants}
                           whileHover={{ y: -4 }}
                           transition={{ type: "spring", stiffness: 300, damping: 20 }}
                           className="border border-artisan-light/10 p-6 md:p-8 relative overflow-hidden bg-artisan-light/[0.01] hover:border-artisan-grey/40 hover:bg-artisan-light/[0.02] transition-colors duration-300 flex flex-col justify-between group cursor-default"
                        >
                           <div className="w-10 h-10 border border-artisan-light/15 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-colors duration-300 shrink-0">
                              <Icon className="w-4 h-4" />
                           </div>
                           <div className="space-y-2 mt-8">
                              <h3 className="text-base font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors duration-300">{item.title}</h3>
                              <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-wider leading-relaxed">{item.desc}</p>
                           </div>

                           {/* Decorative corner indicator */}
                           <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-artisan-light/5 group-hover:bg-artisan-grey transition-colors duration-300" />
                        </motion.div>
                     )
                  })}
               </motion.div>
            </div>

            {/* METRICS DASHBOARD */}
            <div className="mb-24 space-y-6">
               <span className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Operational Metrics</span>
               <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-artisan-light/10 border border-artisan-light/10 mx-auto"
               >
                  {stats.map((stat, idx) => (
                     <motion.div
                        key={idx}
                        whileHover={{ backgroundColor: "rgba(92, 62, 148, 0.03)" }}
                        className="bg-artisan-dark p-6 md:p-8 text-center space-y-2 relative group"
                     >
                        <span className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-[0.3em] block">{stat.label}</span>
                        <p className="text-2xl md:text-3xl font-display font-black text-artisan-light tracking-tighter group-hover:text-artisan-grey transition-colors duration-300">{stat.value}</p>

                        {/* Visual crosshair markers */}
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 border-t border-r border-artisan-light/10 group-hover:border-artisan-grey transition-colors" />
                        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 border-b border-l border-artisan-light/10 group-hover:border-artisan-grey transition-colors" />
                     </motion.div>
                  ))}
               </motion.div>
            </div>

            {/* VISION PANEL */}
            <motion.section
               initial={{ opacity: 0, y: 25 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-100px" }}
               transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
               className="bg-artisan-light/[0.01] border border-artisan-light/10 p-6 md:p-12 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <span className="text-[9px] font-mono tracking-widest text-artisan-grey font-bold">[ VISION // 02 ]</span>
               </div>
               <div className="absolute -bottom-10 -right-10 p-12 opacity-[0.02]">
                  <motion.div
                     animate={{ rotate: 360 }}
                     transition={{ duration: 50, ease: "linear", repeat: Infinity }}
                  >
                     <Target className="w-48 h-48 text-artisan-grey" />
                  </motion.div>
               </div>
               <div className="max-w-4xl space-y-6 relative z-10">
                  <div className="flex items-center gap-3">
                     <Heart className="w-4 h-4 text-artisan-grey" />
                     <h2 className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.5em]">Our Vision Statement</h2>
                  </div>
                  <p className="text-lg md:text-xl font-display font-medium text-artisan-light leading-relaxed italic uppercase tracking-tight">
                     "To become the most trusted and efficient medical supply partner in India, recognized for our commitment to healthcare accessibility and product excellence."
                  </p>
               </div>
            </motion.section>

         </div>
      </div>
   )
}
