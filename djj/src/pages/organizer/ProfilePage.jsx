import React, { useState, useEffect } from 'react';
import { User, Building, Globe, Phone, MapPin, Mail, Save } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { api } from '../../services/api.js';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    website: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/organizer/profile');
        const prof = res.data?.profile || res.profile || {};
        setProfileData({
          companyName: prof.companyName || '',
          website: prof.website || '',
          phone: prof.phone || user?.phone || '',
          address: prof.address || '',
        });
      } catch {
        // Fallback to user data if profile record is brand new
        setProfileData((p) => ({ ...p, phone: user?.phone || '' }));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/organizer/profile', profileData);
      showToast('Organizer profile updated successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, color: C.text, margin: 0 }}>
          Organizer Profile
        </h1>
        <p style={{ color: C.muted, fontSize: '14px', margin: '4px 0 0' }}>
          Manage your organization brand profile and business contact details.
        </p>
      </div>

      <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '20px', padding: '28px' }}>
        {loading ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: C.muted }}>Loading profile details...</div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* User Account Info Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                paddingBottom: '20px',
                borderBottom: `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: C.gold,
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                {(user?.firstName ? user.firstName[0] : 'O').toUpperCase()}
              </div>

              <div>
                <h3 style={{ margin: 0, color: C.text, fontSize: '18px', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Event Organizer'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: C.muted, fontSize: '13px', marginTop: '4px' }}>
                  <Mail size={14} color={C.gold} /> {user?.email || 'organizer@email.com'}
                </div>
              </div>
            </div>

            {/* Editable Profile Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                  Company / Organization Name
                </label>
                <div style={{ position: 'relative' }}>
                  <Building size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData((p) => ({ ...p, companyName: e.target.value }))}
                    placeholder="e.g. Apex Event Management LLC"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${C.border}`,
                      borderRadius: '12px',
                      color: C.text,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                    Website URL
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Globe size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="url"
                      value={profileData.website}
                      onChange={(e) => setProfileData((p) => ({ ...p, website: e.target.value }))}
                      placeholder="https://example.com"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '12px',
                        color: C.text,
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                    Business Phone Number
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000"
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${C.border}`,
                        borderRadius: '12px',
                        color: C.text,
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: C.muted, fontSize: '13px', marginBottom: '6px', fontWeight: 500 }}>
                  Business Address
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} color={C.muted} style={{ position: 'absolute', left: '12px', top: '14px' }} />
                  <textarea
                    rows={3}
                    value={profileData.address}
                    onChange={(e) => setProfileData((p) => ({ ...p, address: e.target.value }))}
                    placeholder="123 Event St, Suite 400, New York, NY"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${C.border}`,
                      borderRadius: '12px',
                      color: C.text,
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  background: C.gold,
                  color: '#000000',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'Space Grotesk, sans-serif',
                  cursor: 'pointer',
                }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
