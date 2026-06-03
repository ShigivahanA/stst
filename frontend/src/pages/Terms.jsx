import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Scale, Shield, AlertTriangle, FileText, ChevronRight, Mail, MapPin, Globe, CheckSquare } from 'lucide-react'

export default function Terms() {
  const [activeSection, setActiveSection] = useState('intro')

  const sections = [
    { id: 'intro', label: 'Overview' },
    { id: 'about', label: 'About Us' },
    { id: 'use', label: 'Terms of Use' },
    { id: 'liability', label: 'Liability & Indemnity' },
    { id: 'disclaimer', label: 'Disclaimers' },
    { id: 'common', label: 'Common Provisions' },
    { id: 'surviving', label: 'Surviving Provisions' }
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200
      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 120,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] }
    }
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 relative">
      {/* Background Graphic Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-artisan-grey/5 blur-[140px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />

        {/* Abstract structural grid */}
        <svg className="absolute -top-20 -left-20 w-[500px] h-[500px] text-artisan-grey/5" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 6" />
          <motion.circle
            cx="100"
            cy="100"
            r="70"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="6 12"
            animate={{ rotate: -360 }}
            transition={{ duration: 50, ease: "linear", repeat: Infinity }}
          />
        </svg>
      </div>

      <div className="container-custom relative z-10">

        {/* HERO HEADER */}
        <header className="mb-16 border-b border-artisan-light/10 pb-12">
          <div className="max-w-4xl space-y-6">

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.9] text-artisan-light">
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  TERMS &
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline"
                >
                  CONDITIONS.
                </motion.span>
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-xs font-mono text-artisan-light/50 uppercase tracking-widest pt-2"
            >
              <span>Effective Date: 3 March 2026</span>
              <span className="hidden sm:inline">/</span>
              <span>STAT SURGICAL SUPPLIES</span>
            </motion.div>
          </div>
        </header>

        {/* TWO COLUMN CONTENT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* LEFT COLUMN: STICKY NAVIGATION */}
          <aside className="lg:col-span-3 hidden lg:block sticky top-32 h-fit">
            <div className="space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-widest block">Document Sections</span>
                <div className="h-0.5 bg-artisan-light/10 w-12" />
              </div>
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-3"
              >
                {sections.map((section) => (
                  <motion.button
                    variants={itemVariants}
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`text-left text-xs font-display font-bold uppercase tracking-wider py-1.5 transition-all duration-300 border-l-2 pl-4 hover:text-artisan-grey hover:border-artisan-grey/50 ${activeSection === section.id
                        ? 'border-artisan-grey text-artisan-grey pl-6'
                        : 'border-artisan-light/10 text-artisan-light/50'
                      }`}
                  >
                    {section.label}
                  </motion.button>
                ))}
              </motion.nav>
            </div>
          </aside>

          {/* RIGHT COLUMN: DETAILED LAW TEXT */}
          <main className="lg:col-span-9 space-y-20 font-body text-artisan-light/70 text-sm sm:text-base leading-relaxed">

            {/* OVERVIEW */}
            <motion.section
              id="intro"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 01 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Overview</h2>
              <p>
                This document governs:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>the use of our website, and</li>
                <li>any other related agreement or legal relationship with us</li>
              </ul>
              <p>
                in a legally binding way. You must read this document carefully.
              </p>
            </motion.section>

            {/* ABOUT US */}
            <motion.section
              id="about"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 02 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">About Us</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-artisan-light/10 p-6 bg-artisan-light/[0.01]">
                  <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-2">Company Name</strong>
                  <p className="text-base text-artisan-light font-display font-extrabold uppercase">STAT Surgical Supplies</p>
                  <p className="text-xs text-artisan-light/40 mt-1">Proprietorship structure</p>
                </div>

                <div className="border border-artisan-light/10 p-6 bg-artisan-light/[0.01]">
                  <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-2">Proprietor</strong>
                  <p className="text-base text-artisan-light font-display font-extrabold uppercase">Mrs. Shanmuga Priya</p>
                  <p className="text-xs text-artisan-light/40 mt-1">Authorized representative</p>
                </div>

                <div className="border border-artisan-light/10 p-6 bg-artisan-light/[0.01] flex items-start gap-4">
                  <div className="w-8 h-8 border border-artisan-light/15 flex items-center justify-center text-artisan-grey shrink-0 mt-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-1">Address</strong>
                    <p className="text-sm text-artisan-light/80">9/330, Nethaji Street, Karnan Nagar, Polichalur, Chennai 600074, Tamil Nadu, India</p>
                  </div>
                </div>

                <a
                  href="mailto:statsurgicalsupplies@gmail.com"
                  className="border border-artisan-light/10 p-6 bg-artisan-light/[0.01] flex items-start gap-4 hover:border-artisan-grey hover:bg-artisan-light/[0.02] transition-colors group"
                >
                  <div className="w-8 h-8 border border-artisan-light/15 flex items-center justify-center text-artisan-grey shrink-0 mt-1 group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-colors duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-1">Email Contact</strong>
                    <p className="text-sm font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors duration-300">statsurgicalsupplies@gmail.com</p>
                  </div>
                </a>
              </div>
            </motion.section>

            {/* TERMS OF USE */}
            <motion.section
              id="use"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 03 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Terms of Use</h2>
              <p>
                Unless stated otherwise, the terms in this section apply generally when using our website. Specific or additional conditions may apply in certain situations and are noted in this document.
              </p>

              <div className="space-y-4 border-l-2 border-artisan-grey pl-6 py-2">
                <h4 className="font-display font-extrabold uppercase text-artisan-light">By using our website, you confirm the following:</h4>
                <ul className="space-y-3 pl-2">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 border border-artisan-light/15 flex items-center justify-center text-xs text-artisan-grey font-mono shrink-0">1</span>
                    <span className="text-sm sm:text-base">You are older than 18 years of age.</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 border border-artisan-light/15 flex items-center justify-center text-xs text-artisan-grey font-mono shrink-0">2</span>
                    <span className="text-sm sm:text-base">You are not in a country under the Indian Government embargo.</span>
                  </li>
                </ul>
              </div>
            </motion.section>

            {/* LIABILITY & INDEMNIFICATION */}
            <motion.section
              id="liability"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 04 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Liability & Indemnification</h2>
              <p>
                We limit our liability as much as legally allowed when executing agreements with you. This means our responsibility for damages is reduced to the maximum extent permitted by law unless explicitly stated otherwise or agreed upon with you.
              </p>

              <div className="space-y-6">
                <div className="space-y-3 border-l-2 border-artisan-grey pl-6 py-1">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Indemnification</h3>
                  <p className="text-sm sm:text-base">
                    You agree to indemnify us and our affiliates, officers, directors, and employees from any claims or demands made by third parties due to or in connection with any culpable violation of these terms or third-party rights related to your use of the service to the extent allowed by law.
                  </p>
                </div>

                <div className="space-y-4 border-l-2 border-artisan-grey pl-6 py-1">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Limitation of Liability</h3>
                  <p>
                    Unless explicitly stated otherwise and subject to applicable law, you cannot claim damages against us (or any individual or entity acting on our behalf).
                  </p>
                  <p>
                    However, this exclusion does not apply to damages affecting life, health, or physical integrity, damages arising from the breach of significant contractual obligations (such as those necessary to fulfill the contract's purpose), and/or damages resulting from intentional or gross negligence, provided that our website has been used appropriately and correctly by you.
                  </p>
                  <p>
                    Unless damages stem from intentional or gross negligence, or they impact life, health, or physical integrity, our liability is limited to typical and foreseeable damages at the time the contract was entered into.
                  </p>

                  <div className="space-y-4 pt-4">
                    <p className="font-mono text-xs uppercase tracking-wider text-artisan-light/60">
                      To the maximum extent permitted by applicable law, in no event shall we, along with our subsidiaries, affiliates, officers, directors, agents, partners, suppliers, or employees, be liable for:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm pl-2 text-artisan-light/60 leading-relaxed">
                      <li>Any indirect, punitive, incidental, special, consequential, or exemplary damages, including loss of profits, goodwill, data, or other intangible losses;</li>
                      <li>Any damage, loss, or injury resulting from hacking, tampering, or unauthorized access to your account or the information within it;</li>
                      <li>Errors, mistakes, or inaccuracies in the content provided;</li>
                      <li>Personal injury or property damage resulting from your use of the service;</li>
                      <li>Unauthorized access to our secure servers and/or personal information stored therein;</li>
                      <li>Interruption or cessation of transmission to or from the service;</li>
                      <li>Bugs, viruses, trojan horses, or similar harmful elements transmitted through the service;</li>
                      <li>Errors or omissions in any content posted, transmitted, or made available through the service;</li>
                      <li>Defamatory, offensive, or illegal conduct of any user or third party.</li>
                    </ul>
                    <p className="border-t border-artisan-light/10 pt-4 text-xs font-mono text-artisan-grey font-bold uppercase tracking-wider">
                      Our liability is limited to the amount you have paid us in the preceding 12 months, or the duration of your agreement with us, whichever is shorter.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* DISCLAIMER OF WARRANTIES */}
            <motion.section
              id="disclaimer"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 05 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Disclaimer of Warranties</h2>
              <div className="space-y-4">
                <p>
                  Our website is provided on an "as is" and "as available" basis. When you use our service, you are doing so at your own risk. We explicitly state that we are not making any promises or guarantees, whether they are express, implied, or even required by law. These include assurances about the quality of the service, its suitability for your specific needs, or whether it infringes on anyone else's rights. Please keep in mind that any advice or information you receive from us or through our service does not create any warranties beyond what we have explicitly stated here.
                </p>
                <p>
                  Additionally, while we strive to provide accurate and reliable content, we cannot guarantee that it is always going to be the case. We do not guarantee that the service will always meet your requirements or be available when you need it. There might be interruptions, or it might not function correctly due to factors beyond our control. While we do our best to keep everything running smoothly, we cannot ensure that the service will be free of harmful elements like viruses. If you choose to download any content from our service, you are assuming the risk, and we are not responsible for any damage it might cause to your devices or data.
                </p>
                <p>
                  We do not endorse or guarantee any products or services advertised through our service or any links we provide. We are not involved in any transactions between you and third-party providers, so any interactions or agreements you make with them are solely your responsibility.
                </p>
                <p>
                  Our service might not always be accessible or may not work correctly with your web browser, mobile device, or operating system. While we strive to provide a seamless experience, we cannot guarantee it in every situation. As such, we want to clarify that we cannot be held responsible for any perceived or actual damages that result from issues related to the content, operation, or use of our service.
                </p>
                <p className="border-t border-artisan-light/10 pt-4 text-xs text-artisan-light/50 font-mono uppercase tracking-wider">
                  Any disclaimers or exclusions in our agreement will only be enforced to the extent permitted by applicable law.
                </p>
              </div>
            </motion.section>

            {/* COMMON PROVISIONS */}
            <motion.section
              id="common"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 06 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Common Provisions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: 'No Waiver',
                    desc: 'Our failure to assert any right or provision under these terms does not waive that right or provision. No waiver will constitute a continuing waiver of such term.'
                  },
                  {
                    title: 'Service Interruption',
                    desc: 'We reserve the right to interrupt the service for maintenance, updates, or other changes, with appropriate notification. We may suspend or discontinue the service within legal limits.'
                  },
                  {
                    title: 'Service Reselling',
                    desc: 'You may not reproduce, duplicate, copy, sell, or exploit any part of our website or its service without our express written permission.'
                  },
                  {
                    title: 'Intellectual Property',
                    desc: 'All intellectual property rights associated with our website, including copyrights, trademarks, illustrations, images, or logos remain our exclusive property.'
                  },
                  {
                    title: 'Contract Assignment',
                    desc: 'We reserve the right to transfer, assign, dispose of by novation, or subcontract any or all rights or obligations. You cannot assign your rights without our written permission.'
                  },
                  {
                    title: 'Severability',
                    desc: 'Invalidity of any provision will not affect the validity of other provisions. Invalid provisions will be interpreted or replaced to render them valid and consistent with original intent.'
                  }
                ].map((prov, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="border border-artisan-light/10 p-5 bg-artisan-light/[0.01]">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-sm mb-3">{prov.title}</h4>
                    <p className="text-xs text-artisan-light/60 leading-relaxed">{prov.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4 border-t border-artisan-light/10 pt-6">
                <div className="space-y-3">
                  <h4 className="font-display font-extrabold uppercase text-artisan-light text-base">Changes to the Terms</h4>
                  <p className="text-sm">
                    We reserve the right to modify these terms at any time. Informed changes only affect the relationship from the date communicated onwards. Continued use of the service signifies acceptance of the revised terms.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-display font-extrabold uppercase text-artisan-light text-base">Governing Law & Jurisdiction</h4>
                  <p className="text-sm">
                    These terms are governed by the law of the place where we are based, that is <strong>Chennai, Tamil Nadu, India</strong>. The jurisdiction over any controversy lies exclusively with the courts of Chennai.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-display font-extrabold uppercase text-artisan-light text-base">iFrames Constraint</h4>
                  <p className="text-sm">
                    Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* SURVIVING PROVISIONS */}
            <motion.section
              id="surviving"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24 border-t border-artisan-light/10 pt-8"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 07 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Surviving Provisions</h2>
              <p>
                Our agreement will continue in effect until it is terminated by either our website or you. Upon termination, the provisions contained in this document that by their context are intended to survive termination or expiration will survive, including:
              </p>

              <div className="space-y-4">
                {[
                  { label: 'License grants', val: 'Your grant of licenses under this document will survive indefinitely.' },
                  { label: 'Indemnification obligations', val: 'Your indemnification obligations will survive for a period of five years from the date of termination.' },
                  { label: 'Disclaimers & Liability limitation', val: 'The disclaimer of warranties and representations, and the stipulations under the section containing indemnity and limitation of liability provisions, will survive indefinitely.' }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 border border-artisan-light/10 bg-artisan-light/[0.01]">
                    <span className="w-6 h-6 rounded-full border border-artisan-light/10 flex items-center justify-center text-artisan-grey shrink-0 mt-0.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <h4 className="font-display font-extrabold uppercase text-artisan-light text-xs mb-1">{item.label}</h4>
                      <p className="text-xs text-artisan-light/60">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

          </main>

        </div>

      </div>
    </div>
  )
}
