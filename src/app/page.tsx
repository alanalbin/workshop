import React from 'react';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';
import HeroSection from '@/components/home/HeroSection';
import HomeExperienceManager from '@/components/home/HomeExperienceManager';
import Workshop3DStudio from '@/components/home/Workshop3DStudio';
import PartnersShowcase from '@/components/home/PartnersShowcase';
import AboutSection from '@/components/home/AboutSection';
import WorkshopStructureSection from '@/components/home/WorkshopStructureSection';
import BenefitsSection from '@/components/home/BenefitsSection';
import EventDetailsSection from '@/components/home/EventDetailsSection';
import FaqSection from '@/components/home/FaqSection';
import CtaBanner from '@/components/home/CtaBanner';
import Scroll3DPopup from '@/components/ui/Scroll3DPopup';
import ScrollFloatingPopup from '@/components/ui/ScrollFloatingPopup';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  let event = DEFAULT_EVENT_CONFIG;

  try {
    event = await DataStore.getEventConfig();
  } catch (err) {
    console.warn('Failed to load event config, falling back to defaults:', err);
  }

  return (
    <div className="flex flex-col relative bg-transparent overflow-x-hidden">
      {/* 3D Beam Intro Loading Screen & Interactive 3D Quantum Cybersphere Background */}
      <HomeExperienceManager />

      {/* Hero Section */}
      <HeroSection event={event} />

      {/* Interactive 3D Workshop Innovation Studio */}
      <Scroll3DPopup delay={0.05}>
        <Workshop3DStudio />
      </Scroll3DPopup>

      {/* Institutional & Organizing Partners Showcase */}
      <Scroll3DPopup delay={0.05}>
        <PartnersShowcase />
      </Scroll3DPopup>

      {/* Workshop Narrative & Mission */}
      <Scroll3DPopup delay={0.05}>
        <AboutSection />
      </Scroll3DPopup>

      {/* Six-Hour Detailed Curriculum Breakdown */}
      <Scroll3DPopup delay={0.05}>
        <WorkshopStructureSection />
      </Scroll3DPopup>

      {/* Verified Participant Takeaways & Benefits */}
      <Scroll3DPopup delay={0.05}>
        <BenefitsSection benefits={event.benefits} />
      </Scroll3DPopup>

      {/* Schedule, Pricing Transparency & Venue Logistics */}
      <Scroll3DPopup delay={0.05}>
        <EventDetailsSection event={event} />
      </Scroll3DPopup>


      {/* Detailed FAQs addressing Student & Faculty inquiries */}
      <Scroll3DPopup delay={0.05}>
        <FaqSection faq={event.faq} />
      </Scroll3DPopup>

      {/* Final Action Banner */}
      <Scroll3DPopup delay={0.05}>
        <CtaBanner fee={event.registrationFee} registrationsClosed={event.registrationsClosed} />
      </Scroll3DPopup>

      {/* Interactive Floating Scroll Pop-up Banner */}
      <ScrollFloatingPopup fee={event.registrationFee} registrationsClosed={event.registrationsClosed} />
    </div>
  );
}
