import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  Image as ImageIcon,
  ChevronRight,
  Search,
  RefreshCcw,
  Users,
  BookOpen,
  Newspaper,
  ArrowLeft
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function AdminContent() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState([])
  const [activeTab, setActiveTab] = useState('maker') // maker, story, press
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [search, setSearch] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    type: 'maker',
    title: '',
    subtitle: '',
    content: '',
    image: '',
    author: '',
    isPublished: true
  })

  const fetchContent = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/content')
      setContent(res.data.data)
    } catch (err) {
      addToast('Failed to fetch guild records', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedItem) {
        await api.put(`/admin/content/${selectedItem._id}`, formData)
        addToast('Record synchronized successfully', 'success')
      } else {
        await api.post('/admin/content', formData)
        addToast('New record published to the guild', 'success')
      }
      setShowModal(false)
      setSelectedItem(null)
      setFormData({
        type: activeTab,
        title: '',
        subtitle: '',
        content: '',
        image: '',
        author: '',
        isPublished: true
      })
      fetchContent()
    } catch (err) {
      addToast('Failed to commit record to ledger', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to expunge this record?')) return
    try {
      await api.delete(`/admin/content/${id}`)
      addToast('Record expunged from ledger', 'success')
      fetchContent()
    } catch (err) {
      addToast('Failed to delete record', 'error')
    }
  }

  const openEdit = (item) => {
    setSelectedItem(item)
    setFormData({
      type: item.type,
      title: item.title,
      subtitle: item.subtitle || '',
      content: item.content,
      image: item.image || '',
      author: item.author || '',
      isPublished: item.isPublished
    })
    setShowModal(true)
  }

  const filteredContent = content.filter(item => 
    item.type === activeTab && 
    (item.title.toLowerCase().includes(search.toLowerCase()) || 
     item.content.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24">
      <div className="container-custom">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
          <div className="space-y-6">
            <Link to="/admin" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">Return to Dashboard</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                GUILD <span className="text-outline">PRESS.</span>
              </h1>
              <p className="text-[11px] font-mono text-artisan-light/20 uppercase tracking-[0.5em] pl-2">Publishing & Content Management System</p>
            </div>
          </div>

          <button 
            onClick={() => {
              setSelectedItem(null)
              setFormData({ ...formData, type: activeTab })
              setShowModal(true)
            }}
            className="px-12 py-6 bg-artisan-grey text-artisan-dark font-display font-black text-sm uppercase tracking-widest hover:bg-artisan-light transition-all flex items-center gap-4 group"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            NEW PUBLICATION
          </button>
        </div>

        {/* CMS HUD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* NAVIGATION SIDEBAR */}
          <div className="lg:col-span-3 space-y-4">
            {[
              { id: 'maker', label: 'Our Makers', icon: Users },
              { id: 'story', label: 'Maker Stories', icon: BookOpen },
              { id: 'press', label: 'Press Room', icon: Newspaper },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-6 border-l-4 flex items-center justify-between group transition-all ${
                  activeTab === tab.id 
                  ? 'border-artisan-grey bg-artisan-light/5 text-artisan-light' 
                  : 'border-transparent bg-artisan-light/[0.02] text-artisan-light/20 hover:text-artisan-light/40'
                }`}
              >
                <div className="flex items-center gap-4">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-artisan-grey' : 'text-artisan-light/10'}`} />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest">{tab.label}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'translate-x-0' : '-translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </button>
            ))}
          </div>

          {/* CONTENT FEED */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* SEARCH BAR */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
              </div>
              <input 
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="SEARCH PUBLICATIONS BY TITLE OR KEYWORD..."
                className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 py-6 pl-16 pr-8 text-[11px] font-mono text-artisan-light uppercase tracking-widest focus:border-artisan-grey transition-all outline-none"
              />
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="py-32 flex flex-col items-center justify-center space-y-6">
                  <RefreshCcw className="w-12 h-12 text-artisan-grey animate-spin" />
                  <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Accessing Guild Archives...</p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="py-32 border-2 border-dashed border-artisan-light/10 flex flex-col items-center justify-center space-y-6">
                  <FileText className="w-16 h-16 text-artisan-light/5" />
                  <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No records found for this sector</p>
                </div>
              ) : (
                filteredContent.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    className="p-8 bg-artisan-light/[0.02] border border-artisan-light/10 group hover:border-artisan-grey/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="w-full md:w-48 h-32 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700">
                        {item.image && item.image !== 'no-photo.jpg' ? (
                          <img src={item.image} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-artisan-light/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isPublished ? 'bg-green-500' : 'bg-artisan-grey/20'}`} />
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${item.isPublished ? 'text-green-500' : 'text-artisan-light/20'}`}>
                              {item.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEdit(item)}
                              className="p-2 text-artisan-light/40 hover:text-artisan-light transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-artisan-light/40 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-display font-black text-artisan-light uppercase tracking-tight">{item.title}</h3>
                          <p className="text-[10px] font-mono text-artisan-light/40 uppercase mt-1 tracking-widest">{item.subtitle}</p>
                        </div>
                        <p className="text-[11px] text-artisan-light/60 line-clamp-2">{item.content}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-artisan-light/5">
                          <span className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-widest">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          {item.author && (
                            <span className="text-[9px] font-mono text-artisan-grey uppercase tracking-widest">By {item.author}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* PUBLICATION MODAL */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="absolute inset-0 bg-artisan-dark/95 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl bg-artisan-dark border-2 border-artisan-light/10 p-12 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              >
                <div className="flex justify-between items-center mb-12">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-artisan-grey font-bold uppercase tracking-[0.4em]">Drafting Room</span>
                    <h2 className="text-4xl font-display font-black text-artisan-light uppercase tracking-tighter">
                      {selectedItem ? 'EDIT RECORD' : 'NEW PUBLICATION'}
                    </h2>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-4 bg-artisan-light/5 hover:bg-artisan-light/10 transition-all">
                    <XCircle className="w-6 h-6 text-artisan-light/40" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Content Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all appearance-none"
                      >
                        <option value="maker">Our Makers</option>
                        <option value="story">Maker Stories</option>
                        <option value="press">Press Room</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Publication Status</label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isPublished: true})}
                          className={`flex-1 p-6 border-2 font-mono text-[10px] tracking-widest transition-all ${formData.isPublished ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-artisan-light/10 text-artisan-light/20'}`}
                        >
                          PUBLISHED
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isPublished: false})}
                          className={`flex-1 p-6 border-2 font-mono text-[10px] tracking-widest transition-all ${!formData.isPublished ? 'border-artisan-grey bg-artisan-grey/10 text-artisan-grey' : 'border-artisan-light/10 text-artisan-light/20'}`}
                        >
                          DRAFT
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Publication Title</label>
                    <input 
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="ENTER AUTHORITATIVE TITLE..."
                      className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-8 text-xl font-display font-black text-artisan-light uppercase tracking-tight outline-none focus:border-artisan-grey transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Subtitle / Teaser</label>
                    <input 
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      placeholder="ENTER SUBTITLE OR TEASER..."
                      className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Main Content</label>
                    <textarea 
                      required
                      rows={10}
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      placeholder="UNLEASH THE NARRATIVE..."
                      className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-8 text-sm text-artisan-light/80 outline-none focus:border-artisan-grey transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Author Identity</label>
                      <input 
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        placeholder="ENTER AUTHOR NAME..."
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Image Source (URL)</label>
                      <input 
                        type="text"
                        value={formData.image}
                        onChange={(e) => setFormData({...formData, image: e.target.value})}
                        placeholder="ENTER HIGH-RES IMAGE URL..."
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-10 bg-artisan-grey text-artisan-dark font-display font-black text-xl uppercase tracking-[0.2em] hover:bg-artisan-light transition-all flex items-center justify-center gap-6 group"
                  >
                    <CheckCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
                    {selectedItem ? 'COMMIT CHANGES' : 'PUBLISH TO GUILD'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
