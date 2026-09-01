import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthInput } from '../../components/auth/AuthInput.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { OTPInput } from '../../components/auth/OTPInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateEmail, validatePassword, validateConfirmPassword, validateOTP } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    const otpErr = validateOTP(otp);
    if (otpErr) newErrors.otp = otpErr;

    const passErr = validatePassword(newPassword, 8);
    if (passErr) newErrors.newPassword = passErr;

    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      await authService.resetPassword({
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
      });

      showToast('Password updated successfully! Please log in with your new password.', 'success');
      navigate('/login', { state: { email } });
    } catch (err) {
      setApiError(err.message || 'Password reset failed. Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter the 6-digit reset OTP and choose a secure new password"
      badgeText="Reset Password"
    >
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
        {!location.state?.email && (
          <AuthInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@example.com"
            error={errors.email}
            icon={Mail}
            required
          />
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: C.muted, display: 'block', marginBottom: '6px', fontFamily: 'Space Grotesk, sans-serif' }}>
            6-Digit Reset OTP Code *
          </label>
          <OTPInput value={otp} onChange={setOtp} error={errors.otp} disabled={loading} />
        </div>

        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.newPassword}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <LoadingButton loading={loading}>Reset & Update Password</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: C.muted, textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
