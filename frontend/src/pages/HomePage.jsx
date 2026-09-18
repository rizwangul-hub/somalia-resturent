import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Hero from '../components/home/Hero';
import FeaturedMenuPreview from '../components/home/FeaturedMenuPreview';
import AboutSection from '../components/home/AboutSection';
import ContactSection from '../components/home/ContactSection';

export default function HomePage() {
  useDocumentTitle('AFLAX Restaurant — Cunto Macaan & Adeeg Hufan');
  return (
    <>
      <Hero />
      <FeaturedMenuPreview />
      <AboutSection />
      <ContactSection />
    </>
  );
}
