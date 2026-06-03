import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, ExternalLink, RefreshCcw, Newspaper } from 'lucide-react'
import api from '../services/api'

export default function PressRoom() {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true)
        const res = await api.get('/content?type=press')
        setReleases(res.data.data)
      } catch (err) {
        console.error('Failed to fetch releases', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReleases()
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
              Media Center
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
            >
              PRESS <br />
              <span className="text-outline">ROOM.</span>
            </motion.h1>
          </div>
        </header>

        {/* RELEASES LIST */}
        <div className="space-y-4">
          <div className="hidden md:grid grid-cols-12 gap-8 px-8 py-4 border-b border-artisan-light/10 text-[8px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.4em]">
            <div className="col-span-2">Date</div>
            <div className="col-span-8">Release Title</div>
            <div className="col-span-2 text-right">Resource</div>
          </div>

          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center space-y-6">
              <RefreshCcw className="w-12 h-12 text-artisan-grey animate-spin" />
              <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest text-center">Syncing Media Ledger...</p>
            </div>
          ) : releases.length === 0 ? (
            <div className="py-32 border-2 border-dashed border-artisan-light/10 flex flex-col items-center justify-center space-y-6">
              <Newspaper className="w-16 h-16 text-artisan-light/5" />
              <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No press releases recorded in the archives</p>
            </div>
          ) : (
            <div className="space-y-px bg-artisan-light/5 border border-artisan-light/5">
              {releases.map((item, idx) => (
                <div key={item._id} className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-artisan-dark p-8 md:px-8 md:py-10 group hover:bg-artisan-light/[0.02] transition-all items-center">
                  <div className="col-span-2 text-[10px] font-mono font-bold text-artisan-light/40">
                    {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="col-span-8 space-y-2">
                    <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">{item.subtitle || 'General'}</span>
                    <h3 className="text-xl md:text-2xl font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors leading-tight">
                      {item.title}
                    </h3>
                  </div>
                  <div className="col-span-2 flex justify-end gap-4">
                    <button title="Read Release" className="w-12 h-12 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-grey hover:text-artisan-dark transition-all">
                      <ExternalLink className="w-5 h-5" />
                    </button>
                    <button title="Download Assets" className="w-12 h-12 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light hover:text-artisan-dark transition-all">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
