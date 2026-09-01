import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthInput } from '../../components/auth/AuthInput.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateEmail, validatePassword } from '../../utils/validation.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { ShieldCheck, Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: 'admin@eventbooking.com',
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
    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

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
      const res = await authService.adminLogin({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const { user, tokens } = res.data;
      login(user, tokens.accessToken, tokens.refreshToken);
      showToast(`Super Admin authenticated. Welcome!`, 'success');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.message || 'Invalid Super Admin credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Super Admin Portal"
      subtitle="Restricted access for SaaS platform administrators"
      badgeText="Super Admin Portal"
    >
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Super Admin Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="admin@eventbooking.com"
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Admin Secret Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="current-password"
          required
        />

        <LoadingButton loading={loading}>
          <ShieldCheck size={18} /> Authenticate Super Admin
        </LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
          <Link to="/login" style={{ color: C.gold, textDecoration: 'none' }}>
            ← Return to User Portal Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
