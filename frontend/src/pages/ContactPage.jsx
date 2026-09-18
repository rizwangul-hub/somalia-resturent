import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import ContactSection from '../components/home/ContactSection';

export default function ContactPage() {
  useDocumentTitle('AFLAX Restaurant — Nala Soo Xiriir');
  return <ContactSection />;
}

