import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, MapPin, Landmark, Receipt, Building, Users } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Add Category', route: '/admin/categories', icon: Tag, color: C.gold },
    { label: 'Add City', route: '/admin/cities', icon: MapPin, color: C.blue },
    { label: 'Add Venue', route: '/admin/venues', icon: Landmark, color: C.purple },
    { label: 'Tax & GST Settings', route: '/admin/tax-settings', icon: Receipt, color: C.amber },
    { label: 'View Organizers', route: '/admin/organizers', icon: Building, color: C.green },
    { label: 'View Customers', route: '/admin/customers', icon: Users, color: C.gold },
  ];

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '18px', margin: '0 0 20px' }}>
        Quick Administrative Actions
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(act.route)}
              style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderRadius: '14px',
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                color: C.text,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="admin-quick-action"
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} color={act.color} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', textAlign: 'center' }}>
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
