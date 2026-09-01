import React from 'react';
import { Activity, UserCheck, ShieldCheck, CheckCircle2, DollarSign } from 'lucide-react';
import { C } from '../../constants/theme.js';

export const RecentActivity = ({ activities = [] }) => {
  const defaultActivities = [
    { id: 1, type: 'ORGANIZER_REGISTER', text: 'New organizer Apex Events LLC registered', time: '10 mins ago', icon: UserCheck },
    { id: 2, type: 'PAYMENT_RECEIVED', text: 'Booking payment ₹10,638 received for Tech Summit 2026', time: '25 mins ago', icon: DollarSign },
    { id: 3, type: 'ORGANIZER_APPROVED', text: 'Organizer Apex Events LLC approved by Super Admin', time: '1 hour ago', icon: ShieldCheck },
    { id: 4, type: 'EVENT_PUBLISHED', text: 'Music Festival 2026 event published', time: '2 hours ago', icon: CheckCircle2 },
  ];

  const items = activities.length > 0 ? activities : defaultActivities;

  return (
    <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '24px' }}>
      <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '18px', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={20} color={C.gold} /> Recent Platform Activity
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {items.map((act) => {
          const Icon = act.icon || Activity;
          return (
            <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: C.panel, borderRadius: '14px', border: `1px solid ${C.border}` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: C.goldDim, border: `1px solid ${C.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color={C.gold} />
              </div>
              <div style={{ flexGrow: 1 }}>
                <span style={{ fontSize: '13px', color: C.text, display: 'block', fontWeight: 500 }}>
                  {act.text}
                </span>
                <span style={{ fontSize: '11px', color: C.muted }}>{act.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
