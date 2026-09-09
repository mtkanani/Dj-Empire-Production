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
    <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, width: '100%', overflowX: 'hidden' }}>
      {/* Desktop & Laptop Sidebar */}
      <div className="admin-sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90 }}>
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 99,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="dashboard-mobile-drawer"
            style={{
              width: 'min(280px, 88vw)',
              height: '100%',
              background: C.bgDark,
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.8)',
            }}
          >
            <AdminSidebar
              collapsed={false}
              setCollapsed={() => {}}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
            />
          </div>
        </div>
      )}

      {/* Main Admin Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <AdminTopbar onMobileToggle={() => setIsMobileOpen((prev) => !prev)} />

        <main className="dashboard-main" style={{ padding: '32px 24px', flexGrow: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
