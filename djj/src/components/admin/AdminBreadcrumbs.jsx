import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const AdminBreadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontFamily: 'Space Grotesk, sans-serif' }}>
      <Link to="/admin/dashboard" style={{ color: C.muted, display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
        <Home size={14} />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

        return (
          <React.Fragment key={name}>
            <ChevronRight size={14} color={C.faint} />
            {isLast ? (
              <span style={{ color: C.gold, fontWeight: 600 }}>{formattedName}</span>
            ) : (
              <Link to={routeTo} style={{ color: C.muted, textDecoration: 'none' }}>
                {formattedName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
