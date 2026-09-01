import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '../../components/auth/AuthLayout.jsx';
import { AuthInput } from '../../components/auth/AuthInput.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { LoadingButton } from '../../components/auth/LoadingButton.jsx';
import { AuthError } from '../../components/auth/AuthError.jsx';
import { authService } from '../../services/authService.js';
import { validateEmail, validatePassword, validateConfirmPassword, validateRequired, validatePhone } from '../../utils/validation.js';
import { useToast } from '../../hooks/useToast.js';
import { User, Mail, Phone } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function CustomerRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
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
    const fnErr = validateRequired(formData.firstName, 'First name');
    if (fnErr) newErrors.firstName = fnErr;

    const lnErr = validateRequired(formData.lastName, 'Last name');
    if (lnErr) newErrors.lastName = lnErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const passErr = validatePassword(formData.password, 8);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);
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
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      };

      const res = await authService.registerCustomer(payload);
      showToast('Account created successfully! Please verify your email.', 'success');

      // Send OTP for email verification automatically
      try {
        await authService.sendOTP(payload.email, 'EMAIL_VERIFICATION');
      } catch (otpErr) {
        // OTP send notice handled gracefully
      }

      navigate('/verify-email', { state: { email: payload.email, role: 'CUSTOMER' } });
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Customer Account" subtitle="Join to discover & book exclusive live events" badgeText="Customer Sign Up">
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <AuthInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="John"
            error={errors.firstName}
            icon={User}
            required
          />
          <AuthInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Doe"
            error={errors.lastName}
            icon={User}
            required
          />
        </div>

        <AuthInput
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="customer@example.com"
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <AuthInput
          label="Mobile Number"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+91 9876543210"
          error={errors.phone}
          icon={Phone}
          autoComplete="tel"
          required
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <LoadingButton loading={loading}>Register Customer</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
          Already have a customer account?{' '}
          <Link to="/login" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>
            Login Here
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
          <Link to="/organizer/register" style={{ color: C.blue, textDecoration: 'none' }}>
            Are you an Event Organizer? Register Here →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
