import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section id="about" className="about-luxury-section">
      <div className="container">
        <div className="about-luxury-grid">
          {/* Left: Restaurant Story & Values */}
          <div className="about-story-col">
            <div className="section-eyebrow">
              <span className="eyebrow-pill">KU SAABSAN MAQAAYADDA</span>
            </div>

            <h2 className="about-heading">
              Khibrad Cunto Oo Gaar Ah &amp; <br />
              <span className="gold-text">Soo Dhawayn Soomaaliyeed</span>
            </h2>

            <p className="about-lead">
              <strong>AFLAX Restaurant</strong> waxa uu ku yaallaa Degmada Yaqshiid, Muqdisho.
              Waxaan u taagannahay inaan macaamiisheena u soo bandhigno cuntooyin dhadhan
              leh oo nadaafadooda iyo tayadooda heer sare laga dhigay.
            </p>

            <p className="about-subtext">
              Laga bilaabo cuntooyinka dhaqanka Soomaaliyeed, Fast Food-ka macaan,
              ilaa cabitaannada dabiiciga ah iyo noocyada kala duwan ee Espresso-ga casriga ah,
              waxaad AFLAX ka helaysaa meel degan oo ku habboon adiga, qoyskaaga iyo asxaabtaada.
            </p>

            {/* Value Highlights Grid */}
            <div className="about-pillars-grid">
              <div className="pillar-item">
                <div className="pillar-icon">🍲</div>
                <div className="pillar-info">
                  <h4>Dhadhan Dhab Ah</h4>
                  <p>Cuntooyin cusub oo maalin kasta lagu karsado maaddooyin tayo leh.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">⚡</div>
                <div className="pillar-info">
                  <h4>Adeeg Degdeg Ah</h4>
                  <p>Dalabkaaga waxaa lagu diyaarinayaa waqti kooban oo hufan.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">🌿</div>
                <div className="pillar-info">
                  <h4>Nadaafad La Hubo</h4>
                  <p>Xoogga saaridda nadaafadda jikada iyo miisaska maqaayadda.</p>
                </div>
              </div>

              <div className="pillar-item">
                <div className="pillar-icon">☕</div>
                <div className="pillar-info">
                  <h4>Espresso Casri Ah</h4>
                  <p>Qaxwo, Cappuccino, Macchiato iyo cabitaanno cusub.</p>
                </div>
              </div>
            </div>

            <div className="about-cta-row">
              <Link to="/booking" className="btn-gold-glow">
                <span>📅 Dalbo Miis Hadda</span>
              </Link>
              <Link to="/menu" className="btn-glass-secondary">
                <span>🍽️ Eeg Dhammaan Menu-ga</span>
              </Link>
            </div>
          </div>

          {/* Right: Visual Showcase Card */}
          <div className="about-visual-col">
            <div className="about-showcase-card">
              <div className="showcase-card-inner">
                <div className="showcase-badge-icon">🍽️</div>
                <div className="showcase-badge-title">AFLAX RESTAURANT</div>
                <div className="showcase-badge-sub">Degmada Yaqshiid, Somalia</div>

                <div className="showcase-stats-list">
                  <div className="stat-row">
                    <span className="stat-label">Cuntooyinka Menu-ga:</span>
                    <strong className="stat-value">63+ Cunto &amp; Cabitaan</strong>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Qeybaha Cuntada:</span>
                    <strong className="stat-value">5 Qeybood Oo Kala Duwan</strong>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Dalbashada Tooska ah:</span>
                    <strong className="stat-value">WhatsApp (+252 77 1989981)</strong>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Waqtiga Adeegga:</span>
                    <strong className="stat-value">Maalin Walba Furan</strong>
                  </div>
                </div>

                <div className="showcase-quote">
                  "Ujeedkayagu waa in qof kasta oo yimaada AFLAX uu ku raaxaysto cunto macaan iyo jawi soo dhawayn leh."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

