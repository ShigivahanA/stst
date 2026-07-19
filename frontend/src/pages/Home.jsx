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
        title="STAT Surgicals - Premium Surgical & Medical Supplies"
        description="STAT Surgicals is India's premier provider of clinical-grade surgical tools, medical equipment, and diagnostics. Serving hospitals and clinics with certified reliability."
        keywords={[
          'surgical tools',
          'medical instruments',
          'surgical supplies',
          'medical equipment India',
          'rehabilitation tools',
          'diagnostic tools',
          'hospital supplies online',
          'buy surgical instruments India',
          'STAT Surgicals',
          'clinical equipment',
          'medical consumables',
          'orthopedic instruments',
          'respiratory support systems',
          'healthcare products Chennai',
          'diagnostic devices online',
          'OT equipment',
          'ICU monitors',
          'medical device distributor India',
          'physiotherapy supplies',
          'laboratory tools',
          'hospital furniture India',
          'neonate care equipment',
          'cardiology instruments',
          'operation theater equipment',
          'sterile surgical blades',
          'disposable medical supplies',
          'nebulizers online India',
          'wheelchairs and walkers',
          'patient monitoring systems',
          'forceps and clamps',
          'scalpels and scissors',
          'medical grade equipment',
          'wholesale surgical instruments',
          'certified medical devices',
          'healthcare procurement portal',
          'surgical gear Chennai',
          'anesthesia machines India',
          'autoclaves and sterilizers',
          'PPE kits and masks',
          'orthopedic implants India',
          'medical diagnostics distributor',
          'surgical scissors online',
          'blood pressure monitors wholesale',
          'pulse oximeters India',
          'hospital beds online'
        ]}
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
