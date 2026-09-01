import React from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { Button } from '../../components/common/Button.jsx';
import { useToast } from '../../hooks/useToast.js';

export default function NotificationsPage() {
  const { showToast } = useToast();

  const notifications = [
    { id: 1, title: 'New Organizer Application', text: 'Apex Event Management LLC submitted business registration docs', time: '10 mins ago', read: false },
    { id: 2, title: 'System Security Alert', text: 'Super admin logged in from IP 127.0.0.1', time: '1 hour ago', read: true },
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '26px', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={26} color={C.gold} /> Admin Notification Center
          </h1>
          <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>Platform system notifications, alerts, and registration updates</p>
        </div>

        <Button variant="ghost" size="sm" onClick={() => showToast('All notifications marked as read', 'success')}>
          <CheckCircle size={14} /> Mark All as Read
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.map((n) => (
          <div key={n.id} style={{ background: C.bgCard, border: `1px solid ${n.read ? C.border : C.borderGold}`, borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: n.read ? C.text : C.gold, fontSize: '15px', display: 'block', fontFamily: 'Space Grotesk, sans-serif' }}>
                {n.title}
              </strong>
              <p style={{ color: C.muted, fontSize: '13px', margin: '4px 0 0' }}>{n.text}</p>
            </div>
            <span style={{ fontSize: '12px', color: C.faint }}>{n.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
