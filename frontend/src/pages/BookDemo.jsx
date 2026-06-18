import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, FileText, Check, ArrowRight, Building, Loader2, ArrowLeft, CheckCircle2, ChevronDown, Download, Video } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

// Predefined available time slots
const TIME_SLOTS = [
  '10:00 AM - 11:30 AM',
  '11:30 AM - 01:00 PM',
  '02:00 PM - 03:30 PM',
  '03:30 PM - 05:00 PM',
  '05:00 PM - 06:30 PM'
]

export default function BookDemo() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const initialProductId = searchParams.get('productId') || ''
  const scrollRef = useRef(null)
  const dropdownRef = useRef(null)

  // Form inputs
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [productId, setProductId] = useState(initialProductId)
  const [productName, setProductName] = useState('')
  const [notes, setNotes] = useState('')
  const [demoType, setDemoType] = useState('in-store')
  const [createdBooking, setCreatedBooking] = useState(null)

  // Appointment selections
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')

  // Loaders & metadata
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Generate next 30 days excluding Sundays
  const [selectableDates, setSelectableDates] = useState([])

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const dates = []
    const today = new Date()
    let offset = 0
    while (dates.length < 30 && offset < 45) {
      const nextDate = new Date(today)
      nextDate.setDate(today.getDate() + offset)
      // 0 is Sunday, which the store is closed on
      if (nextDate.getDay() !== 0) {
        dates.push(nextDate)
      }
      offset++
    }
    setSelectableDates(dates)
    // Select first date by default
    if (dates.length > 0) {
      setSelectedDate(dates[0])
    }
  }, [])

  // Load active product listings
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const res = await api.get('/listings')
        const items = res.data.data || []
        setProductsList(items)

        if (initialProductId) {
          const match = items.find(p => p._id === initialProductId)
          if (match) {
            setProductName(match.name)
          }
        }
      } catch (err) {
        console.error('Failed to load listings for book-demo:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [initialProductId])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim() || !selectedDate || !selectedTimeSlot) {
      addToast('Please fill all required details', 'error')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post('/bookings', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productId: productId || undefined,
        productName: productName.trim() || undefined,
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        notes: notes.trim() || undefined,
        demoType
      })
      setCreatedBooking(res.data.data)
      setIsSuccess(true)
      addToast(`${demoType === 'virtual' ? 'Virtual consultation' : 'In-store trial'} scheduled successfully!`, 'success')
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to schedule trial booking', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Format date helper
  const formatDateLabel = (date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    return {
      dayOfWeek: days[date.getDay()],
      dayNum: date.getDate(),
      month: months[date.getMonth()],
      year: date.getFullYear()
    }
  }

  // Scroll calendar helper
  const scrollCalendar = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  // Download PDF Receipt helper
  const downloadReceipt = async () => {
    const { jsPDF } = await import('jspdf')
    const appointmentId = createdBooking ? `STAT-${createdBooking._id.slice(-6).toUpperCase()}` : `STAT-${Math.floor(100000 + Math.random() * 900000)}`
    const videoLinkVal = createdBooking?.videoLink || `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`
    const currentDemoType = createdBooking?.demoType || demoType

    // Create jsPDF document instance (A4 size, portrait orientation)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    // Setup color parameters
    const primaryColor = [235, 94, 40] // #eb5e28 (Flame)
    const darkColor = [37, 36, 34]    // #252422 (Obsidian)
    const greyColor = [64, 61, 57]    // #403d39 (Charcoal)

    // Dark-themed header band
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2])
    doc.rect(0, 0, 210, 45, 'F')

    // Brand Name: STAT SURGICAL
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(26)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('STAT', 20, 26)

    doc.setFontSize(22)
    doc.setTextColor(255, 252, 242) // Warm white/cream
    doc.text('SURGICAL SUPPLIES', 48, 26)

    // Sub-header subtitle
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(204, 197, 185) // Light gray/taupe
    doc.text('VERIFIED MEDICAL SUPPLIES Inventory & clinical demo registry'.toUpperCase(), 20, 36)

    // Bold border accent divider line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(1)
    doc.line(0, 45, 210, 45)

    // Document title
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('TRIAL DEMO APPOINTMENT CONFIRMATION', 20, 60)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    doc.text(`Appointment ID: ${appointmentId}`, 20, 68)
    doc.text('Status: CONFIRMED', 145, 68)

    // Horizontal divider
    doc.setDrawColor(204, 197, 185)
    doc.setLineWidth(0.2)
    doc.line(20, 74, 190, 74)

    // 1. Client Details Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('CLIENT DETAILS', 20, 84)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text('Client Name:', 20, 92)
    doc.setFont('helvetica', 'bold')
    doc.text(name.toUpperCase(), 68, 92)

    doc.setFont('helvetica', 'normal')
    doc.text('Email Address:', 20, 99)
    doc.setFont('helvetica', 'bold')
    doc.text(email.toLowerCase(), 68, 99)

    doc.setFont('helvetica', 'normal')
    doc.text('Phone Number:', 20, 106)
    doc.setFont('helvetica', 'bold')
    doc.text(phone, 68, 106)

    // Divider line
    doc.line(20, 114, 190, 114)

    // 2. Appointment Details Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('TRIAL SCHEDULING DETAILS', 20, 124)

    doc.setFont('helvetica', 'normal')
    doc.text('Selected Equipment:', 20, 132)
    doc.setFont('helvetica', 'bold')
    doc.text(productName || 'GENERAL STORE CONSULTATION', 68, 132)

    doc.setFont('helvetica', 'normal')
    doc.text('Demo Format:', 20, 139)
    doc.setFont('helvetica', 'bold')
    doc.text(currentDemoType === 'virtual' ? 'VIRTUAL VIDEO CALL' : 'IN-STORE DEMO', 68, 139)

    doc.setFont('helvetica', 'normal')
    doc.text('Appointment Date:', 20, 146)
    doc.setFont('helvetica', 'bold')
    doc.text(selectedDate?.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase(), 68, 146)

    doc.setFont('helvetica', 'normal')
    doc.text('Time Slot Reserved:', 20, 153)
    doc.setFont('helvetica', 'bold')
    doc.text(selectedTimeSlot.toUpperCase(), 68, 153)

    // Divider line
    doc.line(20, 160, 190, 160)

    // 3. Location Details Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)

    if (currentDemoType === 'virtual') {
      doc.text('VIRTUAL CONSULTATION DETAILS', 20, 170)

      doc.setFont('helvetica', 'normal')
      doc.text('Meeting Format:', 20, 178)
      doc.setFont('helvetica', 'bold')
      doc.text('LIVE VIDEO CALL (GOOGLE MEET)', 68, 178)

      doc.setFont('helvetica', 'normal')
      doc.text('Video Meeting URL:', 20, 185)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.text(videoLinkVal, 68, 185)
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])

      doc.setFont('helvetica', 'normal')
      doc.text('Access Code:', 20, 192)
      doc.setFont('helvetica', 'bold')
      doc.text(videoLinkVal.split('/').pop(), 68, 192)
    } else {
      doc.text('STORE VISIT DETAILS', 20, 170)

      doc.setFont('helvetica', 'normal')
      doc.text('Address:', 20, 178)
      doc.setFont('helvetica', 'bold')
      doc.text('No 85, Nalla Thambi Road, Pammal, Chennai - 600075,', 68, 178)
      doc.text('Tamil Nadu, India.', 68, 184)

      doc.setFont('helvetica', 'normal')
      doc.text('Support Contacts:', 20, 191)
      doc.setFont('helvetica', 'bold')
      doc.text('+91 86086 78828  |  statsurgicalsupplies@gmail.com', 68, 191)
    }

    // Divider line
    doc.line(20, 199, 190, 199)

    // 4. Notes Details Section
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('ADDITIONAL REQUIREMENTS / NOTES', 20, 209)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(greyColor[0], greyColor[1], greyColor[2])
    const splitNotes = doc.splitTextToSize(notes || 'NONE PROVIDED.', 170)
    doc.text(splitNotes, 20, 217)

    // Warning info box background block
    doc.setFillColor(255, 252, 242)
    doc.rect(20, 246, 170, 24, 'F')

    // Warning info box border outline
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.setLineWidth(0.4)
    doc.rect(20, 246, 170, 24, 'S')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.text('IMPORTANT SCHEDULE COMPLIANCE & PROTOCOL', 25, 252)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2])
    if (currentDemoType === 'virtual') {
      doc.text('1. Please ensure your camera and microphone are working before joining.', 25, 258)
      doc.text('2. Click the Meeting URL at your selected time slot to join the session.', 25, 263)
    } else {
      doc.text('1. Please carry a printed copy or save this document locally for verification at security check-in.', 25, 258)
      doc.text('2. Appointments can be rescheduled/cancelled through the helpline at least 4 hours in advance.', 25, 263)
    }

    // Save generated PDF to client filesystem
    doc.save(`STAT_Demo_Confirmation_${appointmentId}.pdf`)
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            to={productId ? `/product/${productId}` : '/allproduct'}
            className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-grey hover:text-artisan-light transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Trial details & Store details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none text-artisan-light">
                {demoType === 'virtual' ? 'VIRTUAL' : 'IN-STORE'} <br />
                <span className="text-outline">{demoType === 'virtual' ? 'CONSULTATION.' : 'DEMO TRIAL.'}</span>
              </h1>
              <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                {demoType === 'virtual' 
                  ? 'Connect with our clinical engineers virtually. Request a live Google Meet walkthrough of patient lifts, ICU beds, or respiratory gear to inspect controls and sanitization history from your home or facility.'
                  : 'Want to test the patient lifts, diagnostics, or wheelchairs in person before completing your rental or purchase? Schedule a slot at our Chennai Pammal location to try clinical-grade products live with certified technicians.'
                }
              </p>
            </div>

            {/* Location / Video Info Box */}
            {demoType === 'virtual' ? (
              <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 space-y-4 font-mono text-[10px] uppercase tracking-widest rounded-2xl">
                <p className="border-b border-artisan-light/5 pb-2 font-bold text-artisan-grey flex items-center gap-2">
                  <Video className="w-4 h-4 text-artisan-grey" />
                  Live Video Walkthrough details
                </p>
                <p className="text-artisan-light/70 normal-case leading-relaxed">
                  Our clinical engineers will host a live Google Meet showcase, demonstrating the equipment's calibration, usage parameters, and sterilization logs in real-time.
                </p>
                <div className="pt-2 border-t border-artisan-light/5 text-[9px] text-artisan-light/40 space-y-1.5 normal-case">
                  <p>&bull; High-definition video feed of equipment controls</p>
                  <p>&bull; Live calibration & usage training session</p>
                  <p>&bull; Q&A with clinical product specialist</p>
                </div>
              </div>
            ) : (
              <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 space-y-4 font-mono text-[10px] uppercase tracking-widest rounded-2xl">
                <p className="border-b border-artisan-light/5 pb-2 font-bold text-artisan-grey flex items-center gap-2">
                  <Building className="w-4 h-4 text-artisan-grey" />
                  STAT Surgical Supplies Location
                </p>
                <p className="text-artisan-light/70 normal-case leading-relaxed">
                  No 85, Nalla Thambi Road, Pammal,<br />
                  Chennai - 600 075, Tamil Nadu, India.
                </p>
                <div className="pt-2 border-t border-artisan-light/5 text-[9px] text-artisan-light/40 space-y-1.5">
                  <p>Mon - Fri: 9:00 AM - 7:00 PM</p>
                  <p>Sat: 10:00 AM - 5:00 PM</p>
                  <p className="text-red-500 font-bold">Sun: Closed</p>
                </div>
              </div>
            )}

            {/* Technical support */}
            <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-artisan-light/50">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-artisan-grey" />
                <span>Appointment Line: +91 86086 78828</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-artisan-grey" />
                <span>Support: statsurgicalsupplies@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Scheduler Form or Success Details */}
          <div className="lg:col-span-7 bg-artisan-light/[0.01] border border-artisan-light/10 p-6 sm:p-10 shadow-2xl space-y-8 rounded-3xl min-h-[400px]">
            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-artisan-light border-b border-artisan-light/5 pb-3">
                      Select Appointment Slot
                    </h3>
                  </div>

                  {/* CHOOSE FORMAT - DUAL CARDS */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-widest block">
                      Choose Consultation Format
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDemoType('in-store')}
                        className={`p-4 border font-mono text-[10px] uppercase tracking-wider text-left transition-all flex flex-col justify-between h-24 cursor-pointer rounded-2xl ${demoType === 'in-store'
                          ? 'bg-artisan-light border-artisan-light text-artisan-dark font-black'
                          : 'bg-transparent border-artisan-light/10 text-artisan-light hover:border-artisan-light/30'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <Building className="w-5 h-5 shrink-0" />
                          {demoType === 'in-store' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="block font-bold">In-Store Demo</span>
                          <span className="block text-[7.5px] opacity-60 normal-case mt-0.5">Chennai Pammal Office</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDemoType('virtual')}
                        className={`p-4 border font-mono text-[10px] uppercase tracking-wider text-left transition-all flex flex-col justify-between h-24 cursor-pointer rounded-2xl ${demoType === 'virtual'
                          ? 'bg-artisan-light border-artisan-light text-artisan-dark font-black'
                          : 'bg-transparent border-artisan-light/10 text-artisan-light hover:border-artisan-light/30'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <Video className="w-5 h-5 shrink-0" />
                          {demoType === 'virtual' && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="block font-bold">Virtual Call</span>
                          <span className="block text-[7.5px] opacity-60 normal-case mt-0.5">Live Video Consultation</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 1. SELECT PRODUCT - CUSTOM DROPDOWN */}
                  <div className="space-y-2 relative" ref={dropdownRef}>
                    <label className="text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-widest block">
                      1. Choose Equipment for Demo
                    </label>
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-artisan-grey" />
                        <span className="text-[10px] font-mono text-artisan-light/35 uppercase">Loading catalog...</span>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-4 text-xs font-mono text-artisan-light uppercase tracking-widest text-left flex justify-between items-center rounded-xl focus:border-artisan-grey transition-all"
                        >
                          <span className="truncate pr-4">
                            {productName || '-- General Store Consultation --'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-artisan-light/40 shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 w-full mt-2 bg-artisan-dark/95 backdrop-blur-md border border-artisan-light/10 shadow-2xl rounded-2xl py-2 max-h-60 overflow-y-auto"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setProductId('')
                                  setProductName('')
                                  setIsDropdownOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 text-artisan-light/70 hover:text-artisan-light"
                              >
                                -- General Store Consultation --
                              </button>
                              {productsList.map((p) => (
                                <button
                                  key={p._id}
                                  type="button"
                                  onClick={() => {
                                    setProductId(p._id)
                                    setProductName(p.name)
                                    setIsDropdownOpen(false)
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 last:border-0 text-artisan-light/70 hover:text-artisan-light"
                                >
                                  {p.name}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>

                  {/* 2. PICK DATE */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        2. Select Date (Sundays Closed)
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => scrollCalendar('left')}
                          className="w-7 h-7 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light/5 text-artisan-light transition-colors rounded-full"
                        >
                          &lt;
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollCalendar('right')}
                          className="w-7 h-7 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light/5 text-artisan-light transition-colors rounded-full"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Calendar Row */}
                    <div
                      ref={scrollRef}
                      className="flex gap-3 overflow-x-auto pb-4 scrollbar-none snap-x"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {selectableDates.map((date, idx) => {
                        const formatted = formatDateLabel(date)
                        const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString()
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            className={`flex-shrink-0 w-20 p-3 flex flex-col items-center justify-center border font-mono tracking-wider transition-all snap-start cursor-pointer select-none rounded-2xl ${isSelected
                              ? 'bg-artisan-grey border-artisan-grey text-artisan-dark font-bold'
                              : 'bg-transparent border-artisan-light/10 text-artisan-light hover:border-artisan-light/30'
                            }`}
                          >
                            <span className="text-[9px] opacity-65 mb-1">{formatted.dayOfWeek}</span>
                            <span className="text-lg font-bold font-display tracking-tighter leading-none mb-1">{formatted.dayNum}</span>
                            <span className="text-[9px] opacity-75">{formatted.month}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 3. PICK TIME SLOT */}
                  <div className="space-y-3">
                    <label className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                      3. Select Time Slot
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot, idx) => {
                        const isSelected = selectedTimeSlot === slot
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`w-full p-4 border font-mono text-[10px] uppercase tracking-wider text-left transition-all flex items-center justify-between cursor-pointer rounded-2xl ${isSelected
                              ? 'bg-artisan-light border-artisan-light text-artisan-dark font-black'
                              : 'bg-transparent border-artisan-light/10 text-artisan-light/80 hover:border-artisan-light/30'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" />
                              {slot}
                            </span>
                            {isSelected && <Check className="w-4 h-4 text-artisan-dark" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* 4. DETAILS */}
                  <div className="space-y-6 pt-4 border-t border-artisan-light/5">
                    <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-grey">
                      4. Your Contact Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                          Full Name *
                        </label>
                        <div className="relative flex items-center">
                          <User className="absolute left-3.5 w-4 h-4 text-artisan-light/50" />
                          <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="YOUR FULL NAME"
                            required
                            className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 pl-11 pr-4 py-3.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                          Email Address *
                        </label>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3.5 w-4 h-4 text-artisan-light/50" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="EMAIL@EXAMPLE.COM"
                            required
                            className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 pl-11 pr-4 py-3.5 text-xs font-mono text-artisan-light lowercase outline-none focus:border-artisan-grey transition-all rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                          Phone Number *
                        </label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-3.5 w-4 h-4 text-artisan-light/50" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            required
                            className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 pl-11 pr-4 py-3.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                          Additional Requirements / Special Notes
                        </label>
                        <div className="relative flex items-center">
                          <FileText className="absolute left-3.5 top-4.5 w-4 h-4 text-artisan-light/50" />
                          <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="E.G. DEMO REQUIREMENT FOR MOTORIZED WHEELCHAIR WITH CUSTOM CUSHION"
                            rows={1}
                            className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 pl-11 pr-4 py-3.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all resize-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit button with single loader spinner */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full h-16 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.4em] text-[10px] hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-85 cursor-pointer rounded-full overflow-hidden"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-artisan-dark" />
                          <span>Scheduling Demo Slot...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Demo Schedule Appointment</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              ) : (
                // REDESIGNED INLINE SUCCESS COMPONENT (Renders directly within the page, keeping left info column visible)
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8 py-4"
                >
                  <div className="space-y-4 text-center">
                    <div className="w-16 h-16 bg-artisan-grey/15 border border-artisan-grey/25 text-artisan-grey flex items-center justify-center mx-auto rounded-full">
                      <CheckCircle2 className="w-8 h-8 animate-pulse text-artisan-grey" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-display font-black uppercase tracking-tight text-artisan-light">
                        Demo Booking Confirmed
                      </h3>
                      <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                        Your appointment details are registered below.
                      </p>
                    </div>
                  </div>

                  {/* Receipt Diagnostics Panel */}
                  <div className="border border-artisan-light/10 bg-artisan-light/[0.005] p-6 space-y-4 rounded-2xl">
                    <span className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
                      Booking Summary
                    </span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[10px] uppercase tracking-wider text-artisan-light/75">
                      <div>
                        <span className="text-artisan-light/50 block mb-0.5 text-[8px] tracking-widest">Client Name</span>
                        <span className="text-artisan-light font-bold truncate block">{name}</span>
                      </div>
                      <div>
                        <span className="text-artisan-light/50 block mb-0.5 text-[8px] tracking-widest">Equipment Selected</span>
                        <span className="text-artisan-light font-bold truncate block">{productName || 'General Consultation'}</span>
                      </div>
                      <div>
                        <span className="text-artisan-light/50 block mb-0.5 text-[8px] tracking-widest">Appointment Date</span>
                        <span className="text-artisan-light font-bold block">
                          {selectedDate?.toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-artisan-light/50 block mb-0.5 text-[8px] tracking-widest">Time Slot Reserved</span>
                        <span className="text-artisan-light font-bold block">{selectedTimeSlot}</span>
                      </div>
                      <div>
                        <span className="text-artisan-light/50 block mb-0.5 text-[8px] tracking-widest">Appointment Format</span>
                        <span className="text-artisan-light font-bold block">
                          {(createdBooking?.demoType || demoType) === 'virtual' ? 'VIRTUAL CALL' : 'IN-STORE DEMO'}
                        </span>
                      </div>
                      {(createdBooking?.demoType || demoType) === 'virtual' && (
                        <div className="sm:col-span-2 pt-2 border-t border-artisan-light/5">
                          <span className="text-artisan-light/50 block mb-1 text-[8px] tracking-widest">Meeting Link</span>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-artisan-light font-bold font-mono break-all text-[10px] text-[#eb5e28]">
                              {createdBooking?.videoLink || 'https://meet.google.com/xxx-xxxx-xxx'}
                            </span>
                            <a
                              href={createdBooking?.videoLink || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-artisan-light text-artisan-dark hover:bg-artisan-grey transition-all text-[9px] font-bold uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5 text-artisan-dark" />
                              Join Call
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-artisan-light/5 font-mono text-[9px] text-artisan-light/45 leading-relaxed">
                      <p className="uppercase font-bold text-artisan-light/60 mb-1">
                        {(createdBooking?.demoType || demoType) === 'virtual' ? 'Virtual Call Instructions:' : 'Store Instructions:'}
                      </p>
                      <p className="normal-case">
                        {(createdBooking?.demoType || demoType) === 'virtual'
                          ? `Please prepare your webcam and microphone. Click the Meeting URL at your selected time slot to join the session. A meeting confirmation email has been dispatched to ${email}.`
                          : `Please arrive 10 minutes prior to your time slot. An email confirmation has been dispatched to ${email}.`
                        }
                      </p>
                    </div>
                  </div>

                  {/* Buttons HUD */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={downloadReceipt}
                      className="w-full h-14 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-[9px] hover:bg-artisan-grey hover:text-artisan-dark transition-all duration-300 flex items-center justify-center gap-2 rounded-full cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-artisan-dark" />
                      Download Confirmation Receipt
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/allproduct"
                        className="h-12 border border-artisan-light/10 text-artisan-light/65 hover:text-artisan-light hover:border-artisan-light font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-full flex items-center justify-center"
                      >
                        Browse Products
                      </Link>
                      <Link
                        to="/"
                        className="h-12 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light/10 font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-full flex items-center justify-center"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
