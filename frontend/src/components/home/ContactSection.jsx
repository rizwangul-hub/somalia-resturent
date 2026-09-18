import React, { useState, useEffect } from 'react';
import { settingsService } from '../../services/api';

export default function ContactSection() {
  const [settings, setSettings] = useState({
    restaurantName: 'AFLAX Restaurant',
    phone: '61 0723233',
    whatsapp: '+252771989981',
    location: 'Degmada Yaqshiid, Somalia',
  });

  useEffect(() => {
    let isMounted = true;
    settingsService
      .getPublicSettings()
      .then((res) => {
        if (isMounted && res && res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch((err) => {
        // Graceful fallback to default values without breaking UI
        console.warn('Could not load public settings:', err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const cleanWhatsApp = (settings.whatsapp || '+252771989981').replace(/[^0-9]/g, '');
  const cleanPhone = (settings.phone || '61 0723233').replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="contact-section-luxury">
      <div className="container">
        <div className="section-title">
          <span className="section-badge-gold">NALA SOO XIRIIR</span>
          <h2>{settings.restaurantName || 'AFLAX Restaurant'}</h2>
          <p>Waxaan diyaar u nahay inaan kugu adeegno farxad iyo kalgacal. Noo kaalay ama toos noola soo xiriir.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <div className="contact-icon">📍</div>
            <h3>Goobta Maqaayadda</h3>
            <p>
              {settings.location || 'Degmada Yaqshiid, Somalia'}
              <br />
              <strong>Muqdisho, Soomaaliya</strong>
            </p>
            <span className="contact-meta">U dhow wadada weyn</span>
          </div>

          <div className="contact-card">
            <div className="contact-icon">📞</div>
            <h3>Wac Telefoonka</h3>
            <p>
              <a href={`tel:${cleanPhone}`} className="contact-highlight-link">{settings.phone || '61 0723233'}</a>
              <br />
              Furan maalin kasta 07:00 AM - 11:00 PM
            </p>
            <span className="contact-meta">Adeeg degdeg ah</span>
          </div>

          <div className="contact-card whatsapp-featured-card">
            <div className="contact-icon">💬</div>
            <h3>Dalabka WhatsApp</h3>
            <p>
              Fariin toos ah noo soo dir ama ku dalbo
              <br />
              <strong className="wa-number">{settings.whatsapp || '+252 77 1989981'}</strong>
            </p>
            <a
              href={`https://wa.me/${cleanWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-btn"
            >
              <span>💬</span> La Hadal WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
