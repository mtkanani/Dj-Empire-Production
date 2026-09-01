import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { OrganizerSidebar } from '../components/organizer/OrganizerSidebar.jsx';
import { OrganizerTopbar } from '../components/organizer/OrganizerTopbar.jsx';
import { C } from '../constants/theme.js';

export const OrganizerLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('organizer_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('organizer_sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, color: C.text, width: '100%', overflowX: 'hidden' }}>
      {/* Desktop & Laptop Sidebar */}
      <div className="organizer-sidebar-desktop" style={{ height: '100vh', position: 'sticky', top: 0, zIndex: 90 }}>
        <OrganizerSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      {/* Mobile Drawer Overlay */}
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
            style={{
              width: '260px',
              height: '100%',
              background: C.bgDark,
              boxShadow: '4px 0 24px rgba(0, 0, 0, 0.8)',
            }}
          >
            <OrganizerSidebar
              collapsed={false}
              setCollapsed={() => {}}
              isMobileOpen={isMobileOpen}
              setIsMobileOpen={setIsMobileOpen}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        <OrganizerTopbar onMobileToggle={() => setIsMobileOpen((prev) => !prev)} />

        <main
          style={{
            padding: '32px 24px',
            flexGrow: 1,
            maxWidth: '1400px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};
