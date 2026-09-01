import React from 'react';
import { Settings, Shield, Bell, CreditCard, Lock, Globe } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
          Organizer Settings
        </h1>
        <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
          Manage your account preferences, security options, notifications, and default configurations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: C.gold }}>
            <Lock size={20} />
            <h4 style={{ margin: 0, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Security & Password</h4>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 16px' }}>
            Update password, 2FA authentication, and session security.
          </p>
          <span style={{ fontSize: '11px', color: C.faint, fontStyle: 'italic' }}>Phase foundation - Configured in security phase.</span>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: C.blue }}>
            <Bell size={20} />
            <h4 style={{ margin: 0, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Notification Preferences</h4>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 16px' }}>
            Email alerts for new bookings, daily sales summaries, and payouts.
          </p>
          <span style={{ fontSize: '11px', color: C.faint, fontStyle: 'italic' }}>Phase foundation - Configured in notification phase.</span>
        </div>

        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: C.green }}>
            <CreditCard size={20} />
            <h4 style={{ margin: 0, fontSize: '16px', fontFamily: 'Space Grotesk, sans-serif' }}>Payout Bank Account</h4>
          </div>
          <p style={{ color: C.muted, fontSize: '13px', margin: '0 0 16px' }}>
            Configure bank account details for automated settlement deposits.
          </p>
          <span style={{ fontSize: '11px', color: C.faint, fontStyle: 'italic' }}>Phase foundation - Configured in settlement phase.</span>
        </div>
      </div>
    </div>
  );
}
