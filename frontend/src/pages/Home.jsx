import Hero from '../components/landing/Hero'
import Stats from '../components/landing/Stats'
import HowItWorks from '../components/landing/HowItWorks'
import FeaturedTools from '../components/landing/FeaturedTools'
import Categories from '../components/landing/Categories'
import Testimonials from '../components/landing/Testimonials'
import CTA from '../components/landing/CTA'

export default function Home() {
  return (
    <>
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
