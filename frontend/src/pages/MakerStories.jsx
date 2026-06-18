import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, User, RefreshCcw, BookOpen } from 'lucide-react'
import api from '../services/api'

export default function MakerStories() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        const res = await api.get('/content?type=story')
        setStories(res.data.data)
      } catch (err) {
        console.error('Failed to fetch stories', err)
      } finally {
        setLoading(false)
      }
    }
    fetchStories()
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
              The Journal
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl lg:text-[10rem] font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
            >
              MAKER <br />
              <span className="text-outline">STORIES.</span>
            </motion.h1>
          </div>
        </header>

        {/* STORIES GRID */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-6">
            <RefreshCcw className="w-12 h-12 text-artisan-grey animate-spin" />
            <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest text-center">Opening the Archives...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="py-32 border-2 border-dashed border-artisan-light/10 flex flex-col items-center justify-center space-y-6">
            <BookOpen className="w-16 h-16 text-artisan-light/5" />
            <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No chronicles recorded in the journal yet</p>
          </div>
        ) : (
          <div className="space-y-32">
            {stories.map((story, idx) => (
              <motion.article
                key={story._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center ${idx % 2 !== 0 ? 'lg:direction-rtl' : ''}`}
              >
                <Link to={`/story/${story._id}`} className="lg:col-span-7 overflow-hidden bg-artisan-light/5">
                  <img
                    src={story.image && story.image !== 'no-photo.jpg' ? story.image : `https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800`}
                    alt={story.title}
                    className="w-full h-[500px] object-cover grayscale hover:grayscale-0 hover:scale-105 transition-all duration-1000"
                  />
                </Link>
                <div className="lg:col-span-5 space-y-8">
                  <div className="flex items-center gap-6 text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-artisan-grey" />
                      {story.author || 'Collective'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-artisan-grey" />
                      {new Date(story.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter text-artisan-light leading-tight">
                    {story.title}
                  </h2>
                  <p className="text-lg text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed line-clamp-4">
                    {story.content}
                  </p>
                  <Link to={`/story/${story._id}`} className="inline-flex items-center gap-4 text-xs font-mono font-bold text-artisan-grey uppercase tracking-widest group border-b border-artisan-grey/20 pb-2">
                    Read Full Chronicle <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
