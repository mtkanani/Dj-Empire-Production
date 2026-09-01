import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { C } from '../../constants/theme.js';

export default function ForgotPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <AuthLayout title="Password reset successfully." subtitle="You can now sign in with your email or mobile number and the new password." badgeText="Complete">
      <p style={{ color: C.muted, fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
        Use your registered email or mobile number with the new password.
      </p>
      <LoadingButton type="button" loading={false} onClick={() => navigate('/login')}>
        Login
      </LoadingButton>
    </AuthLayout>
  );
}
