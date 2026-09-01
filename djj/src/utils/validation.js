export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password, minLength = 8) => {
  if (!password) return 'Password is required';
  if (password.length < minLength) return `Password must be at least ${minLength} characters long`;
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

export const validateOTP = (otp) => {
  if (!otp) return 'OTP is required';
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return 'OTP must be exactly 6 digits';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName || 'This field'} is required`;
  }
  return null;
};

export const validatePhone = (phone) => {
  if (!phone || !String(phone).trim()) return 'Mobile number is required';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) return null;
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]\d{9}$/.test(digits.slice(2))) return null;
  if (digits.length >= 10 && digits.length <= 15) return null;
  return 'Enter a valid mobile number';
};

export const validateLoginIdentifier = (value) => {
  if (!value || !String(value).trim()) return 'Email or mobile number is required';
  const trimmed = String(value).trim();
  if (trimmed.includes('@')) return validateEmail(trimmed);
  return validatePhone(trimmed);
};
