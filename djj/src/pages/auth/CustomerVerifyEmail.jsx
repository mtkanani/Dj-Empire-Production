import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { OTPInput } from '../../components/auth/OTPInput.jsx';
import { OTPCountdown } from '../../components/auth/OTPCountdown.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateOTP } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { MailCheck } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function CustomerVerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpErr = validateOTP(otp);
    if (otpErr) {
      setError(otpErr);
      return;
    }

    if (!email.trim()) {
      setError('Please provide the email address associated with your registration.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP(email.trim().toLowerCase(), otp, 'EMAIL_VERIFICATION');
      showToast('Email verified successfully! You can now log in.', 'success');
      navigate('/login', { state: { email } });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to resend OTP.');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await authService.sendOTP(email.trim().toLowerCase(), 'EMAIL_VERIFICATION');
      showToast('A new 6-digit OTP code has been sent to your email.', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP code. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle={`Enter the 6-digit OTP code sent to ${email || 'your email'}`}
      badgeText="Email Verification"
    >
      <AuthError message={error} onClose={() => setError('')} />

      <form onSubmit={handleVerify}>
        {!location.state?.email && (
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', color: C.muted, display: 'block', marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                color: C.text,
                fontSize: '14px',
                outline: 'none',
              }}
              required
            />
          </div>
        )}

        <OTPInput value={otp} onChange={setOtp} error={null} disabled={loading} />

        <LoadingButton loading={loading} disabled={otp.length !== 6}>
          Verify OTP & Complete Registration
        </LoadingButton>

        <OTPCountdown initialSeconds={60} onResend={handleResendOTP} loading={resendLoading} />

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: C.muted, textDecoration: 'none' }}>
            ← Back to Customer Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
