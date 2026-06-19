import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import HowItWorks from '../components/landing/HowItWorks'
import FeaturedTools from '../components/landing/FeaturedTools'
import Categories from '../components/landing/Categories'
import Testimonials from '../components/landing/Testimonials'
import CTA from '../components/landing/CTA'
import SEO from '../components/SEO'

export default function Home() {
  return (
    <>
      <SEO
        title="Premium Surgical & Medical Supplies"
        description="Stat Surgicals is India's premier provider of clinical-grade surgical tools, medical equipment, and diagnostics. Serving hospitals and clinics with certified reliability."
        keywords={['surgical tools', 'medical instruments', 'surgical supplies', 'medical equipment India', 'rehabilitation tools', 'diagnostic tools']}
        canonicalPath="/"
      />
      <Hero />
      <Stats />
      <Categories />
      <FeaturedTools />
      {/* <HowItWorks /> */}
      <Testimonials />
      <CTA />
    </>
  )
}
