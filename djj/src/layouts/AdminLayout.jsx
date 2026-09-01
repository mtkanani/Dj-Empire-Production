import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar.jsx';
import { AdminTopbar } from '../components/admin/AdminTopbar.jsx';
import { C } from '../constants/theme.js';

export const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, width: '100%', overflowX: 'hidden' }}>
      {/* Desktop & Laptop Sidebar */}
      <div className="admin-sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90 }}>
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {/* Main Admin Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <AdminTopbar onMobileToggle={() => setIsMobileOpen((prev) => !prev)} />

        <main style={{ padding: '32px 24px', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
