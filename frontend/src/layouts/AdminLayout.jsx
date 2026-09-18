import React, { useState } from 'react';
import { NavLink, Link, Outlet, Navigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';

export default function AdminLayout() {
  const { admin, isAuthenticated, isLoading, logout } = useAdminAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // While checking existing session on initial load
  if (isLoading) {
    return (
      <div className="admin-loading-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div className="admin-spinner"></div>
        <p>Verifying AFLAX Admin Authentication...</p>
      </div>
    );
  }

  // Strictly protect all admin routes
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-wrapper">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && <div className="admin-backdrop" onClick={closeSidebar}></div>}

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <span className="admin-logo-icon">🍽️</span>
            <div>
              <div className="admin-logo-title">AFLAX</div>
              <div className="admin-logo-sub">ADMIN PORTAL</div>
            </div>
          </div>
          <button
            type="button"
            className="admin-close-sidebar-btn"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* Admin Profile Info Card in Sidebar */}
        <div className="admin-sidebar-profile">
          <div className="profile-avatar">👤</div>
          <div className="profile-text">
            <span className="profile-name">{admin?.name || 'AFLAX Admin'}</span>
            <span className="profile-email">{admin?.email || 'admin@aflax.so'}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/menu"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            onClick={closeSidebar}
          >
            <span className="nav-icon">🍽️</span>
            <span>Menu Items</span>
          </NavLink>

          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            onClick={closeSidebar}
          >
            <span className="nav-icon">🧾</span>
            <span>Orders</span>
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            onClick={closeSidebar}
          >
            <span className="nav-icon">📅</span>
            <span>Table Bookings</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) => (isActive ? 'admin-nav-item active' : 'admin-nav-item')}
            onClick={closeSidebar}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button type="button" className="admin-sidebar-logout-btn" onClick={logout}>
            🚪 Log Out
          </button>

          <Link to="/" className="view-site-link" style={{ marginTop: '10px' }}>
            <span>🌐 View Customer Website</span>
          </Link>
          <div className="admin-footer-info">
            <small>AFLAX Restaurant — Degmada Yaqshiid</small>
          </div>
        </div>
      </aside>

      {/* Admin Main Body */}
      <div className="admin-main-container">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-hamburger"
              onClick={toggleSidebar}
              aria-label="Open menu"
            >
              ☰
            </button>
            <span className="admin-breadcrumb">AFLAX Restaurant Administration</span>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-user-badge">
              <span className="user-icon">👤</span>
              <span className="user-name">{admin?.name || 'AFLAX Admin'}</span>
            </div>

            <button type="button" className="admin-header-logout-btn" onClick={logout} title="Log Out">
              🚪 Log Out
            </button>

            <span className="admin-status-badge">
              <span className="status-dot"></span> Live
            </span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
