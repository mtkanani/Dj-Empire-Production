import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, ShieldCheck, Ticket, Calendar, CreditCard, Save, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { tokenManager } from '../../utils/tokenManager.js';
import { customerAccountService } from '../../services/customer/customerAccountService.js';
import { validatePhone } from '../../utils/validation.js';

export default function CustomerProfilePage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const toast = useToast();

  const getComputedFullName = (u) => {
    if (!u) return '';
    if (u.fullName) return u.fullName;
    if (u.name) return u.name;
    const combined = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    return combined || '';
  };

  const getComputedPhone = (u) => {
    if (!u) return localStorage.getItem('djj_user_phone') || '';
    return (
      u.phone ||
      u.phoneNumber ||
      u.mobile ||
      u.mobileNumber ||
      u.organizerProfile?.phone ||
      localStorage.getItem('djj_user_phone') ||
      ''
    );
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const currentUser = user || tokenManager.getUser();
    if (currentUser) {
      setFullName(getComputedFullName(currentUser));
      setEmail(currentUser.email || '');
      setPhone(getComputedPhone(currentUser));
      setCity(currentUser.city || currentUser.address || 'Mumbai');
    }

    customerAccountService
      .getProfile()
      .then((res) => {
        const profile = res.data || res;
        if (profile?.firstName) {
          setFullName(`${profile.firstName} ${profile.lastName || ''}`.trim());
          setEmail(profile.email || '');
          setPhone(profile.phone || '');
        }
      })
      .catch(() => {});
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      if (toast?.error) toast.error(phoneErr);
      else alert(phoneErr);
      return;
    }

    setIsSaving(true);
    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || fullName;
      const lastName = nameParts.slice(1).join(' ') || '';
      const res = await customerAccountService.updateProfile({
        firstName,
        lastName,
        phone,
        email: email.trim().toLowerCase() || undefined,
      });
      const profile = res.data || res;

      const currentUser = user || tokenManager.getUser() || {};
      const updatedUser = {
        ...currentUser,
        fullName,
        name: fullName,
        firstName: profile.firstName || firstName,
        lastName: profile.lastName || lastName,
        email: profile.email || email,
        phone: profile.phone || phone,
      };

      localStorage.setItem('djj_user_phone', profile.phone || phone);
      tokenManager.setUser(updatedUser);
      if (setUser) setUser(updatedUser);

      if (toast?.success) toast.success('Profile & mobile number updated successfully!');
      else alert('Profile & mobile number updated successfully!');
    } catch (err) {
      if (toast?.error) toast.error(err.message || 'Unable to update profile.');
      else alert(err.message || 'Unable to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#030303',
        color: '#FFFFFF',
        padding: '40px 24px 80px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        {/* Header Title */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '32px',
              fontWeight: 800,
              color: '#FFD700',
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}
          >
            My Account Profile
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '15px' }}>
            View and edit your personal details, mobile phone number, active event tickets, and booking history.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '28px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Profile Card & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Profile Summary Card */}
            <div
              style={{
                background: 'rgba(15, 15, 15, 0.95)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 12px 36px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.08)',
                textAlign: 'center',
              }}
            >
              {/* Avatar Initial Circle */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#000000',
                  boxShadow: '0 0 24px rgba(255, 215, 0, 0.35)',
                }}
              >
                {getInitials(fullName)}
              </div>

              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '4px',
                }}
              >
                {fullName || 'Valued Customer'}
              </h2>

              <p
                style={{
                  fontSize: '13px',
                  color: '#9CA3AF',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Mail size={14} color="#FFD700" />
                {email || 'customer@example.com'}
              </p>

              <p
                style={{
                  fontSize: '13px',
                  color: '#D1D5DB',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Phone size={14} color="#FFD700" />
                {phone}
              </p>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255, 215, 0, 0.12)',
                  border: '1px solid rgba(255, 215, 0, 0.4)',
                  color: '#FFD700',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                <ShieldCheck size={14} color="#FFD700" />
                <span>{user?.role || 'CUSTOMER'} ACCOUNT</span>
              </div>
            </div>

            {/* Quick Actions Navigation */}
            <div
              style={{
                background: 'rgba(15, 15, 15, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FFD700',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Quick Actions
              </h3>

              <button
                onClick={() => navigate('/my-tickets')}
                style={quickLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Ticket size={18} color="#FFD700" />
                  <span>My Digital Tickets</span>
                </div>
                <ArrowRight size={16} color="#9CA3AF" />
              </button>

              <button
                onClick={() => navigate('/my-bookings')}
                style={quickLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Calendar size={18} color="#FFD700" />
                  <span>My Booking History</span>
                </div>
                <ArrowRight size={16} color="#9CA3AF" />
              </button>

              <button
                onClick={() => navigate('/my-payments')}
                style={quickLinkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD700';
                  e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <CreditCard size={18} color="#FFD700" />
                  <span>Payment Transactions</span>
                </div>
                <ArrowRight size={16} color="#9CA3AF" />
              </button>
            </div>
          </div>

          {/* Right Column: Pre-filled & Editable Personal Information Form */}
          <div
            style={{
              background: 'rgba(15, 15, 15, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
            }}
          >
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <User size={20} color="#FFD700" />
              Personal Information
            </h3>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full name"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address (Read-only)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  style={{
                    ...inputStyle,
                    background: 'rgba(255, 255, 255, 0.03)',
                    color: '#9CA3AF',
                    cursor: 'not-allowed',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>

              <div>
                <label style={labelStyle}>Mobile Phone Number</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{
                      ...inputStyle,
                      paddingLeft: '42px',
                      borderColor: 'rgba(255, 215, 0, 0.3)',
                    }}
                    required
                  />
                  <Phone size={16} color="#FFD700" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai, Bangalore, Delhi..."
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 100%)',
                  color: '#000000',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  border: 'none',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
                  transition: 'transform 0.2s ease',
                  marginTop: '12px',
                }}
              >
                <Save size={18} color="#000000" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#D1D5DB',
  marginBottom: '8px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '10px',
  background: 'rgba(0, 0, 0, 0.6)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  color: '#FFFFFF',
  fontSize: '14px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

const quickLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};
