import React from 'react';
import { Link } from 'react-router-dom';
import useMenu from '../../hooks/useMenu';
import MenuCard from '../menu/MenuCard';

/**
 * FeaturedMenuPreview Component for HomePage
 * Displays a curated sample of live menu items directly from MongoDB with link to full menu
 */
export default function FeaturedMenuPreview() {
  const { items, loading } = useMenu();

  // Pick up to 8 sample items from across the menu
  const featured = items.slice(0, 8);

  if (loading || featured.length === 0) {
    return null;
  }

  return (
    <section id="featured-menu" className="featured-menu-luxury">
      <div className="container">
        <div className="section-header-centered">
          <div className="section-eyebrow">
            <span className="eyebrow-pill">DOORASHADA GAARKA AH</span>
          </div>
          <h2 className="section-title-large">
            Cuntooyinka Ugu Caansan Ee <span className="gold-text">AFLAX Restaurant</span>
          </h2>
          <p className="section-lead-text">
            Dhadhamo cuntooyinka iyo cabitaannada ugu macaanka badan ee lagu diyaariyo Degmada Yaqshiid.
            Ka dalbo toos adigoo adeegsanaya WhatsApp.
          </p>
        </div>

        <div className="menu-grid-luxury">
          {featured.map((item) => (
            <MenuCard key={item._id || item.slug} item={item} />
          ))}
        </div>

        <div className="view-full-menu-cta-card">
          <div className="cta-card-content">
            <h3>Ma doonaysaa inaad aragto dhammaan cuntooyinka?</h3>
            <p>Waxaan kuu haynaa in ka badan {items.length} cuntooyin, fast food, cabitaanno iyo espresso.</p>
          </div>
          <Link to="/menu" className="btn-gold-glow">
            <span>🍽️ Eeg Dhammaan Menu-ga ({items.length} Cunto)</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

