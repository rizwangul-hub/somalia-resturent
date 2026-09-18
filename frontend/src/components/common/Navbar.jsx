import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { totalCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on Escape key for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="navbar">
        <div className="logo">
          <Link to="/" className="logo-link" aria-label="AFLAX Restaurant Bogga Hore">
            <div className="logo-icon-emblem" aria-hidden="true">🍽️</div>
            <div className="logo-text-group">
              <div className="logo-main-brand">AFLAX</div>
              <div className="logo-sub-brand">RESTAURANT • YAQSHIID</div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <span>HOME</span>
          </NavLink>
          <NavLink to="/menu" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <span>MENU</span>
          </NavLink>
          <NavLink to="/booking" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <span>DALBO MIIS</span>
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
            <span>CONTACT</span>
          </NavLink>
        </nav>

        {/* Header Right Actions: Table CTA, Cart & Mobile Toggle */}
        <div className="header-right-actions">
          <Link to="/booking" className="header-table-btn" title="Boos Qabasho Miis">
            📅 Dalbo Miis
          </Link>

          <Link
            to="/cart"
            className="cart-button-luxury"
            title="Eeg Dambiisha Cuntada"
            aria-label={`Dambiisha cuntada, ${totalCount} xabbadood`}
          >
            <span className="cart-icon" aria-hidden="true">🛒</span>
            <span className="cart-label">Cart</span>
            <span id="cartCount" className="cart-count-pill">{totalCount}</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={mobileOpen ? 'Xir menu-ga' : 'Fur menu-ga navigation-ka'}
          >
            <span className="menu-btn-icon" aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span>
            <span className="menu-btn-text">Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (When open) */}
      {mobileOpen && (
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div id="mobile-nav-drawer" className="mobile-nav-drawer" role="dialog" aria-label="Mobile Menu">
            <div className="mobile-nav-header">
              <span className="mobile-nav-title">AFLAX MENU</span>
              <button
                type="button"
                className="mobile-drawer-close-btn"
                onClick={() => setMobileOpen(false)}
                aria-label="Xir menu-ga"
              >
                ✕
              </button>
            </div>
            <nav className="mobile-nav-links" aria-label="Mobile Navigation">
              <NavLink to="/" end onClick={() => setMobileOpen(false)}>
                🏠 HOME (Bogga Hore)
              </NavLink>
              <NavLink to="/menu" onClick={() => setMobileOpen(false)}>
                🍽️ MENU (Cuntooyinka)
              </NavLink>
              <NavLink to="/booking" onClick={() => setMobileOpen(false)}>
                📅 DALBO MIIS (Boos Qabasho)
              </NavLink>
              <NavLink to="/contact" onClick={() => setMobileOpen(false)}>
                📞 CONTACT (Nala Soo Xiriir)
              </NavLink>
              <NavLink to="/cart" onClick={() => setMobileOpen(false)}>
                🛒 CART ({totalCount} Xabbadood)
              </NavLink>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

