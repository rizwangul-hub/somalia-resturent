import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AdminAuthProvider } from './context/AdminAuthProvider';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages (Code-split with React.lazy for optimized initial customer load)
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMenuPage = lazy(() => import('./pages/admin/AdminMenuPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function AdminSuspenseFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ff6b00',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
      <p style={{ color: '#aaa', fontSize: '14px' }}>Soo rarida AFLAX Admin Portal...</p>
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AdminAuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Customer Facing Website */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="menu" element={<MenuPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin Authentication */}
            <Route
              path="admin/login"
              element={
                <Suspense fallback={<AdminSuspenseFallback />}>
                  <AdminLoginPage />
                </Suspense>
              }
            />

            {/* AFLAX Restaurant Protected Admin Portal */}
            <Route
              path="admin"
              element={
                <Suspense fallback={<AdminSuspenseFallback />}>
                  <AdminLayout />
                </Suspense>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="menu" element={<AdminMenuPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminAuthProvider>
    </CartProvider>
  );
}
