import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { C } from '../../constants/theme.js';
import { authService } from '../../services/authService.js';
import { validatePassword, validateConfirmPassword } from '../../utils/validation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

export default function ChangePasswordCard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${C.border}`,
    borderRadius: '12px',
    color: C.text,
    fontSize: 'clamp(13px, 2.8vw, 14px)',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passErr = validatePassword(newPassword, 8);
    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (!oldPassword) {
      setError('Current password is required');
      return;
    }
    if (passErr) {
      setError(passErr);
      return;
    }
    if (confirmErr) {
      setError(confirmErr);
      return;
    }
    if (oldPassword === newPassword) {
      setError('New password must be different from the current password');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await authService.changePassword({ oldPassword, newPassword, confirmPassword });
      showToast(res.message || 'Password changed successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Unable to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        background: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '20px',
        padding: 'clamp(16px, 4vw, 28px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <Lock size={18} color={C.gold} />
        <h2
          style={{
            margin: 0,
            fontSize: 'clamp(16px, 3.5vw, 18px)',
            fontFamily: 'Space Grotesk, sans-serif',
            color: C.text,
            fontWeight: 700,
          }}
        >
          Change password
        </h2>
      </div>
      <p style={{ margin: '0 0 16px', color: C.muted, fontSize: 'clamp(12px, 2.8vw, 13px)', lineHeight: 1.45 }}>
        Use your current password to set a new one. If you forgot it, request an email OTP instead.
      </p>

      {error ? (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: C.redDim || 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${C.red || '#ef4444'}`,
            color: C.red || '#fca5a5',
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>
          Current password
          <input
            type="password"
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
          />
        </label>
        <label style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>
          New password
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
          />
        </label>
        <label style={{ fontSize: '12px', color: C.muted, fontWeight: 600 }}>
          Confirm new password
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ ...inputStyle, marginTop: 6 }}
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: '4px',
            minHeight: '44px',
            padding: '10px 16px',
            border: 'none',
            borderRadius: '12px',
            background: C.gold,
            color: '#000',
            fontWeight: 800,
            fontSize: 'clamp(13px, 2.8vw, 14px)',
            fontFamily: 'Space Grotesk, sans-serif',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>

      <button
        type="button"
        onClick={() =>
          navigate('/forgot-password', {
            state: { identifier: user?.email || user?.phone || '' },
          })
        }
        style={{
          marginTop: '14px',
          background: 'none',
          border: 'none',
          color: C.blue || '#60a5fa',
          fontSize: 'clamp(12px, 2.8vw, 13px)',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          textAlign: 'left',
        }}
      >
        Forgot password? Reset with OTP
      </button>
    </div>
  );
}
