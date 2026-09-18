import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';

export default function MainLayout() {
  return (
    <div className="site-layout">
      <Navbar />
      <main className="site-content">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

