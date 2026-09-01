import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Ticket,
  BookOpen,
  Users,
  CreditCard,
  RefreshCw,
  Receipt,
  DollarSign,
  UserCheck,
  DoorOpen,
  QrCode,
  ClipboardCheck,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { C } from '../../constants/theme.js';

export const organizerNavItems = [
  { id: 'dashboard', label: 'Dashboard', route: '/organizer/dashboard', icon: LayoutDashboard },
  { id: 'events', label: 'My Events', route: '/organizer/events', icon: Calendar, exact: true },
  { id: 'create-event', label: 'Create Event', route: '/organizer/events/create', icon: CalendarPlus },
  { id: 'ticketing', label: 'Ticketing', route: '/organizer/ticketing', icon: Ticket },
  { id: 'bookings', label: 'Bookings', route: '/organizer/bookings', icon: BookOpen },
  { id: 'payments', label: 'Payments', route: '/organizer/payments', icon: CreditCard },
  { id: 'refunds', label: 'Refunds', route: '/organizer/refunds', icon: RefreshCw },
  { id: 'invoices', label: 'Invoices', route: '/organizer/invoices', icon: Receipt },
  { id: 'settlements', label: 'Settlements', route: '/organizer/settlements', icon: DollarSign },
  { id: 'check-in', label: 'Check-in', route: '/organizer/check-in', icon: UserCheck },
  { id: 'gates', label: 'Gates', route: '/organizer/gates', icon: DoorOpen },
  { id: 'scanners', label: 'Scanners', route: '/organizer/scanners', icon: QrCode },
  { id: 'scanner-users', label: 'Scanner Staff', route: '/organizer/scanner-users', icon: Users },
  { id: 'attendance', label: 'Attendance', route: '/organizer/attendance', icon: ClipboardCheck },
  { id: 'profile', label: 'Profile', route: '/organizer/profile', icon: User },
  { id: 'settings', label: 'Settings', route: '/organizer/settings', icon: Settings },
];

export const OrganizerSidebar = ({ collapsed, setCollapsed, isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();

  const handleNavItemClick = () => {
    if (isMobileOpen && setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: C.bgDark,
        borderRight: `1px solid ${C.border}`,
        width: collapsed ? '72px' : '250px',
        transition: 'width 0.3s ease',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 90,
      }}
    >
      {/* Sidebar Header Logo */}
      <div
        style={{
          padding: collapsed ? '16px 8px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: C.gold,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 700,
                fontSize: '16px',
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            >
              O
            </div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontWeight: 700, fontSize: '16px' }}>
              Organizer Panel
            </span>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${C.border}`,
            borderRadius: '8px',
            color: C.muted,
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Mobile Drawer Close Button */}
      {isMobileOpen && (
        <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsMobileOpen(false)}
            style={{ background: 'transparent', border: 'none', color: C.muted, cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Sidebar Nav Routes List */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '16px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {organizerNavItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.route
            : location.pathname === item.route || location.pathname.startsWith(`${item.route}/`);

          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.route}
              onClick={handleNavItemClick}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: collapsed ? '10px 0' : '10px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '12px',
                color: isActive ? C.gold : C.muted,
                background: isActive ? C.goldDim : 'transparent',
                border: isActive ? `1px solid ${C.borderGold}` : '1px solid transparent',
                textDecoration: 'none',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={18} color={isActive ? C.gold : C.muted} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return sidebarContent;
};
