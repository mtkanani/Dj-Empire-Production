import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthInput } from '../../components/auth/AuthInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateLoginIdentifier } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { Mail } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const identifierErr = validateLoginIdentifier(identifier);
    if (identifierErr) {
      setError(identifierErr);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(identifier.trim());
      const data = res.data || res;
      showToast(res.message || 'If an account exists, a verification code was sent to the registered email.', 'info');
      sessionStorage.setItem('djj_reset_request_id', data.requestId || '');
      navigate('/forgot-password/verify', {
        state: {
          requestId: data.requestId,
          cooldownSeconds: data.cooldownSeconds || 60,
        },
      });
    } catch (err) {
      setError(err.message || 'Unable to process password reset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email or mobile number. We'll send a code to your registered email."
      badgeText="Step 1 of 3"
    >
      <AuthError message={error} onClose={() => setError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Email or Mobile Number"
          type="text"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (error) setError('');
          }}
          placeholder="Email or Mobile Number"
          icon={Mail}
          autoComplete="username"
          required
        />

        <LoadingButton loading={loading}>Send OTP</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px' }}>
          <Link to="/login" style={{ color: C.gold, textDecoration: 'none', fontWeight: 600 }}>
            ← Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
