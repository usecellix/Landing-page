import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { UseCases } from '@/components/UseCases'
import { HowItWorks } from '@/components/HowItWorks'
import { TrustSection } from '@/components/TrustSection'
import { BottomCTA } from '@/components/BottomCTA'
import { Footer } from '@/components/Footer'

function App() {
  return (
    <div className="overflow-x-hidden bg-background font-sans antialiased">
      <Navbar />
      <Hero />
      <UseCases />
      <HowItWorks />
      <TrustSection />
      <BottomCTA />
      <Footer />
    </div>
  )
}

export default App
