import React from 'react';
import { Link } from 'react-router-dom';
import useApiHealth from '../../hooks/useApiHealth';

export default function Footer() {
  const { isConnected, statusMessage, loading } = useApiHealth();

  return (
    <footer className="footer-luxury">
      <div className="container footer-content-grid">
        <div className="footer-brand-col">
          <div className="footer-logo">
            AFLAX <span>RESTAURANT</span>
          </div>
          <p className="footer-tagline">
            Dhadhan dhab ah iyo soo dhawayn heer sare ah Degmada Yaqshiid, Muqdisho.
            Cuntooyin macaan, cabitaanno cusub iyo coffee casri ah.
          </p>
          <div className="footer-location-chip">
            📍 Degmada Yaqshiid, Muqdisho — Soomaaliya
          </div>
        </div>

        <div className="footer-links-col">
          <h4>Bogagga Muhiimka Ah</h4>
          <ul className="footer-nav-list">
            <li><Link to="/">Hoyga (Home)</Link></li>
            <li><Link to="/menu">Menu-ga Cuntooyinka</Link></li>
            <li><Link to="/booking">Boos Qabashada Miiska</Link></li>
            <li><Link to="/cart">Dambiisha Dalabka</Link></li>
          </ul>
        </div>

        <div className="footer-hours-col">
          <h4>Saacadaha Shaqada</h4>
          <ul className="footer-hours-list">
            <li><span>Sabti - Khamiis:</span> <strong>07:00 AM - 11:00 PM</strong></li>
            <li><span>Jimco:</span> <strong>08:00 AM - 11:00 PM</strong></li>
            <li><span>WhatsApp Dalabka:</span> <strong>24/7 Diyaar</strong></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <p className="footer-copyright">
            © {new Date().getFullYear()} AFLAX Restaurant. Xuquuqda oo dhan waa dhowran tahay. •{' '}
            <Link to="/admin" style={{ color: 'var(--text-dim)', textDecoration: 'none', transition: 'color 0.2s' }}>
              Maamulka (Admin)
            </Link>
          </p>

          {/* Backend API Connection Indicator */}
          <div className="api-status-badge" title="Backend API Communication Status">
            <span
              className={`status-dot ${loading ? 'loading' : isConnected ? 'connected' : 'disconnected'}`}
            />
            <span>
              {loading ? 'Hubinta API...' : `Backend: ${statusMessage}`}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
