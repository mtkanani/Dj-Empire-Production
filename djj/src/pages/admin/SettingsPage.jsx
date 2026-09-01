import React, { useState } from 'react';
import { Settings, Shield, User, Bell } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { Input } from '../../components/common/Input.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

export default function SettingsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [platformName, setPlatformName] = useState('D J EMPIRE PRODUCTION');
  const [supportEmail, setSupportEmail] = useState('support@djempire.com');
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast('Admin settings saved successfully!', 'success');
      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '26px', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={26} color={C.gold} /> Platform System Settings
        </h1>
        <p style={{ color: C.muted, margin: 0, fontSize: '14px' }}>Configure SaaS global platform settings and administrator profile</p>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '24px', padding: '32px' }}>
        <form onSubmit={handleSave}>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '18px', margin: '0 0 16px' }}>
            General Platform Setup
          </h3>
          <Input label="SaaS Platform Branding Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} required />
          <Input label="Support Email Address" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />

          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: C.gold, fontSize: '18px', margin: '24px 0 16px' }}>
            Super Admin Account
          </h3>
          <Input label="Logged Admin Name" value={`${user?.firstName || 'Super'} ${user?.lastName || 'Admin'}`} disabled />
          <Input label="Logged Admin Email" value={user?.email || 'admin@eventbooking.com'} disabled />

          <Button type="submit" variant="primary" fullWidth loading={loading} style={{ marginTop: '16px' }}>
            Save Platform Settings
          </Button>
        </form>
      </div>
    </div>
  );
}
