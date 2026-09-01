import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { OTPInput } from '../../components/auth/OTPInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateOTP } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { C } from '../../constants/theme.js';

export default function ForgotPasswordVerify() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const requestId = location.state?.requestId || sessionStorage.getItem('djj_reset_request_id') || '';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(location.state?.cooldownSeconds || 60);

  useEffect(() => {
    if (!requestId) {
      navigate('/forgot-password', { replace: true });
    }
  }, [requestId, navigate]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpErr = validateOTP(otp);
    if (otpErr) {
      setError(otpErr);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authService.verifyResetOtp({ requestId, otp });
      const data = res.data || res;
      sessionStorage.setItem('djj_reset_token', data.resetToken || '');
      sessionStorage.removeItem('djj_reset_request_id');
      showToast('OTP verified. Create a new password.', 'success');
      navigate('/forgot-password/reset', { state: { resetToken: data.resetToken } });
    } catch (err) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const res = await authService.resendResetOtp(requestId);
      const data = res.data || res;
      setSecondsLeft(data.cooldownSeconds || 60);
      showToast('If an account exists, a new code was sent to the registered email.', 'info');
    } catch (err) {
      setError(err.message || 'Unable to resend code right now.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify OTP"
      subtitle="We've sent a verification code to your registered email."
      badgeText="Step 2 of 3"
    >
      <AuthError message={error} onClose={() => setError('')} />

      <form onSubmit={handleVerify} noValidate>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: C.muted, display: 'block', marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif' }}>
            6-Digit OTP *
          </label>
          <OTPInput value={otp} onChange={setOtp} error={error} disabled={loading} />
        </div>

        <LoadingButton loading={loading}>Verify OTP</LoadingButton>
      </form>

      <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: C.muted }}>
        {secondsLeft > 0 ? (
          <span>Resend OTP in {secondsLeft} seconds</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={{ background: 'none', border: 'none', color: C.gold, fontWeight: 700, cursor: 'pointer' }}
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px' }}>
        <Link to="/forgot-password" style={{ color: C.muted, textDecoration: 'none' }}>
          ← Use a different email or mobile
        </Link>
      </div>
    </AuthLayout>
  );
}
