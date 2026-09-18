import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('AFLAX Restaurant — Bogga Lama Helin (404)');

  return (
    <section className="not-found-section" style={{ minHeight: '65vh', display: 'flex', alignItems: 'center', padding: '60px 20px' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div className="page-placeholder" style={{ padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }} role="img" aria-label="Saxan madhan">
            🍽️
          </div>
          <h1 style={{ fontSize: '72px', color: '#ff6b00', fontWeight: '800', lineHeight: 1, margin: '0 0 16px 0' }}>
            404
          </h1>
          <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>
            Bogga Aad Raadinayso Lama Helin
          </h2>
          <p style={{ color: '#aaa', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
            Waxaa laga yaabaa in cinwaanka aad gelisay uu khaldan yahay, ama boggan la beddelay.
            Fadlan ku noqo bogga hore ama eeg menu-ga maqaayadda AFLAX.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="hero-btn primary" aria-label="Ku noqo bogga hore ee AFLAX Restaurant">
              🏠 Ku Noqo Bogga Hore
            </Link>
            <Link to="/menu" className="hero-btn secondary" aria-label="Eeg menu-ga cuntada ee AFLAX Restaurant">
              🍽️ Eeg Menu-ga
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

