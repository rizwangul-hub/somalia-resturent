import React, { useState } from 'react';
import { useCart } from '../../hooks/useCart';
import { getMenuItemImageUrl } from '../../utils/menuImageResolver';

// Category icons for placeholders
const categoryIcons = {
  'main-food': '🍛',
  'cunto-fudud': '🍔',
  sheetaro: '🥟',
  cawitaano: '🧃',
  'espresso-machine': '☕',
};

/**
 * MenuCard Component
 * Displays a single restaurant menu item with:
 * - Real photographic culinary asset or Cloudinary image
 * - Formatted numeric USD price ($1.25, $0.50, etc.)
 * - Availability check (isAvailable) with visual status badge & disabled button
 * - Direct connection to CartContext (Add to Cart with feedback)
 * - Clean Somali labels
 */
export default function MenuCard({ item }) {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const categoryName =
    typeof item.category === 'object' && item.category !== null
      ? item.category.name
      : '';
  const categorySlug =
    typeof item.category === 'object' && item.category !== null
      ? item.category.slug
      : '';

  const fallbackIcon = categoryIcons[categorySlug] || '🍽️';
  const resolvedImage = getMenuItemImageUrl(item);
  const hasImage = Boolean(resolvedImage && !imgError);
  const isAvailable = item.isAvailable !== false;

  const handleAddToCart = () => {
    if (!isAvailable) return;
    const added = addToCart(item);
    if (added) {
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1200);
    }
  };

  return (
    <div className={`menu-card ${!isAvailable ? 'unavailable' : ''}`}>
      <div className="menu-card-image-container">
        {hasImage ? (
          <img
            src={resolvedImage}
            alt={item.name}
            className={`menu-card-image ${imgLoaded ? 'loaded' : 'loading'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="menu-card-img-placeholder"
            title={`${item.name} (Sawir lama hayo)`}
            role="img"
            aria-label={`${item.name} - sawir lama hayo`}
          >
            <span className="placeholder-icon" aria-hidden="true">{fallbackIcon}</span>
            <span className="placeholder-text">AFLAX</span>
          </div>
        )}

        {/* Availability Badge Overlay */}
        {!isAvailable && (
          <div className="unavailable-overlay">
            <span className="badge-unavailable">Lama heli karo</span>
          </div>
        )}
      </div>

      <div className="menu-info">
        <div className="menu-header-line">
          {categoryName && <span className="category-tag">{categoryName}</span>}
          {!isAvailable && <span className="status-tag-unavailable">Ma furna</span>}
        </div>

        <h3>{item.name}</h3>

        <div className="menu-bottom">
          <span className="price">${Number(item.price).toFixed(2)}</span>

          {isAvailable ? (
            <button
              type="button"
              className={`add-btn ${isAdded ? 'added-success' : ''}`}
              onClick={handleAddToCart}
              title={`Ku dar ${item.name} dalabkaaga`}
              aria-label={`Ku dar ${item.name} dambiisha cuntada`}
            >
              {isAdded ? '✓ Lagu daray' : '+ Ku dar'}
            </button>
          ) : (
            <button
              type="button"
              className="add-btn disabled"
              disabled
              aria-disabled="true"
              title="Cuntadaan hadda lama heli karo"
              aria-label={`${item.name} hadda lama heli karo`}
            >
              Lama heli karo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
