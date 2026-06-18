import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Hammer, Star, RefreshCcw, Users } from 'lucide-react'
import api from '../services/api'

export default function OurMakers() {
  const [makers, setMakers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMakers = async () => {
      try {
        setLoading(true)
        const res = await api.get('/content?type=maker')
        setMakers(res.data.data)
      } catch (err) {
        console.error('Failed to fetch makers', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMakers()
  }, [])

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
              The Collective
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
            >
              OUR <br />
              <span className="text-outline">MAKERS.</span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
              Meet the master artisans sharing their expertise and equipment with the world.
            </p>
          </div>
        </header>

        {/* MAKERS GRID */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6">
            <RefreshCcw className="w-12 h-12 text-artisan-grey animate-spin" />
            <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest text-center">Syncing Collective Archives...</p>
          </div>
        ) : makers.length === 0 ? (
          <div className="py-32 border-2 border-dashed border-artisan-light/10 flex flex-col items-center justify-center space-y-6">
            <Users className="w-16 h-16 text-artisan-light/5" />
            <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No master artisans recorded in this sector</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
            {makers.map((maker, idx) => (
              <motion.div
                key={maker._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-artisan-light/[0.02] border border-artisan-light/10 p-8 space-y-8 group hover:border-artisan-grey transition-all"
              >
                <div className="relative">
                  <img
                    src={maker.image && maker.image !== 'no-photo.jpg' ? maker.image : `https://i.pravatar.cc/200?u=${maker._id}`}
                    alt={maker.title}
                    className="w-24 h-24 rounded-none grayscale group-hover:grayscale-0 transition-all duration-700 object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-artisan-grey flex items-center justify-center text-artisan-dark">
                    <Star className="w-4 h-4 fill-artisan-dark" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-display font-black text-artisan-light uppercase tracking-tight">{maker.title}</h3>
                    <div className="flex items-center gap-2 text-artisan-light/50">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[8px] font-mono uppercase tracking-widest">{maker.subtitle || 'Global Artisans'}</span>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-artisan-light/5">
                    <p className="text-[11px] text-artisan-light/60 line-clamp-3 leading-relaxed">
                      {maker.content}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">Status</span>
                      <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-widest">Master Artisan</span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-4 border border-artisan-light/10 text-xs font-mono font-bold text-artisan-light uppercase tracking-widest group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all">
                  View Workshop
                </button>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
