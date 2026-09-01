import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Calendar, Ticket, BookOpen, CreditCard, UserCheck, BarChart3, Zap } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Event', route: '/organizer/events/create', icon: CalendarPlus, color: C.gold, bg: C.goldDim },
    { label: 'Manage Events', route: '/organizer/events', icon: Calendar, color: C.blue, bg: C.blueDim },
    { label: 'Ticketing', route: '/organizer/ticketing', icon: Ticket, color: C.purple, bg: C.purpleDim },
    { label: 'View Bookings', route: '/organizer/bookings', icon: BookOpen, color: C.amber, bg: C.amberDim },
    { label: 'View Payments', route: '/organizer/payments', icon: CreditCard, color: C.green, bg: C.greenDim },
    { label: 'Check-in', route: '/organizer/check-in', icon: UserCheck, color: C.pink, bg: C.pinkDim },
    { label: 'View Analytics', route: '/organizer/analytics', icon: BarChart3, color: C.orange, bg: C.orangeDim },
  ];

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: C.goldDim,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: C.gold,
          }}
        >
          <Zap size={18} />
        </div>
        <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.text, fontSize: '16px', margin: 0, fontWeight: 700 }}>
          Quick Actions
        </h4>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={() => navigate(act.route)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: `1px solid ${C.border}`,
                borderRadius: '14px',
                color: C.text,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = act.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = act.bg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              }}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: act.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: act.color,
                }}
              >
                <Icon size={18} />
              </div>
              <span
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
