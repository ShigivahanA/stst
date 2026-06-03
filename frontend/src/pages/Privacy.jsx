import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, FileText, ChevronRight, Mail, MapPin, Globe, ExternalLink } from 'lucide-react'

export default function Privacy() {
  const [activeSection, setActiveSection] = useState('intro')

  const sections = [
    { id: 'intro', label: 'Overview' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'data-collection', label: 'Data Collection' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'use-data', label: 'Use of Data' },
    { id: 'retention-transfer', label: 'Retention & Transfer' },
    { id: 'disclosure-security', label: 'Disclosure & Security' },
    { id: 'other-policies', label: 'Other Policies' },
    { id: 'contact', label: 'Contact Us' }
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
            animate={{ rotate: 360 }}
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
                  PRIVACY
                </motion.span>
              </span>
              <span className="overflow-hidden block">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-outline animate-pulse"
                >
                  POLICY.
                </motion.span>
              </span>
            </h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 text-xs font-mono text-artisan-light/50 uppercase tracking-widest pt-2"
            >
              <span>Last updated: 3 March 2026</span>
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
                This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
              </p>
              <p>
                We use Your Personal data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </motion.section>

            {/* INTERPRETATION & DEFINITIONS */}
            <motion.section
              id="definitions"
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Interpretation & Definitions</h2>

              <div className="space-y-4">
                <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Interpretation</h3>
                <p>
                  The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Definitions</h3>
                <p className="mb-4">For the purposes of this Privacy Policy:</p>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="grid grid-cols-1 gap-4"
                >
                  {[
                    { term: 'Account', def: 'means a unique account created for You to access our Service or parts of our Service.' },
                    { term: 'Company', def: "refers to STAT Surgical Supplies, 9/330, Nethaji Street, Karnan Nagar, Polichalur, Chennai 600074. (referred to as either 'the Company', 'We', 'Us' or 'Our' in this Agreement)" },
                    { term: 'Cookies', def: 'are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.' },
                    { term: 'Country', def: 'refers to: Tamil Nadu, India' },
                    { term: 'Device', def: 'means any device that can access the Service such as a computer, a cell phone or a digital tablet.' },
                    { term: 'Personal Data', def: 'is any information that relates to an identified or identifiable individual.' },
                    { term: 'Service', def: 'refers to the Website.' },
                    { term: 'Service Provider', def: 'means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.' },
                    { term: 'Third-party Social Media Service', def: 'refers to any website or any social network website through which a User can log in or create an account to use the Service.' },
                    { term: 'Usage Data', def: 'refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).' },
                    { term: 'Website', def: 'refers to STAT Surgical Supplies, accessible from https://www.statsurgicals.com/' },
                    { term: 'You', def: 'means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      className="border border-artisan-light/10 p-5 bg-artisan-light/[0.01] hover:border-artisan-grey/40 transition-colors duration-300"
                    >
                      <strong className="text-xs font-mono uppercase tracking-widest text-artisan-grey block mb-2">{item.term}</strong>
                      <p className="text-sm text-artisan-light/70">{item.def}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* COLLECTING AND USING YOUR DATA */}
            <motion.section
              id="data-collection"
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Collecting and Using Your Personal Data</h2>

              <div className="space-y-6">
                <div className="space-y-4 border-l-2 border-artisan-grey pl-6 py-2">
                  <h4 className="font-display font-extrabold uppercase text-artisan-light">Personal Data</h4>
                  <p>
                    While using Our Service, we may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 pl-2 font-mono text-xs uppercase tracking-wider text-artisan-light/60">
                    <li>Email address</li>
                    <li>First name and last name</li>
                    <li>Phone number</li>
                    <li>Address, State, Province, ZIP/Postal code, City</li>
                  </ul>
                </div>

                <div className="space-y-4 border-l-2 border-artisan-grey pl-6 py-2">
                  <h4 className="font-display font-extrabold uppercase text-artisan-light">Usage Data</h4>
                  <p>
                    Usage Data is collected automatically when using the Service.
                  </p>
                  <p>
                    Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                  </p>
                  <p>
                    When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                  </p>
                  <p>
                    We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* TRACKING TECHNOLOGIES AND COOKIES */}
            <motion.section
              id="cookies"
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Tracking Technologies and Cookies</h2>
              <p>
                We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:
              </p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {[
                  {
                    title: 'Cookies / Browser Cookies',
                    desc: 'A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service.'
                  },
                  {
                    title: 'Flash Cookies',
                    desc: 'Certain features of our Service may use local stored objects (or Flash Cookies) to collect and store information about Your preferences or Your activity on our Service. Flash Cookies are not managed by the same browser settings.'
                  },
                  {
                    title: 'Web Beacons',
                    desc: 'Certain sections of our Service and our emails may contain small electronic files known as web beacons (clear gifs, pixel tags, single-pixel gifs) that permit the Company to count users who have visited those pages or opened an email.'
                  }
                ].map((tech, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="border border-artisan-light/10 p-5 bg-artisan-light/[0.01]">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-sm mb-3">{tech.title}</h4>
                    <p className="text-xs text-artisan-light/60">{tech.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <p>
                Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
              </p>

              <div className="space-y-4">
                <h4 className="font-display font-extrabold uppercase text-artisan-light">We use both Session and Persistent Cookies for the purposes set out below:</h4>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-100px" }}
                  className="space-y-4"
                >
                  {[
                    {
                      name: 'Necessary / Essential Cookies',
                      type: 'Session Cookies',
                      admin: 'Us',
                      purpose: 'These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided.'
                    },
                    {
                      name: 'Cookies Policy / Notice Acceptance Cookies',
                      type: 'Persistent Cookies',
                      admin: 'Us',
                      purpose: 'These Cookies identify if users have accepted the use of cookies on the Website.'
                    },
                    {
                      name: 'Functionality Cookies',
                      type: 'Persistent Cookies',
                      admin: 'Us',
                      purpose: 'These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience.'
                    }
                  ].map((cookie, idx) => (
                    <motion.div key={idx} variants={itemVariants} className="border border-artisan-light/10 p-6 bg-artisan-light/[0.01] space-y-3">
                      <div className="flex flex-wrap items-baseline gap-3">
                        <h5 className="font-display font-extrabold uppercase text-artisan-light text-sm">{cookie.name}</h5>
                        <span className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-widest">{cookie.type}</span>
                        <span className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Administered by: {cookie.admin}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-artisan-light/60">{cookie.purpose}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.section>

            {/* USE OF YOUR PERSONAL DATA */}
            <motion.section
              id="use-data"
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Use of Your Personal Data</h2>
              <p>The Company may use Personal Data for the following purposes:</p>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  { title: 'Service Maintenance', desc: 'To provide and maintain our Service, including to monitor the usage of our Service.' },
                  { title: 'Account Management', desc: 'To manage Your Account: to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities.' },
                  { title: 'Contractual Performance', desc: 'The development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us.' },
                  { title: 'Communication Protocols', desc: 'To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as push notifications regarding updates or informative communications.' },
                  { title: 'Offers & Updates', desc: 'To provide You with news, special offers and general information about other goods, services and events which we offer that are similar to those you have already purchased.' },
                  { title: 'Request Management', desc: 'To attend and manage Your requests to Us.' },
                  { title: 'Business Transfers', desc: 'To evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets.' },
                  { title: 'Data Analytics', desc: 'For data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service.' }
                ].map((item, idx) => (
                  <motion.div key={idx} variants={itemVariants} className="border border-artisan-light/10 p-5 bg-artisan-light/[0.01]">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-xs tracking-wider mb-2">{item.title}</h4>
                    <p className="text-xs text-artisan-light/60 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="space-y-4">
                <h4 className="font-display font-extrabold uppercase text-artisan-light">We may share Your personal information in the following situations:</h4>
                <div className="space-y-3 pl-4 border-l-2 border-artisan-grey">
                  <p><strong>With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.</p>
                  <p><strong>For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.</p>
                  <p><strong>With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy.</p>
                  <p><strong>With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.</p>
                  <p><strong>With other users:</strong> When You share personal information or otherwise interact in public areas, such information may be viewed by all users and may be publicly distributed outside.</p>
                  <p><strong>With Your consent:</strong> We may disclose Your personal information for any other purpose with Your consent.</p>
                </div>
              </div>
            </motion.section>

            {/* RETENTION & TRANSFER OF DATA */}
            <motion.section
              id="retention-transfer"
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
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Retention & Transfer of Your Personal Data</h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Retention of Your Personal Data</h3>
                  <p>
                    The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                  </p>
                  <p>
                    The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Transfer of Your Personal Data</h3>
                  <p>
                    Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.
                  </p>
                  <p>
                    Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
                  </p>
                  <p>
                    The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* DISCLOSURE & SECURITY OF DATA */}
            <motion.section
              id="disclosure-security"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 07 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Disclosure & Security of Your Personal Data</h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Disclosure of Your Personal Data</h3>

                  <div className="space-y-3 border-l-2 border-artisan-grey pl-6">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-sm">Business Transactions</h4>
                    <p>
                      If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
                    </p>
                  </div>

                  <div className="space-y-3 border-l-2 border-artisan-grey pl-6">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-sm">Law enforcement</h4>
                    <p>
                      Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
                    </p>
                  </div>

                  <div className="space-y-3 border-l-2 border-artisan-grey pl-6">
                    <h4 className="font-display font-extrabold uppercase text-artisan-light text-sm">Other legal requirements</h4>
                    <p>The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:</p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-xs sm:text-sm text-artisan-light/60">
                      <li>Comply with a legal obligation</li>
                      <li>Protect and defend the rights or property of the Company</li>
                      <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                      <li>Protect the personal safety of Users of the Service or the public</li>
                      <li>Protect against legal liability</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-artisan-light/5">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Security of Your Personal Data</h3>
                  <p>
                    The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* OTHER IMPORTANT POLICIES */}
            <motion.section
              id="other-policies"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8 scroll-mt-24"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 08 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Children's Privacy & Links</h2>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Children's Privacy</h3>
                  <p>
                    Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, we take steps to remove that information from Our servers.
                  </p>
                  <p>
                    If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, we may require Your parent's consent before We collect and use that information.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-artisan-light/5">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Links to Other Websites</h3>
                  <p>
                    Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, you will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
                  </p>
                  <p>
                    We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-artisan-light/5">
                  <h3 className="text-lg font-display font-extrabold uppercase text-artisan-light">Changes to this Privacy Policy</h3>
                  <p>
                    We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
                  </p>
                  <p>
                    We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
                  </p>
                  <p>
                    You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* CONTACT US */}
            <motion.section
              id="contact"
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-6 scroll-mt-24 pt-4 border-t border-artisan-light/10"
            >
              <div className="flex items-center gap-4 mb-2">
                <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-widest">[ SECTION // 09 ]</span>
                <div className="h-px bg-artisan-light/10 flex-1" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold uppercase text-artisan-light tracking-tight">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, you can contact us:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="mailto:statsurgicalsupplies@gmail.com"
                  className="flex items-center gap-4 border border-artisan-light/10 p-5 bg-artisan-light/[0.01] hover:border-artisan-grey hover:bg-artisan-light/[0.02] transition-all duration-300 group"
                >
                  <div className="w-10 h-10 border border-artisan-light/15 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-colors duration-300">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest block font-bold">Email Inquiry</span>
                    <span className="text-sm font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors duration-300">statsurgicalsupplies@gmail.com</span>
                  </div>
                </a>

                <div
                  className="flex items-center gap-4 border border-artisan-light/10 p-5 bg-artisan-light/[0.01]"
                >
                  <div className="w-10 h-10 border border-artisan-light/15 flex items-center justify-center text-artisan-grey">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest block font-bold">Corporate Office</span>
                    <span className="text-xs text-artisan-light/70 font-body">Chennai, Tamil Nadu, India</span>
                  </div>
                </div>
              </div>
            </motion.section>

          </main>

        </div>

      </div>
    </div>
  )
}
