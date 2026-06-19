import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Hammer, AlertOctagon, HelpCircle } from 'lucide-react'
import SEO from '../components/SEO'

export default function NotFound() {
   return (
      <div className="h-screen bg-artisan-dark bg-noise flex items-center justify-center p-6 relative overflow-hidden">
         <SEO title="Page Not Found" robots="noindex, nofollow" />
         {/* Background Decorative Element */}
         <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <span className="text-[50vw] font-display font-black select-none leading-none">404</span>
         </div>

         {/* Cinematic Grid Lines */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 w-full h-px bg-artisan-light/5" />
            <div className="absolute top-3/4 w-full h-px bg-artisan-light/5" />
            <div className="absolute left-1/4 h-full w-px bg-artisan-light/5" />
            <div className="absolute left-3/4 h-full w-px bg-artisan-light/5" />
         </div>

         <div className="container-custom relative z-10 w-full">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8 md:space-y-12">

               {/* ICON & ERROR CODE */}
               <div className="space-y-4 mt-5">
                  <div className="space-y-2">
                     <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[1em] block">Error Code: 404</span>
                     <h1 className="text-6xl md:text-8xl lg:text-9xl font-display font-extrabold uppercase tracking-tighter leading-[0.8] text-artisan-light">
                        LOST IN <br />
                        <span className="text-outline">INVENTORY.</span>
                     </h1>
                  </div>
               </div>

               {/* MESSAGE */}
               <div className="space-y-6 max-w-lg mx-auto">
                  <p className="text-sm md:text-base text-artisan-light/40 font-display font-medium uppercase tracking-[0.2em] leading-relaxed">
                     The page you're looking for is unavailable.                  </p>
               </div>

               {/* ACTIONS */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
               >
                  <Link
                     to="/allproduct"
                     className="px-10 py-5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center justify-center gap-4 text-xs"
                  >
                     <ArrowLeft className="w-4 h-4" />
                     Back to Catalog
                  </Link>
                  <Link
                     to="/"
                     className="px-10 py-5 border-2 border-artisan-light/10 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-artisan-light/5 transition-all flex items-center justify-center text-xs"
                  >
                     Home Page
                  </Link>
               </motion.div>
            </div>
         </div>

         {/* Decorative Corners */}
         <div className="absolute top-8 left-8 w-16 h-16 border-t border-l border-artisan-light/10 pointer-events-none" />
         <div className="absolute top-8 right-8 w-16 h-16 border-t border-r border-artisan-light/10 pointer-events-none" />
         <div className="absolute bottom-8 left-8 w-16 h-16 border-b border-l border-artisan-light/10 pointer-events-none" />
         <div className="absolute bottom-8 right-8 w-16 h-16 border-b border-r border-artisan-light/10 pointer-events-none" />
      </div>
   )
}
