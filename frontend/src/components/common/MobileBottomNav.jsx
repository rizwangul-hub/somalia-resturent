import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function MobileBottomNav() {
  const { totalCount } = useCart();

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Bottom Navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Hoyga</span>
      </NavLink>

      <NavLink
        to="/menu"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🍽️</span>
        <span className="bottom-nav-label">Menu</span>
      </NavLink>

      <NavLink
        to="/booking"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">📅</span>
        <span className="bottom-nav-label">Dalbo Miis</span>
      </NavLink>

      <NavLink
        to="/cart"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon-wrapper">
          <span className="bottom-nav-icon">🛒</span>
          {totalCount > 0 && <span className="bottom-nav-badge">{totalCount}</span>}
        </span>
        <span className="bottom-nav-label">Dambiisha</span>
      </NavLink>

      <a
        href="https://wa.me/252610723233?text=Asc%20AFLAX%20Restaurant,%20waxaan%20rabaa%20in%20aan%20dalab%20sameeyo"
        target="_blank"
        rel="noopener noreferrer"
        className="bottom-nav-item whatsapp-bottom-item"
        aria-label="La xiriir AFLAX Restaurant WhatsApp"
      >
        <span className="bottom-nav-icon">💬</span>
        <span className="bottom-nav-label">WhatsApp</span>
      </a>
    </nav>
  );
}
