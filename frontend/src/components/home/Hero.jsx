import React from 'react';
import { Link } from 'react-router-dom';
import heroPlatter from '../../assets/image/haaf-hilib.jpg.jpg';
import sambuusImg from '../../assets/image/Sanbuus.jpg.jpeg';
import espressoImg from '../../assets/image/Espresso.jpg.jpg';

export default function Hero() {
  return (
    <section className="hero-premium" id="home">
      <div className="hero-ambient-glow" aria-hidden="true" />

      <div className="container hero-container">
        <div className="hero-grid">
          {/* Left: Headline & Actions */}
          <div className="hero-text-col">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot" />
              <span>✦ AFLAX RESTAURANT • DEGMADA YAQSHIID</span>
            </div>

            <h1 className="hero-title">
              Dhadhan Dhab Ah &amp; <br />
              <span className="gold-gradient-text">Cuntooyin Casri Ah</span>
            </h1>

            <p className="hero-desc">
              Ku soo dhowow <strong>AFLAX Restaurant</strong>. Ku raaxayso cuntooyin
              Soomaaliyeed oo dhaqameed, cunto fudud (Fast Food), cabitaanno cusub iyo
              espresso casri ah oo lagu diyaariyey nadaafad iyo hufnaan sare.
            </p>

            <div className="hero-actions-group">
              <Link to="/menu" className="btn-gold-glow">
                <span>🍽️ Eeg Menu-ga AFLAX</span>
                <span className="btn-arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/booking" className="btn-glass-secondary">
                <span>📅 Dalbo Miiskaaga</span>
              </Link>
            </div>

            <div className="hero-quick-meta">
              <div className="quick-meta-item">
                <span className="quick-meta-icon">📍</span>
                <span>Degmada Yaqshiid, Muqdisho</span>
              </div>
              <div className="quick-meta-divider">•</div>
              <div className="quick-meta-item">
                <span className="quick-meta-icon">💬</span>
                <a
                  href="https://wa.me/252771989981"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="quick-meta-link"
                >
                  WhatsApp: +252 77 1989981
                </a>
              </div>
            </div>
          </div>

          {/* Right: Premium Food Platter Showcase */}
          <div className="hero-visual-col">
            <div className="hero-card-frame">
              <div className="hero-image-halo" aria-hidden="true" />
              <img
                src={heroPlatter}
                alt="AFLAX Restaurant Haaf Hilib & Bariis Feast"
                className="hero-main-image"
                loading="eager"
                decoding="async"
              />
              <div className="hero-dish-tag">
                <span>⭐ Cuntada Loogu Jecelyahay Yaqshiid</span>
              </div>

              {/* Floating Badge Top Right */}
              <div className="hero-floating-badge badge-top">
                <img src={sambuusImg} alt="Sambuus" className="floating-dish-thumb" />
                <div>
                  <div className="floating-badge-title">Sambuus &amp; Sheetaro</div>
                  <div className="floating-badge-subtitle">Dhadhan Dhab Ah</div>
                </div>
              </div>

              {/* Floating Badge Bottom Left */}
              <div className="hero-floating-badge badge-bottom">
                <img src={espressoImg} alt="Espresso" className="floating-dish-thumb" />
                <div>
                  <div className="floating-badge-title">Espresso &amp; Juices</div>
                  <div className="floating-badge-subtitle">Cusub Maalin Kasta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feature Pillars */}
        <div className="hero-feature-ribbon">
          <div className="ribbon-card">
            <span className="ribbon-icon">✨</span>
            <div>
              <strong>Cunto Tayo Sare Leh</strong>
              <p>Dhadhan Soomaaliyeed &amp; Fast Food</p>
            </div>
          </div>
          <div className="ribbon-card">
            <span className="ribbon-icon">⚡</span>
            <div>
              <strong>Adeeg Degdeg Ah</strong>
              <p>Diyaarinta cuntada &amp; soo dhawayn</p>
            </div>
          </div>
          <div className="ribbon-card">
            <span className="ribbon-icon">🌿</span>
            <div>
              <strong>Nadaafad La Hubo</strong>
              <p>Maaddooyin nadiif ah oo tayo leh</p>
            </div>
          </div>
          <div className="ribbon-card">
            <span className="ribbon-icon">📱</span>
            <div>
              <strong>Dalbo Toos WhatsApp</strong>
              <p>Xaqiijin degdeg ah: +252771989981</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

