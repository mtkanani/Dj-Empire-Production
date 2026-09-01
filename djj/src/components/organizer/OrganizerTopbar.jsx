import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, Settings, Menu, User, Calendar } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { OrganizerBreadcrumbs } from './OrganizerBreadcrumbs.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

export const OrganizerTopbar = ({ onMobileToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    showToast('Organizer logged out successfully', 'info');
    navigate('/organizer/login');
  };

  const organizerName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.companyName || 'Event Organizer';

  const initials = (user?.firstName ? user.firstName[0] : 'O').toUpperCase();

  return (
    <header
      style={{
        height: '70px',
        background: C.bgCard,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 80,
      }}
    >
      {/* Left: Mobile Menu Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onMobileToggle}
          style={{
            background: 'none',
            border: 'none',
            color: C.text,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Open navigation menu"
        >
          <Menu size={22} color={C.gold} />
        </button>

        <OrganizerBreadcrumbs />
      </div>

      {/* Right: Search, Notifications, Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Quick Search */}
        <div style={{ position: 'relative', width: '200px' }} className="organizer-topbar-search">
          <Search size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search events, bookings..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${C.border}`,
              borderRadius: '999px',
              color: C.text,
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Notifications Icon with Badge */}
        <button
          onClick={() => navigate('/organizer/analytics')}
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${C.border}`,
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.muted,
            cursor: 'pointer',
            position: 'relative',
          }}
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: C.gold,
            }}
          />
        </button>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: C.gold,
                color: '#000000',
                fontWeight: 700,
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Space Grotesk, sans-serif',
                boxShadow: `0 0 10px ${C.goldDim}`,
              }}
            >
              {initials}
            </div>

            <div style={{ textAlign: 'left' }} className="organizer-profile-name">
              <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: C.text, fontFamily: 'Space Grotesk, sans-serif' }}>
                {organizerName}
              </span>
              <span style={{ fontSize: '11px', color: C.gold }}>ORGANIZER</span>
            </div>
          </button>

          {/* Profile Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '210px',
                background: C.bgCard,
                border: `1px solid ${C.borderGold}`,
                borderRadius: '16px',
                padding: '8px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, marginBottom: '4px' }}>
                <strong style={{ color: C.gold, fontSize: '13px', display: 'block', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {organizerName}
                </strong>
                <span style={{ color: C.muted, fontSize: '11px', wordBreak: 'break-all' }}>{user?.email || 'organizer@event.com'}</span>
              </div>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/organizer/profile');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: C.muted,
                  fontSize: '13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <User size={15} /> My Profile
              </button>

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/organizer/settings');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: C.muted,
                  fontSize: '13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Settings size={15} /> Settings
              </button>

              <div style={{ height: '1px', background: C.border, margin: '4px 0' }} />

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'transparent',
                  border: 'none',
                  color: C.red,
                  fontSize: '13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={15} /> Logout Organizer
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
