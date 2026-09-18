import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import useMenu from '../hooks/useMenu';
import MenuCard from '../components/menu/MenuCard';

const categoryIcons = {
  'main-food': '🍛',
  'cunto-fudud': '🍔',
  sheetaro: '🥟',
  cawitaano: '🧃',
  'espresso-machine': '☕',
};

export default function MenuPage() {
  useDocumentTitle('AFLAX Restaurant — Menu');
  const {
    items,
    allCount,
    categories,
    categoryCounts,
    loading,
    error,
    selectedCategory,
    setSelectedCategory,
    search,
    setSearch,
    resetFilters,
    reload,
  } = useMenu();

  const isFiltered = Boolean(selectedCategory || search.trim());

  return (
    <section id="menu" className="menu-page-luxury">
      <div className="container">
        {/* Section Header */}
        <div className="section-title">
          <span className="section-badge-gold">CUNTOOYINKA MAQAAYADDA</span>
          <h2>Menu-ga AFLAX Restaurant</h2>
          <p>
            Ku raaxayso cuntooyin macaan, fast food, cabitaanno cusub iyo coffee casri ah oo lagu diyaariyey jacayl iyo nadaafad sare.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-box-wrapper">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Raadi cunto ama cabitaan (tusaale: Shuwaarmo, Bariis, Coffee)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Raadso cunto"
            />
            {search && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearch('')}
                title="Tirtir raadinta"
                aria-label="Tirtir raadinta"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="category-pills-container" role="tablist" aria-label="Menu categories">
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === ''}
            className={`category-pill ${selectedCategory === '' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            <span className="cat-pill-name">Dhammaan</span>
            <span className="cat-pill-count">{allCount || 0}</span>
          </button>

          {categories.map((cat) => {
            const icon = categoryIcons[cat.slug] || '🍽️';
            const count = categoryCounts[cat.slug] || 0;

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
                <span className="cat-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Results Bar when filters are active */}
        {!loading && !error && (
          <div className="menu-results-bar">
            <span className="results-count" aria-live="polite">
              Waxaa la helay <strong>{items.length}</strong> {items.length === 1 ? 'cunto' : 'cuntooyin'}
              {selectedCategory && (
                <span className="active-filter-badge">
                  Qeybta: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                </span>
              )}
              {search && (
                <span className="active-filter-badge">
                  Raadinta: "{search}"
                </span>
              )}
            </span>

            {isFiltered && (
              <button type="button" className="reset-filter-btn" onClick={resetFilters}>
                Dib u deji shaandhada (Show all)
              </button>
            )}
          </div>
        )}

        {/* State 1: Loading */}
        {loading && (
          <div className="menu-state-message">
            <div className="loading-spinner">⏳</div>
            <h3>Cuntooyinka waa la soo rarayaa...</h3>
            <p>Fadlan wax yar sug inta xogta laga keenayo Database-ka.</p>
          </div>
        )}

        {/* State 2: Error */}
        {!loading && error && (
          <div className="menu-state-message error-state">
            <div className="state-icon">⚠️</div>
            <h3>Cilad ayaa dhacday</h3>
            <p>{error}</p>
            <button type="button" className="retry-btn" onClick={reload}>
              Isku day mar kale
            </button>
          </div>
        )}

        {/* State 3: Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="menu-state-message empty-state">
            <div className="state-icon">🍽️</div>
            <h3>Wax cunto ah lagama helin</h3>
            <p>
              {search
                ? `Raadinta "${search}" wax cunto ah lagama helin qeybtaan.`
                : 'Hadda ma jiraan cuntooyin ku jira qeybtaan.'}
            </p>
            <button type="button" className="retry-btn" onClick={resetFilters}>
              Eeg Dhammaan Menu-ga
            </button>
          </div>
        )}

        {/* State 4: Menu Items Grid */}
        {!loading && !error && items.length > 0 && (
          <div className="menu-grid">
            {items.map((item) => (
              <MenuCard key={item._id || item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
