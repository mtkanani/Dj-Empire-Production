import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { C } from '../../constants/theme.js';

const ROUTE_LABELS = {
  organizer: 'Organizer',
  dashboard: 'Dashboard',
  events: 'My Events',
  create: 'Create Event',
  ticketing: 'Ticketing',
  bookings: 'Bookings',
  customers: 'Customers',
  payments: 'Payments',
  refunds: 'Refunds',
  invoices: 'Invoices',
  settlements: 'Settlements',
  'check-in': 'Check-in',
  gates: 'Gates',
  scanners: 'Scanners',
  'scanner-users': 'Scanner Staff',
  attendance: 'Attendance',
  profile: 'Profile',
  settings: 'Settings',
};

export const OrganizerBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // If path is root /organizer or /organizer/dashboard
  const subPaths = pathnames.slice(1);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>
      <Link to="/organizer/dashboard" style={{ color: C.muted, display: 'flex', alignItems: 'center', textDecoration: 'none' }} title="Dashboard">
        <Home size={14} />
      </Link>

      <ChevronRight size={14} color={C.faint} />
      <Link to="/organizer/dashboard" style={{ color: subPaths.length === 0 || subPaths[0] === 'dashboard' ? C.gold : C.muted, textDecoration: 'none', fontWeight: subPaths.length === 0 || subPaths[0] === 'dashboard' ? 600 : 400 }}>
        Dashboard
      </Link>

      {subPaths.map((name, index) => {
        if (name === 'dashboard') return null;

        const routeTo = `/organizer/${subPaths.slice(0, index + 1).join('/')}`;
        const isLast = index === subPaths.length - 1;
        const label = ROUTE_LABELS[name] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

        return (
          <React.Fragment key={name}>
            <ChevronRight size={14} color={C.faint} />
            {isLast ? (
              <span style={{ color: C.gold, fontWeight: 600 }}>{label}</span>
            ) : (
              <Link to={routeTo} style={{ color: C.muted, textDecoration: 'none' }}>
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
