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
import { User, Mail, Building, Globe, Phone, FileText } from 'lucide-react';
import { C } from '../../constants/theme.js';

export default function OrganizerRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phone: '',
    website: '',
    businessRegistrationNumber: '',
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

    const compErr = validateRequired(formData.companyName, 'Company name');
    if (compErr) newErrors.companyName = compErr;

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
        companyName: formData.companyName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        website: formData.website.trim() || undefined,
        businessRegistrationNumber: formData.businessRegistrationNumber.trim() || undefined,
      };

      await authService.registerOrganizer(payload);
      showToast('Organizer account registered! Please verify your email.', 'success');

      try {
        await authService.sendOTP(payload.email, 'EMAIL_VERIFICATION');
      } catch (otpErr) {
        // OTP send notice handled gracefully
      }

      navigate('/organizer/verify-email', { state: { email: payload.email, role: 'EVENT_ORGANIZER' } });
    } catch (err) {
      setApiError(err.message || 'Organizer registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Become an Event Organizer"
      subtitle="Host events, manage VIP section tickets & staff scanner accounts"
      badgeText="Organizer Portal"
    >
      <AuthError message={apiError} onClose={() => setApiError('')} />

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <AuthInput
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Alice"
            error={errors.firstName}
            icon={User}
            required
          />
          <AuthInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Smith"
            error={errors.lastName}
            icon={User}
            required
          />
        </div>

        <AuthInput
          label="Company / Organization Name"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Apex Events LLC"
          error={errors.companyName}
          icon={Building}
          required
        />

        <AuthInput
          label="Work Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="organizer@apexevents.com"
          error={errors.email}
          icon={Mail}
          autoComplete="email"
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <AuthInput
            label="Mobile Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 9876543210"
            error={errors.phone}
            icon={Phone}
            required
          />
          <AuthInput
            label="Reg. Number (Optional)"
            name="businessRegistrationNumber"
            value={formData.businessRegistrationNumber}
            onChange={handleChange}
            placeholder="REG-998877"
            icon={FileText}
          />
        </div>

        <AuthInput
          label="Company Website (Optional)"
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://apexevents.com"
          icon={Globe}
        />

        <PasswordInput
          label="Account Password"
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

        <LoadingButton loading={loading}>Register Event Organizer</LoadingButton>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: C.muted }}>
          Already registered as an Organizer?{' '}
          <Link to="/organizer/login" style={{ color: C.gold, fontWeight: 700, textDecoration: 'none' }}>
            Organizer Login
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px' }}>
          <Link to="/register" style={{ color: C.muted, textDecoration: 'underline' }}>
            ← Customer Registration
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
