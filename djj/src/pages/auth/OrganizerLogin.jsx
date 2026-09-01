import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthInput } from '../../components/auth/AuthInput.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateLoginIdentifier, validatePassword } from '../../utils/validation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function OrganizerLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    identifier: location.state?.email || '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    const identifierErr = validateLoginIdentifier(formData.identifier);
    if (identifierErr) newErrors.identifier = identifierErr;

    const passErr = validatePassword(formData.password, 1);
    if (passErr) newErrors.password = passErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');

    try {
      const identifier = formData.identifier.trim();
      const res = await authService.login({
        identifier,
        email: identifier.includes('@') ? identifier.toLowerCase() : identifier,
        password: formData.password,
      });

      const { user, tokens } = res.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      showToast(`Welcome to Portal, ${user.firstName || 'User'}!`, 'success');

      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/client', { replace: true });
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('verify')) {
        showToast('Please verify your organizer email before logging in.', 'warning');
        navigate('/organizer/verify-email', { state: { email: formData.identifier } });
      } else {
        setApiError(err.message || 'Invalid email/mobile number or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Organizer Login"
      subtitle="Access live metrics, section inventory & scanner staff setup"
      badgeText="Organizer Portal"
    >
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Login Identifier"
          type="text"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          placeholder="Email or Mobile Number"
          error={errors.identifier}
          icon={Mail}
          autoComplete="username"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <div style={{ textAlign: 'right', marginBottom: '20px', fontSize: '13px' }}>
          <Link to="/forgot-password" style={{ color: C.blue, textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>

        <LoadingButton loading={loading}>Sign In to Organizer Portal</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
          Don't have an organizer account?{' '}
          <Link to="/organizer/register" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>
            Register Organization
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
          <Link to="/login" style={{ color: C.muted, textDecoration: 'underline' }}>
            Customer Login Portal →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
