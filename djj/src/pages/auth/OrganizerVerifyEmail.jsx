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

export default function OrganizerVerifyEmail() {
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
      setError('Please provide your organizer email address.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.verifyOTP(email.trim().toLowerCase(), otp, 'EMAIL_VERIFICATION');
      showToast('Organizer email verified successfully! Please log in.', 'success');
      navigate('/organizer/login', { state: { email } });
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email.trim()) {
      setError('Please enter your work email to resend OTP.');
      return;
    }

    setResendLoading(true);
    setError('');

    try {
      await authService.sendOTP(email.trim().toLowerCase(), 'EMAIL_VERIFICATION');
      showToast('A new 6-digit OTP code has been sent to your work email.', 'info');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP code.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Organizer Email"
      subtitle={`Enter 6-digit OTP dispatched to ${email || 'your work email'}`}
      badgeText="Organizer Verification"
    >
      <AuthError message={error} onClose={() => setError('')} />

      <form onSubmit={handleVerify}>
        <OTPInput value={otp} onChange={setOtp} error={null} disabled={loading} />

        <LoadingButton loading={loading} disabled={otp.length !== 6}>
          Verify Organizer Account
        </LoadingButton>

        <OTPCountdown initialSeconds={60} onResend={handleResendOTP} loading={resendLoading} />

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <Link to="/organizer/login" style={{ color: '#A0A0A0', textDecoration: 'none' }}>
            ← Back to Organizer Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
