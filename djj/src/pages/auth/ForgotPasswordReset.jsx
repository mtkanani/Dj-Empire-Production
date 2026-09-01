import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validatePassword, validateConfirmPassword } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { C } from '../../constants/theme.js';

export default function ForgotPasswordReset() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const resetToken = location.state?.resetToken || sessionStorage.getItem('djj_reset_token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password', { replace: true });
    }
  }, [resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const passErr = validatePassword(newPassword, 8);
    if (passErr) newErrors.newPassword = passErr;
    const confirmErr = validateConfirmPassword(newPassword, confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setApiError('');
    try {
      await authService.resetPassword({
        resetToken,
        newPassword,
        confirmPassword,
      });
      sessionStorage.removeItem('djj_reset_token');
      showToast('Password reset successfully.', 'success');
      navigate('/forgot-password/success', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create New Password" subtitle="Choose a new password for your account" badgeText="Step 3 of 3">
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
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

        <LoadingButton loading={loading}>Reset Password</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: C.muted, textDecoration: 'none' }}>
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
