import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useMenu from '../../hooks/useMenu';
import MenuCard from '../menu/MenuCard';

const categoryIcons = {
  'main-food': '🍛',
  'cunto-fudud': '🍔',
  sheetaro: '🥟',
  cawitaano: '🧃',
  'espresso-machine': '☕',
};

/**
 * FeaturedMenuPreview Component for HomePage
 * Displays interactive category tabs and menu items directly on the home page
 * Works 100% reliably even without backend attachment via confirmed fallback data
 */
export default function FeaturedMenuPreview() {
  const {
    items,
    allCount,
    categories,
    selectedCategory,
    setSelectedCategory,
  } = useMenu();

  const [showAll, setShowAll] = useState(false);

  // If a category is selected, show all items of that category
  // If "Dhammaan" is selected, show all or top 12 with expand button
  const displayItems = selectedCategory || showAll ? items : items.slice(0, 12);

  return (
    <section id="featured-menu" className="featured-menu-luxury">
      <div className="container">
        <div className="section-header-centered">
          <div className="section-eyebrow">
            <span className="eyebrow-pill">CUNTOOYINKA MAQAAYADDA</span>
          </div>
          <h2 className="section-title-large">
            Menu-ga Cuntooyinka <span className="gold-text">AFLAX Restaurant</span>
          </h2>
          <p className="section-lead-text">
            Dhadhamo cuntooyin Soomaaliyeed, fast food, cawitaanno dabiici ah iyo espresso casri ah.
            Dhammaan 63 cunto waxaa lagu diyaariyey gacmo nadiif ah Degmada Yaqshiid.
          </p>
        </div>

        {/* Category Navigation Pills directly on Home Page */}
        <div className="category-pills-container" role="tablist" aria-label="Menu categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === ''}
            className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory('');
              setShowAll(false);
            }}
          >
            <span className="cat-pill-name">Dhammaan (All)</span>
            <span className="cat-pill-count">{allCount || 63}</span>
          </button>

          {categories.map((cat) => {
            const icon = categoryIcons[cat.slug] || '🍽️';
            return (
              <button
                key={cat._id || cat.slug}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.slug}
                className={`category-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                <span className="cat-pill-icon">{icon}</span>
                <span className="cat-pill-name">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Category Header Notice */}
        {selectedCategory && (
          <div className="menu-results-bar" style={{ marginBottom: '24px' }}>
            <span>
              Qeybta: <strong>{categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</strong> ({displayItems.length} cunto)
            </span>
            <button
              type="button"
              className="reset-filter-btn"
              onClick={() => setSelectedCategory('')}
            >
              Muuji Dhammaan (Show all)
            </button>
          </div>
        )}

        {/* Menu Cards Grid */}
        <div className="menu-grid-luxury">
          {displayItems.map((item) => (
            <MenuCard key={item._id || item.slug} item={item} />
          ))}
        </div>

        {/* Expand / Show All Button on Home Page */}
        {!selectedCategory && !showAll && items.length > 12 && (
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <button
              type="button"
              className="btn-gold-glow"
              onClick={() => setShowAll(true)}
              style={{ minWidth: '260px' }}
            >
              <span>👇 Muuji Dhammaan 63-ka Cunto</span>
            </button>
          </div>
        )}

        {/* Full Menu Page CTA */}
        <div className="view-full-menu-cta-card">
          <div className="cta-card-content">
            <h3>Bogga Menu-ga Buuxa &amp; Raadinta Tooska Ah</h3>
            <p>
              Raadi cunto kasta adigoo adeegsanaya magaca, ama kala saar qeybaha cuntooyinka.
            </p>
          </div>
          <Link to="/menu" className="btn-gold-glow">
            <span>🍽️ Eeg Bogga Menu-ga ({allCount || 63} Cunto)</span>
            <span className="btn-arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}


